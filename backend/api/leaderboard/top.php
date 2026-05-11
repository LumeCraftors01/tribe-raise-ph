<?php
// ===================================================
// TRIBE OF RAISE PH — Leaderboard
// GET /backend/api/leaderboard/top.php
// ===================================================

require_once __DIR__ . '/../../config/helpers.php';

setCORSHeaders();
checkRateLimit($_SERVER['REMOTE_ADDR'], 30);

$db   = getDB();
$stmt = safeQuery($db,
    'SELECT u.username, u.trophies, u.level,
            c.name AS clan_name
     FROM users u
     LEFT JOIN clans c ON u.clan_id = c.id
     WHERE u.is_banned = 0
     ORDER BY u.trophies DESC
     LIMIT 100'
);

$players = array_map(fn($row) => [
    'name'     => $row['username'],
    'trophies' => (int)$row['trophies'],
    'level'    => (int)$row['level'],
    'clan'     => $row['clan_name'] ?? 'No Clan',
    'avatar'   => '⚔️',
], $stmt->fetchAll());

respondSuccess(['players' => $players]);
