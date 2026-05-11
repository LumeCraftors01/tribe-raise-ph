<?php
// ===================================================
// TRIBE OF RAISE PH — Game: Save Buildings
// POST /backend/api/game/save_buildings.php
// ===================================================

require_once __DIR__ . '/../../config/helpers.php';

setCORSHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respondError('Method not allowed', 405);

$body      = getJSON();
$buildings = $body['buildings'] ?? null;

if (!is_array($buildings)) respondError('Invalid buildings data.');
if (count($buildings) > 500) respondError('Too many buildings (max 500).');

// Basic anti-cheat: validate building levels and counts
foreach ($buildings as $b) {
    if (!isset($b['level']) || $b['level'] < 1 || $b['level'] > 15) {
        respondError('Invalid building level detected.');
    }
}

$db = getDB();
safeQuery($db,
    'UPDATE bases SET buildings_json = ?, updated_at = NOW() WHERE user_id = ?',
    [json_encode($buildings), $auth['sub']]
);

respondSuccess(['message' => 'Village saved.']);
