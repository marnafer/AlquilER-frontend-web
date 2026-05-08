<?php

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'dev_secret_123');
define('JWT_EXPIRATION', 3600);

define('APP_ENV', 'development');

if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
}