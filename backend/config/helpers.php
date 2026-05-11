<?php
// ===================================================
// TRIBE OF RAISE PH — Backend Helpers
// JWT, CORS, Rate Limiting, Validation, Response
// ===================================================

require_once __DIR__ . '/database.php';

// ---- CORS Headers ----
function setCORSHeaders(): void {
    $allowed = ['https://tribeofraiserph.com', 'http://localhost', 'http://127.0.0.1'];
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed) || APP_ENV === 'development') {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Session, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// ---- JSON Response ----
function respond(array $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function respondError(string $message, int $code = 400): never {
    respond(['success' => false, 'message' => $message], $code);
}

function respondSuccess(array $data = []): never {
    respond(array_merge(['success' => true], $data));
}

// ---- Rate Limiting ----
function checkRateLimit(string $ip, int $limit = RATE_LIMIT): void {
    $key  = "rate_{$ip}_" . floor(time() / 60);
    $file = sys_get_temp_dir() . "/torph_rate_{$key}.tmp";

    $count = file_exists($file) ? (int) file_get_contents($file) : 0;
    if ($count >= $limit) {
        respondError('Too many requests. Slow down, warrior!', 429);
    }
    file_put_contents($file, $count + 1);
}

// ---- JWT ----
function generateJWT(int $userId, string $username): string {
    $header  = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64UrlEncode(json_encode([
        'sub' => $userId,
        'usr' => $username,
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY,
    ]));
    $sig = base64UrlEncode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function verifyJWT(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $sig] = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

    if (!hash_equals($expected, $sig)) return null;

    $data = json_decode(base64UrlDecode($payload), true);
    if (!$data || $data['exp'] < time()) return null;

    return $data;
}

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 4 - strlen($data) % 4));
}

// ---- Auth Middleware ----
function requireAuth(): array {
    $token = $_SERVER['HTTP_X_SESSION'] ?? '';
    if (!$token) respondError('Unauthorized — no session token', 401);

    $data = verifyJWT($token);
    if (!$data) respondError('Unauthorized — invalid or expired token', 401);

    return $data;
}

// ---- Input Validation ----
function getJSON(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function validateUsername(string $name): bool {
    return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $name) === 1;
}

function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function sanitizeString(string $input, int $maxLen = 255): string {
    return substr(htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8'), 0, $maxLen);
}

// ---- Anti-Cheat: Resource Validation ----
function validateResourceAmount(int $amount, int $min = 0, int $max = 1_000_000): bool {
    return $amount >= $min && $amount <= $max;
}

// ---- SQL Injection Prevention (use prepared statements always) ----
function safeQuery(PDO $db, string $sql, array $params = []): \PDOStatement {
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}
