# TypeSpeed V1 - Tests manuels

Ouvrir `http://localhost/typespeed/` avec la console du navigateur ouverte (F12, onglet **Console**).
Pour accélérer les tests, choisir **30 s**.

## Rappel des formules

- Un mot = 5 caractères (espaces compris).
- **WPM brut** = caractères saisis / 5 / minutes écoulées.
- **WPM net** = caractères corrects / 5 / minutes écoulées.
- **Précision** = caractères corrects / caractères saisis x 100 (comparaison position par position sur le contenu actuel du champ).
- La durée utilisée dans les formules a un plancher de 1 seconde.

## Exemples chiffrés (vérifiables à la main)

| Cas | Calcul | Résultat affiché |
|---|---|---|
| 250 caractères saisis en 60 s | 250 / 5 / 1 | **50 WPM** |
| 100 caractères saisis en 30 s | 100 / 5 / 0,5 | **40 WPM** |
| 300 saisis, 285 corrects, 120 s | brut : 300 / 5 / 2 ; net : 285 / 5 / 2 | brut **30**, net **28,5 -> 29** |
| 120 saisis, 117 corrects | 117 / 120 | **97,5 %** (3 erreurs) |
| 80 saisis, 76 corrects | 76 / 80 | **95 %** |
| Rien saisi | division évitée | **0** WPM, précision **-** |
| 1 erreur sur 2 000 caractères (99,95 %) | tronqué à 0,1 | **99,9 %** (jamais 100 % avec une erreur) |

## Scénarios

| # | Scénario | Étapes | Résultat attendu |
|---|---|---|---|
| 1 | Pas de démarrage au clic | Cliquer dans le champ, attendre 3 s | Le chrono reste à la durée choisie |
| 2 | Démarrage à la 1re frappe | Taper une lettre | Le chrono décroît, message « Test en cours » |
| 3 | Durée respectée | Choisir 30 s, taper une lettre, chronométrer | Fin à 30 s (à ±0,2 s) |
| 4 | Fin automatique | Laisser le chrono atteindre 0 | Le récapitulatif « Résultat » apparaît, chrono à 0 |
| 5 | Saisie bloquée | Après la fin, tenter de taper | Le champ est désactivé, rien ne change |
| 6 | Redémarrage | Cliquer sur « Recommencer » (ou Échap) | Chrono = durée, statistiques à 0, champ vide, résultats masqués, nouveau texte |
| 7 | WPM sur exemple | 30 s, saisir exactement 100 caractères, laisser finir | **40 WPM** brut. Si 100 sont corrects : net 40 |
| 8 | Précision sans erreur | Recopier 40 caractères parfaitement | **100 %**, 0 erreur |
| 9 | Précision avec erreurs | Sur 20 caractères saisis, faire exactement 3 fautes | 17 corrects / 20 = **85 %**, 3 erreurs |
| 10 | Retour arrière | Faire une faute, voir « Erreurs : 1 », appuyer sur Retour arrière | Erreurs : 0, caractères saisis -1, précision recalculée |
| 11 | Accents | Recopier un passage avec é, è, à, ç, ô | Les caractères accentués corrects sont verts. Taper `e` à la place de `é` compte une erreur |
| 12 | Champ vide | Charger la page, ne rien taper ; ou taper puis tout effacer | Aucune erreur console, pas de NaN ni d'infini, précision « - » |
| 13 | Changement de durée | Terminer un test, cliquer sur une autre durée | Résultats masqués, nouveau texte, chrono = nouvelle durée |
| 14 | Mobile | Ouvrir sur téléphone (ou F12 > mode appareil, 375 px) | Pas de défilement horizontal, boutons utilisables, statistiques en 2 x 2 |
| 15 | Console propre | Faire plusieurs tests complets | Aucune erreur rouge dans la console |

## Scénarios complémentaires

| Scénario | Résultat attendu |
|---|---|
| Changer d'onglet 10 s pendant un test, revenir | Le temps restant a diminué de 10 s (horloge réelle) |
| Terminer tout le texte avant la fin du temps | Fin immédiate, durée affichée « X s sur 30 s (texte terminé) », WPM calculé sur le temps réel |
| Coller du texte (Ctrl+V), glisser-déposer | Bloqué |
| Flèches, Début, Fin, Entrée dans le champ | Ignorés |
| Cliquer sur une durée pendant un test | Boutons désactivés, rien ne change |
| Redémarrer 10 fois de suite | Un seul chrono actif, comportement identique à chaque fois |
| `http://localhost/typespeed/?duree=30` | 30 s présélectionné ; `?duree=abc` ou `?duree=999` : retombe sur 60 s |
| Vider `data/texts.php` (`return [];`) | Message « Aucun texte disponible », pas d'erreur JavaScript |
| Navigation au clavier (Tab) | Focus visible partout ; Entrée sur « Recommencer » relance le test |

## État des vérifications

Voir la section « Vérifications effectuées » du `README.md`.
