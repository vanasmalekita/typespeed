<?php
declare(strict_types=1);

/**
 * En-tête commun. Variables attendues (définies par la page appelante) :
 *   $pageTitle       string  Titre de l'onglet
 *   $pageDescription string  Meta description
 */

if (!function_exists('e')) {
    /** Échappe une valeur pour l'affichage dans du HTML. */
    function e(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}

$cssFile = __DIR__ . '/../assets/css/style.css';
$cssVersion = is_file($cssFile) ? (string) filemtime($cssFile) : '1';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($pageTitle ?? 'TypeSpeed') ?></title>
    <meta name="description" content="<?= e($pageDescription ?? '') ?>">
    <meta name="color-scheme" content="light dark">
    <link rel="stylesheet" href="assets/css/style.css?v=<?= e($cssVersion) ?>">
</head>
<body>
<a class="skip-link" href="#typing-input">Aller à la zone de saisie</a>
<header class="site-header">
    <a class="logo" href="./" aria-label="TypeSpeed, retour à l'accueil">TypeSpeed</a>
    <p class="tagline">Testez gratuitement votre vitesse de frappe.</p>
</header>
