# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| `cabinet-dentaire-ivoire` | Clinical Atelier & Active Dossier (bespoke) | Fixed frosted status & waypoint bar (live Bouaké UTC+0 opening dot + 4 anchor links + single `Prendre rendez-vous` CTA) | 5-plane architectural depth + real-time 3D porcelain-ivory molar crown seating onto a machined titanium implant (`pin` + `parallax` + `kinetic`) | 5 acts · `10.9vh` desktop (`pin > flow > pin > pan > flow`) | Active WhatsApp consultation composer synced with 3D need selector + downloadable `.txt` access memo + Grand Bazar vector landmark map & colophon | Scroll-driven 3D Radioscopy Scanner (`#scanner-3d-canvas`) sweeping a local clipping X-ray plane across a 4-cusp molar & bifurcated roots/implant while syncing patient symptom selection directly into the WhatsApp booking dossier | Cool mineral alabaster (`#f4f6f9`), deep slate ink (`#0e1724`), surgical cobalt (`#1352b8`), `Outfit` + `Plus Jakarta Sans` + `JetBrains Mono` | `4500` |
| `cabinet-dentaire-ivoire-v2` *(supersedes row 1; differs 6/6)* | Gallery / Lookbook & Scrubbed Cinema | Split floating two-capsule ivory masthead (independent serif brand capsule left + frosted nav & `Prendre rendez-vous` pill right; zero full-width bar) | 5-plane warm sunlit portrait arch & champagne glass prism depth (`pin` + `parallax` + `kinetic="lines"` + genuine RGBA Roman arch cutout occluding monumental italic depth mark) | 6 acts · `14.8vh` desktop (`pin > flow > scrub > pan > pin > flow`) | Tactile chip-based two-step WhatsApp concierge composer paired with a warm Roman travertine architectural orientation plaque for Grand Bazar Bouaké | *Le Rideau d'Éclat Ivoire* (`#eclat-loupe-stage`) — scroll-scrubbed (`--sc-p`) & finger/keyboard-draggable champagne optical veil sweeping across pixel-registered before/after studio smile photography while syncing the chosen care intention into WhatsApp | Warm sunlit ivory (`#faf6f0`), Roman travertine (`#f1e9dd`), espresso ink (`#1d1611`) + dark espresso cinema interlude (`#18120e`), burnished champagne-bronze (`#7a5422` / `#e2bf8a`), `Cormorant Garamond` + `Plus Jakarta Sans` | `4500` |

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **`cabinet-dentaire-ivoire` (first build, shares 0 columns with prior rows):** Claims the **Clinical Atelier & Active Dossier** grammar, a **fixed status bar with live opening-hours dot**, a **5-plane architectural + exploded 3D crown-to-implant seating hero**, the **5-act `10.9vh` (`pin > flow > pin > pan > flow`)** sequence band, an **Active WhatsApp Consultation Dossier + downloadable `.txt` memo + landmark map** close, and the **scroll-scrubbed 3D Radioscopy X-Ray clipping plane** signature move in a cool mineral-alabaster / surgical-cobalt light world.
- **`cabinet-dentaire-ivoire-v2` (Refonte v2 superseding `cabinet-dentaire-ivoire`; shares 0 of 6 structural columns with Row 1 — differs 6/6):** Claims the **Gallery / Lookbook & Scrubbed Cinema** grammar, a **split floating two-capsule ivory masthead**, a **5-plane sunlit Roman-arch smile portrait + RGBA champagne prism foreground** hero, the **6-act `14.8vh` (`pin > flow > scrub > pan > pin > flow`)** sequence band with a dark espresso dense-GOP macro cinema act (`03-eclat-nacre.mp4`), a **tactile chip-based WhatsApp concierge + Roman travertine orientation plaque** close, and the **Rideau d'Éclat Ivoire optical before/after smile curtain** signature move in a warm ivory, travertine, and champagne-bronze world (`Cormorant Garamond` + `Plus Jakarta Sans`).

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
