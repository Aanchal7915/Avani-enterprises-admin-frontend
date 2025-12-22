import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AvaniFormsPage = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchForms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/avani-form`);
      const data = res.data?.data || res.data || [];
      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch avani forms", err);
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return forms;
    return forms.filter((f) =>
      (f.fullName || "").toLowerCase().includes(q) ||
      (f.email || "").toLowerCase().includes(q) ||
      (f.phoneNu || "").toLowerCase().includes(q) ||
      (Array.isArray(f.service) ? f.service.join(", ") : f.service || "").toLowerCase().includes(q) ||
      (f.companyName || "").toLowerCase().includes(q)
    );
  }, [forms, search]);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((f) => ({
        Name: f.fullName,
        Email: f.email,
        Phone: f.phoneNu,
        Services: Array.isArray(f.service) ? f.service.join(", ") : f.service,
        Company: f.companyName,
        Details: f.projectDetails,
        Date: f.createdAt ? new Date(f.createdAt).toLocaleString() : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    XLSX.writeFile(workbook, `avani_submissions_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto space-y-6 pt-8 md:pt-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-xs md:text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white/80 hover:bg-gray-50 shadow-sm transition self-start"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contact Submissions</h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">Complete list of submissions from the website.</p>
            </div>
          </div>

          <div className="p-0">
            <div className="flex items-center justify-between mb-6">
              <div />
              <div className="flex items-center gap-2">
                <input
                  placeholder="Search name, email, phone or service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm w-72"
                />
                <button onClick={exportExcel} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm">Export</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border shadow-sm">
              {loading ? (
                <div className="py-10 text-center">Loading…</div>
              ) : error ? (
                <div className="py-6 text-red-500">{error}</div>
              ) : filtered.length === 0 ? (
                <div className="py-6 text-gray-500">No submissions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"> </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filtered.map((f, idx) => (
                        <tr key={f._id} className={`transition-colors hover:bg-indigo-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{f.fullName || '—'}</div>
                            <div className="text-xs text-gray-400">{f.email || '—'}</div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">{f.phoneNu || '—'}</div>
                          </td>

                          <td className="px-6 py-4 whitespace-normal max-w-xs">
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(f.service) ? f.service : (f.service ? String(f.service).split(',').map(s => s.trim()) : []) ).map((s, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">{s}</span>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{f.companyName || '—'}</td>

                          <td className="px-6 py-4 break-words max-w-xl text-sm text-gray-600">{f.projectDetails ? f.projectDetails : '—'}</td>

                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}</td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {/* <button
                              onClick={() => navigate(`/avani-forms/${f._id}`, { state: { form: f } })}
                              className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                            >
                              View
                            </button> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AvaniFormsPage;
