# TypeSpeed

Test de vitesse de frappe gratuit en français, directement dans le navigateur : sans compte, sans base de données, sans publicité. Les calculs (chronomètre, WPM, précision) sont faits en JavaScript ; PHP sert la page et fournit les textes.

## Fonctionnalités de la V1

- Durées de 30, 60 ou 120 secondes.
- Chronomètre démarrant à la **première frappe** (pas au clic), fondé sur `performance.now()`.
- Textes français aléatoires avec accents et ponctuation.
- Caractères colorés : corrects, erreurs, position attendue.
- WPM brut et net, précision, caractères saisis, erreurs.
- Récapitulatif final et bouton « Recommencer » (touche Échap également).
- Responsive, thème clair/sombre automatique, navigation au clavier, aucune ressource distante.

## Technologies

PHP 8+ (aucun framework), HTML5, CSS3, JavaScript natif, Git/GitHub.

## Formules

Un mot = 5 caractères (espaces compris).

| Indicateur | Formule |
|---|---|
| WPM brut | caractères saisis / 5 / minutes écoulées |
| WPM net | caractères corrects / 5 / minutes écoulées |
| Précision | caractères corrects / caractères saisis x 100 |

La comparaison se fait position par position sur le contenu actuel du champ : un caractère effacé n'est plus compté. Plancher de 1 s sur la durée des formules. Précision tronquée à 0,1 près.

## Structure

```
typespeed/
├── index.php                  Page principale
├── includes/header.php        En-tête commun (+ fonction e() d'échappement)
├── includes/footer.php        Pied de page + chargement du JS
├── data/texts.php             Textes d'entraînement
├── assets/css/style.css       Styles et variables de couleur
├── assets/js/typing-test.js   Logique du test
├── assets/images/             Réservé aux futures images
├── tests/manual-tests.md      Scénarios de test
├── .gitignore  LICENSE  README.md
```

## Installation locale sous Windows avec XAMPP

1. Installer XAMPP (https://www.apachefriends.org) avec au minimum **Apache** et **PHP**. Choisir une version fournissant PHP 8.x.
2. Ouvrir le **XAMPP Control Panel** et cliquer sur **Start** en face d'**Apache** (le nom devient vert). Si le port 80 est occupé (Skype, IIS...), voir « Dépannage ».
3. Créer le dossier `C:\xampp\htdocs\typespeed`.
4. Copier dedans tout le contenu de ce projet en conservant les sous-dossiers : `index.php` directement dans `typespeed`, `header.php` et `footer.php` dans `includes`, `texts.php` dans `data`, `style.css` dans `assets\css`, `typing-test.js` dans `assets\js`.
5. Ouvrir http://localhost/typespeed/ dans Chrome, Firefox ou Edge.
6. Cliquer dans le champ, taper : le chronomètre démarre à la première lettre.

### Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Apache ne démarre pas | Port 80/443 occupé | Fermer l'application concurrente, ou changer le port dans XAMPP (Config > httpd.conf, `Listen 8080`) puis ouvrir `http://localhost:8080/typespeed/` |
| La page affiche du code PHP | Ouvert par double-clic (`file://`) | Utiliser l'adresse `http://localhost/typespeed/` |
| Erreur 404 | Mauvais dossier | Vérifier `C:\xampp\htdocs\typespeed\index.php` |
| Page sans style, ou « Chargement du texte... » figé | Chemins `assets/` incorrects | Vérifier l'arborescence ci-dessus ; regarder l'onglet Réseau (F12) pour les fichiers en 404 |
| Page blanche | Erreur PHP | Vérifier la version PHP (8+) et `C:\xampp\apache\logs\error.log` |

### Console du navigateur

Appuyer sur **F12** (ou Ctrl+Maj+I), onglet **Console** pour les erreurs JavaScript, onglet **Réseau** pour les fichiers non chargés. Rafraîchir avec Ctrl+F5 après une modification.

### Modifier les textes et les couleurs

- **Textes** : éditer `data/texts.php` (une ligne par texte, entre guillemets doubles, terminée par une virgule). Éviter les guillemets français et les tirets longs, difficiles à taper.
- **Couleurs** : éditer les variables en haut de `assets/css/style.css` (`--accent`, `--bg`, `--ok`, `--bad`...), dans `:root` (clair) et dans le bloc `prefers-color-scheme: dark` (sombre).

## GitHub

Prérequis : Git installé (https://git-scm.com) et un dépôt vide créé sur github.com (sans README ni licence). Remplacer `[Votre nom]` dans `LICENSE`. Dans un terminal, depuis le dossier du projet :

```
git init
git add .
git commit -m "TypeSpeed V1"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/typespeed.git
git push -u origin main
```

GitHub demande de s'authentifier à l'envoi (navigateur ou jeton d'accès personnel). Aucun secret n'est présent dans le code.

## Publication avec PHP

**GitHub Pages ne convient pas** : il n'héberge que des fichiers statiques et n'exécute pas PHP.

Un hébergement mutualisé gratuit avec PHP 8 est la voie la plus simple pour cette application, qui n'a besoin ni de base de données ni de configuration spéciale. D'après des comparatifs publiés en 2026, InfinityFree et Byet (byet.org) proposent du PHP 8.3 avec SSL gratuit ; ces offres, leurs quotas et leurs conditions changent souvent : **vérifiez-les sur le site du fournisseur avant de vous engager**, sans supposer qu'elles dureront. Procédure type :

1. Créer le compte et un site (sous-domaine gratuit).
2. Contrôler que PHP est en version 8.x dans le panneau.
3. Envoyer le contenu du projet (pas le dossier parent) dans le dossier `htdocs` du site, par le gestionnaire de fichiers ou en FTP.
4. Ouvrir l'adresse du site, puis refaire les tests de `tests/manual-tests.md`.

Alternatives : un PaaS avec offre gratuite limitée (par exemple Koyeb, avec support PHP natif d'après les comparatifs, sous réserve des quotas actuels), ou un hébergement mutualisé payant à bas prix si la fiabilité compte. Les offres gratuites peuvent suspendre un site, imposer des limites ou disparaître.

## Limites connues

- Pas d'historique ni de sauvegarde : tout est perdu en rechargeant la page.
- Textes en français uniquement, comparaison stricte (un `e` à la place d'un `é` est une erreur).
- Pas d'adaptation aux dispositions de clavier ; les claviers virtuels mobiles (correction automatique, suggestions) peuvent gêner la saisie.
- Vitesse mesurée sur le contenu actuel du champ (les frappes effacées ne comptent pas).
- Le coller est bloqué ; les flèches et Entrée sont ignorées dans le champ.

## Évolutions envisagées (non développées en V1)

V2 : historique local, catégories, niveaux. V3 : exercices guidés, plusieurs langues, AZERTY/QWERTY. V4 : comptes et base de données. V5 : classement, défis, objectifs, statistiques avancées. `data/texts.php` et la séparation PHP/JS permettent d'ajouter ces fonctions sans tout réécrire.

## Vérifications effectuées

Effectuées par l'auteur de la V1 avant livraison :

- Fonctions de calcul exécutées sous Node : WPM, précision, accents, champ vide, valeurs `NaN`/infinies, génération de texte (tous les exemples chiffrés de `tests/manual-tests.md`).
- Interface exécutée dans Chromium (Playwright) sur une copie HTML statique équivalente à la sortie de `index.php` : démarrage à la première frappe, fin à 30 s, saisie bloquée, redémarrage, changement de durée, erreurs et retour arrière, collage bloqué, fin anticipée, absence d'erreur console, absence de défilement horizontal en 375 px.

**Non vérifié** (à faire par vous) : exécution réelle de `index.php` sous PHP/XAMPP (PHP n'était pas disponible là où le code a été écrit), Firefox et Edge, appareil mobile réel, hébergement public.

## Licence

MIT (voir `LICENSE`).
