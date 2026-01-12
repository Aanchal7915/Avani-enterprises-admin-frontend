import { useState, useEffect, useMemo, Fragment } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import {
  Download,
  Search,
  Briefcase,
  Users,
  MapPin,
  Building2,
  Clock,
  Eye,
  EyeOff,
  FileText,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const JobsDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);

  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      fetchData();
    }
  }, [authLoading, token]);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs`),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/applications`),
      ]);
      setJobs(jobsRes.data.data || []);
      setApplications(appsRes.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    return [...new Set(jobs.map((j) => j.department))].filter(Boolean);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        job.title?.toLowerCase().includes(search) ||
        job.department?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search);

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && job.isActive && job.status === "Active") ||
        (filterStatus === "inactive" && !job.isActive) ||
        (filterStatus === "filled" && job.status === "Filled") ||
        (filterStatus === "closed" && job.status === "Closed");

      const matchesDepartment =
        filterDepartment === "all" || job.department === filterDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [jobs, searchTerm, filterStatus, filterDepartment]);

  const getApplicationCount = (jobId) => {
    return applications.filter((app) => app.jobId?._id === jobId).length;
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredJobs.map((job) => ({
        Title: job.title,
        Department: job.department,
        Location: job.location,
        Type: job.type,
        Experience: job.experience,
        Status: job.status,
        Active: job.isActive ? "Yes" : "No",
        Applications: getApplicationCount(job._id),
        "Posted Date": new Date(job.createdAt).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(
      workbook,
      `Jobs_Export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const toggleJobStatus = async (jobId) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/jobs/${jobId}/toggle`);
      fetchData();
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Failed to toggle status. Please try again.");
    }
  };

  const toggleDetails = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto space-y-6 pt-8 md:pt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Jobs Dashboard
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Manage, track, and monitor all job postings and applications.
              </p>
            </div>

            <button
              onClick={downloadExcel}
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-pink-500 
                text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-pink-600 
                transition-all shadow-md active:scale-95 text-sm md:text-base"
            >
              <Download size={18} className="mr-2" />
              Export to Excel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/jobs-dashboard")}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Jobs Dashboard
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Overview of all job postings
                </p>
              </div>
              <Briefcase size={24} className="text-indigo-500" />
            </button>

            <button
              onClick={() => navigate("/jobs")}
              className="flex items-center justify-between p-4 rounded-2xl 
                bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wide">
                  Job Management
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Create, edit, and manage job postings
                </p>
              </div>
              <Briefcase size={24} />
            </button>

            <button
              onClick={() => navigate("/applications")}
              className="flex items-center justify-between p-4 rounded-2xl 
                bg-gradient-to-br from-indigo-600 to-pink-500 text-white shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wide">
                  Applications
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  Review and manage candidate applications
                </p>
              </div>
              <FileText size={24} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-600" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/90 rounded-xl p-3 border border-purple-100">
                <p className="text-xs text-gray-500 mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
              <div className="bg-white/90 rounded-xl p-3 border border-purple-100">
                <p className="text-xs text-gray-500 mb-1">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">
                  {jobs.filter((j) => j.isActive && j.status === "Active").length}
                </p>
              </div>
              <div className="bg-white/90 rounded-xl p-3 border border-purple-100">
                <p className="text-xs text-gray-500 mb-1">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
              </div>
              <div className="bg-white/90 rounded-xl p-3 border border-purple-100">
                <p className="text-xs text-gray-500 mb-1">New Applications</p>
                <p className="text-2xl font-bold text-orange-600">
                  {applications.filter((a) => a.status === "New").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-indigo-50 shadow-sm relative z-20">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
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

              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  <Filter size={14} className="mr-1" />
                  Filters
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white/90"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="filled">Filled</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white/90"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {filteredJobs.length}
              </span>{" "}
              job{filteredJobs.length !== 1 && "s"} based on{" "}
              <span className="font-medium text-indigo-500">
                active filters
              </span>
              .
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 text-red-600 py-6 px-4 rounded-2xl text-center text-sm">
              {error}
            </div>
          ) : (
            <>
              <div className="hidden md:block bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 text-gray-600 text-xs uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Job Title</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Applications</th>
                      <th className="px-6 py-3.5">Posted</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job, idx) => (
                        <Fragment key={job._id}>
                          <tr
                            className={clsx(
                              "transition-colors",
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                              "hover:bg-indigo-50/40",
                              expandedRow === job._id && "bg-indigo-50/60"
                            )}
                          >
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">
                                {job.title}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-gray-400" />
                                <span className="text-gray-700">{job.department}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400" />
                                <span className="text-gray-700">{job.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-700">{job.type}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {getApplicationCount(job._id)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(job.createdAt).toLocaleDateString()}
                              <div className="text-xs text-gray-400">
                                {new Date(job.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={clsx(
                                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                                  job.isActive && job.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : job.status === "Filled"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                )}
                              >
                                {job.isActive && job.status === "Active" ? "Active" : job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleDetails(job._id)}
                                  className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                                  title="View Details"
                                >
                                  {expandedRow === job._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedRow === job._id && (
                            <tr>
                              <td colSpan={8} className="px-0">
                                <div className="bg-indigo-50/30 p-4 border-b border-indigo-100 shadow-inner animate-in slide-in-from-top-2 duration-200">
                                  <div className="max-w-4xl mx-auto space-y-3">
                                    <div className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm">
                                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Job Details</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">Experience Required</p>
                                          <p className="text-gray-900">{job.experience}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">Job Type</p>
                                          <p className="text-gray-900">{job.type}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <p className="text-xs text-gray-500 mb-1">Description</p>
                                          <p className="text-gray-700 text-xs leading-relaxed">{job.description}</p>
                                        </div>
                                        {job.skills && job.skills.length > 0 && (
                                          <div className="col-span-2">
                                            <p className="text-xs text-gray-500 mb-2">Required Skills</p>
                                            <div className="flex flex-wrap gap-2">
                                              {job.skills.map((skill, idx) => (
                                                <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
                                                  {skill}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-12 text-center text-gray-500 text-sm"
                        >
                          🌤️ No jobs found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={clsx(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          job.isActive && job.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : job.status === "Filled"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {job.isActive && job.status === "Active" ? "Active" : job.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-gray-700">{job.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-gray-700">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-700">{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-gray-700">{getApplicationCount(job._id)} Applications</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => toggleDetails(job._id)}
                        className="w-full py-2 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                      >
                        {expandedRow === job._id ? "Hide Details" : "View Details"}
                      </button>
                    </div>

                    {expandedRow === job._id && (
                      <div className="pt-3 border-t border-gray-100 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Experience</p>
                          <p className="text-sm text-gray-700">{job.experience}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Description</p>
                          <p className="text-xs text-gray-700 leading-relaxed">{job.description}</p>
                        </div>
                        {job.skills && job.skills.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {job.skills.map((skill, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {filteredJobs.length === 0 && (
                  <div className="text-center text-gray-500 py-10 bg-white/80 border border-gray-100 rounded-2xl text-sm">
                    No jobs found matching your filters.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobsDashboard;
