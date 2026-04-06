import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;
const SERPAPI_KEY = process.env.VITE_SERPAPI_KEY || "781318403c31dc4aecf60aac47d5540d971eb58ab1c023207148552d339fb261";

app.use(cors());
app.use(express.json());

// 🔎 SerpAPI Tracking Logic (Proxy for Cloud Deployment)
app.post('/api/v1/track/serpapi', async (req, res) => {
  const { nama, prodi, fakultas } = req.body;
  
  const query = `${nama} ${prodi || ''} ${fakultas || ''} linkedin OR instagram OR facebook OR tiktok`.trim();
  console.log(`[SerpAPI] Execute Cloud Track: "${query}"`);

  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: SERPAPI_KEY
    });

    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const results = await response.json();
    
    let linkedin = "";
    let instagram = "";
    let facebook = "";
    let tiktok = "";
    
    if (results.organic_results) {
      for (const res of results.organic_results) {
        const link = res.link || "";
        if (link.includes("linkedin.com") && !linkedin) linkedin = link;
        else if (link.includes("instagram.com") && !instagram) instagram = link;
        else if (link.includes("facebook.com") && !facebook) facebook = link;
        else if (link.includes("tiktok.com") && !tiktok) tiktok = link;
      }
    }

    res.json({ nama, linkedin, instagram, facebook, tiktok, results_found: !!(linkedin || instagram || facebook || tiktok) });
  } catch (err) {
    res.status(500).json({ error: 'Proxy tracking failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Proxy listening on port ${PORT}`);
});
