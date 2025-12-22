import { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AvaniFormsPanel = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Phone", "Services", "Company", "Details", "Date"],
      ...forms.map((f) => [
        f.fullName || "",
        f.email || "",
        f.phoneNu || "",
        Array.isArray(f.service) ? f.service.join(", ") : f.service || "",
        f.companyName || "",
        f.projectDetails || "",
        f.createdAt ? new Date(f.createdAt).toLocaleString() : "",
      ]),
    ];

    const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avani_forms_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Contact Submissions</h3>
          <p className="text-xs text-gray-500">Recent form submissions from the website</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchForms} title="Refresh" className="p-2 rounded-md hover:bg-gray-100">
            <RefreshCw size={16} />
          </button>
          <button onClick={exportCsv} title="Export CSV" className="p-2 rounded-md hover:bg-gray-100">
            <Download size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : forms.length === 0 ? (
        <div className="text-sm text-gray-500">No submissions yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">Services</th>
                <th className="py-2 pr-4">Company</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {forms.slice(0, 8).map((f) => (
                <tr
                  key={f._id}
                  className="border-t border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/avani-forms/${f._id}`, { state: { form: f } })}
                  title="View details"
                >
                  <td className="py-2 pr-4 font-medium">{f.fullName || '—'}</td>
                  <td className="py-2 pr-4">
                    <div className="text-sm">{f.email || '—'}</div>
                    <div className="text-xs text-gray-400">{f.phoneNu || '—'}</div>
                  </td>
                  <td className="py-2 pr-4">{Array.isArray(f.service) ? f.service.join(', ') : f.service || '—'}</td>
                  <td className="py-2 pr-4">{f.companyName || '—'}</td>
                  <td className="py-2 pr-4 text-xs text-gray-400">{f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AvaniFormsPanel;
