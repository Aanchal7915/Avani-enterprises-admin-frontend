import { useEffect, useState } from "react";
import axios from "axios";

export default function SeoManager() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ page: "", section: "", title: "", seoHeading: "", metaDescription: "", metaKeywords: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await axios.get("/admin/seo");
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
        await axios.put(`/admin/seo/${editingId}`, form);
      } else {
        await axios.post(`/admin/seo`, form);
      }
      setForm({ page: "", section: "", title: "", seoHeading: "", metaDescription: "", metaKeywords: "" });
      setEditingId(null);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const edit = (entry) => {
    setForm({ page: entry.page, section: entry.section || "", title: entry.title || "", seoHeading: entry.seoHeading || "", metaDescription: entry.metaDescription || "", metaKeywords: entry.metaKeywords || "" });
    setEditingId(entry._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!confirm("Delete this SEO entry?")) return;
    try {
      await axios.delete(`/admin/seo/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-3">{editingId ? 'Edit SEO Entry' : 'Create SEO Entry'}</h3>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
            <input aria-label="page" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200" placeholder="/about or /services" value={form.page} onChange={e=>setForm({...form,page:e.target.value})} required />
            <p className="text-xs text-gray-400 mt-1">Include leading slash. Example: <code className="bg-gray-100 px-1 rounded">/about</code></p>
          </div>

          <div className="col-span-1 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Section (optional)</label>
            <input aria-label="section" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200" placeholder="hero | services | faq" value={form.section} onChange={e=>setForm({...form,section:e.target.value})} />
            <p className="text-xs text-gray-400 mt-1">Use when you want different meta for sections inside a page.</p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input aria-label="title" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200" placeholder="Title shown in browser tab" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <p className="text-xs text-gray-400 mt-1">Recommended length: 50-60 characters.</p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Heading</label>
            <input aria-label="seoHeading" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200" placeholder="H1 to show on page (optional)" value={form.seoHeading} onChange={e=>setForm({...form,seoHeading:e.target.value})} />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea aria-label="metaDescription" rows={4} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200" placeholder="Write a concise meta description..." value={form.metaDescription} onChange={e=>setForm({...form,metaDescription:e.target.value})} />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Recommended: 120-160 characters</span>
              <span>{form.metaDescription.length} chars</span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
            <input aria-label="metaKeywords" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200" placeholder="keyword1, keyword2, keyword3" value={form.metaKeywords} onChange={e=>setForm({...form,metaKeywords:e.target.value})} />
            <p className="text-xs text-gray-400 mt-1">Comma-separated keywords (optional).</p>
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center gap-3 mt-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{editingId ? 'Update Entry' : 'Create Entry'}</button>
            <button type="button" onClick={()=>{setForm({ page: "", section: "", title: "", seoHeading: "", metaDescription: "", metaKeywords: "" }); setEditingId(null);}} className="px-3 py-2 border rounded-lg">Reset</button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Existing SEO Entries</h3>
          <div className="text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{entries.length}</span></div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map(en => (
            <div key={en._id} className="p-4 border rounded-lg hover:shadow-md flex flex-col md:flex-row md:justify-between gap-3 md:gap-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{en.page}</span>
                  {en.section && <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">{en.section}</span>}
                </div>
                <div className="font-medium text-gray-900 mt-2">{en.title || '—'}</div>
                <div className="text-sm text-gray-500 mt-1">{en.metaDescription?.slice(0,160) || 'No description'}</div>
                <div className="text-xs text-gray-400 mt-2">Updated: {new Date(en.updatedAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end gap-2">
                <button onClick={()=>edit(en)} className="px-3 py-1 bg-indigo-600 text-white rounded">Edit</button>
                <button onClick={()=>remove(en._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
