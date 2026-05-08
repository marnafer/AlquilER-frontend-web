<?php

return [
    'key' => $_ENV['JWT_KEY'] ?? 'fallback_key',
    'alg' => 'HS256',
    'exp' => $_ENV['JWT_EXP'] ?? 3600
];