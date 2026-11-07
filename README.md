# Cabinet Dentaire Ivoire · Site Officiel (Bouaké)

Site vitrine éditorial et parcours de prise de rendez-vous conçu pour le **Cabinet Dentaire Ivoire** (Dr Kouakou Hilaire, Avenue Félix Houphouët-Boigny, juste en face du Grand Bazar, Immeuble Librairie de France, 2e étage, Bouaké).

## Direction artistique & Architecture

- **Dossier du site livrable (prêt à déployer) :** `scrollcraft/builds/cabinet-dentaire-ivoire/`
  - `index.html` : Structure sémantique en 6 actes (`pin > flow > scrub > pan > pin > flow`), données structurées SEO local (`Dentist` Schema.org), conciergerie WhatsApp et repères d'accès Grand Bazar.
  - `styles.css` : Palette lumineuse Ivoire Solaire (`#FAF6F0`), Travertin Blond (`#F1E9DD`), Encre Expresso (`#1D1611`) et Bronze Champagne (`#7A5422`), typographie `Cormorant Garamond` + `Plus Jakarta Sans`, direction artistique mobile dédiée (`860px`, `390x844`, `360x640`) et support `prefers-reduced-motion`.
  - `app.js` : Montage de la timeline au scroll, parallaxe optique sur le héros multi-plans, mouvement signature **Rideau d'Éclat Ivoire** (comparateur optique avant/après piloté au défilement et manipulable au doigt ou au clavier), synchronisation directe avec le message WhatsApp (`+225 07 07 17 11 17`), statut d'ouverture en direct à Bouaké (`UTC+0`) et fiche d'accès hors-ligne `.txt`.
  - `assets/` : Photographies éditoriales haute définition en WebP, découpes RGBA multi-plans et film studio macro photoréaliste encodé à GOP dense (`03-eclat-nacre.mp4` et `03-eclat-nacre-m.mp4`) pour un défilement fluide image par image.
  - `scrollcraft.css` & `scrollcraft.js` : Moteur de timeline au défilement sans dépendance externe.
  - `BRIEF.md` : Cahier créatif, courbe émotionnelle et architecture de conversion.
- **Registre des empreintes :** `scrollcraft/FINGERPRINTS.md`
- **Configuration d'hébergement automatique :** `vercel.json` et `netlify.toml`

## Lancer en local

Depuis la racine du dépôt :

```bash
npx serve scrollcraft/builds/cabinet-dentaire-ivoire -l 4500
```

Puis ouvrir `http://localhost:4500`.

## Déploiement en production

Le dépôt inclut `vercel.json` et `netlify.toml` pointant directement sur `scrollcraft/builds/cabinet-dentaire-ivoire` :
- **Vercel / Netlify :** importez simplement le dépôt GitHub, aucune configuration manuelle n'est requise.
- **Cloudflare Pages / hébergeur statique :** définissez `scrollcraft/builds/cabinet-dentaire-ivoire` comme dossier racine de publication (aucune commande de build nécessaire).
