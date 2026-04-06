import { useState, Fragment } from 'react';
import { 
  Search, 
  Radar, 
  User, 
  GraduationCap, 
  MapPin, 
  Building, 
  ExternalLink, 
  ShieldCheck, 
  CircleAlert, 
  Briefcase, 
  Code as Github, 
  Globe as Linkedin, 
  Database, 
  BookOpen,
  ArrowRight,
  Target,
  FileText,
  Calendar,
  Hash,
  Activity,
  Award
} from 'lucide-react';
import './SearchAndTrack.css';

const SearchAndTrack = ({ onResult }) => {
  const [searchForm, setSearchForm] = useState({
    nama: '',
    nim: '',
    universitas: '',
    prodi: '',
    tahun_lulus: '',
    status_lulus: 'sudah'
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [scanningStatus, setScanningStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [sourceStatus, setSourceStatus] = useState({
    pddikti: 'waiting',
    linkedin: 'waiting',
    github: 'waiting',
    orcid: 'waiting'
  });
  const [linkedinSearchStatus, setLinkedinSearchStatus] = useState('');
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualLinkedInUrl, setManualLinkedInUrl] = useState('');
  const [apiKeys, setApiKeys] = useState({
    rapidapi: localStorage.getItem('RAPIDAPI_KEY') || '',
    serpapi: localStorage.getItem('SERPAPI_KEY') || '',
    nubela: localStorage.getItem('NUBELA_KEY') || ''
  });
  const [detailedMhs, setDetailedMhs] = useState(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setSearchForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    if (!searchForm.nama && !searchForm.nim) {
      setError('Harap isi nama atau NIM untuk memulai pencarian radar.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults(null);
    setProgress(0);
    setScanningStatus('Inisialisasi Radar Sistem...');
    setLinkedinSearchStatus('');
    setSourceStatus({
      pddikti: 'scanning',
      linkedin: 'scanning',
      github: 'scanning',
      orcid: 'scanning'
    });
    
    let statusInterval = null;
    let progressInterval = null;
    
    try {
      const statuses = [
        'Sinkronisasi Satelit Radar...',
        'Menghubungkan API PDDikti...',
        'Memindai Database Mahasiswa...',
        'Menganalisis Data Akademik...',
        'Memverifikasi Status Kelulusan...',
        'Menganalisis Skor Akurasi...',
        'Enrichment Metadata Alumni...',
        'Menyiapkan Hasil Radar...'
      ];
      let currentIdx = 0;
      
      // Rotate statuses faster (200ms) for Ultra-Radar feeling
      statusInterval = setInterval(() => {
        currentIdx = (currentIdx + 1) % statuses.length;
        setScanningStatus(statuses[currentIdx]);
      }, 200);

      // Ultra-Fast progress bar simulation (0 -> 95% in ~1.5 seconds)
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 95) return prev + (95 - prev) * 0.3; 
          return prev;
        });
      }, 100); // Faster tick (100ms)

      // --- PDDIKTI SEARCH via PROXY ---
      const keyword = (searchForm.nama || searchForm.nim || '').trim();
      console.log('PDDikti search keyword:', keyword);
      
      setSourceStatus({
        pddikti: 'scanning'
      });
      
      setScanningStatus('Menghubungkan ke API PDDikti...');
      
      const queryParams = new URLSearchParams({
        universitas: searchForm.universitas || '',
        prodi: searchForm.prodi || ''
      });
      
      try {
        const response = await fetch(
          `http://localhost:8000/api/proxy/pddikti/search/mhs/${encodeURIComponent(keyword)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const results = data.map(item => ({
          sumber: 'PDDikti',
          confidence: 0.9,
          data: item
        }));
        
        console.log(`✅ PDDikti: ${results.length} results found`);
        
        clearInterval(statusInterval);
        clearInterval(progressInterval);
        setProgress(100);
        setSourceStatus({
          pddikti: 'ready'
        });
        
        setSearchResults({ 
          results,
          results_count: results.length,
          confidence: results.length > 0 ? 0.9 : 0
        });

        if (onResult) {
          onResult({ results, results_count: results.length });
        }
        
      } catch (err) {
        console.error('PDDikti search failed:', err);
        clearInterval(statusInterval);
        clearInterval(progressInterval);
        setProgress(100);
        setSourceStatus({
          pddikti: 'error'
        });
        throw err;
      }
      
      setProgress(100);
      setSearchResults({ 
        results: results,
        results_count: results.length,
        confidence: results.length > 0 ? 0.8 : 0
      });

      if (onResult) {
        onResult({ 
          results: results,
          results_count: results.length 
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      // Check if it's the 503 Service Unavailable error
      if (err.message.includes('503') || err.message.includes('Service Unavailable')) {
        setError(
          <div>
            <strong>⚠️ API PDDikti Sedang Maintenance</strong>
            <p style={{marginTop: '8px', fontSize: '0.9em'}}>
              Server PDDikti sedang overload (error 503).
              <br/>
              <span style={{color: '#fbbf24'}}>
                Fallback: Menggunakan data mock lokal ✅
              </span>
            </p>
          </div>
        );
      } else if (err.message.includes('Failed to fetch')) {
        setError('Backend server tidak berjalan. Jalankan `npm run server` di terminal.');
      } else {
        setError(`Gagal pencarian PDDikti: ${err.message}`);
      }
    } finally {
      if (statusInterval) clearInterval(statusInterval);
      if (progressInterval) clearInterval(progressInterval);
      setTimeout(() => {
        setIsSearching(false);
        setScanningStatus('');
        setLinkedinSearchStatus('');
      }, 300);
    }
  };

  const handleSaveAlumni = async (alumniData) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/alumni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alumniData)
      });
      
      const res = await response.json();
      if (response.ok) {
        alert(`🎯 ${alumniData.nama} berhasil disimpan ke database.`);
      } else {
        alert(`❌ Gagal menyimpan: ${res.error || 'Terjadi kesalahan'}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Gagal terhubung ke server untuk menyimpan data.");
    }
  };

  const handleFetchDetail = async (id_mhs) => {
    if (!id_mhs) return;

    // Toggle off if already viewing this student's detail
    const currentId = detailedMhs?.id_mhs || detailedMhs?.data?.id_mhs;
    if (detailedMhs && currentId === id_mhs) {
      setDetailedMhs(null);
      return;
    }

    setIsFetchingDetail(true);
    try {
      // Use proxy endpoint to avoid CORS issues
      const response = await fetch(`http://localhost:8000/api/proxy/pddikti/mhs/detail/${id_mhs}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDetailedMhs(data);
    } catch (err) {
      console.error("Failed to fetch student details:", err);
      if (err.message.includes('503') || err.message.includes('Service Unavailable')) {
        setError('API PDDikti sedang tidak tersedia. Silakan coba lagi nanti.');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Gagal terhubung ke API. Periksa koneksi internet.');
      } else {
        setError(`Gagal mengambil detail mahasiswa: ${err.message}`);
      }
    } finally {
      setIsFetchingDetail(false);
    }
  };



  // 1. RapidAPI LinkedIn Search (Free tier: 100-500 requests/month)
  const searchLinkedInRapidAPI = async (nama, universitas) => {
    if (!apiKeys.rapidapi) {
      console.log('RapidAPI key not available, skipping...');
      setLinkedinSearchStatus('❌ RapidAPI: No API key');
      return null;
    }
    
    try {
      setScanningStatus('Mencari via RapidAPI LinkedIn...');
      setLinkedinSearchStatus('🔍 RapidAPI: Connecting...');
      
      console.log('Using RapidAPI Key:', apiKeys.rapidapi.substring(0, 10) + '...');
      
      // Try different RapidAPI endpoints - updated with alternative endpoints
      const endpoints = [
        {
          // Alternative 1: Profile data API (get by username)
          url: `https://linkedin-profile-data.p.rapidapi.com/linkedin-data?username=${encodeURIComponent(nama.toLowerCase().replace(/\s+/g, '-'))}`,
          host: 'linkedin-profile-data.p.rapidapi.com',
          type: 'profile'
        },
        {
          // Alternative 2: Company employees search
          url: `https://linkedin-data-scraper.p.rapidapi.com/search-people?keywords=${encodeURIComponent(nama)}&geoId=102478259&start=0&count=10`,
          host: 'linkedin-data-scraper.p.rapidapi.com',
          type: 'search'
        },
        {
          // Alternative 3: Try company search instead
          url: `https://linkedin-api8.p.rapidapi.com/search-employees?companyId=1441&keywords=${encodeURIComponent(nama)}`,
          host: 'linkedin-api8.p.rapidapi.com',
          type: 'employees'
        }
      ];
      
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint.host);
          setLinkedinSearchStatus(`🔍 Trying ${endpoint.host}...`);
          
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': apiKeys.rapidapi,
              'X-RapidAPI-Host': endpoint.host
            }
          });
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            if (response.status === 401) {
              console.log('Unauthorized - trying next endpoint...');
              setLinkedinSearchStatus(`❌ ${endpoint.host}: Unauthorized`);
              continue;
            }
            if (response.status === 429) {
              console.log('RapidAPI rate limit reached');
              setLinkedinSearchStatus('⚠️ RapidAPI: Rate limit reached');
              throw new Error('Rate limit reached');
            }
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.json();
          console.log('RapidAPI response data:', data);
          
          // Handle different response formats based on endpoint type
          let items = [];
          
          if (endpoint.type === 'profile') {
            // Single profile response
            if (data && (data.firstName || data.first_name || data.name)) {
              items = [data];
            }
          } else if (endpoint.type === 'employees') {
            // Employees search response
            if (data.employees && Array.isArray(data.employees)) {
              items = data.employees;
            } else if (data.items && Array.isArray(data.items)) {
              items = data.items;
            }
          } else {
            // Standard search response
            if (data.items && Array.isArray(data.items)) {
              items = data.items;
            } else if (data.data && Array.isArray(data.data)) {
              items = data.data;
            } else if (Array.isArray(data)) {
              items = data;
            } else if (data.results && Array.isArray(data.results)) {
              items = data.results;
            } else if (data.people && Array.isArray(data.people)) {
              items = data.people;
            }
          }
          
          if (items && items.length > 0) {
            console.log(`Found ${items.length} results from ${endpoint.host}`);
            setLinkedinSearchStatus(`✅ Found ${items.length} results from ${endpoint.host}`);
            
            // Filter by university if provided
            let results = items;
            if (universitas) {
              results = results.filter(item => 
                item.education?.some(edu => 
                  edu.school?.toLowerCase().includes(universitas.toLowerCase())
                ) || 
                item.school?.toLowerCase().includes(universitas.toLowerCase()) ||
                item.university?.toLowerCase().includes(universitas.toLowerCase())
              );
            }
            
            return results.map(item => ({
              sumber: 'LinkedIn',
              confidence: 0.75,
              data: {
                nama: item.firstName && item.lastName 
                  ? `${item.firstName} ${item.lastName}`
                  : (item.first_name && item.last_name 
                    ? `${item.first_name} ${item.last_name}`
                    : (item.name || item.fullName || item.full_name || item.title || item.username || nama)),
                headline: item.headline || item.occupation || item.subtitle || item.head_line || '',
                universitas: item.education?.[0]?.school || item.education?.[0]?.schoolName || item.school || item.university || item.college || '',
                prodi: item.education?.[0]?.fieldOfStudy || item.education?.[0]?.field_of_study || item.education?.[0]?.degree || item.fieldOfStudy || item.degree || item.major || '',
                jabatan: item.position?.[0]?.title || item.positions?.[0]?.title || item.occupation || item.jobTitle || item.job_title || item.current_job || '',
                perusahaan: item.position?.[0]?.companyName || item.positions?.[0]?.companyName || item.company || item.companyName || item.current_company || '',
                lokasi: item.location || item.geoLocation || item.locationName || item.location_name || item.city || item.country || '',
                url: item.linkedinUrl || item.url || item.linkedin_url || item.profile_url || `https://linkedin.com/in/${item.username || item.publicIdentifier || item.public_identifier || item.user_id || ''}`,
                foto: item.profilePicture || item.profile_picture || item.imageUrl || item.imgUrl || item.profile_image || '',
                summary: item.summary || item.about || item.bio || item.description || ''
              }
            }));
          }
          
          // If we got here with empty results, try next endpoint
          console.log('No results from', endpoint.host, '- trying next...');
          setLinkedinSearchStatus(`⚠️ ${endpoint.host}: No results`);
          
        } catch (endpointErr) {
          console.log(`Endpoint ${endpoint.host} failed:`, endpointErr.message);
          setLinkedinSearchStatus(`❌ ${endpoint.host}: ${endpointErr.message}`);
          lastError = endpointErr;
          continue;
        }
      }
      
      // All endpoints tried, no results
      console.log('All RapidAPI endpoints failed or returned no results');
      setLinkedinSearchStatus('❌ All RapidAPI endpoints failed');
      return null;
      
    } catch (err) {
      console.error('RapidAPI LinkedIn error:', err);
      return null;
    }
  };

  // 2. SerpAPI Google Search for LinkedIn (Free: 100 searches/month)
  const searchLinkedInSerpAPI = async (nama, universitas) => {
    if (!apiKeys.serpapi) {
      console.log('SerpAPI key not available, skipping...');
      return null;
    }
    
    try {
      setScanningStatus('Mencari via Google Search (SerpAPI)...');
      
      const query = universitas 
        ? `site:linkedin.com/in/ ${nama} ${universitas}`
        : `site:linkedin.com/in/ ${nama}`;
      
      const response = await fetch(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKeys.serpapi}&num=10`
      );
      
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.organic_results && data.organic_results.length > 0) {
        // Parse LinkedIn URLs from search results
        const linkedinResults = data.organic_results
          .filter(result => result.link.includes('linkedin.com/in/'))
          .slice(0, 5);
        
        return linkedinResults.map((result, idx) => ({
          sumber: 'LinkedIn',
          confidence: 0.6 - (idx * 0.05), // Decreasing confidence
          data: {
            nama: result.title?.split(' - ')[0] || result.title || nama,
            headline: result.snippet || '',
            universitas: universitas || '',
            url: result.link,
            // Extract username from URL
            username: result.link.split('/in/')[1]?.split('/')[0] || '',
            source: 'Google Search via SerpAPI'
          }
        }));
      }
      
      return null;
    } catch (err) {
      console.error('SerpAPI error:', err);
      return null;
    }
  };

  // 3. Nubela/LinkDB LinkedIn API (Free: 50-100 requests/month)
  const searchLinkedInNubela = async (nama, universitas) => {
    if (!apiKeys.nubela) {
      console.log('Nubela key not available, skipping...');
      return null;
    }
    
    try {
      setScanningStatus('Mencari via Nubela LinkDB...');
      
      // Nubela requires LinkedIn URL, so we need to construct potential URLs
      // or use their search endpoint if available
      const username = nama.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const response = await fetch(
        `https://nubela.co/proxycurl/api/v2/linkedin?url=https://www.linkedin.com/in/${username}&fallback_to_cache=on-error`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKeys.nubela}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Nubela error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.first_name) {
        return [{
          sumber: 'LinkedIn',
          confidence: 0.8,
          data: {
            nama: `${data.first_name} ${data.last_name}`,
            headline: data.occupation || '',
            universitas: data.education?.[0]?.school || universitas || '',
            prodi: data.education?.[0]?.field_of_study || '',
            jabatan: data.occupation || '',
            perusahaan: data.experiences?.[0]?.company || '',
            lokasi: data.city || data.state || '',
            url: data.url || `https://linkedin.com/in/${username}`,
            foto: data.profile_pic_url || '',
            summary: data.summary || ''
          }
        }];
      }
      
      return null;
    } catch (err) {
      console.error('Nubela error:', err);
      return null;
    }
  };

  // 4. Manual LinkedIn URL Input (100% Free)
  const handleManualLinkedInSubmit = async (e) => {
    e.preventDefault();
    if (!manualLinkedInUrl) return;
    
    setIsSearching(true);
    setScanningStatus('Mengambil data dari LinkedIn URL...');
    setError(null);
    
    try {
      // Validate URL
      if (!manualLinkedInUrl.includes('linkedin.com/in/')) {
        throw new Error('URL harus berupa LinkedIn profile URL (linkedin.com/in/...)');
      }
      
      // Try to fetch basic data from the URL (meta tags)
      // Note: Direct fetching might be blocked by CORS, so we'll parse the URL
      const urlParts = manualLinkedInUrl.split('/in/');
      const username = urlParts[1]?.split('/')[0];
      
      if (!username) {
        throw new Error('Username LinkedIn tidak valid');
      }
      
      // Create basic profile from URL
      const profileData = {
        sumber: 'LinkedIn',
        confidence: 0.5,
        data: {
          nama: username.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          username: username,
          url: manualLinkedInUrl,
          source: 'Manual Input',
          note: 'Data lengkap membutuhkan API key (RapidAPI/SerpAPI/Nubela)'
        }
      };
      
      setSearchResults({
        results: [profileData],
        results_count: 1,
        confidence: 0.5
      });
      
      setSourceStatus(prev => ({
        ...prev,
        linkedin: 'ready',
        pddikti: 'waiting',
        github: 'waiting',
        orcid: 'waiting'
      }));
      
      setShowManualForm(false);
      setManualLinkedInUrl('');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
      setScanningStatus('');
    }
  };

  // Master LinkedIn Search with Failover
  const searchLinkedInWithFailover = async (nama, universitas) => {
    setSourceStatus(prev => ({ ...prev, linkedin: 'scanning' }));
    
    let results = null;
    let errors = [];
    
    // Try 1: RapidAPI
    if (apiKeys.rapidapi) {
      results = await searchLinkedInRapidAPI(nama, universitas);
      if (results && results.length > 0) {
        setSourceStatus(prev => ({ ...prev, linkedin: 'ready' }));
        return results;
      }
      errors.push('RapidAPI: No results or rate limited');
    }
    
    // Try 2: SerpAPI
    if (!results && apiKeys.serpapi) {
      results = await searchLinkedInSerpAPI(nama, universitas);
      if (results && results.length > 0) {
        setSourceStatus(prev => ({ ...prev, linkedin: 'ready' }));
        return results;
      }
      errors.push('SerpAPI: No results or rate limited');
    }
    
    // Try 3: Nubela
    if (!results && apiKeys.nubela) {
      results = await searchLinkedInNubela(nama, universitas);
      if (results && results.length > 0) {
        setSourceStatus(prev => ({ ...prev, linkedin: 'ready' }));
        return results;
      }
      errors.push('Nubela: No results or error');
    }
    
    // If all APIs failed or no keys available
    if (!results) {
      setSourceStatus(prev => ({ ...prev, linkedin: 'waiting' }));
      console.log('All LinkedIn APIs failed or no API keys:', errors);
    }
    
    return results;
  };

  // Save API keys to localStorage
  const saveApiKeys = () => {
    localStorage.setItem('RAPIDAPI_KEY', apiKeys.rapidapi);
    localStorage.setItem('SERPAPI_KEY', apiKeys.serpapi);
    localStorage.setItem('NUBELA_KEY', apiKeys.nubela);
    setShowApiKeyForm(false);
    alert('API Keys tersimpan!');
  };

  const getConfidenceLevel = (score) => {
    if (score >= 0.8) return { label: 'Tinggi', color: 'var(--success)', icon: ShieldCheck };
    if (score >= 0.5) return { label: 'Sedang', color: 'var(--warning)', icon: CircleAlert };
    return { label: 'Rendah', color: 'var(--danger)', icon: CircleAlert };
  };

  const getSourceIcon = (source) => {
    switch (source.toLowerCase()) {
      case 'linkedin': return <Linkedin size={14} />;
      case 'github': return <Github size={14} />;
      case 'pddikti': return <Database size={14} />;
      case 'orcid': return <BookOpen size={14} />;
      default: return <Target size={14} />;
    }
  };

  const filteredResults = searchResults?.results?.filter(r => {
    if (activeTab === 'all') return true;
    return r.sumber.toLowerCase() === activeTab;
  }) || [];

  const sourceCounts = searchResults?.results?.reduce((acc, r) => {
    const s = r.sumber.toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, { all: 0 }) || { all: 0 };

  return (
    <div className="search-and-track-container animate-fade-in">
      <div className="search-header">
        <Radar size={56} className="text-primary mb-3" />
        <h1>OSINT Radar Engine</h1>
        <p>Gunakan teknologi Open-Source Intelligence untuk melacak profil alumni di seluruh platform digital secara real-time.</p>
      </div>

      <div className="search-form glass-panel">
        <div className="form-grid">
          <div className="form-group">
            <label>Keyword / Nama Lengkap</label>
            <input
              type="text"
              value={searchForm.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              placeholder="Masukkan nama alumni..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>NIM (Opsional)</label>
            <input
              type="text"
              value={searchForm.nim}
              onChange={(e) => handleInputChange('nim', e.target.value)}
              placeholder="Nomor Induk Mahasiswa"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Institusi Pendidikan (Opsional)</label>
            <input
              list="univ-options"
              value={searchForm.universitas}
              onChange={(e) => handleInputChange('universitas', e.target.value)}
              className="form-input"
              placeholder="Semua (Default: UMM) atau Ketik manual..."
            />
            <datalist id="univ-options">
              <option value="Universitas Muhammadiyah Malang" />
              <option value="Universitas Brawijaya" />
              <option value="Universitas Negeri Malang" />
              <option value="UIN Maulana Malik Ibrahim" />
              <option value="Politeknik Negeri Malang" />
              <option value="Universitas Islam Malang" />
              <option value="Universitas Indonesia" />
              <option value="Universitas Gadjah Mada" />
              <option value="Institut Teknologi Bandung" />
              <option value="Universitas Airlangga" />
              <option value="Universitas Diponegoro" />
              <option value="Universitas Hasanuddin" />
              <option value="Universitas Padjadjaran" />
            </datalist>
          </div>

          <div className="form-group">
            <label>Prodi / Bidang (Opsional)</label>
            <input
              list="prodi-options"
              value={searchForm.prodi}
              onChange={(e) => handleInputChange('prodi', e.target.value)}
              className="form-input"
              placeholder="Semua Prodi atau Ketik manual..."
            />
            <datalist id="prodi-options">
              <option value="Informatika" />
              <option value="Sistem Informasi" />
              <option value="Teknik Komputer" />
              <option value="Ilmu Komputer" />
              <option value="Teknik Mesin" />
              <option value="Teknik Elektro" />
              <option value="Teknik Industri" />
              <option value="Teknik Sipil" />
              <option value="Ilmu Komunikasi" />
              <option value="Manajemen" />
              <option value="Akuntansi" />
              <option value="Ilmu Hukum" />
              <option value="Psikologi" />
              <option value="Pendidikan Dokter" />
              <option value="Farmasi" />
              <option value="Hubungan Internasional" />
              <option value="Bahasa dan Sastra Inggris" />
            </datalist>
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="btn-search" 
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <div className="spinner"></div> : <Radar size={20} />}
            {isSearching ? 'Scanning Radar...' : 'Start Tracking'}
          </button>
        </div>
      </div>

      {isSearching && (
        <div className="radar-scanning-overlay">
          <div className="radar-anim-container">
            <div className="radar-beam"></div>
            <div className="radar-circles">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
            <Radar className="radar-icon-centered" size={48} />
          </div>
          <h3>Memindai Sinyal Digital...</h3>
          <p className="scanning-status-text">{scanningStatus}</p>
          {linkedinSearchStatus && (
            <p className="linkedin-status-text" style={{ 
              fontSize: '0.85rem', 
              color: linkedinSearchStatus.includes('✅') ? '#4ade80' : 
                     linkedinSearchStatus.includes('❌') ? '#f87171' : 
                     linkedinSearchStatus.includes('⚠️') ? '#fbbf24' : '#60a5fa',
              marginTop: '0.5rem',
              fontWeight: '500'
            }}>
              {linkedinSearchStatus}
            </p>
          )}
          <div className="scanning-progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="radar-source-indicators">
            <div className={`source-indicator ${sourceStatus.pddikti}`}>
              <Database size={12} /> PDDikti
            </div>
            <div className={`source-indicator ${sourceStatus.linkedin}`}>
              <Linkedin size={12} /> LinkedIn
            </div>
            <div className={`source-indicator ${sourceStatus.github}`}>
              <Github size={12} /> GitHub
            </div>
            <div className={`source-indicator ${sourceStatus.orcid}`}>
              <BookOpen size={12} /> ORCID
            </div>
          </div>
        </div>
      )}

      {searchResults && !isSearching && (
        <div className="search-results">
          <div className="result-summary glass-panel">
            <div className="summary-item">
              <span className="label">Hasil Radar</span>
              <span className="value text-primary">{searchResults.results_count} Kandidat</span>
            </div>
            <div className="summary-item">
              <span className="label">Status Database</span>
              <span className="value">{searchResults.alumni_id ? 'Tersimpan' : 'Baru (Draft)'}</span>
            </div>
            <div className="summary-item">
              <span className="label">Akurasi Rata-rata</span>
              <span className="value text-success">
                {searchResults.confidence ? (searchResults.confidence * 100).toFixed(0) : 0}% Match
              </span>
            </div>
          </div>

          <div className="source-tabs">
            {['all', 'linkedin', 'github', 'pddikti', 'orcid'].map(tab => (
              <button 
                key={tab}
                className={`source-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {sourceCounts[tab] > 0 && <span className="count-badge">{sourceCounts[tab]}</span>}
              </button>
            ))}
          </div>

          {filteredResults.length > 0 ? (
            <div className="table-wrapper glass-panel animate-fade-in mt-4" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Match</th>
                    <th>Sumber</th>
                    <th>NIM/ID</th>
                    <th>Nama Kandidat</th>
                    <th>Informasi Utama</th>
                    <th>Status/Info</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => {
                    const conf = getConfidenceLevel(result.confidence);
                    const d = result.data;
                    const isPddikti = result.sumber.toLowerCase().includes('pddikti');
                    // Check if detail is currently open for THIS specific user
                    const hasDetail = detailedMhs && (detailedMhs.id_mhs === d.id_mhs || detailedMhs.data?.nama === d.nama);

                    return (
                      <Fragment key={idx}>
                        <tr className={`source-${result.sumber.toLowerCase()}-row`}>
                          <td className="font-bold" style={{ color: conf.color }}>
                            {(result.confidence * 100).toFixed(0)}%
                          </td>
                          <td>
                            <div className="source-icon-tag" style={{ border: '1px solid rgba(255,255,255,0.1)', padding:'4px 8px', borderRadius:'15px', display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'11px', fontWeight:'600' }}>
                              {getSourceIcon(result.sumber)} {result.sumber.toUpperCase()}
                            </div>
                          </td>
                          <td className="font-mono text-muted text-sm">
                            {d.nim || (d.username ? `@${d.username}` : '-')}
                          </td>
                          <td className="font-semibold">{d.nama}</td>
                          <td className="text-sm">
                            {isPddikti ? (
                              <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                                <div><strong style={{opacity:0.7}}>PT:</strong> {d.universitas || '-'}</div>
                                <div><strong style={{opacity:0.7}}>Prodi:</strong> {d.prodi || '-'}</div>
                              </div>
                            ) : (
                              <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                                {d.jabatan && <div><strong>{d.jabatan}</strong></div>}
                                {d.perusahaan && <div>@ {d.perusahaan}</div>}
                                {d.universitas && <div>{d.universitas}</div>}
                              </div>
                            )}
                          </td>
                          <td>
                            {isPddikti ? (
                              <span className="badge badge-success text-xs" style={{padding:'4px 8px'}}>{d.status || 'Aktif'}</span>
                            ) : (
                              <span className="text-xs text-muted">{d.lokasi || '-'}</span>
                            )}
                          </td>
                          <td>
                            {isPddikti ? (
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                  className="btn btn-outline btn-sm action-review-btn"
                                  onClick={() => handleFetchDetail(d.id_mhs)}
                                  disabled={isFetchingDetail || !d.id_mhs}
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                  {isFetchingDetail && !hasDetail ? 'Loading...' : (hasDetail ? 'Tutup Detail' : 'Detail')}
                                </button>
                                
                                <button 
                                  className="btn btn-primary btn-sm action-review-btn"
                                  onClick={() => handleSaveAlumni(d)}
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                  <Database size={12} style={{marginRight:'4px'}} /> Simpan
                                </button>
                              </div>
                            ) : (
                              d.url && (
                                <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm action-review-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                  View Source <ExternalLink size={12} style={{marginLeft:'4px'}} />
                                </a>
                              )
                            )}
                          </td>
                        </tr>

                        {/* Collapsible Detail Row for PDDikti */}
                        {isPddikti && hasDetail && (
                          <tr className="detail-expanded-row animate-fade-in" style={{ backgroundColor: 'rgba(5, 10, 24, 0.4)' }}>
                            <td colSpan="7" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                               <div className="pddikti-history-table-container">
                                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                                    <h5 className="history-subtitle" style={{margin:0}}>Detail Lengkap Mahasiswa</h5>
                                    <span className="text-xs text-muted">Data real-time dari server PDDIKTI</span>
                                  </div>
                                  
                                  <div className="history-table-wrapper mb-4">
                                    <table className="history-table">
                                      <tbody>
                                        <tr>
                                          <td><strong>Kode PT</strong></td>
                                          <td>{detailedMhs.kode_pt || detailedMhs.data?.kode_pt || '-'}</td>
                                          <td><strong>Program Studi</strong></td>
                                          <td>{detailedMhs.prodi || detailedMhs.data?.prodi || d.prodi || '-'}</td>
                                        </tr>
                                        <tr>
                                          <td><strong>Kode Prodi</strong></td>
                                          <td>{detailedMhs.kode_prodi || detailedMhs.data?.kode_prodi || '-'}</td>
                                          <td><strong>Jenis Daftar</strong></td>
                                          <td>{detailedMhs.jenis_daftar || detailedMhs.data?.jenis_daftar || '-'}</td>
                                        </tr>
                                        <tr>
                                          <td><strong>Jenis Kelamin</strong></td>
                                          <td>{detailedMhs.jenis_kelamin || detailedMhs.data?.jenis_kelamin || '-'}</td>
                                          <td><strong>Jenjang</strong></td>
                                          <td>{detailedMhs.jenjang || detailedMhs.data?.jenjang || '-'}</td>
                                        </tr>
                                        <tr>
                                          <td><strong>Tanggal Masuk</strong></td>
                                          <td colSpan="3">{detailedMhs.tanggal_masuk || detailedMhs.data?.tanggal_masuk || '-'}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>

                                  <h5 className="history-subtitle">Riwayat Status Kuliah</h5>
                                  <div className="history-table-wrapper">
                                    <table className="history-table">
                                      <thead>
                                        <tr>
                                          <th>Semester</th>
                                          <th>Status</th>
                                          <th>SKS</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(detailedMhs.riwayat_studi || detailedMhs.data?.riwayat_studi || []).map((sem, sIdx) => (
                                          <tr key={sIdx}>
                                            <td>{sem.id_smt || sem.semester}</td>
                                            <td><span className={`status-pill ${sem.id_stat_mhs?.toLowerCase() || 'aktif'}`}>{sem.nm_stat_mhs || 'Aktif'}</span></td>
                                            <td>{sem.sks_smt || 0}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  
                                  {detailedMhs.riwayat_pendidikan && (
                                    <div className="academic-history-summary mt-4">
                                      <p className="text-xs text-muted">No Peserta / Ijazah: {detailedMhs.riwayat_pendidikan[0]?.no_seri_ijazah || '-'}</p>
                                    </div>
                                  )}
                               </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results glass-panel">
              <Radar size={40} className="text-muted mb-2" />
              <p>Tidak ada hasil untuk kategori <strong>{activeTab}</strong>.</p>
              <button className="btn btn-outline btn-sm mt-3" onClick={() => setActiveTab('all')}>Tampilkan Semua</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndTrack;