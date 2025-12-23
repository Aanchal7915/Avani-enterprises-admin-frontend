// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import * as XLSX from "xlsx";
// import Sidebar from "../components/Sidebar";
// import {
//   ArrowLeft,
//   Search,
//   Download,
//   ChevronDown,
//   ChevronUp,
//   StickyNote,
//   User,
//   Mail,
//   Phone,
//   Layout
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const AvaniFormsPage = () => {
//   const navigate = useNavigate();
//   const [forms, setForms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [expandedRow, setExpandedRow] = useState(null);

//   const fetchForms = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/avani-form`);
//       const data = res.data?.data || res.data || [];
//       setForms(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to fetch avani forms", err);
//       setError("Failed to load submissions");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchForms();
//   }, []);

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return forms;
//     return forms.filter((f) =>
//       (f.fullName || "").toLowerCase().includes(q) ||
//       (f.email || "").toLowerCase().includes(q) ||
//       (f.phoneNu || "").toLowerCase().includes(q) ||
//       (Array.isArray(f.service) ? f.service.join(", ") : f.service || "").toLowerCase().includes(q) ||
//       (f.companyName || "").toLowerCase().includes(q)
//     );
//   }, [forms, search]);

//   const toggleDetails = (id) => {
//     setExpandedRow(expandedRow === id ? null : id);
//   };

//   const exportExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(
//       filtered.map((f) => ({
//         Name: f.fullName,
//         Email: f.email,
//         Phone: f.phoneNu,
//         Services: Array.isArray(f.service) ? f.service.join(", ") : f.service,
//         Company: f.companyName,
//         Details: f.projectDetails,
//         Date: f.createdAt ? new Date(f.createdAt).toLocaleString() : "",
//       }))
//     );
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
//     XLSX.writeFile(workbook, `avani_submissions_${new Date().toISOString().split("T")[0]}.xlsx`);
//   };

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
//       <Sidebar />

//       <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
//         <div className="max-w-7xl mx-auto space-y-6 pt-8 md:pt-4 px-2 sm:px-0">

//           {/* Header Area */}
//           <div className="flex flex-col gap-3">
//             <button
//               onClick={() => navigate(-1)}
//               className="inline-flex items-center text-[10px] md:text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white/80 hover:bg-gray-50 shadow-sm transition self-start font-medium text-gray-600"
//             >
//               <ArrowLeft size={14} className="mr-1.5" />
//               Back
//             </button>

//             <div className="flex flex-row flex-wrap items-center justify-between gap-3 overflow-hidden px-1">
//               <div className="flex-1 min-w-[100px]">
//                 <h1 className="text-lg md:text-3xl font-bold text-gray-900 tracking-tight truncate">Submissions</h1>
//                 <p className="hidden md:block text-gray-500 text-sm">Website contact forms.</p>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end px-1">
//             <button
//               onClick={exportExcel}
//               className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all shadow-md active:scale-95 text-sm md:text-base font-bold"
//             >
//               <Download size={18} className="mr-2" />
//               Export to Excel
//             </button>
//           </div>

//           {/* Search Bar */}
//           <div className="bg-white/80 backdrop-blur-xl p-2.5 md:p-5 rounded-xl border border-indigo-50 shadow-sm">
//             <div className="flex flex-col md:flex-row gap-2 md:items-center">
//               <div className="relative w-full md:w-96">
//                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
//                 <input
//                   placeholder="Search..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white/90 text-[11px] md:text-sm"
//                 />
//               </div>
//               <div className="text-[9px] text-gray-400 px-1 italic">
//                 {filtered.length} total results
//               </div>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500 border-t-transparent" />
//             </div>
//           ) : error ? (
//             <div className="bg-red-50 border border-red-100 text-red-600 py-6 px-4 rounded-2xl text-center text-sm">{error}</div>
//           ) : filtered.length === 0 ? (
//             <div className="bg-white/80 border border-gray-100 rounded-2xl p-10 text-center text-gray-500">No submissions found.</div>
//           ) : (
//             <>
//               {/* Desktop Table View */}
//               <div className="hidden md:block bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm">
//                 <table className="w-full text-left border-collapse">
//                   <thead className="bg-slate-50/80 text-gray-600 text-xs uppercase font-semibold tracking-wider">
//                     <tr>
//                       <th className="px-6 py-4">Name</th>
//                       <th className="px-6 py-4">Contact Info</th>
//                       <th className="px-6 py-4">Services</th>
//                       <th className="px-6 py-4">Company</th>
//                       <th className="px-6 py-4">Date</th>
//                       <th className="px-6 py-4 text-right">Details</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {filtered.map((f) => (
//                       <React.Fragment key={f._id}>
//                         <tr className={`transition-colors hover:bg-indigo-50/40 ${expandedRow === f._id ? 'bg-indigo-50/60' : 'bg-white'}`}>
//                           <td className="px-6 py-4 font-medium text-gray-900">{f.fullName || '—'}</td>
//                           <td className="px-6 py-4">
//                             <div className="text-gray-900">{f.email || '—'}</div>
//                             <div className="text-xs text-gray-500">{f.phoneNu || '—'}</div>
//                           </td>
//                           <td className="px-6 py-4">
//                             <div className="flex flex-wrap gap-1.5">
//                               {(Array.isArray(f.service) ? f.service : (f.service ? String(f.service).split(',').map(s => s.trim()) : [])).map((s, i) => (
//                                 <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">{s}</span>
//                               ))}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 text-gray-700">{f.companyName || '—'}</td>
//                           <td className="px-6 py-4 text-gray-500 text-xs">
//                             {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}
//                             <div className="text-[10px]">{f.createdAt ? new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
//                           </td>
//                           <td className="px-6 py-4 text-right">
//                             <button
//                               onClick={() => toggleDetails(f._id)}
//                               className={`p-2 rounded-lg transition-colors relative group ${expandedRow === f._id
//                                 ? 'bg-indigo-100 text-indigo-600'
//                                 : 'hover:bg-indigo-50 text-indigo-400 hover:text-indigo-500'
//                                 }`}
//                               title="View Project Details"
//                             >
//                               <StickyNote size={20} />
//                               {f.projectDetails && !expandedRow === f._id && (
//                                 <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-400 border border-white" />
//                               )}
//                             </button>
//                           </td>
//                         </tr>
//                         {expandedRow === f._id && (
//                           <tr>
//                             <td colSpan={6} className="px-0">
//                               <div className="bg-indigo-50/30 p-6 border-b border-indigo-100 animate-in slide-in-from-top-2 duration-200">
//                                 <div className="max-w-3xl mx-auto bg-white rounded-xl border border-indigo-100 p-5 shadow-sm">
//                                   <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
//                                     <StickyNote size={18} className="text-indigo-500" />
//                                     <h4 className="text-sm font-semibold text-gray-900">Project Details</h4>
//                                   </div>
//                                   <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
//                                     {f.projectDetails || 'No additional project details provided.'}
//                                   </p>
//                                 </div>
//                               </div>
//                             </td>
//                           </tr>
//                         )}
//                       </React.Fragment>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Mobile Card View */}
//               <div className="md:hidden space-y-4">
//                 {filtered.map((f) => (
//                   <div key={f._id} className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-bold text-gray-900 text-lg">{f.fullName || "N/A"}</h3>
//                         <p className="text-xs text-gray-400">
//                           {f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       <div>
//                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
//                         <div className="space-y-1">
//                           <div className="flex items-center gap-2 text-sm text-gray-700">
//                             <Mail size={14} className="text-gray-400" />
//                             {f.email || '—'}
//                           </div>
//                           <div className="flex items-center gap-2 text-sm text-gray-700">
//                             <Phone size={14} className="text-gray-400" />
//                             {f.phoneNu || '—'}
//                           </div>
//                           {f.companyName && (
//                             <div className="flex items-center gap-2 text-sm text-gray-700">
//                               <Layout size={14} className="text-gray-400" />
//                               {f.companyName}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div>
//                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Services</p>
//                         <div className="flex flex-wrap gap-1.5">
//                           {(Array.isArray(f.service) ? f.service : (f.service ? String(f.service).split(',').map(s => s.trim()) : [])).map((s, i) => (
//                             <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-full border border-indigo-100">
//                               {s}
//                             </span>
//                           ))}
//                         </div>
//                       </div>

//                       <div>
//                         <button
//                           onClick={() => toggleDetails(f._id)}
//                           className="w-full flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-100/50 transition-colors"
//                         >
//                           <span className="flex items-center gap-2 text-sm">
//                             <StickyNote size={14} />
//                             Project Details
//                           </span>
//                           {expandedRow === f._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                         </button>

//                         {expandedRow === f._id && (
//                           <div className="mt-2 p-4 bg-white rounded-xl border border-gray-100 shadow-inner animate-in slide-in-from-top-2 duration-300">
//                             <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
//                               {f.projectDetails || "No project details provided."}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AvaniFormsPage;
















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
      (f.phoneNu || "").toLowerCase().includes(q) ||
      (Array.isArray(f.service) ? f.service.join(", ") : f.service || "").toLowerCase().includes(q) ||
      (f.companyName || "").toLowerCase().includes(q)
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
                placeholder="Search by name, email, phone... or service..."
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
                      <div className="flex items-start gap-2 text-sm break-all">
                        <Mail size={14} className="mt-1 shrink-0" />
                        {f.email || "—"}
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Phone size={14} className="mt-1 shrink-0" />
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

