import { useState, useEffect } from "react";
import axios from "axios";
import ErrorFallback from "../components/ErrorFallback";
import { useAuth } from "../context/AuthContext";
import { Plus, Edit2, Trash2, Eye, X } from "lucide-react";

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", author: "", tags: "", featuredImage: "", isPublished: false });

  const { token, loading: authLoading } = useAuth();

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
    setForm({ title: "", slug: "", excerpt: "", content: "", author: "", tags: "", featuredImage: "", isPublished: false });
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ ...b, tags: (b.tags || []).join(", ") });
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

  if (error) return <ErrorFallback error={error} resetError={fetchBlogs} message="Failed to load blogs" />;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-sm text-gray-500">Create, edit, publish and delete blog posts</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white px-5 py-1.5 md:px-4 md:py-2 rounded-lg text-[11px] md:text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95 whitespace-nowrap shrink-0"
        >
          <Plus size={14} className="md:w-4 md:h-4" />
          <span>New Post</span>
        </button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 gap-4">
          {blogs.map(b => (
            <div key={b._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{b.title}</div>
                <div className="text-xs text-gray-500">{b.slug} • {b.isPublished ? 'Published' : 'Draft'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(b)} className="p-2 bg-gray-100 rounded"><Edit2 size={16} /></button>
                <button onClick={() => remove(b._id)} className="p-2 bg-red-50 text-red-600 rounded"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800">{editing ? 'Edit Blog Post' : 'Create New Post'}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={save} className="space-y-4">
                <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border p-2 rounded" />
                <input placeholder="Slug (unique)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full border p-2 rounded" />
                <input placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="w-full border p-2 rounded" />
                <input placeholder="Featured Image URL" value={form.featuredImage} onChange={e => setForm({ ...form, featuredImage: e.target.value })} className="w-full border p-2 rounded" />
                <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full border p-2 rounded" />
                <textarea placeholder="Excerpt" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full border p-2 rounded" />
                <textarea placeholder="Content (HTML/markdown)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full border p-2 rounded h-40" />
                <div className="flex items-center gap-2 mb-4">
                  <input type="checkbox" id="isPublished" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                  <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 cursor-pointer">Publish now</label>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                  >
                    {editing ? 'Update Post' : 'Create Post'}
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
