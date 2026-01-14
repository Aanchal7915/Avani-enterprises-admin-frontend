import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Globe, Settings2, Edit, Trash, PlusCircle, CheckCircle, Info, ChevronRight, X } from "lucide-react";

export default function SeoManager() {
    const [entries, setEntries] = useState([]);
    const [form, setForm] = useState({ page: "", section: "", title: "", seoHeading: "", metaDescription: "", metaKeywords: "" });
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchAll = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/seo`);
            setEntries(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to load SEO entries");
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/seo/${editingId}`, form);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/seo`, form);
            }
            setForm({ page: "", section: "", title: "", seoHeading: "", metaDescription: "", metaKeywords: "" });
            setEditingId(null);
            setIsFormOpen(false);
            fetchAll();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Save failed");
        }
    };

    const edit = (entry) => {
        setForm({ page: entry.page, section: entry.section || "", title: entry.title || "", seoHeading: entry.seoHeading || "", metaDescription: entry.metaDescription || "", metaKeywords: entry.metaKeywords || "" });
        setEditingId(entry._id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const remove = async (id) => {
        if (!confirm("Delete this SEO entry?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/seo/${id}`);
            fetchAll();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Delete failed");
        }
    };

    const filteredEntries = entries.filter(e =>
        e.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Settings2 className="text-indigo-600" size={32} />
                        SEO Management
                    </h1>
                    <p className="mt-2 text-gray-600">Optimize your website's search engine visibility and metadata.</p>
                </div>
                <button
                    onClick={() => {
                        setIsFormOpen(!isFormOpen);
                        if (editingId) {
                            setEditingId(null);
                            setForm({ page: "", section: "", title: "", seoHeading: "", metaDescription: "", metaKeywords: "" });
                        }
                    }}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-indigo-600 to-pink-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                    {isFormOpen ? <X className="mr-2" size={20} /> : <PlusCircle className="mr-2" size={20} />}
                    {isFormOpen ? 'Close Editor' : 'Create New Entry'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 overflow-hidden">
                    <div className="p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <Globe size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-sm text-gray-500 font-medium truncate uppercase">Indexed</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{entries.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-4 overflow-hidden">
                    <div className="p-2 sm:p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
                        <CheckCircle size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-sm text-gray-500 font-medium truncate uppercase">Optimized</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{entries.filter(e => e.title && e.metaDescription).length}</p>
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center md:justify-start gap-3 sm:gap-4 overflow-hidden">
                    <div className="p-2 sm:p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                        <Info size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-sm text-gray-500 font-medium truncate uppercase text-center md:text-left">Pending Review</p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate text-center md:text-left">{entries.filter(e => !e.metaDescription).length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Modal/Section - MADE SMALLER */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-2xl max-w-lg w-full my-auto transition-all duration-300 relative">
                            <button
                                onClick={() => {
                                    setIsFormOpen(false);
                                    setEditingId(null);
                                    setForm({ page: "", section: "", title: "", seoHeading: "", metaDescription: "", metaKeywords: "" });
                                }}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center justify-between mb-4 pr-8">
                                <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Configuration' : 'New Configuration'}</h3>
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full animate-pulse">Live Preview</span>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Target Page</label>
                                        <input
                                            aria-label="page"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-sm"
                                            placeholder="/services"
                                            value={form.page}
                                            onChange={e => setForm({ ...form, page: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
                                        <input
                                            aria-label="section"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-sm"
                                            placeholder="hero"
                                            value={form.section}
                                            onChange={e => setForm({ ...form, section: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Browser Title</label>
                                    <input
                                        aria-label="title"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-sm"
                                        placeholder="Avani - Best Digital Marketing Agency"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                    />
                                    <div className="mt-1 flex justify-between items-center text-[10px]">
                                        <p className="text-gray-400">Optimal: 50-60 chars</p>
                                        <span className={clsx("font-medium", form.title.length > 60 ? "text-red-500" : "text-green-500")}>
                                            {form.title.length}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Main SEO Heading (H1)</label>
                                    <input
                                        aria-label="seoHeading"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-sm"
                                        placeholder="Welcome to Avani Enterprises"
                                        value={form.seoHeading}
                                        onChange={e => setForm({ ...form, seoHeading: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Description</label>
                                    <textarea
                                        aria-label="metaDescription"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 resize-none text-sm"
                                        placeholder="Describe your page for search engines..."
                                        value={form.metaDescription}
                                        onChange={e => setForm({ ...form, metaDescription: e.target.value })}
                                    />
                                    <div className="mt-1 flex justify-between items-center text-[10px]">
                                        <p className="text-gray-400">Optimal: 120-160 chars</p>
                                        <span className={clsx("font-medium", form.metaDescription.length > 160 ? "text-red-500" : "text-green-500")}>
                                            {form.metaDescription.length}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Keywords</label>
                                    <input
                                        aria-label="metaKeywords"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-sm"
                                        placeholder="marketing, digital, agency, avani"
                                        value={form.metaKeywords}
                                        onChange={e => setForm({ ...form, metaKeywords: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:opacity-90 transition-all duration-200 text-sm"
                                    >
                                        {editingId ? 'Update' : 'Save'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setForm({ page: "", section: "", title: "", seoHeading: "", metaDescription: "", metaKeywords: "" });
                                            setEditingId(null);
                                            setIsFormOpen(false);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Entries List Column */}
                <div className={isFormOpen ? "lg:col-span-7" : "lg:col-span-12"}>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-gray-900">SEO Library</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search pages..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-full sm:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Page & Title</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Meta Keywords</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SEO Details</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredEntries.map(en => (
                                        <tr key={en._id} className="hover:bg-gray-50/50 transition-colors group text-xs">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">{en.page}</span>
                                                    {en.section && <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg font-medium">{en.section}</span>}
                                                </div>
                                                <div className="font-bold text-gray-900 line-clamp-1">{en.title || 'No Title Set'}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-gray-600 max-w-[150px] line-clamp-2">
                                                    {en.metaKeywords || <span className="text-gray-300 italic">None</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-400 w-12 shrink-0">H1:</span>
                                                        <span className="text-gray-600 truncate">{en.seoHeading || '—'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-400 w-12 shrink-0">Desc:</span>
                                                        <span className="text-gray-600 line-clamp-1">{en.metaDescription || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 transition-opacity">
                                                    <button
                                                        onClick={() => edit(en)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => remove(en._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredEntries.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                <Globe className="mx-auto mb-3 text-gray-300" size={48} />
                                                <p className="font-medium text-gray-600">No SEO entries found</p>
                                                <p className="text-sm">Try adjusting your search or create a new entry.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ label, active }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={clsx("w-1.5 h-1.5 rounded-full", active ? "bg-green-500" : "bg-gray-300")} />
            <span className={clsx("text-[10px] font-bold uppercase tracking-tight", active ? "text-gray-700" : "text-gray-400")}>
                {label}
            </span>
        </div>
    );
}

function clsx(...classes) {
    return classes.filter(Boolean).join(" ");
}
