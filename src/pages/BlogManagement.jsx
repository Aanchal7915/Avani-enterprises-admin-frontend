import { useState, useEffect } from "react";
import axios from "axios";
import ErrorFallback from "../components/ErrorFallback";
import { useAuth } from "../context/AuthContext";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";

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
    <div className="max-w-6xl mx-auto pt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-sm text-gray-500">Create, edit, publish and delete blog posts</p>
        </div>
        <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded"> <Plus /> New Post</button>
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded max-w-2xl w-full">
            <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Post' : 'New Post'}</h2>
            <form onSubmit={save} className="space-y-3">
              <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border p-2 rounded" />
              <input placeholder="Slug (unique)" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="w-full border p-2 rounded" />
              <input placeholder="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} className="w-full border p-2 rounded" />
              <input placeholder="Featured Image URL" value={form.featuredImage} onChange={e=>setForm({...form,featuredImage:e.target.value})} className="w-full border p-2 rounded" />
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} className="w-full border p-2 rounded" />
              <textarea placeholder="Excerpt" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} className="w-full border p-2 rounded" />
              <textarea placeholder="Content (HTML/markdown)" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} className="w-full border p-2 rounded h-40" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form,isPublished:e.target.checked})} /> Publish</label>
                <div className="flex-1" />
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
