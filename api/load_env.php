<?php
/**
 * Simple .env loader (no Composer)
 * Reads key=value pairs from .env into $_ENV
 */

function loadEnv($path)
{
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Split key=value
        [$name, $value] = array_map('trim', explode('=', $line, 2));

        // Remove surrounding quotes
        $value = trim($value, "'\"");

        // Set into environment
        $_ENV[$name] = $value;
        putenv("$name=$value");
    }
}
