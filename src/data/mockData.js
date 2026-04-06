export const alumniData = [
  {
    id: "AL-1001",
    name: "Ahmad Fauzi",
    nim: "1801001",
    graduationYear: 2022,
    extractedJob: "Software Engineer",
    extractedCompany: "Tech Indonesia",   // fix: was "Tech Indoesia"
    confidenceScore: 98,
    status: "Tracked",
    evidenceUrl: "https://linkedin.com/in/ahmadfauzi",
    lastChecked: "2026-04-01T10:00:00Z"
  },
  {
    id: "AL-1002",
    name: "Budi Santoso",
    nim: "1801002",
    graduationYear: 2022,
    extractedJob: "Data Analyst",
    extractedCompany: "DataCorp",
    confidenceScore: 65,
    status: "Pending Validation",
    evidenceUrl: "https://linkedin.com/in/budisantoso-data",
    lastChecked: "2026-04-02T12:30:00Z"
  },
  {
    id: "AL-1003",
    name: "Citra Lestari",
    nim: "1801003",
    graduationYear: 2022,
    extractedJob: "-",
    extractedCompany: "-",
    confidenceScore: 0,
    status: "Untracked",
    evidenceUrl: null,
    lastChecked: "2026-04-03T09:15:00Z"
  },
  {
    id: "AL-1004",
    name: "Deni Pratama",
    nim: "1801004",
    graduationYear: 2023,
    extractedJob: "UI/UX Designer",
    extractedCompany: "Creative Studio",
    confidenceScore: 92,
    status: "Tracked",
    evidenceUrl: "https://dribbble.com/denipratama",
    lastChecked: "2026-04-04T14:20:00Z"
  },
  {
    id: "AL-1005",
    name: "Eka Putri",
    nim: "1801005",
    graduationYear: 2023,
    extractedJob: "Marketing Specialist",
    extractedCompany: "Digital Agency",
    confidenceScore: 55,
    status: "Pending Validation",
    evidenceUrl: "https://linkedin.com/in/ekaputrimarketing",
    lastChecked: "2026-04-05T08:00:00Z"
  },
  {
    id: "AL-1006",
    name: "Fajar Ramadhan",
    nim: "1801006",
    graduationYear: 2021,
    extractedJob: "System Administrator",
    extractedCompany: "NetWorks",
    confidenceScore: 88,
    status: "Tracked",
    evidenceUrl: "https://linkedin.com/in/fajar-sysadmin",
    lastChecked: "2026-03-28T11:45:00Z"
  },
  {
    id: "AL-1007",
    name: "Gita Anjani",
    nim: "1801007",
    graduationYear: 2024,
    extractedJob: "-",
    extractedCompany: "-",
    confidenceScore: 0,
    status: "Untracked",
    evidenceUrl: null,
    lastChecked: "2026-04-05T10:15:00Z"
  },
  {
    id: "AL-1008",
    name: "Joko Anwar",
    nim: "1801008",
    graduationYear: 2021,
    extractedJob: "Product Manager",
    extractedCompany: "Startup ID",
    confidenceScore: 99,
    status: "Tracked",
    evidenceUrl: "https://linkedin.com/in/joko-pm",
    lastChecked: "2026-04-02T16:00:00Z"
  }
];

// kpiStats computed dynamically from alumniData — no more hardcoding!
export const kpiStats = (() => {
  const tracked = alumniData.filter(a => a.status === 'Tracked').length;
  const untracked = alumniData.filter(a => a.status === 'Untracked').length;
  const pending = alumniData.filter(a => a.status === 'Pending Validation').length;
  return [
    { name: "Tracked", value: tracked, color: "#10B981" },
    { name: "Untracked", value: untracked, color: "#EF4444" },
    { name: "Pending", value: pending, color: "#F59E0B" }
  ];
})();

// yearStats computed dynamically from alumniData
export const yearStats = (() => {
  const years = [...new Set(alumniData.map(a => a.graduationYear))].sort();
  return years.map(year => ({
    year: String(year),
    tracked: alumniData.filter(a => a.graduationYear === year && a.status === 'Tracked').length,
    untracked: alumniData.filter(a => a.graduationYear === year && a.status !== 'Tracked').length,
  }));
})();
