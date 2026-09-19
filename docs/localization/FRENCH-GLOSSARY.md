# Glossaire de localisation française

## Statut et portée

Ce document est l'autorité terminologique de travail pour les textes du tracker
en `fr-FR`. Il contraint la future traduction du catalogue sémantique, mais ne
constitue ni ce catalogue ni un dictionnaire de fragments à assembler à
l'exécution.

Les termes Bethesda proviennent des identités qualifiées de
`official-terminology-provenance.csv`. Une valeur observée dans une phrase reste
une preuve contextuelle : elle n'est pas automatiquement une étiquette autonome.
Les termes marqués **tracker** sont des choix éditoriaux correspondant au modèle
précis de l'application, et non des termes officiels Starfield.

## Style et grammaire

- Employer un français logiciel concis et neutre, avec la casse française des
  phrases : seule l'initiale et les noms propres prennent normalement une
  majuscule.
- Rédiger les aides, validations, confirmations et libellés accessibles comme
  des phrases françaises naturelles. Ne pas conserver mécaniquement l'ordre de
  l'anglais.
- Respecter genre, nombre, articles, contractions et élisions dans la phrase.
  Les formes ci-dessous sont des lemmes ou libellés ; elles ne dispensent pas de
  l'accord grammatical.
- Préserver les noms saisis par l'utilisateur et les paramètres de noms de
  référence tels qu'ils sont fournis.

## Terminologie du produit

| Concept anglais | Français privilégié | Statut et preuve | Sens, contextes et exclusions |
| --- | --- | --- | --- |
| Outpost | Avant-poste | **Bethesda officiel**, `term.outpost`; forme autonome et contexte Free Lanes concordants. | Avant-poste construit par le joueur. Nom masculin : `un avant-poste`, `l'avant-poste`. |
| Cargo Link | Liaison | **Bethesda officiel**, `term.cargo-link`; libellé autonome. | Point de liaison logistique géré par le tracker. Employer `Liaison` même si le mot est générique ; rejeter `plateforme cargo` et `liaison de fret`, non attestés comme libellés officiels. |
| Inter-System Cargo Link | Liaison intersystème | **Bethesda officiel**, `term.inter-system-cargo-link`; libellé autonome. | Liaison entre systèmes stellaires nécessitant de l'He-3. `Intersystème` est le modificateur compact attesté par `term.inter-system`. Ne pas employer « interstellaire » pour ce type d'objet. |
| Biome | Biome | **Dérivé de l'officiel / contextuel**, `term.biome`. | Les preuves emploient uniformément `biome`, au singulier ou au pluriel, mais dans des libellés et phrases. Nom masculin. |
| Planet | Planète | **Dérivé de l'officiel / contextuel**, `term.planet`. | Corps de type planète. Ne pas l'utiliser comme terme générique couvrant lunes et objets orbitaux. |
| Planetary Body | Corps céleste | **Dérivé de l'officiel / contextuel**, `term.planetary-body`. | Abstraction inclusive du tracker pour planète, lune ou objet orbital. `Corps planétaire` existe dans une phrase officielle, mais est moins inclusif ; préférer la preuve officielle `corps céleste`. |
| Star System | Système stellaire | **Dérivé de l'officiel / contextuel**, `term.star-system`. | `Système cible` et `système Algorab` sont des formes contextuelles abrégées ; le contexte explicite atteste `système stellaire`. |
| Outpost Management | Gestion d'avant-poste | **Bethesda officiel**, `skill.outpost-management`. | Nom de compétence ; respecter exactement la forme officielle. |
| Outpost Engineering | Ingénierie avant-poste | **Bethesda officiel**, `skill.outpost-engineering`. | Nom de compétence ; ne pas normaliser en `ingénierie d'avant-poste`. |
| Planetary Habitation | Habitat planétaire | **Bethesda officiel**, `skill.planetary-habitation`. | Nom de compétence. |
| Research Methods | Méthodologie | **Bethesda officiel**, `skill.research-methods`. | Nom de compétence ; ne pas élargir en `méthodes de recherche`. |
| Special Projects | Projets spéciaux | **Bethesda officiel**, `skill.special-projects`. | Nom de compétence. |
| X-Tech | X-Tech | **Bethesda officiel**, `term.x-tech`. | Ressource officielle. Token invariant avec trait d'union et majuscules exacts. |
| X-Tech Power Core | Noyau d'énergie X-Tech | **Bethesda officiel**, `term.x-tech-power-core`; nom d'objet autonome. | Les dialogues disent aussi `noyau de X-Tech`. Pour le nom d'objet et le concept du tracker, conserver `Noyau d'énergie X-Tech`; ne pas réduire au variant contextuel. |
| Starfield | Starfield | **Produit invariant** ; `term.starfield` est contextuellement ambigu en français. | L'identité qualifiée donne `Cosmos étoilé`, traduction du sens commun de l'anglais à cet emplacement, pas un motif pour traduire le titre du produit. Toujours préserver `Starfield`. |
| Planned Supply | Approvisionnement planifié | **Tracker**. | Assertion virtuelle qu'un élément sera approvisionné ultérieurement. Ce n'est ni du stock présent, ni une réservation, ni une livraison réelle. Employer comme nom de fonctionnalité. |
| Present | Présence | **Tracker**. | Colonne compacte : ressource possible ou explicitement enregistrée sur l'avant-poste, jamais quantité en stock. `Actuel` et `Présent` sont rejetés respectivement comme temporel et sujet à accord de genre. |
| Producing | En production | **Tracker**. | État configuré d'extraction, récolte ou fabrication active, sans notion de débit. Évite l'accord variable de `produit/produite`. |
| Inputs | Intrants | **Tracker**. | Éléments requis par une recette ou une production organique. Rejeter `entrées`, trop proche de la saisie de données. |
| Logistics | Logistique | **Tracker**. | Éléments réellement affectés à une exportation acheminée ; ne signifie pas simplement « exportables ». |
| Manufacturing | Fabrication | **Tracker**. | Production configurée de produits manufacturés à partir d'intrants. Aucun débit n'est modélisé. |
| Validation | Validation | **Tracker**. | Ensemble des erreurs, avertissements et informations issus des règles du domaine. Ne pas traduire par `vérification` quand il s'agit du nom de la fonctionnalité. |
| Resource Matrix | Matrice des ressources | **Tracker**. | Vue matricielle Présence / En production / Intrants / Logistique. |
| Reshuffle | Réorganiser | **Tracker**. | Entrer dans le mode de modification de l'ordre. Rejeter `mélanger`, qui implique un ordre aléatoire. |
| Lock order / Lock | Verrouiller l'ordre | **Tracker**. | Terminer ou empêcher la réorganisation. Dans les phrases, accorder selon le contrôle concerné. |
| Inorganic | Inorganique | **Tracker**. | Catégorie de ressources. Employer `Ressources inorganiques` pour un titre développé et `Inorganiques` seulement si le contexte de ressources est déjà explicite. |
| Organic | Organique | **Tracker**. | Catégorie de ressources. Employer `Ressources organiques` pour un titre développé. Ne pas confondre récolte organique et extraction minérale. |
| Network | Réseau | **Tracker**. | Document regroupant des avant-postes et leurs liaisons ; pas nécessairement un réseau informatique. |
| Active Production | Production active | **Tracker**. | Terme générique pour extraction, récolte ou fabrication actuellement configurée. |
| Source / Destination | Source / Destination | **Tracker**. | Origine locale, organique, manufacturée, importée ou virtuelle / avant-poste receveur d'une liaison. |
| Import / Export (JSON) | Importer / Exporter | **Tracker**. | Opérations de fichier sur toute la collection. Les flux logistiques doivent employer un vocabulaire d'acheminement, pas les verbes de fichier. |
| Undo / Redo | Annuler / Rétablir | **Tracker**. | Navigation dans l'historique d'édition de la session. |
| Error / Warning / Info | Erreur / Avertissement / Information | **Tracker**. | Niveaux de validation. Ne pas renforcer un avertissement en erreur pendant la traduction. |

## Variantes officielles et décisions contextuelles

- `term.x-tech-power-core` présente deux formes officielles : le nom autonome
  `Noyau d'énergie X-Tech` et, dans les phrases, `noyau de X-Tech`. Le premier
  est le terme canonique du tracker ; le second reste disponible uniquement
  lorsque la grammaire d'une phrase le justifie.
- `term.planetary-body` présente `corps planétaires` et `corps célestes`.
  L'abstraction du tracker inclut plus que les seules planètes ; `corps céleste`
  est donc la recommandation contextuelle, pas une réécriture de la preuve.
- `term.star-system` présente `système cible`, `système stellaire` et des noms
  composés comme `système Algorab`. Utiliser `système stellaire` comme libellé
  autonome et permettre les contractions naturelles dans les phrases.
- La valeur française observée pour l'identité anglaise `Starfield` est
  `Cosmos étoilé`. Elle décrit le sens commun à cet emplacement et ne remplace
  pas le nom invariant du produit.
- `Cargo Pad` ne possède aucune preuve officielle active dans les sources
  approuvées. Le terme de présentation est retiré ; les identifiants internes
  `CargoPad` restent inchangés.

## Tokens protégés et abréviations

Préserver exactement :

- les paramètres (`{count}`, `{outpost}`, `{resource}`) et leurs accolades ASCII ;
- `He-3`, `JSON`, `FormID`, les identifiants, versions et extensions comme `.json` ;
- `X-Tech` et `Starfield` ;
- les abréviations de ressource et les accords de touches (`Ctrl`, `Shift`, `Z`, `Esc`) ;
- les noms saisis par l'utilisateur et les noms Bethesda injectés comme paramètres.

Ne pas créer d'abréviation française pour les termes longs sans décision
éditoriale distincte. La phrase finale doit rester propre au français ; le
glossaire ne doit jamais servir à concaténer mécaniquement des fragments.
