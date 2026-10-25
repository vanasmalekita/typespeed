<?php
declare(strict_types=1);

/**
 * TypeSpeed - page principale.
 * PHP sert la page et fournit les textes. Le test lui-même (chrono, WPM, précision)
 * est entièrement calculé côté navigateur dans assets/js/typing-test.js.
 */

const DURATIONS = [30, 60, 120];
const DEFAULT_DURATION = 60;

// Textes : on ne garde que les chaînes non vides (configuration défensive).
$texts = require __DIR__ . '/data/texts.php';
$texts = is_array($texts) ? $texts : [];
$texts = array_values(array_filter(
    $texts,
    static fn ($text): bool => is_string($text) && trim($text) !== ''
));

// Durée initiale : paramètre facultatif ?duree=30|60|120, validé par liste blanche.
$requested = filter_input(INPUT_GET, 'duree', FILTER_VALIDATE_INT);
$duration = in_array($requested, DURATIONS, true) ? $requested : DEFAULT_DURATION;

$pageTitle = 'TypeSpeed - Test de vitesse de frappe gratuit';
$pageDescription = 'Mesurez gratuitement votre vitesse de frappe (WPM) et votre précision au clavier, directement dans votre navigateur, sans compte.';

require __DIR__ . '/includes/header.php';
?>
<main class="app" id="app" data-default-duration="<?= (int) $duration ?>">
    <h1 class="visually-hidden">Test de vitesse de frappe</h1>

    <section class="controls" aria-label="Réglages du test">
        <div class="duration" role="group" aria-labelledby="duration-label">
            <span class="duration__label" id="duration-label">Durée du test</span>
            <?php foreach (DURATIONS as $seconds): ?>
                <button type="button" class="duration__btn" data-duration="<?= (int) $seconds ?>"
                        aria-pressed="<?= $seconds === $duration ? 'true' : 'false' ?>"><?= (int) $seconds ?> s</button>
            <?php endforeach; ?>
        </div>
        <div class="timer" role="timer" aria-label="Temps restant">
            <span class="timer__value" id="time-left"><?= (int) $duration ?></span><span class="timer__unit"> s</span>
        </div>
    </section>

    <section class="panel" aria-label="Texte à recopier">
        <div class="timebar" aria-hidden="true"><div class="timebar__fill" id="timebar-fill"></div></div>
        <div class="text-display" id="text-display" lang="fr">Chargement du texte…</div>
    </section>

    <div class="field">
        <label class="field__label" for="typing-input">Recopiez le texte ci-dessus ici</label>
        <textarea id="typing-input" class="field__input" rows="3"
                  aria-describedby="text-display hint"
                  autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                  placeholder="Commencez à taper : le chronomètre démarre à la première frappe."></textarea>
        <p class="hint" id="hint">Le chronomètre démarre à votre première frappe.</p>
    </div>

    <dl class="stats" aria-label="Indicateurs de performance">
        <div class="stats__item">
            <dt>Vitesse (WPM)</dt>
            <dd id="stat-wpm">0</dd>
        </div>
        <div class="stats__item">
            <dt>Précision</dt>
            <dd id="stat-accuracy">&mdash;</dd>
        </div>
        <div class="stats__item">
            <dt>Caractères saisis</dt>
            <dd id="stat-typed">0</dd>
        </div>
        <div class="stats__item">
            <dt>Erreurs</dt>
            <dd id="stat-errors">0</dd>
        </div>
    </dl>

    <section class="results" id="results" role="status" hidden>
        <h2 class="results__title">Résultat</h2>
        <dl class="results__list">
            <div><dt>Vitesse brute</dt><dd id="res-wpm-raw"></dd></div>
            <div><dt>Vitesse nette</dt><dd id="res-wpm-net"></dd></div>
            <div><dt>Précision</dt><dd id="res-accuracy"></dd></div>
            <div><dt>Caractères saisis</dt><dd id="res-typed"></dd></div>
            <div><dt>Erreurs</dt><dd id="res-errors"></dd></div>
            <div><dt>Durée du test</dt><dd id="res-duration"></dd></div>
        </dl>
        <p class="results__note">Vitesse brute = caractères saisis ÷ 5 ÷ minutes. Vitesse nette = caractères corrects ÷ 5 ÷ minutes. Un mot vaut 5 caractères, espaces compris.</p>
    </section>

    <div class="actions">
        <button type="button" class="btn" id="restart-btn">Recommencer</button>
    </div>

    <noscript><p class="notice">JavaScript est nécessaire pour utiliser TypeSpeed. Activez-le dans votre navigateur puis rechargez la page.</p></noscript>

    <script type="application/json" id="typespeed-texts"><?= json_encode(
        $texts,
        JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    ) ?></script>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
