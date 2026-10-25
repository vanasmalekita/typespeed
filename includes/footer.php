<?php
declare(strict_types=1);

$jsFile = __DIR__ . '/../assets/js/typing-test.js';
$jsVersion = is_file($jsFile) ? (string) filemtime($jsFile) : '1';
?>
<footer class="site-footer">
    <p>TypeSpeed V1 &middot; Gratuit, sans compte, sans publicité. Aucune frappe n'est enregistrée ni envoyée : tout reste dans votre navigateur.</p>
</footer>
<script src="assets/js/typing-test.js?v=<?= e($jsVersion) ?>"></script>
</body>
</html>
