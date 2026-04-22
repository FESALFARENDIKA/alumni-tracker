<?php
/**
 * 🚀 ALUMNI TRACKER PROXY (PHP TURBO VERSION)
 * Digunakan untuk Bypass CORS di InfinityFree Tanpa Perlu Server Render/Node.js
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// 🔑 SerpAPI Key
$serpapi_key = "781318403c31dc4aecf60aac47d5540d971eb58ab1c023207148552d339fb261";

$action = $_GET['action'] ?? "";

// --- 1. PDDIKTI SEARCH (Radar) ---
if ($action === 'pddikti') {
    $keyword = $_GET['keyword'] ?? "";
    $url = "https://api-frontend.kemdikbud.go.id/search_mhs";
    $post_data = json_encode(["nama" => $keyword, "nipnim" => $keyword]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Referer: https://pddikti.kemdikbud.go.id/',
        'Origin: https://pddikti.kemdikbud.go.id'
    ]);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 60); 
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); // Force IPv4 for shared hosting
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code !== 200 || !$response) {
        echo json_encode([]); 
    } else {
        echo $response;
    }
} 

// --- 2. PDDIKTI DETAIL ---
else if ($action === 'pddikti_detail') {
    $id = $_GET['id'] ?? "";
    if (!$id) die(json_encode(["error" => "No ID provided"]));
    
    $url = "https://api-frontend.kemdikbud.go.id/detail_mhs/" . $id;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    $response = curl_exec($ch);
    curl_close($ch);
    echo $response;
}

// --- 3. OSINT TRACKING (SerpAPI) ---
else if ($action === 'track') {
    $json = file_get_contents('php://input');
    $data = json_decode($json);
    
    $nama = $data->nama ?? "";
    $query = urlencode("$nama linkedin OR instagram OR facebook OR tiktok");
    $url = "https://serpapi.com/search.json?engine=google&q=$query&api_key=$serpapi_key";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    $response = curl_exec($ch);
    $results = json_decode($response, true);
    curl_close($ch);
    
    $organic = $results['organic_results'] ?? [];
    $linkedin = ""; $instagram = ""; $facebook = ""; $tiktok = "";
    
    foreach ($organic as $res) {
        $link = $res['link'] ?? "";
        if (strpos($link, "linkedin.com") !== false && !$linkedin) $linkedin = $link;
        else if (strpos($link, "instagram.com") !== false && !$instagram) $instagram = $link;
    }
    
    echo json_encode([
        "nama" => $nama,
        "linkedin" => $linkedin,
        "instagram" => $instagram,
        "results_found" => !!($linkedin || $instagram)
    ]);
} 

else {
    echo json_encode(["status" => "PHP Turbo Proxy Active", "server" => $_SERVER['SERVER_SOFTWARE']]);
}
?>
