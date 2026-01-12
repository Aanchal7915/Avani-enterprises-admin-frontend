import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import clsx from "clsx";

const CareerPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Fetch ALL jobs, not just active ones
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs`);
      const jobsData = res.data.data || res.data || [];
      console.log(`Fetched ${jobsData.length} jobs from API`);
      setJobs(jobsData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch jobs:", err.response?.data || err.message);
      setJobs([]);
      setLoading(false);
    }
  };

  // Show all jobs, regardless of status
  const allJobs = jobs;

  const filteredJobs = allJobs.filter((job) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      job.title?.toLowerCase().includes(search) ||
      job.department?.toLowerCase().includes(search) ||
      job.description?.toLowerCase().includes(search);

    const matchesDepartment =
      filterDepartment === "all" || job.department === filterDepartment;
    const matchesLocation =
      filterLocation === "all" || job.location === filterLocation;
    const matchesType = filterType === "all" || job.type === filterType;

    return matchesSearch && matchesDepartment && matchesLocation && matchesType;
  });

  const departments = [...new Set(jobs.map((j) => j.department))].filter(Boolean);
  const locations = [...new Set(jobs.map((j) => j.location))].filter(Boolean);
  const types = [...new Set(jobs.map((j) => j.type))].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/avani-logo.jpg"
              alt="Avani Logo"
              className="w-12 h-12 object-contain rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                AVANI ENTERPRISES
              </h1>
              <p className="text-xs text-gray-500">Careers</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Join Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore exciting career opportunities and be part of our growing
            team. We're always looking for talented individuals.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search jobs by title, department, or keywords..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-indigo-400/30 
                focus:border-indigo-400 bg-white/90"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white/90"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white/90"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 bg-white/90"
            >
              <option value="all">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredJobs.length}
            </span>{" "}
            position{filteredJobs.length !== 1 && "s"}
          </div>
        </div>

        {/* All Jobs */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Available Positions
          </h3>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white/90 rounded-2xl border border-gray-100 p-12 text-center">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                No positions match your search criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => {
                const isActive = job.isActive && job.status === "Active";
                const isFilled = job.status === "Filled";
                const isClosed = job.status === "Closed";
                
                return (
                  <div
                    key={job._id}
                    className={clsx(
                      "backdrop-blur-xl rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all cursor-pointer",
                      isActive ? "bg-white/90 border-gray-100" : "bg-gray-50/90 border-gray-200"
                    )}
                    onClick={() => navigate(`/careers/${job._id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={clsx(
                        "p-3 rounded-xl",
                        isActive ? "bg-gradient-to-br from-indigo-50 to-pink-50" : "bg-gray-100"
                      )}>
                        <Briefcase size={24} className={isActive ? "text-indigo-600" : "text-gray-400"} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className={clsx(
                            "text-xl font-semibold",
                            isActive ? "text-gray-900" : "text-gray-700"
                          )}>
                            {job.title}
                          </h4>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                              <CheckCircle size={12} />
                              Active
                            </span>
                          ) : isFilled ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                              <CheckCircle size={12} />
                              Filled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
                              <XCircle size={12} />
                              Closed
                            </span>
                          )}
                        </div>

                        <div className={clsx(
                          "flex flex-wrap items-center gap-4 text-sm mb-3",
                          isActive ? "text-gray-600" : "text-gray-500"
                        )}>
                          <span className="flex items-center gap-1">
                            <Building2 size={16} />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {job.type}
                          </span>
                          {job.experience && (
                            <span className="flex items-center gap-1">
                              <Calendar size={16} />
                              {job.experience}
                            </span>
                          )}
                        </div>

                        <p className={clsx(
                          "text-sm line-clamp-2 mb-3",
                          isActive ? "text-gray-600" : "text-gray-500"
                        )}>
                          {job.description}
                        </p>

                        <button className={clsx(
                          "inline-flex items-center text-sm font-medium transition-colors",
                          isActive ? "text-indigo-600 hover:text-indigo-700" : "text-gray-600 hover:text-gray-700"
                        )}>
                          View Details & Apply →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>© 2025 Avani Enterprises. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CareerPage;
