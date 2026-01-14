import { useState, useEffect } from "react";
import axios from "axios";
import ErrorFallback from "../components/ErrorFallback";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    tags: "",
    featuredImage: "",
    isPublished: false,
    imageAltText: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: ""
  });

  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) fetchBlogs();
  }, [authLoading]);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/blogs`);
      setBlogs(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "",
      tags: "",
      featuredImage: "",
      isPublished: true,
      imageAltText: "",
      metaTitle: "",
      metaKeywords: "",
      metaDescription: ""
    });
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      ...b,
      tags: (b.tags || []).join(", "),
      isPublished: b.isPublished ?? true,
      imageAltText: b.imageAltText || "",
      metaTitle: b.metaTitle || "",
      metaKeywords: b.metaKeywords || "",
      metaDescription: b.metaDescription || ""
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
      if (editing) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/blogs/${editing._id}`, payload);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/blogs`, payload);
      }
      fetchBlogs();
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this blog?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) return <ErrorFallback error={error} resetError={fetchBlogs} message="Failed to load blogs" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Your Blogs</h1>
          <p className="text-slate-500 mt-1 font-medium">Create, edit, and optimize your blog posts for better reach.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:opacity-90 hover:scale-[1.02] transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Add New Blog Post</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by title..."
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all w-64 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-5 text-center w-16">#</th>
                <th className="px-6 py-5">Preview</th>
                <th className="px-6 py-5">Post Details</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-center">Edit</th>
                <th className="px-6 py-5 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-bold">Loading blogs...</td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-bold">No blog posts found.</td>
                </tr>
              ) : filteredBlogs.map((b, idx) => (
                <tr key={b._id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-5 text-center text-sm font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                      <img
                        src={b.featuredImage || "/placeholder-blog.png"}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = "https://via.placeholder.com/150?text=No+Image"}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="max-w-md">
                      <div className="font-bold text-slate-900 truncate">{b.title}</div>
                      <div className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">{b.excerpt || "No description available..."}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${b.isPublished
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                      {b.isPublished ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => remove(b._id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 border border-rose-100 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-slate-500">
            Showing 1 to {filteredBlogs.length} of {blogs.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-100">1</button>
            <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-pink-500 p-6 flex justify-between items-center z-20 shadow-lg">
              <div>
                <h2 className="text-2xl font-black text-white">{editing ? 'Edit Blog Post' : 'Create New Post'}</h2>
                <p className="text-xs text-indigo-100 font-medium">Fill in the details below to {(editing ? 'update' : 'publish')} your blog.</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white border border-white/20 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-0">
              <form onSubmit={save} className="">
                <div className="flex flex-col lg:flex-row">
                  {/* Left Column: Primary Content */}
                  <div className="flex-1 p-8 space-y-6 border-r border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blog Title</label>
                      <input
                        placeholder="Type blog title here..."
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                      <input
                        placeholder="https://example.com/image.jpg"
                        value={form.featuredImage}
                        onChange={e => setForm({ ...form, featuredImage: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image Alt Text (Naming)</label>
                      <input
                        placeholder="Describe the image for accessibility..."
                        value={form.imageAltText}
                        onChange={e => setForm({ ...form, imageAltText: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blog Content</label>
                      <textarea
                        placeholder="Write your amazing content here..."
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all h-80 resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Settings & SEO */}
                  <div className="w-full lg:w-80 bg-slate-50/50 p-8 space-y-8">
                    {/* Publish Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Publish Settings</h3>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                        <select
                          value={form.isPublished ? "true" : "false"}
                          onChange={e => setForm({ ...form, isPublished: e.target.value === "true" })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all appearance-none cursor-pointer shadow-sm"
                        >
                          <option value="true">Active (Visible)</option>
                          <option value="false">Inactive (Hidden)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug</label>
                        <input
                          placeholder="url-friendly-slug"
                          value={form.slug}
                          onChange={e => setForm({ ...form, slug: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all text-xs"
                        />
                      </div>
                    </div>

                    {/* SEO Optimization */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">SEO Optimization</h3>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Title</label>
                        <input
                          placeholder="SEO title..."
                          value={form.metaTitle}
                          onChange={e => setForm({ ...form, metaTitle: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Keywords</label>
                        <input
                          placeholder="keywords, comma, separated"
                          value={form.metaKeywords}
                          onChange={e => setForm({ ...form, metaKeywords: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Description</label>
                        <textarea
                          placeholder="Brief SEO summary..."
                          value={form.metaDescription}
                          onChange={e => setForm({ ...form, metaDescription: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-bold transition-all h-24 text-xs resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-4 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:opacity-90 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
                  >
                    {editing ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
