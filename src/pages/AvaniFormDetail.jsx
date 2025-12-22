import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

const AvaniFormDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
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

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!form) return <div className="p-6">No submission found.</div>;

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-semibold mb-4">Submission Details</h2>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-xs text-gray-500">Name</div>
            <div className="font-medium text-lg">{form.fullName || '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">{form.email || '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Phone</div>
            <div className="font-medium">{form.phoneNu || '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Services</div>
            <div className="font-medium">{Array.isArray(form.service) ? form.service.join(', ') : form.service || '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Company</div>
            <div className="font-medium">{form.companyName || '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Project Details</div>
            <div className="whitespace-pre-wrap text-sm text-gray-700">{form.projectDetails || '—'}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Submitted</div>
            <div className="text-sm text-gray-600">{form.createdAt ? new Date(form.createdAt).toLocaleString() : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvaniFormDetail;
