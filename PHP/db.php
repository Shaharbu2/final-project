<?php
// db.php – חיבור בסיסי ל-MySQL עם PDO
// עדכני לפי הפרטים שלך (שם DB/משתמש/סיסמה/שרת)

$DB_HOST = 'localhost';
$DB_NAME = 'ayeletdo_campusnet';
$DB_USER = 'ayeletdo_campususer';
$DB_PASS = 'Shaharburg147';
$DB_CHARSET = 'utf8mb4';

$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";

$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
  exit('DB connection failed: ' . $e->getMessage());
}
