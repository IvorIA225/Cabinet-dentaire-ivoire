/**
 * app.js — Interactive Dossier, Live Bouaké Clinic Hours, Accessibility Focus & Hero Depth
 * Cabinet Dentaire Ivoire (Bouaké)
 */
(function () {
  "use strict";

  const WA_NUMBER = "2250707171117";
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const CLINICAL_ZONES = {
    douleur: {
      tab: "Douleur ou carie",
      motifLabel: "Soulager une douleur ou soigner une carie",
      title: "Soulager une rage de dents ou soigner une carie",
      body: "Lorsque l'émail est entamé, le froid ou le sucre réveille le nerf. Nous endormons d'abord la zone sans précipitation, retirons la partie abîmée et reconstruisons la dent avec une résine de la teinte naturelle de votre sourire.",
      meta: "Créneau prioritaire : appelez ou écrivez dès 07h30 en semaine en cas de vive douleur.",
      hudZone: "Zone ciblée : couronne et chambre pulpaire",
      suggestSlot: "Urgence (dès que possible)",
    },
    detartrage: {
      tab: "Détartrage et gencives",
      motifLabel: "Détartrage et soin des gencives",
      title: "Retrouver des gencives saines et des dents nettes",
      body: "Le tartre déposé le long de la gencive finit par provoquer des saignements au brossage et une gêne durable. Un nettoyage doux aux ultrasons suivi d'un polissage retire ces dépôts tout en respectant l'émail.",
      meta: "Séance confortable d'environ trente minutes, recommandée une à deux fois par an.",
      hudZone: "Zone ciblée : collet gingival et surface d'émail",
      suggestSlot: null,
    },
    implant: {
      tab: "Dent manquante",
      motifLabel: "Remplacer une dent absente (implant ou prothèse)",
      title: "Remplacer une dent absente de façon stable",
      body: "Un espace vide sollicite trop les dents voisines et complique la mastication. Après examen de votre os, nous posons une racine en titane surmontée d'une couronne céramique ou réalisons une prothèse ajustée à votre bouche.",
      meta: "Bilan complet et devis écrit remis avant de démarrer le traitement.",
      hudZone: "Zone ciblée : ancrage radiculaire en titane",
      suggestSlot: null,
    },
    alignement: {
      tab: "Orthodontie",
      motifLabel: "Alignement dentaire et orthodontie",
      title: "Redresser des dents qui se chevauchent ou s'écartent",
      body: "Des dents bien alignées se nettoient plus facilement et fatiguent moins l'articulation de la mâchoire. Nous suivons les enfants, les adolescents et les adultes avec des rendez-vous réguliers adaptés à vos horaires à Bouaké.",
      meta: "Première consultation dédiée au bilan d'alignement et au calendrier de suivi.",
      hudZone: "Zone ciblée : axe d'alignement de l'arcade",
      suggestSlot: null,
    },
    controle: {
      tab: "Contrôle et enfants",
      motifLabel: "Bilan complet ou visite enfant",
      title: "Vérifier que tout va bien, pour vous ou votre enfant",
      body: "Une carie débutante se traite vite et sans douleur lorsqu'elle est repérée tôt. Chez l'enfant, cette visite permet de découvrir le fauteuil dans le calme et de protéger les dents définitives dès leur apparition.",
      meta: "Créneaux pratiques en matinée du lundi au vendredi ou le samedi de 07h30 à 12h00.",
      hudZone: "Zone ciblée : sillons d'émail et prévention",
      suggestSlot: "Samedi matin (07h30 à 12h00)",
    },
  };

  /* --------------------------------------------------------------------------
     1. LIVE BOUAKE OPENING HOURS (Africa/Abidjan = UTC+0 all year)
     ------------------------------------------------------------------------ */
  function updateBouakeStatus() {
    const badge = document.getElementById("clinic-hours-badge");
    const label = document.getElementById("clinic-hours-text");
    if (!badge || !label) return;

    const now = new Date();
    const utcDay = now.getUTCDay(); // 0 = Sun, 1..5 = Mon..Fri, 6 = Sat
    const mins = now.getUTCHours() * 60 + now.getUTCMinutes();

    let open = false;
    let text = "Lun au Ven 07h30 à 15h00 · Sam 07h30 à 12h00";

    if (utcDay >= 1 && utcDay <= 5) {
      if (mins >= 450 && mins < 900) {
        open = true;
        text = "Ouvert à Bouaké · jusqu'à 15h00";
      } else if (mins < 450) {
        text = "Ouvre ce matin à 07h30";
      } else {
        text = utcDay === 5 ? "Fermé · ouvre samedi à 07h30" : "Fermé · ouvre demain à 07h30";
      }
    } else if (utcDay === 6) {
      if (mins >= 450 && mins < 720) {
        open = true;
        text = "Ouvert ce samedi · jusqu'à 12h00";
      } else if (mins < 450) {
        text = "Ouvre ce matin à 07h30";
      } else {
        text = "Fermé · ouvre lundi à 07h30";
      }
    } else {
      text = "Dimanche fermé · ouvre lundi à 07h30";
    }

    badge.setAttribute("data-open", open ? "true" : "false");
    label.textContent = text;
  }
  updateBouakeStatus();

  /* --------------------------------------------------------------------------
     2. HERO SUBTLE POINTER DEPTH (gated to fine pointer & no reduced motion)
     ------------------------------------------------------------------------ */
  const heroAct = document.getElementById("hero-act");
  if (heroAct && FINE_POINTER && !REDUCED) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let heroVisible = true;
    const hio = new IntersectionObserver((entries) => {
      heroVisible = entries[0]?.isIntersecting ?? false;
    });
    hio.observe(heroAct);

    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse" || !heroVisible) return;
        tx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        ty = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
      },
      { passive: true }
    );

    (function stepHeroPointer() {
      if (heroVisible) {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        heroAct.style.setProperty("--hero-px", cx.toFixed(3));
        heroAct.style.setProperty("--hero-py", cy.toFixed(3));
      }
      requestAnimationFrame(stepHeroPointer);
    })();
  }

  /* --------------------------------------------------------------------------
     3. SYNCHRONIZED 3D CLINICAL EXPLORER & WHATSAPP DOSSIER
     ------------------------------------------------------------------------ */
  const tabs = Array.from(document.querySelectorAll("[data-zone-tab]"));
  const detailTitle = document.getElementById("zone-detail-title");
  const detailBody = document.getElementById("zone-detail-body");
  const detailMeta = document.getElementById("zone-detail-meta");
  const hudZoneLabel = document.getElementById("scanner-zone-label");
  const syncNote = document.getElementById("dossier-sync-note");

  const motifSelect = document.getElementById("dossier-motif");
  const slotSelect = document.getElementById("dossier-slot");
  const nameInput = document.getElementById("dossier-name");
  const noteInput = document.getElementById("dossier-note");
  const previewEl = document.getElementById("wa-preview-text");
  const formEl = document.getElementById("dossier-form");
  const feedbackEl = document.getElementById("dossier-feedback");
  const copyBtn = document.getElementById("copy-wa-btn");
  const downloadMemoBtn = document.getElementById("download-memo-btn");

  let currentZone = "douleur";
  let userTouchedSlot = false;

  if (slotSelect) {
    slotSelect.addEventListener("change", () => {
      userTouchedSlot = true;
      updateWhatsAppPreview();
    });
  }

  function composeWhatsAppMessage() {
    const z = CLINICAL_ZONES[currentZone] || CLINICAL_ZONES.douleur;
    const motif = (motifSelect && motifSelect.value) || z.motifLabel;
    const slot = (slotSelect && slotSelect.value) || "Matin en semaine (07h30 à 11h00)";
    const patientName = nameInput ? nameInput.value.trim() : "";
    const extra = noteInput ? noteInput.value.trim() : "";

    const parts = ["Bonjour Cabinet Dentaire Ivoire,"];
    if (patientName) {
      parts.push(`Je m'appelle ${patientName} et j'aimerais prendre rendez-vous.`);
    } else {
      parts.push("J'aimerais prendre rendez-vous au cabinet de Bouaké.");
    }
    parts.push(`Motif : ${motif}.`);
    parts.push(`Disponibilité souhaitée : ${slot}.`);
    if (extra) {
      parts.push(`Précision : ${extra}.`);
    }
    parts.push("Merci beaucoup.");
    return parts.join(" ");
  }

  function updateWhatsAppPreview() {
    const msg = composeWhatsAppMessage();
    if (previewEl) previewEl.textContent = msg;
    const directWaLink = document.getElementById("direct-wa-fallback");
    if (directWaLink) {
      directWaLink.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    }
  }

  function selectClinicalZone(zoneKey, opts = {}) {
    if (!CLINICAL_ZONES[zoneKey]) return;
    currentZone = zoneKey;
    const z = CLINICAL_ZONES[zoneKey];

    tabs.forEach((btn) => {
      const active = btn.getAttribute("data-zone-tab") === zoneKey;
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.tabIndex = active ? 0 : -1;
    });

    if (detailTitle) detailTitle.textContent = z.title;
    if (detailBody) detailBody.textContent = z.body;
    if (detailMeta) detailMeta.textContent = z.meta;
    if (hudZoneLabel) hudZoneLabel.textContent = z.hudZone;
    if (syncNote) syncNote.textContent = `Motif préparé dans votre demande : ${z.tab}`;

    if (motifSelect && opts.fromSelect !== true) {
      motifSelect.value = z.motifLabel;
    }
    if (slotSelect && !userTouchedSlot && z.suggestSlot) {
      slotSelect.value = z.suggestSlot;
    }

    if (window.Dental3D && typeof window.Dental3D.setZone === "function") {
      window.Dental3D.setZone(zoneKey);
    }

    updateWhatsAppPreview();
  }

  // Wire Peak Explorer tabs + keyboard Left/Right arrow navigation
  tabs.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      selectClinicalZone(btn.getAttribute("data-zone-tab"));
    });
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = tabs[(idx + dir + tabs.length) % tabs.length];
      next.focus();
      selectClinicalZone(next.getAttribute("data-zone-tab"));
    });
  });

  // Wire Act 4 Care Gallery "Choisir ce soin" buttons
  document.querySelectorAll("[data-pick-zone]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const zone = btn.getAttribute("data-pick-zone");
      selectClinicalZone(zone);
      const desk = document.getElementById("rendez-vous");
      if (desk) desk.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
    });
  });

  // Wire Act 5 form inputs
  if (motifSelect) {
    motifSelect.addEventListener("change", () => {
      const matched = Object.entries(CLINICAL_ZONES).find(
        ([, val]) => val.motifLabel === motifSelect.value
      );
      if (matched) selectClinicalZone(matched[0], { fromSelect: true });
      else updateWhatsAppPreview();
    });
  }
  [nameInput, noteInput].forEach((inp) => {
    if (inp) inp.addEventListener("input", updateWhatsAppPreview);
  });

  function showFeedback(text) {
    if (!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.hidden = false;
  }

  if (formEl) {
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = composeWhatsAppMessage();
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      showFeedback(
        "WhatsApp s'ouvre avec votre message préparé pour le (+225) 07 07 17 11 17. Si l'application ne se lance pas sur cet appareil, utilisez le bouton Copier le message ou appelez directement le cabinet."
      );
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const msg = composeWhatsAppMessage();
      try {
        await navigator.clipboard.writeText(msg);
        showFeedback("Votre message a été copié. Vous pouvez le coller dans WhatsApp ou par SMS au (+225) 07 07 17 11 17.");
      } catch {
        showFeedback("Copiez directement l'aperçu du message ci-dessus pour l'envoyer au (+225) 07 07 17 11 17.");
      }
    });
  }

  if (downloadMemoBtn) {
    downloadMemoBtn.addEventListener("click", () => {
      const z = CLINICAL_ZONES[currentZone] || CLINICAL_ZONES.douleur;
      const motif = (motifSelect && motifSelect.value) || z.motifLabel;
      const slot = (slotSelect && slotSelect.value) || "Matin en semaine (07h30 à 11h00)";
      const memoLines = [
        "CABINET DENTAIRE IVOIRE (BOUAKÉ)",
        "Dr Kouakou Hilaire, Chirurgien-dentiste",
        "",
        "VOTRE DEMANDE PRÉPARÉE",
        `Motif : ${motif}`,
        `Créneau souhaité : ${slot}`,
        "",
        "REPÈRES D'ACCÈS À BOUAKÉ",
        "Adresse : Avenue Félix Houphouët-Boigny, face au Grand Bazar",
        "Bâtiment : Immeuble Librairie de France, au 2e étage",
        "Boîte postale : 01 BP 888 Bouaké 01",
        "Google Maps : https://www.google.com/maps/place/Cabinet+Dentaire+Ivoire/@7.683118,-5.0282452,17z",
        "",
        "CONTACTS DIRECTS",
        "WhatsApp et Mobile : (+225) 07 07 17 11 17",
        "Téléphone fixe : (+225) 27 31 63 49 53",
        "Email : cabinetdentaireivoire@yahoo.fr",
        "",
        "HORAIRES D'OUVERTURE",
        "Lundi au vendredi : 07h30 à 15h00",
        "Samedi : 07h30 à 12h00",
        "Dimanche : Fermé",
        "",
        "BON À SAVOIR",
        "Pensez à apporter votre carte d'assurance ou de mutuelle partenaire (dont MUPEMENET-CI) ainsi que vos éventuelles radiographies récentes.",
      ].join("\r\n");

      const blob = new Blob([memoLines], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "memo-cabinet-dentaire-ivoire-bouake.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      showFeedback("La fiche mémo avec l'adresse exacte face au Grand Bazar et les numéros du cabinet a été téléchargée.");
    });
  }

  // Initialize default selection
  selectClinicalZone("douleur");

  /* --------------------------------------------------------------------------
     4. PINNED-ACT & RAIL KEYBOARD FOCUS PARKING (verify.md §Keyboard)
     Ensures Tab into any control inside a pinned or panning act parks scroll
     at a position where its cue is fully open (opacity = 1).
     ------------------------------------------------------------------------ */
  function invertDwell(targetP, L) {
    if (!L) return targetP;
    // Binary search monotone dwell(raw, L) = targetP on [0, 1]
    let lo = 0, hi = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) * 0.5;
      const c = mid - 0.5;
      const val = (1 - L) * mid + L * (4 * c * c * c + 0.5);
      if (val < targetP) lo = mid;
      else hi = mid;
    }
    return (lo + hi) * 0.5;
  }

  window.addEventListener("focusin", (e) => {
    const el = e.target;
    if (!el || !el.closest) return;

    // Case A: Control inside a pinned act's cue
    const cueEl = el.closest("[data-sc-cue]");
    const actEl = el.closest("[data-sc-act]");
    if (cueEl && actEl && ["pin", "scrub"].includes(actEl.getAttribute("data-sc-act"))) {
      const op = parseFloat(getComputedStyle(cueEl).opacity || "1");
      if (op < 0.9) {
        const nums = (cueEl.getAttribute("data-sc-cue") || "0 1").trim().split(/\s+/).map(parseFloat);
        const from = isNaN(nums[0]) ? 0 : nums[0];
        const to = nums.length > 1 && !isNaN(nums[1]) ? nums[1] : 1;
        const midP = (from + to) * 0.5;
        const L = parseFloat(actEl.getAttribute("data-sc-dwell")) || 0;
        const raw = invertDwell(midP, L);
        const rect = actEl.getBoundingClientRect();
        const actTop = rect.top + window.scrollY;
        const travel = Math.max(actEl.offsetHeight - window.innerHeight, 1);
        window.scrollTo({ top: Math.round(actTop + raw * travel), behavior: "instant" });
      }
    }

    // Case B: Control inside horizontal pan rail
    const cardEl = el.closest(".care-card");
    const panAct = el.closest('[data-sc-act="pan"]');
    if (cardEl && panAct && !REDUCED) {
      const rail = panAct.querySelector("[data-sc-pan]");
      if (rail) {
        const over = rail.scrollWidth - window.innerWidth;
        if (over > 0) {
          const targetX = Math.max(0, Math.min(over, cardEl.offsetLeft - window.innerWidth * 0.25));
          const raw = targetX / over;
          const actTop = panAct.getBoundingClientRect().top + window.scrollY;
          const travel = Math.max(panAct.offsetHeight - window.innerHeight, 1);
          window.scrollTo({ top: Math.round(actTop + raw * travel), behavior: "instant" });
        }
      }
    }
  });
})();

