/* ============================================================================
   app.js — Cabinet Dentaire Ivoire (Refonte v2 · Maison de Soin & Esthétique)
   Interactions utiles :
     1. Statut d'ouverture en direct sur le fuseau de Bouaké (UTC+0)
     2. Parallaxe optique douce au pointeur sur le héros multi-plans
     3. Mouvement signature (Acte 5) : Rideau d'Éclat Ivoire piloté par --sc-p
        et débrayable librement au doigt, à la souris ou au clavier
     4. Synchronisation entre la galerie (Acte 4), le rideau d'éclat (Acte 5)
        et la conciergerie WhatsApp (+225 07 07 17 11 17) (Acte 6)
     5. Copie presse-papiers, téléchargement de la fiche d'accès .txt et
        accessibilité clavier complète sur les scènes épinglées et le rail
   ========================================================================== */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE_POINTER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var WHATSAPP_NUMBER = "2250707171117";

  /* -------------------------------------------------------------------------
     1. DONNÉES CLINIQUES EN FRANÇAIS NATUREL (Zéro jargon, zéro tiret cadratin)
     ----------------------------------------------------------------------- */
  var INTENTS = {
    eclat: {
      label: "Éclat et détartrage",
      title: "Retrouver une teinte saine et des gencives apaisées",
      body: "Le thé, le café et le tartre ternissent progressivement l'émail et irritent les gencives. Un détartrage doux aux ultrasons suivi d'un polissage soigné redonne fraîcheur et éclat naturel dès la première séance.",
      motif: "Retrouver l'éclat du sourire (détartrage, polissage ou gencives)",
      momentHint: "En semaine (lundi au vendredi, 07h30 à 15h00)"
    },
    prothese: {
      label: "Dent abîmée ou absente",
      title: "Réparer ou remplacer une dent sans démarcation visible",
      body: "Une dent fracturée ou absente fatigue les dents voisines et gêne le sourire. Couronne en céramique nacrée, prothèse ajustée ou implant solide : nous choisissons ensemble la solution durable adaptée à votre bouche.",
      motif: "Réparer ou remplacer une dent (couronne céramique, prothèse ou implant)",
      momentHint: "En semaine (lundi au vendredi, 07h30 à 15h00)"
    },
    alignement: {
      label: "Alignement harmonieux",
      title: "Réaligner les dents en douceur, à tout âge",
      body: "Des dents bien alignées se brossent plus facilement et équilibrent tout le visage. Après un bilan précis, nous proposons un suivi progressif adapté à l'enfant, à l'adolescent ou à l'adulte.",
      motif: "Aligner les dents (orthodontie enfant, ado ou adulte)",
      momentHint: "Le samedi matin (07h30 à 12h00)"
    },
    urgence: {
      label: "Soulager une douleur",
      title: "Calmer rapidement une rage de dents ou une dent sensible",
      body: "Quand le froid, le chaud ou la mastication réveillent une vive douleur, attendre aggrave l'inflammation. Nous endormons doucement la zone dès votre arrivée pour vous soulager sans stress.",
      motif: "Soulager une douleur ou une urgence dentaire",
      momentHint: "Dès que possible (créneau prioritaire dès 07h30)"
    }
  };

  /* -------------------------------------------------------------------------
     2. STATUT D'OUVERTURE EN DIRECT À BOUAKÉ (Côte d'Ivoire = UTC+0 toute l'année)
     ----------------------------------------------------------------------- */
  function updateBouakeHours() {
    var el = document.getElementById("live-hours-status");
    if (!el) return;

    var now = new Date();
    var day = now.getUTCDay(); // 0 = Dim, 1..5 = Lun..Ven, 6 = Sam
    var mins = now.getUTCHours() * 60 + now.getUTCMinutes();

    var isOpen = false;
    var statusText = "";

    if (day >= 1 && day <= 5) {
      if (mins >= 450 && mins < 900) {
        isOpen = true;
        statusText = "Bouaké · Cabinet ouvert jusqu'à 15h00";
      } else if (mins < 450) {
        statusText = "Bouaké · Ouvre ce matin à 07h30";
      } else {
        statusText = day === 5
          ? "Bouaké · Ouvre samedi à 07h30"
          : "Bouaké · Ouvre demain à 07h30";
      }
    } else if (day === 6) {
      if (mins >= 450 && mins < 720) {
        isOpen = true;
        statusText = "Bouaké · Cabinet ouvert ce samedi jusqu'à 12h00";
      } else if (mins < 450) {
        statusText = "Bouaké · Ouvre ce samedi à 07h30";
      } else {
        statusText = "Bouaké · Ouvre lundi dès 07h30";
      }
    } else {
      statusText = "Bouaké · Fermé dimanche, ouvre lundi à 07h30";
    }

    el.setAttribute("data-open", isOpen ? "true" : "false");
    el.textContent = statusText;
  }

  /* -------------------------------------------------------------------------
     3. PARALLAXE DOUCE AU POINTEUR SUR LE HÉROS MULTI-PLANS
     ----------------------------------------------------------------------- */
  function initHeroPointer() {
    if (!FINE_POINTER || REDUCED) return;
    var heroAct = document.getElementById("hero-act");
    var heroStage = document.querySelector(".hero-stage");
    if (!heroAct || !heroStage) return;

    var tx = 0;
    var ty = 0;
    var cx = 0;
    var cy = 0;
    var active = true;
    var raf = 0;

    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      heroStage.style.setProperty("--hero-px", cx.toFixed(4));
      heroStage.style.setProperty("--hero-py", cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    }

    var io = new IntersectionObserver(function (entries) {
      active = !!(entries[0] && entries[0].isIntersecting);
    });
    io.observe(heroAct);

    window.addEventListener(
      "pointermove",
      function (e) {
        if (!active || e.pointerType !== "mouse") return;
        tx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        ty = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
        if (!raf) raf = requestAnimationFrame(tick);
      },
      { passive: true }
    );
  }

  /* -------------------------------------------------------------------------
     4. MOUVEMENT SIGNATURE : LE RIDEAU D'ÉCLAT IVOIRE (Scroll + Tactile/Clavier)
     ----------------------------------------------------------------------- */
  var currentIntent = "eclat";

  function initEclatCurtain() {
    var actEl = document.getElementById("eclat");
    var loupeEl = document.getElementById("eclat-loupe-stage");
    var rangeEl = document.getElementById("eclat-range");
    if (!actEl || !loupeEl || !rangeEl) return;

    var manualOverride = false;
    var visible = true;
    var shownPct = REDUCED ? 38 : 84;

    function applyCurtain(pct) {
      var clamped = Math.max(4, Math.min(96, pct));
      loupeEl.style.setProperty("--curtain-pos", clamped.toFixed(2) + "%");
      rangeEl.value = String(Math.round(clamped));
      loupeEl.setAttribute(
        "data-sc-verify-state",
        "curtain:" + Math.round(clamped) + "|intent:" + currentIntent
      );
    }

    rangeEl.addEventListener("input", function () {
      manualOverride = true;
      shownPct = parseFloat(rangeEl.value) || 50;
      applyCurtain(shownPct);
    });

    var io = new IntersectionObserver(
      function (entries) {
        var nowVis = !!(entries[0] && entries[0].isIntersecting);
        if (!nowVis && visible) {
          manualOverride = false;
        }
        visible = nowVis;
      },
      { rootMargin: "150px 0px" }
    );
    io.observe(actEl);

    if (REDUCED) {
      applyCurtain(38);
      return { refreshVerify: function () { applyCurtain(shownPct); } };
    }

    function smoothstep(a, b, x) {
      var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }

    function loop() {
      if (visible && !document.hidden && !manualOverride) {
        var p = parseFloat(actEl.style.getPropertyValue("--sc-p")) || 0;
        // De p=0.06 à p=0.82, le voile doré glisse de 86 % vers 16 % à travers le sourire (situé autour de 60 %)
        var sweep = smoothstep(0.06, 0.82, p);
        var targetPct = 86 - sweep * 70;
        shownPct += (targetPct - shownPct) * 0.16;
        applyCurtain(shownPct);
      }
      requestAnimationFrame(loop);
    }

    applyCurtain(shownPct);
    requestAnimationFrame(loop);

    return {
      refreshVerify: function () {
        applyCurtain(shownPct);
      }
    };
  }

  /* -------------------------------------------------------------------------
     5. SYNCHRONISATION DES INTENTIONS DE SOIN & CONCIERGERIE WHATSAPP
     ----------------------------------------------------------------------- */
  var motifHidden = document.getElementById("concierge-motif");
  var momentHidden = document.getElementById("concierge-moment");
  var nameInput = document.getElementById("patient-name");
  var mutuelleInput = document.getElementById("patient-mutuelle");
  var previewText = document.getElementById("wa-preview-text");
  var directAnchor = document.getElementById("wa-direct-anchor");
  var feedbackEl = document.getElementById("concierge-feedback");

  function composeWhatsAppMessage() {
    var motif = motifHidden ? motifHidden.value : INTENTS.eclat.motif;
    var moment = momentHidden ? momentHidden.value : "Dès que possible (créneau prioritaire dès 07h30)";
    var nom = nameInput ? nameInput.value.trim() : "";
    var note = mutuelleInput ? mutuelleInput.value.trim() : "";

    var parts = ["Bonjour Cabinet Dentaire Ivoire,"];
    if (nom) {
      parts.push("Je m'appelle " + nom + " et j'aimerais prendre rendez-vous au cabinet de Bouaké.");
    } else {
      parts.push("J'aimerais prendre rendez-vous au cabinet de Bouaké.");
    }
    parts.push("Motif : " + motif + ".");
    parts.push("Disponibilité souhaitée : " + moment + ".");
    if (note) {
      parts.push("Précision : " + note + ".");
    }
    parts.push("Merci beaucoup.");
    return parts.join(" ");
  }

  function refreshWhatsAppComposer() {
    var msg = composeWhatsAppMessage();
    if (previewText) previewText.textContent = msg;
    if (directAnchor) {
      directAnchor.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
    }
  }

  function activateChipGroup(containerId, hiddenInput, attrName, targetValue) {
    var container = document.getElementById(containerId);
    if (!container || !hiddenInput) return;
    hiddenInput.value = targetValue;
    var chips = container.querySelectorAll(".choice-chip");
    chips.forEach(function (chip) {
      var match = chip.getAttribute(attrName) === targetValue;
      chip.classList.toggle("is-active", match);
      chip.setAttribute("aria-pressed", match ? "true" : "false");
    });
    refreshWhatsAppComposer();
  }

  function selectIntent(intentKey, curtainCtrl, scrollToConcierge) {
    var data = INTENTS[intentKey];
    if (!data) return;
    currentIntent = intentKey;

    var tabs = document.querySelectorAll("[data-intent-tab]");
    tabs.forEach(function (tab) {
      var active = tab.getAttribute("data-intent-tab") === intentKey;
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
    });

    var titleEl = document.getElementById("intent-story-title");
    var bodyEl = document.getElementById("intent-story-body");
    var syncEl = document.getElementById("intent-story-sync");
    if (titleEl) titleEl.textContent = data.title;
    if (bodyEl) bodyEl.textContent = data.body;
    if (syncEl) syncEl.textContent = "Sélection enregistrée pour votre demande : " + data.label;

    activateChipGroup("motif-chips", motifHidden, "data-motif", data.motif);
    if (intentKey === "urgence") {
      activateChipGroup("moment-chips", momentHidden, "data-moment", data.momentHint);
    }

    if (curtainCtrl && curtainCtrl.refreshVerify) {
      curtainCtrl.refreshVerify();
    }

    if (scrollToConcierge) {
      var target = document.getElementById("rendez-vous");
      if (target) {
        target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
      }
    }
  }

  function showToast(text) {
    if (!feedbackEl) return;
    feedbackEl.textContent = text;
    feedbackEl.hidden = false;
  }

  function buildMemoCardText() {
    var motif = motifHidden ? motifHidden.value : INTENTS.eclat.motif;
    var moment = momentHidden ? momentHidden.value : "";
    return [
      "CABINET DENTAIRE IVOIRE · BOUAKÉ",
      "Chirurgien-dentiste : Dr Kouakou Hilaire",
      "",
      "ADRESSE EXACTE :",
      "Avenue Félix Houphouët-Boigny, juste en face du Grand Bazar",
      "Immeuble Librairie de France, 2e étage (01 BP 888 Bouaké 01)",
      "Coordonnées GPS : 7.683118, -5.0282452",
      "",
      "CONTACTS :",
      "Mobile et WhatsApp : (+225) 07 07 17 11 17",
      "Téléphone fixe : (+225) 27 31 63 49 53",
      "Email : cabinetdentaireivoire@yahoo.fr",
      "",
      "HORAIRES D'OUVERTURE :",
      "Lundi au vendredi : 07h30 à 15h00",
      "Samedi : 07h30 à 12h00 (Fermé le dimanche)",
      "",
      "MUTUELLES :",
      "Partenaire de réseaux de prévoyance et mutuelles dont la MUPEMENET-CI",
      "Pensez à apporter votre carte d'assuré.",
      "",
      "DEMANDE PRÉPARÉE :",
      "Motif : " + motif,
      "Créneau souhaité : " + moment
    ].join("\r\n");
  }

  /* -------------------------------------------------------------------------
     6. ACCESSIBILITÉ CLAVIER SUR LES ACTES ÉPINGLÉS & LE RAIL HORIZONTAL
     ----------------------------------------------------------------------- */
  function initKeyboardScrollAssist() {
    document.addEventListener("focusin", function (e) {
      var el = e.target;
      if (!(el instanceof HTMLElement)) return;

      var cue = el.closest("[data-sc-cue]");
      var pinnedAct = el.closest('[data-sc-act="pin"], [data-sc-act="scrub"]');
      if (cue && pinnedAct) {
        var raw = (cue.getAttribute("data-sc-cue") || "0 1").trim().split(/\s+/).map(Number);
        var from = isNaN(raw[0]) ? 0 : raw[0];
        var to = isNaN(raw[1]) ? 1 : raw[1];
        var midP = (from + to) * 0.5;
        var rect = pinnedAct.getBoundingClientRect();
        var actTop = rect.top + window.scrollY;
        var travel = Math.max(0, pinnedAct.offsetHeight - window.innerHeight);
        var currentP = travel > 0 ? (window.scrollY - actTop) / travel : 0;
        if (currentP < from + 0.04 || currentP > to - 0.04) {
          window.scrollTo({ top: Math.round(actTop + midP * travel), behavior: "instant" });
          if (window.ScrollCraft && window.ScrollCraft.instances && window.ScrollCraft.instances[0]) {
            window.ScrollCraft.instances[0].read();
          }
        }
        return;
      }

      var panAct = el.closest('[data-sc-act="pan"]');
      var rail = el.closest("[data-sc-pan]");
      if (panAct && rail) {
        if (REDUCED) {
          el.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
        } else {
          var item = el.closest(".lookbook-plate, .lookbook-endnote");
          if (item) {
            var maxShift = Math.max(1, rail.scrollWidth - window.innerWidth);
            var desiredX = Math.max(0, Math.min(maxShift, item.offsetLeft - window.innerWidth * 0.25));
            var ratio = desiredX / maxShift;
            var panTop = panAct.getBoundingClientRect().top + window.scrollY;
            var panTravel = Math.max(0, panAct.offsetHeight - window.innerHeight);
            window.scrollTo({ top: Math.round(panTop + ratio * panTravel), behavior: "instant" });
            if (window.ScrollCraft && window.ScrollCraft.instances && window.ScrollCraft.instances[0]) {
              window.ScrollCraft.instances[0].read();
            }
          }
        }
      }
    });
  }

  /* -------------------------------------------------------------------------
     7. INITIALISATION
     ----------------------------------------------------------------------- */
  if (window.ScrollCraft && typeof window.ScrollCraft.mount === "function") {
    window.ScrollCraft.mount();
  }
  updateBouakeHours();
  initHeroPointer();
  var curtainCtrl = initEclatCurtain();
  initKeyboardScrollAssist();

  // Onglets d'intention de l'Acte 5 (clic + flèches clavier)
  var intentTabs = Array.prototype.slice.call(document.querySelectorAll("[data-intent-tab]"));
  intentTabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () {
      selectIntent(tab.getAttribute("data-intent-tab"), curtainCtrl, false);
    });
    tab.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var nextIdx = (idx + (e.key === "ArrowRight" ? 1 : -1) + intentTabs.length) % intentTabs.length;
      intentTabs[nextIdx].focus();
      selectIntent(intentTabs[nextIdx].getAttribute("data-intent-tab"), curtainCtrl, false);
    });
  });

  // Boutons rapides de la galerie lookbook (Acte 4 -> Acte 6)
  document.querySelectorAll("[data-pick-intent]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectIntent(btn.getAttribute("data-pick-intent"), curtainCtrl, true);
    });
  });

  // Pastilles de choix de la conciergerie (Acte 6)
  document.querySelectorAll("#motif-chips .choice-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      activateChipGroup("motif-chips", motifHidden, "data-motif", chip.getAttribute("data-motif"));
    });
  });
  document.querySelectorAll("#moment-chips .choice-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      activateChipGroup("moment-chips", momentHidden, "data-moment", chip.getAttribute("data-moment"));
    });
  });

  if (nameInput) nameInput.addEventListener("input", refreshWhatsAppComposer);
  if (mutuelleInput) mutuelleInput.addEventListener("input", refreshWhatsAppComposer);

  var form = document.getElementById("concierge-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = composeWhatsAppMessage();
      var waUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
      var popup = window.open(waUrl, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.href = waUrl;
      }
      showToast("Votre message s'ouvre dans WhatsApp vers le (+225) 07 07 17 11 17. Vous pouvez aussi appeler directement l'accueil.");
    });
  }

  var copyBtn = document.getElementById("copy-wa-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var msg = composeWhatsAppMessage();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(function () {
          showToast("Texte copié. Collez-le directement dans votre conversation WhatsApp avec le (+225) 07 07 17 11 17.");
        });
      }
    });
  }

  var memoBtn = document.getElementById("download-memo-btn");
  if (memoBtn) {
    memoBtn.addEventListener("click", function () {
      var blob = new Blob([buildMemoCardText()], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "fiche-acces-cabinet-dentaire-ivoire-bouake.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      showToast("Fiche d'accès téléchargée avec le repère du Grand Bazar et les contacts du cabinet.");
    });
  }

  refreshWhatsAppComposer();
})();
