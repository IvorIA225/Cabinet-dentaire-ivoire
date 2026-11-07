# Cabinet Dentaire Ivoire · Site Officiel (Bouaké)

Site vitrine et parcours de prise de rendez-vous conçu pour le **Cabinet Dentaire Ivoire** (Dr Kouakou Hilaire, Avenue Félix Houphouët-Boigny, face au Grand Bazar, Immeuble Librairie de France, 2e étage, Bouaké).

## Architecture du projet

- **Dossier du site livrable (prêt à déployer) :** `scrollcraft/builds/cabinet-dentaire-ivoire/`
  - `index.html` : Structure sémantique, données structurées SEO local (`Dentist` Schema.org), parcours en 5 actes.
  - `styles.css` : Système de design minéral clair, direction artistique mobile dédiée (`860px`, `390px`, `360x640`) et support `prefers-reduced-motion`.
  - `dental-3d.js` : Moteur 3D temps réel (Three.js PBR) pour l'assemblage couronne-implant du héros et le scanner radiographique interactif.
  - `app.js` : Synchronisation du besoin dentaire 3D avec le message WhatsApp prérempli, statut d'ouverture en direct à Bouaké (UTC+0), téléchargement du mémo hors-ligne `.txt` et accessibilité clavier.
  - `scrollcraft.css` & `scrollcraft.js` : Moteur de timeline au défilement.
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

Le dépôt inclut déjà `vercel.json` et `netlify.toml` pointant sur `scrollcraft/builds/cabinet-dentaire-ivoire` :
- **Vercel / Netlify :** importez simplement le dépôt GitHub, aucune configuration manuelle n'est requise.
- **Cloudflare Pages / hébergeur statique :** définissez `scrollcraft/builds/cabinet-dentaire-ivoire` comme dossier racine de publication (aucune commande de build nécessaire).
