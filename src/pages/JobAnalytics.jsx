import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ErrorFallback from "../components/ErrorFallback";
import { useAuth } from "../context/AuthContext";
import {
  Briefcase,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobAnalytics = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(null);
    } catch (err) {
      console.error("Failed to fetch data", err);
      setJobs([]);
      setApplications([]);
      setError(err);
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetError={fetchData}
        message="Failed to load analytics"
      />
    );
  }

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === "active").length;
    const totalApplications = applications.length;

    const statusBreakdown = applications.reduce((acc, app) => {
      const status = app.status || "new";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const applicationsPerJob = jobs.map((job) => ({
      title: job.title,
      count: applications.filter((app) => app.jobId?._id === job._id).length,
    }));

    const recentApplications = applications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const mostAppliedPositions = applicationsPerJob
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      statusBreakdown,
      applicationsPerJob,
      recentApplications,
      mostAppliedPositions,
    };
  }, [jobs, applications]);

  const statusColors = {
    new: { bg: "#3b82f6", label: "New" },
    screening: { bg: "#f59e0b", label: "Screening" },
    shortlisted: { bg: "#8b5cf6", label: "Shortlisted" },
    interview: { bg: "#6366f1", label: "Interview" },
    hired: { bg: "#10b981", label: "Hired" },
    rejected: { bg: "#ef4444", label: "Rejected" },
  };

  const totalStatusCount = Object.values(stats.statusBreakdown).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto space-y-6 pt-8 md:pt-4">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-xs md:text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white/80 hover:bg-gray-50 shadow-sm transition self-start"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Job Analytics Dashboard
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Track job postings and application metrics
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total Jobs
                    </h3>
                    <Briefcase size={18} className="text-indigo-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalJobs}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    All job postings
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-pink-500 text-white rounded-2xl shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide">
                      Active Jobs
                    </h3>
                    <TrendingUp size={18} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold mt-2">
                    {stats.activeJobs}
                  </p>
                  <p className="text-xs mt-1 text-white/70">
                    Currently accepting applications
                  </p>
                </div>

                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total Applications
                    </h3>
                    <FileText size={18} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalApplications}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    All applications received
                  </p>
                </div>

                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Avg per Job
                    </h3>
                    <Users size={18} className="text-pink-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalJobs > 0
                      ? Math.round(stats.totalApplications / stats.totalJobs)
                      : 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Applications per job
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Applications by Status */}
                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="text-indigo-500" size={18} />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Applications by Status
                      </h3>
                    </div>
                  </div>

                  {Object.keys(stats.statusBreakdown).length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                      No application data available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(stats.statusBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([status, count]) => {
                          const percent = Math.round(
                            (count / totalStatusCount) * 100
                          );
                          const color =
                            statusColors[status]?.bg || "#6b7280";
                          const label =
                            statusColors[status]?.label ||
                            status.charAt(0).toUpperCase() + status.slice(1);

                          return (
                            <div key={status} className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-600">
                                <span className="font-medium">{label}</span>
                                <span className="text-gray-500">
                                  {count} ({percent}%)
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor: color,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Most Applied Positions */}
                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="text-pink-500" size={18} />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Most Applied Positions
                      </h3>
                    </div>
                  </div>

                  {stats.mostAppliedPositions.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                      No data available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.mostAppliedPositions.map((job, idx) => {
                        const maxCount = stats.mostAppliedPositions[0]?.count || 1;
                        const percent = Math.round((job.count / maxCount) * 100);

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span className="font-medium truncate max-w-[200px]">
                                {job.title}
                              </span>
                              <span className="text-gray-500">
                                {job.count} applications
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Applications per Job */}
              <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="text-indigo-500" size={18} />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Applications per Job
                    </h3>
                  </div>
                </div>

                {stats.applicationsPerJob.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                    No jobs available
                  </div>
                ) : (
                  <div className="h-56 flex items-end gap-3 md:gap-4 border-t border-gray-100 pt-4 overflow-x-auto">
                    {stats.applicationsPerJob.map((job, idx) => {
                      const maxValue = Math.max(
                        ...stats.applicationsPerJob.map((j) => j.count)
                      );
                      const heightPercent =
                        maxValue > 0 ? (job.count / maxValue) * 100 : 0;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-end min-w-[60px] relative"
                        >
                          <div className="text-xs font-bold text-indigo-600 mb-1">
                            {job.count}
                          </div>
                          <div className="flex-1 flex items-end">
                            <div
                              className="w-8 md:w-10 rounded-t-xl bg-gradient-to-t from-indigo-500/80 to-pink-400/80 shadow-sm relative group hover:from-indigo-600 hover:to-pink-500 transition-all"
                              style={{ height: `${heightPercent || 5}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {job.count} apps
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-[10px] text-gray-500 text-center max-w-[60px] truncate">
                            {job.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Applications */}
              <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-emerald-500" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Recent Applications
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    Last {stats.recentApplications.length} applications
                  </span>
                </div>

                {stats.recentApplications.length === 0 ? (
                  <div className="text-sm text-gray-400 py-6 text-center">
                    No applications yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 text-sm">
                    {stats.recentApplications.map((app) => (
                      <div
                        key={app._id}
                        className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {app.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied for: {app.jobId?.title || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                          {app.status && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full border"
                              style={{
                                backgroundColor:
                                  statusColors[app.status]?.bg + "20",
                                color: statusColors[app.status]?.bg,
                                borderColor: statusColors[app.status]?.bg,
                              }}
                            >
                              {statusColors[app.status]?.label || app.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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

export default JobAnalytics;
