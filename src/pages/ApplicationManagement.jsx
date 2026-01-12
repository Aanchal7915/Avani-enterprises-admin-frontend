import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ErrorFallback from "../components/ErrorFallback";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Download,
  Search,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  GraduationCap,
  Linkedin,
  Globe,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJob, setFilterJob] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewingApp, setViewingApp] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      fetchData();
    }
  }, [authLoading, token]);

  const fetchData = async () => {
    try {
      const [appsRes, jobsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/applications`),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs`),
      ]);
      setApplications(appsRes.data.data || []);
      setJobs(jobsRes.data.data || []);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data", err);
      setApplications([]);
      setJobs([]);
      setError(err);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetError={fetchData}
        message="Failed to load applications"
      />
    );
  }

  const filteredApplications = applications.filter((app) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      app.fullName?.toLowerCase().includes(search) ||
      app.email?.toLowerCase().includes(search) ||
      app.phone?.includes(searchTerm);

    const matchesJob =
      filterJob === "all" || app.jobId?._id === filterJob;
    const matchesStatus =
      filterStatus === "all" || app.status === filterStatus;

    return matchesSearch && matchesJob && matchesStatus;
  });

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/applications/${id}/status`,
        { status }
      );
      setApplications((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status } : app))
      );
      if (viewingApp && viewingApp._id === id) {
        setViewingApp({ ...viewingApp, status });
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleSaveNotes = async () => {
    if (!viewingApp) return;
    
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/applications/${viewingApp._id}/status`,
        { adminNotes }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === viewingApp._id ? { ...app, adminNotes } : app
        )
      );
      alert("Notes saved successfully!");
    } catch (err) {
      console.error("Failed to save notes", err);
      alert("Failed to save notes. Please try again.");
    }
  };

  const openViewModal = (app) => {
    setViewingApp(app);
    setAdminNotes(app.adminNotes || "");
  };

  const closeViewModal = () => {
    setViewingApp(null);
    setAdminNotes("");
  };

  const getStatusBadge = (status) => {
    const badges = {
      New: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
      Screening: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100" },
      Shortlisted: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
      Interview: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
      Hired: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
      Rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" },
    };
    const badge = badges[status] || badges.New;
    return (
      <span
        className={clsx(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
          badge.bg,
          badge.text,
          badge.border
        )}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto space-y-6 pt-8 md:pt-4">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Application Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              View and manage all job applications
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-indigo-50 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-indigo-400/30 
                    focus:border-indigo-400 bg-white/90 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white/90 text-sm"
              >
                <option value="all">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white/90 text-sm"
              >
                <option value="all">All Status</option>
                <option value="New">New</option>
                <option value="Screening">Screening</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {filteredApplications.length}
              </span>{" "}
              application{filteredApplications.length !== 1 && "s"}
            </div>
          </div>

          {/* Applications Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 text-gray-600 text-xs uppercase font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Candidate</th>
                      <th className="px-6 py-3.5">Position</th>
                      <th className="px-6 py-3.5">Experience</th>
                      <th className="px-6 py-3.5">Applied Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((app) => (
                        <tr
                          key={app._id}
                          className="transition-colors hover:bg-indigo-50/40"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {app.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {app.email}
                              </div>
                              <div className="text-xs text-gray-500">
                                {app.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {app.positionAppliedFor || app.jobId?.title || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {app.jobId?.department}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              {app.experience || "N/A"}
                            </div>
                            {app.currentCompany && (
                              <div className="text-xs text-gray-500">
                                at {app.currentCompany}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(app.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white/90 focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
                              value={app.status || "New"}
                              onChange={(e) =>
                                handleStatusChange(app._id, e.target.value)
                              }
                            >
                              <option value="New">New</option>
                              <option value="Screening">Screening</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview">Interview</option>
                              <option value="Hired">Hired</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openViewModal(app)}
                                className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              {app.resumeUrl && (
                                <>
                                  <a
                                    href={app.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                    title="View CV"
                                  >
                                    <FileText size={16} />
                                  </a>
                                  <a
                                    href={app.resumeUrl}
                                    download
                                    className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                                    title="Download CV"
                                  >
                                    <Download size={16} />
                                  </a>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-500 text-sm"
                        >
                          No applications found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* View Application Modal */}
      {viewingApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-start z-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewingApp.fullName}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Applied for: {viewingApp.positionAppliedFor || viewingApp.jobId?.title}
                </p>
                <div className="mt-2">{getStatusBadge(viewingApp.status)}</div>
              </div>
              <button
                onClick={closeViewModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm text-gray-900">{viewingApp.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm text-gray-900">{viewingApp.phone}</div>
                    </div>
                  </div>
                  {viewingApp.currentLocation && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="text-sm text-gray-900">{viewingApp.currentLocation}</div>
                      </div>
                    </div>
                  )}
                  {viewingApp.linkedinProfile && (
                    <div className="flex items-start gap-3">
                      <Linkedin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">LinkedIn</div>
                        <a
                          href={viewingApp.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          View Profile <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                  {viewingApp.portfolioWebsite && (
                    <div className="flex items-start gap-3">
                      <Globe size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Portfolio</div>
                        <a
                          href={viewingApp.portfolioWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          View Website <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Briefcase size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="text-sm text-gray-900">{viewingApp.experience}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Qualification</div>
                      <div className="text-sm text-gray-900">
                        {viewingApp.highestQualification}
                        {viewingApp.highestQualification === "Other" && viewingApp.otherQualification && (
                          <span className="text-gray-600"> - {viewingApp.otherQualification}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {viewingApp.currentCompany && (
                    <div className="flex items-start gap-3">
                      <Briefcase size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Current Company</div>
                        <div className="text-sm text-gray-900">{viewingApp.currentCompany}</div>
                      </div>
                    </div>
                  )}
                  {viewingApp.currentDesignation && (
                    <div className="flex items-start gap-3">
                      <Briefcase size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Current Designation</div>
                        <div className="text-sm text-gray-900">{viewingApp.currentDesignation}</div>
                      </div>
                    </div>
                  )}
                  {viewingApp.currentCTC && (
                    <div className="flex items-start gap-3">
                      <DollarSign size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Current CTC</div>
                        <div className="text-sm text-gray-900">{viewingApp.currentCTC}</div>
                      </div>
                    </div>
                  )}
                  {viewingApp.expectedCTC && (
                    <div className="flex items-start gap-3">
                      <DollarSign size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-500">Expected CTC</div>
                        <div className="text-sm text-gray-900">{viewingApp.expectedCTC}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500">Notice Period</div>
                      <div className="text-sm text-gray-900">{viewingApp.noticePeriod}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Documents
                </h3>
                <div className="flex flex-wrap gap-3">
                  {viewingApp.resumeUrl && (
                    <a
                      href={viewingApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <FileText size={18} />
                      <span className="text-sm font-medium">View Resume</span>
                      <Download size={14} />
                    </a>
                  )}
                  {viewingApp.coverLetterUrl && (
                    <a
                      href={viewingApp.coverLetterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <FileText size={18} />
                      <span className="text-sm font-medium">View Cover Letter</span>
                      <Download size={14} />
                    </a>
                  )}
                </div>
                {viewingApp.coverLetterText && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">Cover Letter</div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {viewingApp.coverLetterText}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              {(viewingApp.howDidYouHear || viewingApp.willingToRelocate || viewingApp.additionalComments) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Additional Information
                  </h3>
                  <div className="space-y-3">
                    {viewingApp.howDidYouHear && (
                      <div>
                        <div className="text-xs text-gray-500">How did you hear about us?</div>
                        <div className="text-sm text-gray-900">{viewingApp.howDidYouHear}</div>
                      </div>
                    )}
                    {viewingApp.willingToRelocate && (
                      <div>
                        <div className="text-xs text-gray-500">Willing to relocate?</div>
                        <div className="text-sm text-gray-900">{viewingApp.willingToRelocate}</div>
                      </div>
                    )}
                    {viewingApp.additionalComments && (
                      <div>
                        <div className="text-xs text-gray-500">Additional Comments</div>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {viewingApp.additionalComments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <MessageSquare size={18} />
                  Admin Notes
                </h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this candidate..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none"
                  rows={4}
                />
                <button
                  onClick={handleSaveNotes}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Save Notes
                </button>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Update Status
                </h3>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white text-sm"
                  value={viewingApp.status || "New"}
                  onChange={(e) =>
                    handleStatusChange(viewingApp._id, e.target.value)
                  }
                >
                  <option value="New">New</option>
                  <option value="Screening">Screening</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
              <button
                onClick={closeViewModal}
                className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-white transition-colors text-sm font-medium"
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

export default ApplicationManagement;
