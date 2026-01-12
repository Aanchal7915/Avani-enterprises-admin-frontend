import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ErrorFallback from "../components/ErrorFallback";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Search,
  MapPin,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  FileText,
  MoreVertical,
} from "lucide-react";
import clsx from "clsx";

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    experience: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    skills: "",
    benefits: "",
    status: "active",
  });

  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      fetchJobs();
    }
  }, [authLoading, token]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs`);
      setJobs(res.data.data || []);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
      setJobs([]);
      setError(err);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetError={fetchJobs}
        message="Failed to load jobs"
      />
    );
  }

  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(search) ||
      job.department?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search)
    );
  });

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      department: "",
      location: "",
      type: "Full-time",
      experience: "",
      description: "",
      responsibilities: "",
      qualifications: "",
      skills: "",
      benefits: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    
    // Convert status from "Active"/"Filled"/"Closed" to "active"/"filled"/"closed" for the form
    let formStatus = "active";
    if (job.status === "Active") formStatus = "active";
    else if (job.status === "Filled") formStatus = "filled";
    else if (job.status === "Closed") formStatus = "closed";
    
    setFormData({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "Full-time",
      experience: job.experience || "",
      description: job.description || "",
      responsibilities: Array.isArray(job.responsibilities) 
        ? job.responsibilities.join('\n') 
        : job.responsibilities || "",
      qualifications: Array.isArray(job.qualifications)
        ? job.qualifications.join('\n')
        : job.qualifications || "",
      skills: Array.isArray(job.skills)
        ? job.skills.join(', ')
        : job.skills || "",
      benefits: Array.isArray(job.benefits)
        ? job.benefits.join('\n')
        : job.benefits || "",
      status: formStatus,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert string fields to arrays
      const jobData = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        experience: formData.experience,
        description: formData.description,
        responsibilities: formData.responsibilities
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0),
        qualifications: formData.qualifications
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0),
        skills: formData.skills
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0),
        benefits: formData.benefits
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0),
        status: formData.status === "active" ? "Active" : formData.status === "filled" ? "Filled" : "Closed",
        isActive: formData.status === "active",
      };

      console.log("\n=== FRONTEND: Submitting Job ===");
      console.log("Job Data:", JSON.stringify(jobData, null, 2));
      console.log("Responsibilities:", jobData.responsibilities);
      console.log("Qualifications:", jobData.qualifications);
      console.log("Is Array - Responsibilities:", Array.isArray(jobData.responsibilities));
      console.log("Is Array - Qualifications:", Array.isArray(jobData.qualifications));
      console.log("Array Length - Responsibilities:", jobData.responsibilities.length);
      console.log("Array Length - Qualifications:", jobData.qualifications.length);

      if (editingJob) {
        console.log("Updating existing job:", editingJob._id);
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/jobs/${editingJob._id}`,
          jobData
        );
        console.log("✅ Update response:", response.data);
      } else {
        console.log("Creating new job");
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/jobs`, 
          jobData
        );
        console.log("✅ Create response:", response.data);
      }
      
      console.log("✅ Job saved successfully!");
      fetchJobs();
      setShowModal(false);
      setEditingJob(null);
      setFormData({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        experience: "",
        description: "",
        responsibilities: "",
        qualifications: "",
        skills: "",
        benefits: "",
        status: "active",
      });
    } catch (err) {
      console.error("\n❌ FRONTEND ERROR:");
      console.error("Error:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Error message:", err.message);
      
      const errorMsg = err.response?.data?.message || err.message;
      const errorDetails = err.response?.data?.details 
        ? '\n\nDetails:\n' + err.response.data.details.map(d => `- ${d.field}: ${d.message}`).join('\n')
        : '';
      
      alert(`Failed to save job: ${errorMsg}${errorDetails}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      console.error("Failed to delete job", err);
      alert("Failed to delete job. Please try again.");
    }
  };

  const toggleStatus = async (job) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/jobs/${job._id}/toggle`);
      fetchJobs();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    // Normalize status to lowercase for comparison
    const normalizedStatus = status?.toLowerCase() || "closed";
    
    const badges = {
      active: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-100",
        label: "Active",
        icon: CheckCircle,
      },
      filled: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-100",
        label: "Filled",
        icon: CheckCircle,
      },
      closed: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-100",
        label: "Closed",
        icon: XCircle,
      },
    };
    const badge = badges[normalizedStatus] || badges.closed;
    const Icon = badge.icon;
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
          badge.bg,
          badge.text,
          badge.border
        )}
      >
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto space-y-6 pt-8 md:pt-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Job Management
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Create, edit, and manage job vacancies
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-pink-500 
                text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-pink-600 
                transition-all shadow-md active:scale-95 text-sm md:text-base"
            >
              <Plus size={18} className="mr-2" />
              Create New Job
            </button>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-indigo-50 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by title, department, or location..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-indigo-400/30 
                  focus:border-indigo-400 bg-white/90 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {filteredJobs.length}
              </span>{" "}
              job{filteredJobs.length !== 1 && "s"}
            </div>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all p-5 relative"
                >
                  {/* 3-Dot Menu */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === job._id ? null : job._id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === job._id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10"
                      >
                        <button
                          onClick={() => {
                            setViewingJob(job);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FileText size={16} className="text-emerald-600" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            openEditModal(job);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 size={16} className="text-indigo-600" />
                          Edit Job
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(job._id);
                            setOpenMenuId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete Job
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Job Icon */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-pink-50 rounded-xl">
                      <Briefcase size={24} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 pr-8">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  {/* Job Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 size={16} className="text-gray-400" />
                      <span className="truncate">{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-gray-400" />
                      <span>{job.type}</span>
                    </div>
                    {job.experience && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{job.experience}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {job.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {getStatusBadge(job.status)}
                    <span className="text-xs text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <Briefcase
                    size={48}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <p className="text-gray-500">No jobs found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingJob ? "Edit Job" : "Create New Job"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2-5 years"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="filled">Filled</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsibilities
                </label>
                <textarea
                  rows={3}
                  placeholder="One per line"
                  value={formData.responsibilities}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responsibilities: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualifications
                </label>
                <textarea
                  rows={3}
                  placeholder="One per line"
                  value={formData.qualifications}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qualifications: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills Required
                </label>
                <textarea
                  rows={2}
                  placeholder="Comma separated"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits
                </label>
                <textarea
                  rows={2}
                  placeholder="One per line"
                  value={formData.benefits}
                  onChange={(e) =>
                    setFormData({ ...formData, benefits: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all shadow-md"
                >
                  {editingJob ? "Update Job" : "Create Job"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Job Details Modal */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Job Details
              </h2>
              <button
                onClick={() => setViewingJob(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Header */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {viewingJob.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Building2 size={16} />
                    {viewingJob.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {viewingJob.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {viewingJob.type}
                  </span>
                  {viewingJob.experience && (
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {viewingJob.experience}
                    </span>
                  )}
                </div>
                {getStatusBadge(viewingJob.status)}
              </div>

              {/* Description */}
              {viewingJob.description && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {viewingJob.description}
                  </p>
                </div>
              )}

              {/* Responsibilities */}
              {viewingJob.responsibilities && viewingJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Responsibilities
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    {(Array.isArray(viewingJob.responsibilities)
                      ? viewingJob.responsibilities
                      : viewingJob.responsibilities.split('\n')
                    ).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {viewingJob.qualifications && viewingJob.qualifications.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Qualifications
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    {(Array.isArray(viewingJob.qualifications)
                      ? viewingJob.qualifications
                      : viewingJob.qualifications.split('\n')
                    ).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {viewingJob.skills && viewingJob.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Skills Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(viewingJob.skills)
                      ? viewingJob.skills
                      : viewingJob.skills.split(',')
                    ).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full border border-indigo-100"
                      >
                        {typeof skill === 'string' ? skill.trim() : skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {viewingJob.benefits && viewingJob.benefits.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Benefits
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    {(Array.isArray(viewingJob.benefits)
                      ? viewingJob.benefits
                      : viewingJob.benefits.split('\n')
                    ).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Meta Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Posted on: {new Date(viewingJob.createdAt).toLocaleDateString()}
                </div>
                {viewingJob.applicationCount !== undefined && (
                  <div className="text-sm text-gray-500 mt-1">
                    Applications received: {viewingJob.applicationCount}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setViewingJob(null);
                  openEditModal(viewingJob);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Edit Job
              </button>
              <button
                onClick={() => setViewingJob(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-white transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
