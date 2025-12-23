import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, Mail, Phone, Layout, StickyNote, Calendar, User } from "lucide-react";

const AvaniFormDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState(state?.form || null);
  const [loading, setLoading] = useState(!form);
  const [error, setError] = useState("");

  useEffect(() => {
    if (form) return;
    const fetchOne = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/avani-form/${id}`);
        setForm(res.data?.data || res.data || null);
      } catch (err) {
        console.error("Failed to fetch avani form", err);
        setError("Failed to load submission");
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id, form]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
    </div>
  );

  if (error || !form) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-red-500">
      {error || "Submission not found"}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <div className="max-w-4xl mx-auto space-y-6 pt-8 md:pt-4">

          {/* Header */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition self-start font-medium text-gray-600"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Submissions
            </button>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Submission Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main Info Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                      {form.fullName?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white leading-tight">{form.fullName || 'Anonymous'}</h2>
                      <div className="flex items-center gap-2 text-indigo-100 text-sm mt-1">
                        <Calendar size={14} />
                        {form.createdAt ? new Date(form.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Contact Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                      <div className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Mail size={16} /></div>
                        {form.email || '—'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                      <div className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><Phone size={16} /></div>
                        {form.phoneNu || '—'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company</p>
                      <div className="flex items-center gap-3 text-gray-700 font-medium">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-500"><Layout size={16} /></div>
                        {form.companyName || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-pink-50 rounded-lg text-pink-500"><StickyNote size={18} /></div>
                      <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider">Project Details</h3>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {form.projectDetails || 'No additional project details provided.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50 flex items-center justify-between">
                  <span>Selected Services</span>
                  <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                    {Array.isArray(form.service) ? form.service.length : (form.service ? 1 : 0)}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(form.service) ? form.service : (form.service ? String(form.service).split(',').map(s => s.trim()) : ['No specific service selected'])).map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-50/50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100/50">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
                <h3 className="font-bold mb-2">Need Help?</h3>
                <p className="text-indigo-200 text-xs leading-relaxed mb-4">
                  If you have questions about this submission, contact your technical support or the website administrator.
                </p>
                <div className="text-xs font-mono bg-white/10 p-2 rounded-lg">
                  Ref ID: {form._id}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AvaniFormDetail;
