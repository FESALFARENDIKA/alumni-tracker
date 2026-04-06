import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = 8000;

// Official Kemdikbud PDDikti API
const PDDIKTI_PUBLIC_API = 'https://api-pddikti.kemdiktisaintek.go.id';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./alumni_osint.db');



/**
 * Fetch from a URL with timeout support
 */
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

/**
 * Fetch from Official API with proper spoofed headers
 * Returns { data, source }
 */
async function fetchPddikti(path) {
  try {
    const publicPath = path.replace(/^\//, ''); // strip leading slash
    const publicUrl = `${PDDIKTI_PUBLIC_API}/${publicPath}`;
    console.log(`[PDDikti] Fetching: ${publicUrl}`);
    
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://pddikti.kemdiktisaintek.go.id',
      'Referer': 'https://pddikti.kemdiktisaintek.go.id/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
    };

    const res = await fetchWithTimeout(publicUrl, { headers }, 8000);
    if (res.ok) {
      const data = await res.json();
      console.log(`[PDDikti] ✅ Public API OK`);
      return { data, source: 'pddikti-official' };
    }
    const errData = await res.text();
    throw new Error(`HTTP ${res.status}: ${errData}`);
  } catch (err) {
    throw new Error(`PDDikti request failed: ${err.message}`);
  }
}



// API Overview
app.get('/api/v1/', (req, res) => {
  res.json({
    message: 'OSINT Alumni API Server (Real PDDikti)',
    version: '2.0.0',
    sources: {
      primary: PDDIKTI_PUBLIC_API
    },
    endpoints: [
      '/api/proxy/pddikti/search/mhs/:keyword',
      '/api/proxy/pddikti/mhs/detail/:id_mhs'
    ]
  });
});


app.get('/api/proxy/pddikti/search/mhs/:keyword', async (req, res) => {
  const keyword = decodeURIComponent(req.params.keyword);
  const { universitas, prodi } = req.query;
  
  console.log(`\n[SEARCH] keyword="${keyword}" universitas="${universitas}" prodi="${prodi}"`);

  try {
    const { data, source } = await fetchPddikti(`/pencarian/mhs/${encodeURIComponent(keyword)}`);

    // Normalize: PDDikti API returns array OR { mahasiswa: [...] }
    let results = [];
    if (Array.isArray(data)) {
      results = data;
    } else if (data?.mahasiswa && Array.isArray(data.mahasiswa)) {
      results = data.mahasiswa;
    } else if (data?.data && Array.isArray(data.data)) {
      results = data.data;
    } else if (data && typeof data === 'object' && !data.error) {
      // Single object returned
      results = [data];
    }

    // Normalize field names so frontend gets consistent shape
    results = results.map(item => ({
      id_mhs: item.id || item.id_mhs || item.mahasiswa_id || '',
      nama: item.nama || item.nm_mhs || item.name || '',
      nim: item.nim || item.nipd || '',
      nipd: item.nipd || item.nim || '',
      nm_mhs: item.nm_mhs || item.nama || item.name || '',
      universitas: item.nama_pt || item.pt || item.universitas || item.perguruan_tinggi || '',
      nama_pt: item.nama_pt || item.pt || item.universitas || item.perguruan_tinggi || '',
      prodi: item.nama_prodi || item.prodi || item.program_studi || '',
      nama_prodi: item.nama_prodi || item.prodi || item.program_studi || '',
      jenjang: item.jenjang || item.jenjang_didik || 'S1',
      status: item.status || item.status_mhs || 'Aktif',
      jk: item.jk || item.jenis_kelamin_id || '',
      jenis_kelamin: item.jk || item.jenis_kelamin || item.jenis_kelamin_id || '',
      kode_pt: item.kode_pt || '',
      kode_prodi: item.kode_prodi || '',
      // keep original data too
      ...item
    }));

    // Optional filter by universitas/prodi if provided
    if (universitas && universitas.trim()) {
      results = results.filter(r =>
        (r.nama_pt || '').toLowerCase().includes(universitas.toLowerCase()) ||
        (r.universitas || '').toLowerCase().includes(universitas.toLowerCase())
      );
    }
    if (prodi && prodi.trim()) {
      results = results.filter(r =>
        (r.nama_prodi || '').toLowerCase().includes(prodi.toLowerCase()) ||
        (r.prodi || '').toLowerCase().includes(prodi.toLowerCase())
      );
    }

    console.log(`[SEARCH] ✅ ${results.length} results (source: ${source})`);
    res.json(results);

  } catch (err) {
    console.error(`[SEARCH] ❌ Error: ${err.message}`);
    res.status(503).json({
      error: 'PDDikti API tidak tersedia',
      message: err.message,
      hint: 'Pastikan django server berjalan: cd api-pddikti-main && python manage.py runserver 8001'
    });
  }
});


app.get('/api/proxy/pddikti/mhs/detail/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`\n[DETAIL] id_mhs="${id}"`);

  try {
    const { data, source } = await fetchPddikti(`/detail/mhs/${id}`);
    console.log(`[DETAIL] ✅ (source: ${source})`);
    
    // Ensure consistent shape for frontend
    res.json({
      ...data,
      data: data
    });

  } catch (err) {
    console.error(`[DETAIL] ❌ Error: ${err.message}`);
    res.status(503).json({
      error: 'PDDikti API tidak tersedia',
      message: err.message
    });
  }
});



// Alumni database search
app.get('/api/v1/search/mhs/:keyword/', (req, res) => {
  const { keyword } = req.params;
  const { universitas, prodi } = req.query;
  
  let query = `SELECT * FROM alumni WHERE (nama LIKE ? OR nim LIKE ?)`;
  const params = [`%${keyword}%`, `%${keyword}%`];

  if (universitas) {
    query += ` AND universitas LIKE ?`;
    params.push(`%${universitas}%`);
  }
  if (prodi) {
    query += ` AND prodi LIKE ?`;
    params.push(`%${prodi}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      // Table might not exist yet
      return res.json([]);
    }
    res.json(rows || []);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 OSINT Alumni API Server (Real PDDikti) running on http://localhost:${PORT}`);
  console.log(`📡 Primary source : ${PDDIKTI_PUBLIC_API}`);
  console.log(`\n⚡ Endpoints:`);
  console.log(`   Search : http://localhost:${PORT}/api/proxy/pddikti/search/mhs/:keyword`);
  console.log(`   Detail : http://localhost:${PORT}/api/proxy/pddikti/mhs/detail/:id\n`);
});

export default app;
