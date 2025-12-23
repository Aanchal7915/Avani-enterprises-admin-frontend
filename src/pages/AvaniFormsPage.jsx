
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import {
  ArrowLeft,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  StickyNote,
  Users,
  PhoneCall,
  BarChart3,
  MessageSquare,
  Mail,
  Phone,
  Layout
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AvaniFormsPage = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchForms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/avani-form`
      );
      const data = res.data?.data || res.data || [];
      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
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
      (f.phoneNu || "").toLowerCase().includes(q)
      
    );
  }, [forms, search]);

  const toggleDetails = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((f) => ({
        Name: f.fullName,
        Email: f.email,
        Phone: f.phoneNu,
        Services: Array.isArray(f.service)
          ? f.service.join(", ")
          : f.service,
        Company: f.companyName,
        Details: f.projectDetails,
        Date: f.createdAt
          ? new Date(f.createdAt).toLocaleString()
          : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
    XLSX.writeFile(
      workbook,
      `avani_submissions_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto space-y-6 pt-8 md:pt-4">

          {/* TOP HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-xs px-3 py-1.5 rounded-lg border bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={14} className="mr-1.5" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Contact Submissions
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  Manage and track all contact form inquiries from Avani Enterprises website. Review project details and export data seamlessly.
                </p>
              </div>
            </div>

            <button
              onClick={exportExcel}
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-pink-500 
                text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-pink-600 
                transition-all shadow-md active:scale-95 text-sm md:text-base font-semibold"
            >
              <Download size={18} className="mr-2" />
              Export to Excel
            </button>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  All Leads
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  View & manage all incoming leads
                </p>
              </div>
              <Users size={24} className="text-indigo-500" />
            </button>

            <button
              onClick={() => navigate("/contacted-leads")}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contacted Leads
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Leads that have been followed up
                </p>
              </div>
              <PhoneCall size={24} className="text-teal-500" />
            </button>

            <button
              onClick={() => navigate("/analytics")}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Analytics
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  See stats & performance
                </p>
              </div>
              <BarChart3 size={24} className="text-pink-500" />
            </button>

            <button
              onClick={() => navigate("/avani-forms")}
              className="flex items-center justify-between p-4 rounded-2xl 
                bg-gradient-to-br from-indigo-600 to-pink-500 text-white shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
                  Submissions
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Website contact forms
                </p>
              </div>
              <MessageSquare size={24} className="text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-indigo-50 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name, email, phone or service..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-indigo-400/30 
                  focus:border-indigo-400 bg-white/90 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600">{filtered.length}</span>{" "}
              submission{filtered.length !== 1 && "s"}.
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-500 bg-white p-10 rounded-xl">
              No submissions found
            </div>
          ) : (
            <>
              {/* MOBILE VIEW */}
              <div className="md:hidden space-y-4">
                {filtered.map((f) => (
                  <div
                    key={f._id}
                    className="bg-white p-4 rounded-2xl shadow-sm space-y-4"
                  >
                    <div>
                      <h3 className="font-bold text-lg">
                        {f.fullName || "N/A"}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {f.createdAt
                          ? new Date(f.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} />
                        {f.email || "—"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} />
                        {f.phoneNu || "—"}
                      </div>
                      {f.companyName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Layout size={14} />
                          {f.companyName}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleDetails(f._id)}
                      className="w-full flex justify-between items-center bg-indigo-50 p-3 rounded-xl text-sm font-semibold text-indigo-700"
                    >
                      Project Details
                      {expandedRow === f._id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    {expandedRow === f._id && (
                      <div className="bg-gray-50 p-3 rounded-xl text-sm">
                        {f.projectDetails || "No details provided"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Phone</th>
                      <th className="px-6 py-4 text-left">Company</th>
                      <th className="px-6 py-4 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f) => (
                      <tr key={f._id} className="border-t">
                        <td className="px-6 py-4">{f.fullName}</td>
                        <td className="px-6 py-4">{f.email}</td>
                        <td className="px-6 py-4">{f.phoneNu}</td>
                        <td className="px-6 py-4">{f.companyName}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {f.createdAt
                            ? new Date(f.createdAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AvaniFormsPage;

