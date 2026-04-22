import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import XLSX from 'xlsx';
import path from 'path';

const app = express();
const PORT = 8000;

// Official Kemdikbud PDDikti API
const PDDIKTI_PUBLIC_API = 'https://api-pddikti.kemdiktisaintek.go.id';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./alumni_osint.db');

// Database initialization
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS alumni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_mhs TEXT UNIQUE,
    nama TEXT,
    nim TEXT,
    universitas TEXT,
    prodi TEXT,
    status TEXT,
    jk TEXT,
    jenjang TEXT,
    last_tracked DATETIME DEFAULT CURRENT_TIMESTAMP,
    linkedin TEXT,
    instagram TEXT,
    facebook TEXT,
    tiktok TEXT,
    email TEXT,
    tempat_kerja TEXT,
    posisi TEXT,
    jenis_pekerjaan TEXT,
    akurasi INTEGER
  )`);
});

// Load Excel on Start
const EXCEL_FILE_PATH = path.join(process.cwd(), 'Alumni 2000-2025.xlsx');
let alumniExcelData = [];
try {
  const workbook = XLSX.readFile(EXCEL_FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  alumniExcelData = XLSX.utils.sheet_to_json(worksheet);
  console.log(`[Excel] ✅ Loaded ${alumniExcelData.length} records.`);
} catch (err) {
  console.error(`[Excel] ❌ Error loading file: ${err.message}`);
}

// 🔎 Search Excel Data with Pagination
app.get('/api/v1/excel/search', (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  let filtered = alumniExcelData;
  if (q && q.trim()) {
    const searchStr = q.toLowerCase().trim();
    filtered = alumniExcelData.filter(row => 
      String(row['Nama Lulusan'] || '').toLowerCase().includes(searchStr)
    );
  }

  const total = filtered.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    data: paginatedData.map(row => ({
      nama: row['Nama Lulusan'],
      nim: row['NIM'],
      fakultas: row['Fakultas'] || '',
      prodi: row['Program Studi'] || '',
      tahun_lulus: row['Tanggal Lulus'] || row['Tahun Lulus'] || '-'
    })),
    total,
    page: pageNum,
    limit: limitNum
  });
});

// 🔎 Get Excel Stats
app.get('/api/v1/excel/stats', (req, res) => {
  const total = alumniExcelData.length;
  const yearStats = {};

  alumniExcelData.forEach(row => {
    let year = row['Tanggal Lulus'] || row['Tahun Lulus'] || row['Tahun Masuk'] || 'Unknown';
    if (year && typeof year === 'string' && year.length >= 4) {
      const match = year.match(/\b(19|20)\d{2}\b/);
      if (match) year = match[0];
    } else if (typeof year === 'number') {
      year = year.toString();
    }
    
    if (year && year !== '-' && year !== 'Unknown') {
      if (!yearStats[year]) yearStats[year] = 0;
      yearStats[year]++;
    }
  });

  res.json({
    total,
    years: yearStats
  });
});

// 🔎 OSINT Tracking (User-Preferred Logic)
const SERPAPI_KEY = "781318403c31dc4aecf60aac47d5540d971eb58ab1c023207148552d339fb261";

app.post('/api/v1/track/serpapi', async (req, res) => {
  const { nama } = req.body;
  console.log(`[OSINT] Tracking: "${nama}"`);

  try {
    // MENGGUNAKAN QUERY SEDERHANA (SESUAI PERMINTAAN USER)
    const q = `${nama} linkedin OR instagram OR facebook OR tiktok`;
    const params = new URLSearchParams({ engine: 'google', q: q, api_key: SERPAPI_KEY });
    const resp = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const results = await resp.json();

    let linkedin = "", instagram = "", facebook = "", tiktok = "";
    let email = "", posisi = "";
    
    const organic = results.organic_results || [];
    for (const r of organic) {
      const link = r.link || "";
      const snippet = r.snippet || "";
      const title = r.title || "";

      if (link.includes("linkedin.com") && !linkedin) {
        linkedin = link;
        const clean = title.replace(/\s*[\|·]\s*LinkedIn.*$/i, '');
        const parts = clean.split(/\s+[\-–|·]\s+/);
        if (parts.length >= 2) posisi = parts[1].trim();
      }
      else if (link.includes("instagram.com") && !instagram) instagram = link;
      else if (link.includes("facebook.com") && !facebook) facebook = link;
      else if (link.includes("tiktok.com") && !tiktok) tiktok = link;

      if (!email) {
        const emailMatch = snippet.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) email = emailMatch[0];
      }
    }

    let akurasi = 0;
    if (linkedin) akurasi += 70;
    if (instagram) akurasi += 10;
    if (facebook) akurasi += 10;
    if (email) akurasi += 10;

    res.json({
      nama, linkedin, instagram, facebook, tiktok,
      email, posisi, akurasi,
      results_found: !!(linkedin || instagram)
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to track.' });
  }
});

// 🔎 PDDikti Proxy - Search Mahasiswa
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

app.get('/api/proxy/pddikti/search/mhs/:keyword', async (req, res) => {
  const keyword = decodeURIComponent(req.params.keyword);
  try {
    const url = `${PDDIKTI_PUBLIC_API}/pencarian/mhs/${encodeURIComponent(keyword)}`;
    const headers = {
      'Accept': 'application/json',
      'Origin': 'https://pddikti.kemdiktisaintek.go.id',
      'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    const resp = await fetchWithTimeout(url, { headers }, 8000);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    let results = Array.isArray(data) ? data : (data?.mahasiswa || data?.data || [data]);
    results = results.map(item => ({
      id_mhs: item.id || item.id_mhs || item.mahasiswa_id || '',
      nama: item.nama || item.nm_mhs || '',
      nim: item.nim || item.nipd || '',
      nama_pt: item.nama_pt || item.pt || '',
      nama_prodi: item.nama_prodi || item.prodi || '',
      jenjang: item.jenjang || 'S1',
      ...item
    }));
    res.json(results);
  } catch (err) {
    res.status(503).json({ error: 'PDDikti API tidak tersedia', message: err.message });
  }
});

app.get('/api/proxy/pddikti/mhs/detail/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const url = `${PDDIKTI_PUBLIC_API}/detail/mhs/${id}`;
    const headers = {
      'Accept': 'application/json',
      'Origin': 'https://pddikti.kemdiktisaintek.go.id',
      'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
      'User-Agent': 'Mozilla/5.0'
    };
    const resp = await fetchWithTimeout(url, { headers }, 8000);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    res.json({ ...data, data });
  } catch (err) {
    res.status(503).json({ error: 'PDDikti API tidak tersedia', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 PDDikti: ${PDDIKTI_PUBLIC_API}`);
});
