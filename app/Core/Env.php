<?php
// app/Core/Env.php

namespace App\Core;

class Env {
    private static array $cache = [];

    public static function get(string $key, $default = null) {
        if (empty(self::$cache)) {
            $path = __DIR__ . '/../../.env';
            if (!file_exists($path)) {
                return $default;
            }
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) continue;
                if (strpos($line, '=') === false) continue;
                [$k, $v] = array_map('trim', explode('=', $line, 2));
                $v = trim($v, "\"' ");
                self::$cache[$k] = $v;
            }
        }
        return self::$cache[$key] ?? $default;
    }
}
