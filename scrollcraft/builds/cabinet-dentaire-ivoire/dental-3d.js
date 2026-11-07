/**
 * dental-3d.js — Real-time PBR 3D Dental Anatomy & Radioscopy Engine
 * Built for Cabinet Dentaire Ivoire (Bouaké)
 *
 * Renders two distinct bespoke stages:
 *   1. Hero Stage (#hero-3d-canvas): Precision exploded surgical assembly of an
 *      anatomical 4-cusp ivory molar crown, champagne-titanium abutment, and
 *      machined helical titanium implant base, driven by Act 1 `--sc-p` and
 *      subtle fine-pointer studio light parallax.
 *   2. Peak Stage (#scanner-3d-canvas): Interactive 3D Clinical Radioscopy
 *      Scanner where scroll (`--sc-p`) sweeps a local clipping plane across the
 *      enamel to reveal internal root canals, pulp horns, gingival collar,
 *      orthodontic arch guide, or titanium implant anchor depending on the
 *      visitor's selected clinical need.
 *
 * Honors prefers-reduced-motion, pauses offscreen via IntersectionObserver,
 * never locks or captures the pointer, and falls back cleanly to static posters
 * if WebGL is unavailable.
 */

import * as THREE from "./vendor/three.module.js";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Generates a procedural studio cyclorama reflection environment matching the
 * photographic style preamble: large warm-daylight softbox upper-right,
 * cool mineral-alabaster overhead bounce, and subtle cobalt-slate edge fill.
 */
function createStudioEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  // Studio cyclorama with subtle slate negative-fill so porcelain edges read crisply on light alabaster
  envScene.background = new THREE.Color(0xd5dfec);

  const mkPanel = (w, h, color, intensity, pos, look) => {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(intensity),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.lookAt(look[0], look[1], look[2]);
    envScene.add(mesh);
  };

  // Key morning daylight softbox from upper-right
  mkPanel(13, 10, 0xfffaf0, 2.55, [9, 8.5, 7], [0, 0, 0]);
  // Large overhead high-key studio bounce
  mkPanel(16, 16, 0xf6f9fc, 1.55, [0, 13, 0], [0, 0, 0]);
  // Dark slate studio flag on left-side silhouette for porcelain contour definition
  mkPanel(11, 12, 0x5c708a, 0.55, [-11, 1.5, 1.5], [0, 0, 0]);
  // Cool mineral-cobalt rim fill on front-left
  mkPanel(9, 8, 0xcbe0fc, 1.2, [-7, 2, 7], [0, 0, 0]);
  // Subtle warm travertine floor bounce
  mkPanel(16, 16, 0xe4ddd0, 0.9, [0, -10, 0], [0, 0, 0]);

  const target = pmrem.fromScene(envScene, 0.035);
  pmrem.dispose();
  return target.texture;
}

/**
 * Anatomically sculpted 4-cusp molar crown geometry.
 * Models cervical constriction (CEJ), buccal/lingual convexity, developmental
 * wall grooves, four pronounced cusps (MB, DB, ML, DL), deep central fossa, and
 * cruciform fissures so the molar silhouette is unmistakable from every angle.
 */
function buildMolarCrownGeometry() {
  const segU = 104;
  const segV = 64;
  const positions = [];
  const uvs = [];
  const indices = [];

  // Occlusal height field at normalized top coordinates (nx, nz in roughly -1..1)
  function occlusalHeight(nx, nz) {
    const r2 = nx * nx + nz * nz;
    const r = Math.sqrt(r2);
    const cusps = [
      { x: -0.49, z: 0.45, a: 0.48, s: 0.27 },  // Mesiobuccal (tallest primary cusp)
      { x: 0.48, z: 0.43, a: 0.41, s: 0.26 },   // Distobuccal
      { x: -0.46, z: -0.45, a: 0.45, s: 0.27 }, // Mesiolingual
      { x: 0.46, z: -0.42, a: 0.36, s: 0.25 },  // Distolingual
    ];
    let h = 0.04;
    for (const c of cusps) {
      const dx = nx - c.x;
      const dz = nz - c.z;
      h += c.a * Math.exp(-(dx * dx + dz * dz) / (2 * c.s * c.s));
    }
    // Deep central developmental fossa + cruciform developmental fissures
    const fossa = 0.24 * Math.exp(-r2 / 0.13);
    const grooveMD = 0.095 * Math.exp(-(nz * nz) / 0.016) * Math.exp(-(nx * nx) / 0.65);
    const grooveBL = 0.090 * Math.exp(-(nx * nx) / 0.016) * Math.exp(-(nz * nz) / 0.65);
    // Crisp marginal ridge connecting cusps around perimeter
    const rim = 0.055 * smoothstep(0.38, 0.80, r) * (1 - smoothstep(0.84, 1.12, r));
    return h - fossa - grooveMD - grooveBL + rim;
  }

  function molarRadius(u, profileScale, wallHeightFrac = 0.5) {
    // 4-lobed molar cross-section with buccal & lingual developmental grooves
    const fourLobe = 1 + 0.095 * Math.cos(4 * u - 0.14);
    const grooveIndent = 1 - 0.045 * smoothstep(0.25, 0.95, wallHeightFrac) * Math.pow(Math.cos(2 * u), 2);
    const mesialSwell = 1 - 0.03 * Math.cos(u) + 0.02 * Math.sin(2 * u);
    return profileScale * fourLobe * grooveIndent * mesialSwell;
  }

  for (let iv = 0; iv <= segV; iv++) {
    const v = iv / segV; // 0 = inner cervical rim, 0.13 = outer CEJ, 0.62 = cusp crest shoulder, 1.0 = central fossa
    for (let iu = 0; iu <= segU; iu++) {
      const u = (iu / segU) * Math.PI * 2;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);

      let x = 0;
      let y = 0;
      let z = 0;

      if (v < 0.13) {
        // Milled inner seating chamber & cervical bevel (y around 0.12 -> 0.0)
        const t = v / 0.13;
        const baseR = lerp(0.48, 0.70, smoothstep(0, 1, t));
        const r = molarRadius(u, baseR, 0);
        x = r * cosU * 1.06;
        z = r * sinU * 0.96;
        y = lerp(0.13, 0.0, smoothstep(0, 1, t));
      } else {
        // Single C2-continuous spherical-anatomical sweep from CEJ (s=0) over cusp crests into central fossa (s=1)
        const s = (v - 0.13) / 0.87;
        const theta = Math.pow(s, 0.92) * (Math.PI * 0.5); // 0 at cervical line -> pi/2 at occlusal center
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        // Radial envelope swells from 0.70 at CEJ to ~0.95 at equator, then rounds smoothly over cusp tips to 0 at center
        const eqBulge = 0.70 + 0.27 * Math.sin(Math.min(1, s / 0.62) * Math.PI * 0.78);
        const radialProfile = eqBulge * Math.pow(cosT, 0.74);
        const r = molarRadius(u, radialProfile, sinT);
        x = r * cosU * 1.06;
        z = r * sinU * 0.96;

        const nx = x / 0.86;
        const nz = z / 0.79;
        const occ = occlusalHeight(nx, nz);
        const occWeight = smoothstep(0.24, 0.70, s);
        y = 0.72 * Math.pow(sinT, 0.68) + occ * occWeight;
      }

      positions.push(x, y, z);
      uvs.push(iu / segU, v);
    }
  }

  const row = segU + 1;
  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * row + iu;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Bifurcated anatomical molar roots (mesial and distal) branching smoothly from
 * a shared cervical root trunk beneath y = 0.
 */
function buildBifurcatedRootsGeometry() {
  const group = new THREE.Group();

  function makeRootBranch(side) {
    const segU = 48;
    const segV = 42;
    const pos = [];
    const idx = [];
    for (let iv = 0; iv <= segV; iv++) {
      const t = iv / segV; // 0 at cervical line -> 1 at apex
      const split = smoothstep(0.10, 0.88, t);
      const cx = side * 0.36 * split + 0.09 * t * t; // gentle natural distal sweep
      const cz = 0;
      const y = -t * 1.48;
      // Wide oval at trunk, narrowing organically to rounded apex
      const rx = lerp(0.46, 0.035, Math.pow(t, 0.82)) * (1 - 0.18 * smoothstep(0, 0.25, t));
      const rz = lerp(0.62, 0.045, Math.pow(t, 0.78));

      for (let iu = 0; iu <= segU; iu++) {
        const u = (iu / segU) * Math.PI * 2;
        // Subtle developmental root concavity on inner furcation face
        const flute = 1 - 0.10 * Math.sin(t * Math.PI) * Math.max(0, -side * Math.cos(u));
        const x = cx + Math.cos(u) * rx * flute;
        const z = cz + Math.sin(u) * rz;
        pos.push(x, y, z);
      }
    }
    const row = segU + 1;
    for (let iv = 0; iv < segV; iv++) {
      for (let iu = 0; iu < segU; iu++) {
        const a = iv * row + iu;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  return {
    mesial: makeRootBranch(-1),
    distal: makeRootBranch(1),
  };
}

/**
 * Internal Pulp Chamber & Root Canal network (visible inside the X-ray scan).
 */
function buildPulpSystem(material) {
  const pulpGroup = new THREE.Group();

  // Central pulp chamber with slight horn extensions
  const chamberGeo = new THREE.SphereGeometry(0.28, 32, 24);
  chamberGeo.scale(1.15, 0.68, 0.95);
  const chamber = new THREE.Mesh(chamberGeo, material);
  chamber.position.set(0, 0.34, 0);
  pulpGroup.add(chamber);

  // Four pulp horns reaching toward the four cusps
  const hornCoords = [
    [-0.26, 0.56, 0.22],
    [0.25, 0.52, 0.21],
    [-0.24, 0.54, -0.22],
    [0.24, 0.50, -0.20],
  ];
  hornCoords.forEach(([hx, hy, hz]) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(hx * 0.35, 0.34, hz * 0.35),
      new THREE.Vector3(hx * 0.78, (0.34 + hy) * 0.52, hz * 0.78),
      new THREE.Vector3(hx, hy, hz),
    ]);
    const hGeo = new THREE.TubeGeometry(curve, 16, 0.042, 12, false);
    pulpGroup.add(new THREE.Mesh(hGeo, material));
  });

  // Two root canals descending into mesial and distal roots
  [-1, 1].forEach((side) => {
    const canalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.12, 0.26, 0),
      new THREE.Vector3(side * 0.22, -0.22, 0),
      new THREE.Vector3(side * 0.33 + 0.03, -0.78, 0),
      new THREE.Vector3(side * 0.36 + 0.08, -1.34, 0),
    ]);
    const cGeo = new THREE.TubeGeometry(canalCurve, 32, 0.036, 12, false);
    pulpGroup.add(new THREE.Mesh(cGeo, material));
  });

  return pulpGroup;
}

/**
 * Machined helical titanium dental implant post + champagne-titanium abutment.
 */
function buildImplantAssembly(titaniumMat, abutmentMat) {
  const grp = new THREE.Group();

  // Helical threaded titanium fixture
  const segU = 72;
  const segV = 84;
  const pos = [];
  const idx = [];
  for (let iv = 0; iv <= segV; iv++) {
    const t = iv / segV; // 0 = collar at y=-0.02, 1 = apex at y=-1.36
    const y = -0.02 - t * 1.34;
    const baseR = lerp(0.38, 0.21, Math.pow(t, 0.75)) * (t > 0.92 ? lerp(1, 0.18, (t - 0.92) / 0.08) : 1);
    const threadEnv = smoothstep(0.06, 0.16, t) * (1 - smoothstep(0.84, 0.95, t));

    for (let iu = 0; iu <= segU; iu++) {
      const u = (iu / segU) * Math.PI * 2;
      const helix = Math.sin(t * Math.PI * 22 + u);
      const threadDepth = 0.036 * threadEnv * Math.pow(Math.max(0, helix), 0.7);
      const r = baseR + threadDepth;
      pos.push(Math.cos(u) * r, y, Math.sin(u) * r);
    }
  }
  const row = segU + 1;
  for (let iv = 0; iv < segV; iv++) {
    for (let iu = 0; iu < segU; iu++) {
      const a = iv * row + iu;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  const screwGeo = new THREE.BufferGeometry();
  screwGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  screwGeo.setIndex(idx);
  screwGeo.computeVertexNormals();
  grp.add(new THREE.Mesh(screwGeo, titaniumMat));

  // Precision machined collar ring
  const collarGeo = new THREE.CylinderGeometry(0.42, 0.39, 0.11, 64);
  const collar = new THREE.Mesh(collarGeo, titaniumMat);
  collar.position.y = 0.02;
  grp.add(collar);

  // Champagne-gold anodized prosthetic abutment cone
  const abutGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.36, 64);
  const abut = new THREE.Mesh(abutGeo, abutmentMat);
  abut.position.y = 0.24;
  grp.add(abut);

  // Anti-rotational hex bevel top
  const hexGeo = new THREE.CylinderGeometry(0.19, 0.25, 0.10, 6);
  const hex = new THREE.Mesh(hexGeo, abutmentMat);
  hex.position.y = 0.46;
  grp.add(hex);

  return grp;
}

/**
 * Gingival collar + Orthodontic alignment guide for Peak Clinical Explorer.
 */
function buildGingivaGeometry() {
  const geo = new THREE.TorusGeometry(0.76, 0.24, 32, 72);
  geo.rotateX(Math.PI / 2);
  geo.scale(1.06, 0.72, 0.96);
  return geo;
}

/* ============================================================================
   STAGE 1: HERO 3D SURGICAL ENAMEL ASSEMBLY (#hero-3d-canvas)
   ========================================================================== */
function mountHero3D() {
  const canvas = document.getElementById("hero-3d-canvas");
  const wrap = document.getElementById("hero-3d-stage");
  const actEl = document.getElementById("hero-act");
  if (!canvas || !wrap || !actEl) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    wrap.classList.add("is-fallback");
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;

  const scene = new THREE.Scene();
  scene.environment = createStudioEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 35);
  camera.position.set(0.06, 0.28, 7.15);

  // Lighting aligned with photographic upper-right daylight + grazing contour rim
  const keyLight = new THREE.DirectionalLight(0xfffaf0, 2.45);
  keyLight.position.set(5.2, 6.2, 4.4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xcbe0fc, 0.95);
  fillLight.position.set(-4.6, 1.4, 2.8);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x4f84e8, 1.15);
  rimLight.position.set(-2.4, -2.2, -4.0);
  scene.add(rimLight);

  const root = new THREE.Group();
  scene.add(root);

  // Warm natural B1 porcelain-ivory enamel with crisp clearcoat & contour contrast on light alabaster
  const enamelMat = new THREE.MeshPhysicalMaterial({
    color: 0xeee4d3,
    roughness: 0.22,
    metalness: 0.0,
    ior: 1.58,
    reflectivity: 0.68,
    clearcoat: 1.0,
    clearcoatRoughness: 0.09,
    sheen: 0.42,
    sheenRoughness: 0.32,
    sheenColor: new THREE.Color(0xfffcf5),
    envMapIntensity: 1.08,
  });

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0xbec9d6,
    metalness: 0.90,
    roughness: 0.23,
    envMapIntensity: 1.25,
  });

  const champagneAbutMat = new THREE.MeshStandardMaterial({
    color: 0xd6c096,
    metalness: 0.88,
    roughness: 0.19,
    envMapIntensity: 1.3,
  });

  const precisionRingMat = new THREE.MeshBasicMaterial({
    color: 0x1352b8,
    transparent: true,
    opacity: 0.48,
  });

  const crownGeo = buildMolarCrownGeometry();
  const crownMesh = new THREE.Mesh(crownGeo, enamelMat);
  root.add(crownMesh);

  const implantGroup = buildImplantAssembly(titaniumMat, champagneAbutMat);
  root.add(implantGroup);

  // Delicate cobalt alignment calibration ring between crown and abutment
  const ringGeo = new THREE.RingGeometry(0.54, 0.568, 64);
  ringGeo.rotateX(-Math.PI / 2);
  const calRing = new THREE.Mesh(ringGeo, precisionRingMat);
  calRing.position.y = 0.20;
  root.add(calRing);

  // Subtle translucent glass architectural pedestal disk underneath
  const plinthGeo = new THREE.CylinderGeometry(1.18, 1.24, 0.08, 72);
  const plinthMat = new THREE.MeshPhysicalMaterial({
    color: 0xdce5f0,
    roughness: 0.20,
    metalness: 0.06,
    transmission: 0.48,
    transparent: true,
    opacity: 0.84,
    envMapIntensity: 0.95,
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = -1.48;
  root.add(plinth);

  // Vertically centered so full 4-cusp crown + titanium fixture + plinth keep >=12% top/bottom margin
  root.position.set(0.0, 0.10, 0);

  let width = 0;
  let height = 0;
  let visible = true;
  let pointerX = 0;
  let pointerY = 0;
  let curPX = 0;
  let curPY = 0;

  function resize() {
    const r = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const isNarrow = window.innerWidth <= 860;
    const aspectGuard = Math.min(1, camera.aspect / 0.82);
    const baseZ = (isNarrow ? 7.25 : 7.05) / aspectGuard;
    camera.position.set(isNarrow ? 0 : 0.06, 0.34, baseZ);
    camera.lookAt(0, 0.0, 0);
    camera.updateProjectionMatrix();
  }

  if (FINE_POINTER && !REDUCED) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse" || !visible) return;
        pointerX = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        pointerY = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
      },
      { passive: true }
    );
  }

  function renderAt(p) {
    resize();
    // Scroll p=0 -> p=0.62 closes the exploded crown gap cleanly onto the abutment
    const seat = REDUCED ? 1 : smoothstep(0.0, 0.62, p);
    crownMesh.position.y = lerp(0.42, 0.02, seat);
    calRing.position.y = lerp(0.24, 0.04, seat);
    calRing.scale.setScalar(lerp(1.06, 0.82, seat));
    precisionRingMat.opacity = REDUCED ? 0 : (1 - seat) * 0.52;

    curPX += (pointerX - curPX) * 0.07;
    curPY += (pointerY - curPY) * 0.07;

    const baseRotY = REDUCED ? 0.42 : lerp(-0.36, 0.64, smoothstep(0, 1, p)) + curPX * 0.14;
    const baseRotX = REDUCED ? 0.18 : lerp(0.22, 0.14, seat) + curPY * 0.08;
    root.rotation.set(baseRotX, baseRotY, -0.03);

    keyLight.position.x = 5.2 + curPX * 1.1;
    keyLight.position.y = 6.2 - curPY * 0.8;

    renderer.render(scene, camera);
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false;
    },
    { rootMargin: "200px 0px" }
  );
  io.observe(wrap);

  resize();
  wrap.classList.add("is-webgl-live");

  if (REDUCED) {
    renderAt(1);
    window.addEventListener("resize", () => renderAt(1), { passive: true });
    return { renderAt };
  }

  let raf = 0;
  function loop() {
    if (visible && !document.hidden) {
      const p = parseFloat(actEl.style.getPropertyValue("--sc-p")) || 0;
      renderAt(p);
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  window.addEventListener("resize", resize, { passive: true });

  return { renderAt, stop: () => cancelAnimationFrame(raf) };
}

/* ============================================================================
   STAGE 2: PEAK 3D CLINICAL RADIOSCOPY SCANNER (#scanner-3d-canvas)
   ========================================================================== */
const ZONE_PRESETS = {
  douleur: {
    camRotY: -0.35,
    camRotX: 0.28,
    showImplant: false,
    showGingiva: false,
    showOrtho: false,
    spotPos: [-0.36, 0.84, 0.34],
    spotColor: 0x1352b8,
  },
  detartrage: {
    camRotY: 0.25,
    camRotX: 0.10,
    showImplant: false,
    showGingiva: true,
    showOrtho: false,
    spotPos: [0.0, 0.02, 0.72],
    spotColor: 0x1d6be0,
  },
  implant: {
    camRotY: 0.58,
    camRotX: 0.06,
    showImplant: true,
    showGingiva: false,
    showOrtho: false,
    spotPos: [0.0, -0.58, 0.36],
    spotColor: 0x1352b8,
  },
  alignement: {
    camRotY: 0.04,
    camRotX: 0.20,
    showImplant: false,
    showGingiva: false,
    showOrtho: true,
    spotPos: [0.0, 0.46, 0.84],
    spotColor: 0x1d6be0,
  },
  controle: {
    camRotY: -0.16,
    camRotX: 0.32,
    showImplant: false,
    showGingiva: false,
    showOrtho: false,
    spotPos: [0.0, 0.88, 0.0],
    spotColor: 0x1352b8,
  },
};

function mountScanner3D() {
  const canvas = document.getElementById("scanner-3d-canvas");
  const wrap = document.getElementById("scanner-3d-stage");
  const actEl = document.getElementById("scanner-act");
  const beamReadout = document.getElementById("scanner-depth-label");
  if (!canvas || !wrap || !actEl) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    wrap.classList.add("is-fallback");
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.99;

  const scene = new THREE.Scene();
  scene.environment = createStudioEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 35);
  camera.position.set(0, 0.24, 7.20);

  const keyLight = new THREE.DirectionalLight(0xfffaf0, 2.35);
  keyLight.position.set(4.8, 5.8, 4.4);
  scene.add(keyLight);

  const cobaltFill = new THREE.DirectionalLight(0x7caaff, 1.3);
  cobaltFill.position.set(-4.6, 1.0, 3.0);
  scene.add(cobaltFill);

  const rimLight = new THREE.DirectionalLight(0x3f7ae6, 1.05);
  rimLight.position.set(-2.0, -2.0, -4.0);
  scene.add(rimLight);

  const root = new THREE.Group();
  root.position.y = 0.08;
  scene.add(root);

  // Two opposing clipping planes meeting at scanY in world space:
  // Above scanY -> Solid Pure Ivory Enamel; Below scanY -> Translucent Cobalt X-Ray Anatomy!
  const clipSolid = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);   // keeps y >= -constant
  const clipXray = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);   // keeps y <= constant

  const solidEnamelMat = new THREE.MeshPhysicalMaterial({
    color: 0xeee4d3,
    roughness: 0.21,
    metalness: 0.0,
    ior: 1.58,
    clearcoat: 1.0,
    clearcoatRoughness: 0.09,
    sheen: 0.38,
    sheenColor: new THREE.Color(0xfffcf5),
    envMapIntensity: 1.08,
    clippingPlanes: [clipSolid],
    side: THREE.DoubleSide,
  });

  const solidDentinRootMat = new THREE.MeshPhysicalMaterial({
    color: 0xe3dac9,
    roughness: 0.28,
    metalness: 0.0,
    clearcoat: 0.35,
    envMapIntensity: 0.95,
    clippingPlanes: [clipSolid],
    side: THREE.DoubleSide,
  });

  const xrayShellMat = new THREE.MeshPhysicalMaterial({
    color: 0x2b6ee8,
    emissive: new THREE.Color(0x0b2c6b),
    emissiveIntensity: 0.55,
    roughness: 0.12,
    metalness: 0.05,
    transparent: true,
    opacity: 0.28,
    wireframe: false,
    clippingPlanes: [clipXray],
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const xrayWireMat = new THREE.MeshBasicMaterial({
    color: 0x5c9aff,
    transparent: true,
    opacity: 0.14,
    wireframe: true,
    clippingPlanes: [clipXray],
  });

  const pulpMat = new THREE.MeshStandardMaterial({
    color: 0x388bff,
    emissive: new THREE.Color(0x1352b8),
    emissiveIntensity: 1.1,
    roughness: 0.25,
    clippingPlanes: [clipXray],
  });

  const titaniumScanMat = new THREE.MeshStandardMaterial({
    color: 0xd4e2f4,
    emissive: new THREE.Color(0x0d367a),
    emissiveIntensity: 0.32,
    metalness: 0.88,
    roughness: 0.22,
    clippingPlanes: [clipXray],
  });

  const crownGeo = buildMolarCrownGeometry();
  const rootsGeo = buildBifurcatedRootsGeometry();

  // Solid upper group
  const solidCrown = new THREE.Mesh(crownGeo, solidEnamelMat);
  const solidRootM = new THREE.Mesh(rootsGeo.mesial, solidDentinRootMat);
  const solidRootD = new THREE.Mesh(rootsGeo.distal, solidDentinRootMat);
  const naturalSolidGroup = new THREE.Group();
  naturalSolidGroup.add(solidRootM, solidRootD);
  root.add(solidCrown, naturalSolidGroup);

  // X-ray lower/revealed group
  const xrayCrown = new THREE.Mesh(crownGeo, xrayShellMat);
  const xrayCrownWire = new THREE.Mesh(crownGeo, xrayWireMat);
  root.add(xrayCrown, xrayCrownWire);

  const naturalXrayRoots = new THREE.Group();
  naturalXrayRoots.add(
    new THREE.Mesh(rootsGeo.mesial, xrayShellMat),
    new THREE.Mesh(rootsGeo.distal, xrayShellMat),
    buildPulpSystem(pulpMat)
  );
  root.add(naturalXrayRoots);

  const implantXrayGroup = buildImplantAssembly(titaniumScanMat, titaniumScanMat);
  implantXrayGroup.visible = false;
  root.add(implantXrayGroup);

  // Gingival collar (shown on Détartrage & gencives)
  const gingivaMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6a8a8,
    roughness: 0.34,
    clearcoat: 0.45,
    transparent: true,
    opacity: 0,
  });
  const gingivaMesh = new THREE.Mesh(buildGingivaGeometry(), gingivaMat);
  gingivaMesh.position.y = -0.02;
  root.add(gingivaMesh);

  // Orthodontic precision archwire & crystal bracket (shown on Alignement)
  const orthoGroup = new THREE.Group();
  const archCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.35, 0.44, 0.36),
    new THREE.Vector3(-0.68, 0.45, 0.72),
    new THREE.Vector3(0.0, 0.46, 0.84),
    new THREE.Vector3(0.68, 0.45, 0.72),
    new THREE.Vector3(1.35, 0.44, 0.36),
  ]);
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0x3b7be8,
    emissive: new THREE.Color(0x1352b8),
    emissiveIntensity: 0.45,
    metalness: 0.85,
    roughness: 0.18,
    transparent: true,
    opacity: 0,
  });
  const wireMesh = new THREE.Mesh(new THREE.TubeGeometry(archCurve, 48, 0.024, 12, false), wireMat);
  const bracketGeo = new THREE.BoxGeometry(0.24, 0.18, 0.09);
  const bracketMesh = new THREE.Mesh(bracketGeo, wireMat);
  bracketMesh.position.set(0, 0.46, 0.81);
  orthoGroup.add(wireMesh, bracketMesh);
  root.add(orthoGroup);

  // Luminous horizontal laser scan plane disc sweeping along scanY
  const laserRingGeo = new THREE.RingGeometry(0.05, 1.22, 72);
  laserRingGeo.rotateX(-Math.PI / 2);
  const laserMat = new THREE.MeshBasicMaterial({
    color: 0x2a72e5,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  });
  const laserDisc = new THREE.Mesh(laserRingGeo, laserMat);

  const laserRimGeo = new THREE.RingGeometry(1.19, 1.23, 72);
  laserRimGeo.rotateX(-Math.PI / 2);
  const laserRimMat = new THREE.MeshBasicMaterial({
    color: 0x1352b8,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  const laserRim = new THREE.Mesh(laserRimGeo, laserRimMat);
  scene.add(laserDisc, laserRim);

  // Anatomical focus beacon (pulses gently on the selected clinical target)
  const beaconCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0x1352b8 })
  );
  const beaconHaloMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.32,
  });
  const beaconHalo = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), beaconHaloMat);
  const beacon = new THREE.Group();
  beacon.add(beaconCore, beaconHalo);
  root.add(beacon);

  let activeZone = "douleur";
  let curRotY = ZONE_PRESETS.douleur.camRotY;
  let curRotX = ZONE_PRESETS.douleur.camRotX;
  let curGingiva = 0;
  let curOrtho = 0;
  const curBeaconPos = new THREE.Vector3(...ZONE_PRESETS.douleur.spotPos);

  let width = 0;
  let height = 0;
  let visible = true;

  function resize() {
    const r = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const isNarrow = window.innerWidth <= 860;
    const aspectGuard = Math.min(1, camera.aspect / 0.80);
    const baseZ = (isNarrow ? 6.95 : 7.15) / aspectGuard;
    camera.position.set(0, 0.22, baseZ);
    camera.lookAt(0, -0.02, 0);
    camera.updateProjectionMatrix();
  }

  function setZone(zoneKey) {
    if (!ZONE_PRESETS[zoneKey]) return;
    activeZone = zoneKey;
    if (REDUCED) renderAt(0.45, 0);
  }

  function renderAt(p, nowMs) {
    resize();
    const preset = ZONE_PRESETS[activeZone] || ZONE_PRESETS.douleur;

    // Scroll sweeps scanY up across the whole tooth (revealing full X-ray mid-act)
    // and then sweeps back down to restore luminous solid ivory enamel at exit!
    let xrayOpen;
    if (REDUCED) {
      xrayOpen = preset.showImplant ? 0.85 : 0.58;
    } else if (p < 0.52) {
      xrayOpen = smoothstep(0.05, 0.46, p);
    } else {
      xrayOpen = 1 - smoothstep(0.62, 0.94, p);
    }
    // When implant mode is selected by user, keep root region open enough to see implant
    if (preset.showImplant) xrayOpen = Math.max(xrayOpen, 0.62);

    const scanY = lerp(-1.42, 1.42, xrayOpen);
    clipSolid.constant = -scanY;
    clipXray.constant = scanY;

    laserDisc.position.y = scanY;
    laserRim.position.y = scanY;
    const ringActive = xrayOpen > 0.03 && xrayOpen < 0.97;
    laserDisc.visible = ringActive;
    laserRim.visible = ringActive;

    if (beamReadout) {
      const pct = Math.round(xrayOpen * 100);
      beamReadout.textContent =
        pct > 65
          ? "Vue radiographique interne active"
          : pct > 15
            ? `Coupe scanner : ${pct} %`
            : "Vue émail naturel reconstitué";
    }

    // Toggle natural root vs titanium implant
    naturalSolidGroup.visible = !preset.showImplant;
    naturalXrayRoots.visible = !preset.showImplant;
    implantXrayGroup.visible = preset.showImplant;

    const k = REDUCED ? 1 : 0.09;
    curRotY += (preset.camRotY + (REDUCED ? 0 : (p - 0.5) * 0.48) - curRotY) * k;
    curRotX += (preset.camRotX - curRotX) * k;
    root.rotation.set(curRotX, curRotY, 0);

    curGingiva += ((preset.showGingiva ? 0.82 : 0) - curGingiva) * k;
    gingivaMat.opacity = curGingiva;
    gingivaMesh.visible = curGingiva > 0.02;

    curOrtho += ((preset.showOrtho ? 0.92 : 0) - curOrtho) * k;
    wireMat.opacity = curOrtho;
    orthoGroup.visible = curOrtho > 0.02;

    const targetB = new THREE.Vector3(...preset.spotPos);
    curBeaconPos.lerp(targetB, k * 1.2);
    beacon.position.copy(curBeaconPos);
    const pulse = REDUCED ? 1 : 1 + 0.18 * Math.sin((nowMs || 0) * 0.004);
    beaconHalo.scale.setScalar(pulse);

    // Expose verifiable state signature on the stage for shoot.mjs
    wrap.setAttribute(
      "data-sc-verify-state",
      `scan:${scanY.toFixed(2)}|rot:${curRotY.toFixed(2)}|zone:${activeZone}`
    );

    renderer.render(scene, camera);
  }

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false;
    },
    { rootMargin: "200px 0px" }
  );
  io.observe(wrap);

  resize();
  wrap.classList.add("is-webgl-live");

  if (REDUCED) {
    renderAt(0.45, 0);
    window.addEventListener("resize", () => renderAt(0.45, 0), { passive: true });
    return { setZone, renderAt };
  }

  let raf = 0;
  function loop(now) {
    if (visible && !document.hidden) {
      const p = parseFloat(actEl.style.getPropertyValue("--sc-p")) || 0;
      renderAt(p, now);
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  window.addEventListener("resize", resize, { passive: true });

  return { setZone, renderAt, stop: () => cancelAnimationFrame(raf) };
}

/* ============================================================================
   BOOT
   ========================================================================== */
const heroCtrl = mountHero3D();
const scannerCtrl = mountScanner3D();

window.Dental3D = {
  setZone(zoneKey) {
    if (scannerCtrl) scannerCtrl.setZone(zoneKey);
  },
  heroCtrl,
  scannerCtrl,
};
