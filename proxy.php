<?php
/**
 * 🚀 ALUMNI TRACKER PROXY V3.2 (REVERTED OSINT LOGIC)
 * Reverted to user's preferred simple query for better LinkedIn accuracy.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$serpapi_key = "781318403c31dc4aecf60aac47d5540d971eb58ab1c023207148552d339fb261";
$action = $_GET['action'] ?? "";

// --- 1. PDDIKTI SEARCH ---
if ($action === 'pddikti') {
    $keyword = $_GET['keyword'] ?? "";
    $url = "https://api-pddikti.kemdiktisaintek.go.id/pencarian/mhs/" . rawurlencode($keyword);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Origin: https://pddikti.kemdiktisaintek.go.id',
        'Referer: https://pddikti.kemdiktisaintek.go.id/',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    curl_close($ch);
    echo $response;
}

// --- 2. OSINT TRACKING (REVERTED TO USER LOGIC) ---
else if ($action === 'track') {
    $json = file_get_contents('php://input');
    $data = json_decode($json);
    
    $nama = $data->nama ?? "";
    
    // MENGGUNAKAN QUERY LAMA ANDA
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
    $email = ""; $tempat_kerja = ""; $posisi = ""; $jenis_pekerjaan = "";
    
    foreach ($organic as $res) {
        $link = $res['link'] ?? "";
        $snippet = $res['snippet'] ?? "";
        $title = $res['title'] ?? "";

        if (strpos($link, "linkedin.com") !== false && !$linkedin) {
            $linkedin = $link;
            // Ekstraksi posisi dasar
            $clean = preg_replace('/\s*[\|·]\s*LinkedIn.*$/i', '', $title);
            $parts = preg_split('/\s+[\-–|·]\s+/', $clean);
            if (count($parts) >= 2) $posisi = trim($parts[1]);
        }
        else if (strpos($link, "instagram.com") !== false && !$instagram) $instagram = $link;
        else if (strpos($link, "facebook.com") !== false && !$facebook) $facebook = $link;
        else if (strpos($link, "tiktok.com") !== false && !$tiktok) $tiktok = $link;
        
        if (!$email && preg_match('/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/', $snippet, $matches)) {
            $email = $matches[0];
        }
    }

    // Skor Akurasi Sederhana
    $akurasi = 0;
    if ($linkedin) $akurasi += 70;
    if ($instagram) $akurasi += 10;
    if ($facebook) $akurasi += 10;
    if ($email) $akurasi += 10;
    
    echo json_encode([
        "nama" => $nama,
        "linkedin" => $linkedin,
        "instagram" => $instagram,
        "facebook" => $facebook,
        "tiktok" => $tiktok,
        "email" => $email,
        "posisi" => $posisi,
        "akurasi" => $akurasi,
        "results_found" => !!($linkedin || $instagram)
    ]);
} 

else {
    echo json_encode(["status" => "Alumni Tracker Proxy V3.2", "engine" => "Reverted OSINT"]);
}
?>
