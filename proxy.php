<?php
/**
 * 🚀 ALUMNI TRACKER PROXY (PHP VERSION)
 * Digunakan untuk Bypass CORS di InfinityFree Tanpa Perlu Server Render/Node.js
 * 
 * Cara Pakai: Upload file ini ke folder /htdocs/ Anda.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// 🔑 Ganti dengan SerpAPI Key Anda
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
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo $response ? $response : json_encode(["error" => "PDDikti Timeout"]);
} 

// --- 2. PDDIKTI DETAIL ---
else if ($action === 'pddikti_detail') {
    $id = $_GET['id'] ?? "";
    if (!$id) die(json_encode(["error" => "No ID provided"]));
    
    $url = "https://api-frontend.kemdikbud.go.id/detail_mhs/" . $id;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    echo $response;
}

// --- 3. OSINT TRACKING (SerpAPI) ---
else if ($action === 'track') {
    $json = file_get_contents('php://input');
    $data = json_decode($json);
    
    $nama = $data->nama ?? "";
    $prodi = $data->prodi ?? "";
    $fak = $data->fakultas ?? "";
    
    $query = urlencode("$nama $prodi $fak linkedin OR instagram OR facebook OR tiktok");
    $url = "https://serpapi.com/search.json?engine=google&q=$query&api_key=$serpapi_key";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $results = json_decode($response, true);
    curl_close($ch);
    
    $organic = $results['organic_results'] ?? [];
    $linkedin = ""; $instagram = ""; $facebook = ""; $tiktok = "";
    
    foreach ($organic as $res) {
        $link = $res['link'] ?? "";
        if (strpos($link, "linkedin.com") !== false && !$linkedin) $linkedin = $link;
        else if (strpos($link, "instagram.com") !== false && !$instagram) $instagram = $link;
        else if (strpos($link, "facebook.com") !== false && !$facebook) $facebook = $link;
        else if (strpos($link, "tiktok.com") !== false && !$tiktok) $tiktok = $link;
    }
    
    echo json_encode([
        "nama" => $nama,
        "linkedin" => $linkedin,
        "instagram" => $instagram,
        "facebook" => $facebook,
        "tiktok" => $tiktok,
        "results_found" => !!($linkedin || $instagram || $facebook || $tiktok)
    ]);
} 

else {
    echo json_encode(["status" => "All-in-One PHP Proxy is Operational", "os" => PHP_OS]);
}
?>
