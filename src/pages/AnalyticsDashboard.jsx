import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  TrendingUp,
  Users,
  PhoneCall,
  Activity,
  Calendar,
  Search,
  Filter,
  BarChart3,
  PieChart,
  ArrowLeft, // back icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdvancedFilter from "../components/AdvancedFilter";
import { filterLeads } from "../utils/filterLogic";

const AnalyticsDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ dates: [], months: [], years: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("monthly");
  const [selectedConversionPeriod, setSelectedConversionPeriod] = useState("monthly");

  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      fetchLeads();
    }
  }, [authLoading, token]);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/leads`);
      setLeads(res.data || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch leads");
      setLoading(false);
    }
  };

  // ---------- FILTERED LEADS (month + search) ----------
  const filteredLeads = useMemo(() => {
    // 1. Advanced Date/Month/Year Filtering
    const dateFiltered = filterLeads(leads, filters);

    // 2. Search
    return dateFiltered.filter((lead) => {
      const search = searchTerm.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.phone?.includes(searchTerm)
      );
    });
  }, [leads, filters, searchTerm]);

  // ---------- CONTACTED / PENDING ----------
  const isContactedLead = (lead) => {
    if (lead.contacted === true) return true;
    if (typeof lead.status === "string") {
      const s = lead.status.toLowerCase();
      return s === "contacted" || s === "closed" || s === "converted";
    }
    return false;
  };

  const totalLeads = filteredLeads.length;
  const contactedLeads = filteredLeads.filter(isContactedLead).length;
  const pendingLeads = totalLeads - contactedLeads;
  const contactRate = totalLeads
    ? Math.round((contactedLeads / totalLeads) * 100)
    : 0;

  // ---------- MONTHLY DATA (growth + bar chart) ----------
  const monthlyData = useMemo(() => {
    const map = {};

    filteredLeads.forEach((lead) => {
      const d = new Date(lead.createdAt);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      const key = `${year}-${month}`;

      if (!map[key]) {
        map[key] = {
          year,
          month,
          label: d.toLocaleString("default", { month: "short" }) + " " + year,
          count: 0,
        };
      }
      map[key].count += 1;
    });

    const arr = Object.values(map);
    arr.sort((a, b) => {
      if (a.year === b.year) return a.month - b.month;
      return a.year - b.year;
    });

    return arr;
  }, [filteredLeads]);

  const maxMonthlyValue =
    monthlyData.length > 0 ? Math.max(...monthlyData.map((m) => m.count)) : 1;

  // ---------- GROWTH VS LAST MONTH ----------
  let growthText = "Not enough data to calculate growth";
  let growthPercent = 0;
  let growthDirection = "neutral"; // "up" | "down" | "neutral";

  if (monthlyData.length >= 2) {
    const last = monthlyData[monthlyData.length - 1].count;
    const prev = monthlyData[monthlyData.length - 2].count;
    const diff = last - prev;

    if (prev === 0) {
      growthPercent = last > 0 ? 100 : 0;
    } else {
      growthPercent = Math.round((diff / prev) * 100);
    }

    if (diff > 0) growthDirection = "up";
    else if (diff < 0) growthDirection = "down";

    if (growthDirection === "up") {
      growthText = `+${growthPercent}% vs last month`;
    } else if (growthDirection === "down") {
      growthText = `${growthPercent}% vs last month`;
    } else {
      growthText = "No change vs last month";
    }
  }

  const latestMonthLabel =
    monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].label : "";

  // ---------- SERVICE-WISE BREAKDOWN ----------
  const PREDEFINED_SERVICES = [
    "Web Development",
    "Social Media Management",
    "Ai automation",
    "google & meta ads"
  ];

  // Service mapping for variations
  const normalizeService = (service) => {
    if (!service) return null;
    const s = service.toLowerCase().trim();

    // Web Development variations
    if (s.includes('web') && s.includes('dev')) return "Web Development";

    // Social Media Management variations
    if ((s.includes('social') && s.includes('media')) || s.includes('smm')) {
      return "Social Media Management";
    }

    // AI Automation variations
    if ((s.includes('ai') || s.includes('artificial')) && s.includes('auto')) {
      return "Ai automation";
    }

    // Google & Meta Ads variations
    if ((s.includes('google') || s.includes('meta') || s.includes('facebook')) &&
      (s.includes('ad') || s.includes('ppc'))) {
      return "google & meta ads";
    }

    // Exact match fallback
    const exactMatch = PREDEFINED_SERVICES.find(
      predefined => predefined.toLowerCase() === s
    );
    return exactMatch || null;
  };

  const serviceData = useMemo(() => {
    const map = {};

    // Initialize all predefined services with 0
    PREDEFINED_SERVICES.forEach(service => {
      map[service] = 0;
    });

    filteredLeads.forEach((lead) => {
      if (Array.isArray(lead.services) && lead.services.length > 0) {
        lead.services.forEach((s) => {
          const normalized = normalizeService(s);
          if (normalized) {
            map[normalized] = (map[normalized] || 0) + 1;
          }
        });
      } else if (lead.service) {
        const normalized = normalizeService(lead.service);
        if (normalized) {
          map[normalized] = (map[normalized] || 0) + 1;
        }
      }
    });

    // Return in predefined order, filter out services with 0 count
    return PREDEFINED_SERVICES.map(service => [service, map[service]])
      .filter(([, count]) => count > 0);
  }, [filteredLeads]);

  const totalServiceCount =
    serviceData.reduce((sum, [, count]) => sum + count, 0) || 1;

  // ---------- STATUS-WISE BREAKDOWN (UPDATED FOR 4 STATUSES) ----------

  const STATUS_VALUES = [
    "not interested",
    "contacted",
    "not responded",
    "interested",
    "converted",
  ];

  const STATUS_LABELS = {
    "not interested": "Not Interested",
    contacted: "Contacted",
    "not responded": "Not Responded",
    interested: "Interested",
    converted: "Converted",
    unknown: "Unknown",
  };

  const statusData = useMemo(() => {
    const map = {};

    // ✅ Initialize all known statuses with 0 (so missing ones also show)
    STATUS_VALUES.forEach((status) => {
      map[status] = 0;
    });

    filteredLeads.forEach((lead) => {
      let rawStatus = "";

      if (typeof lead.status === "string" && lead.status.trim() !== "") {
        rawStatus = lead.status;
      } else if (lead.contacted === true) {
        rawStatus = "contacted";
      }

      const normalized = rawStatus.trim().toLowerCase();
      const key = STATUS_VALUES.includes(normalized) ? normalized : "unknown";

      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredLeads]);


  const totalStatusCount =
    statusData.reduce((sum, [, count]) => sum + count, 0) || 1;

  // ---------- RECENT CONTACTED ----------
  const recentContacted = useMemo(
    () =>
      filteredLeads
        .filter(isContactedLead)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [filteredLeads]
  );

  // ---------- PIE CHART DATA: TIME-BASED DISTRIBUTION ----------
  const timeDistributionData = useMemo(() => {
    const dailyMap = {};
    const monthlyMap = {};
    const yearlyMap = {};

    filteredLeads.forEach((lead) => {
      const d = new Date(lead.createdAt);

      // Daily: "Leads on 12/9/2025"
      const dateKey = d.toLocaleDateString();
      const dailyLabel = `Leads on ${dateKey}`;

      // Monthly: "Leads in Dec 2025"
      const monthKey = d.toLocaleString("default", { month: "short", year: "numeric" });
      const monthlyLabel = `Leads in ${monthKey}`;

      // Yearly: "Leads in 2025"
      const yearKey = d.getFullYear().toString();
      const yearlyLabel = `Leads in ${yearKey}`;

      dailyMap[dailyLabel] = (dailyMap[dailyLabel] || 0) + 1;
      monthlyMap[monthlyLabel] = (monthlyMap[monthlyLabel] || 0) + 1;
      yearlyMap[yearlyLabel] = (yearlyMap[yearlyLabel] || 0) + 1;
    });

    return {
      daily: Object.entries(dailyMap).sort((a, b) => b[1] - a[1]).slice(0, 7),
      monthly: Object.entries(monthlyMap).sort((a, b) => b[1] - a[1]).slice(0, 6),
      yearly: Object.entries(yearlyMap).sort((a, b) => b[1] - a[1]),
    };
  }, [filteredLeads]);

  // ---------- PIE CHART DATA: CONVERSION FUNNEL ----------
  const conversionFunnelData = useMemo(() => {
    // Group leads by time period
    const periodGroups = {};

    filteredLeads.forEach((lead) => {
      const d = new Date(lead.createdAt);
      let periodKey;

      if (selectedConversionPeriod === "daily") {
        periodKey = d.toLocaleDateString();
      } else if (selectedConversionPeriod === "monthly") {
        periodKey = d.toLocaleString("default", { month: "short", year: "numeric" });
      } else {
        periodKey = d.getFullYear().toString();
      }

      if (!periodGroups[periodKey]) {
        periodGroups[periodKey] = { contacted: 0, converted: 0 };
      }

      const isContacted = lead.contacted === true ||
        (lead.status && ["contacted", "closed", "converted"].includes(lead.status.toLowerCase()));
      const isConverted = lead.status?.toLowerCase() === "converted";

      if (isContacted) {
        periodGroups[periodKey].contacted++;
      }
      if (isConverted) {
        periodGroups[periodKey].converted++;
      }
    });

    // Get current period key
    const now = new Date();
    let currentPeriodKey;

    if (selectedConversionPeriod === "daily") {
      currentPeriodKey = now.toLocaleDateString();
    } else if (selectedConversionPeriod === "monthly") {
      currentPeriodKey = now.toLocaleString("default", { month: "short", year: "numeric" });
    } else {
      currentPeriodKey = now.getFullYear().toString();
    }

    // Get data for current period only
    const currentPeriod = periodGroups[currentPeriodKey] || { contacted: 0, converted: 0 };
    const totalContacted = currentPeriod.contacted;
    const totalConverted = currentPeriod.converted;

    const contactedNotConverted = totalContacted - totalConverted;

    // Funnel order: Contacted → Converted
    return [
      { label: "Contacted", count: contactedNotConverted, color: "#f59e0b", description: "Contacted but not converted yet" },
      { label: "Converted", count: totalConverted, color: "#10b981", description: "Successfully converted leads" },
    ].filter(item => item.count > 0);
  }, [filteredLeads, selectedConversionPeriod]);

  // Helper function to generate pie chart colors
  const PIE_COLORS = [
    "#6366f1", "#ec4899", "#8b5cf6", "#14b8a6", "#f59e0b",
    "#ef4444", "#3b82f6", "#10b981", "#f97316", "#06b6d4"
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

      {/* same navbar offset */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto space-y-6 pt-8 md:pt-4">
          {/* Header with back button on the left */}
          <div className="flex flex-col gap-3 md:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-xs md:text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white/80 hover:bg-gray-50 shadow-sm transition self-start"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Understand how many leads are coming in, how many are contacted
                and how your growth is trending.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-indigo-50 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
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

              {/* Month Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="inline-flex items-center text-xs font-medium text-gray-500 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  <Filter size={14} className="mr-1" />
                  Filters
                </span>
                <div className="relative w-full md:w-auto min-w-[200px]">
                  <AdvancedFilter
                    onFilterChange={setFilters}
                    initialFilters={filters}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Showing analytics for{" "}
              <span className="font-medium text-indigo-500">
                active filters
              </span>{" "}
              with{" "}
              <span className="font-semibold text-gray-600">
                {filteredLeads.length}
              </span>{" "}
              lead{filteredLeads.length !== 1 && "s"}.
            </div>
          </div>

          {/* Loading / Error / Content */}
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
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Leads */}
                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total Leads
                    </h3>
                    <Users size={18} className="text-indigo-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {totalLeads}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    All leads matching current filters.
                  </p>
                </div>

                {/* Contacted Leads */}
                <div className="bg-gradient-to-br from-indigo-600 to-pink-500 text-white rounded-2xl shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide">
                      Contacted Leads
                    </h3>
                    <PhoneCall size={18} />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold mt-2">
                    {contactedLeads}
                  </p>
                  <p className="text-xs mt-1 text-white/70">
                    Leads that have already been contacted or followed up.
                  </p>
                </div>

                {/* Pending Leads (label: Not Interested Leads) */}
                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Not Interested Leads
                    </h3>
                    <Activity size={18} className="text-amber-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {pendingLeads < 0 ? 0 : pendingLeads}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Leads that are yet to be contacted.
                  </p>
                </div>

                {/* Contact Rate */}
                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Contact Rate
                    </h3>
                    <TrendingUp size={18} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                    {contactRate}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Contacted leads as a percentage of total leads.
                  </p>
                </div>
              </div>

              {/* Growth Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-sm p-4 md:p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} />
                      <h3 className="text-sm font-semibold">
                        Growth (Leads per Month)
                      </h3>
                    </div>
                    {latestMonthLabel && (
                      <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
                        Latest: {latestMonthLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {growthDirection === "up" && "+"}
                    {growthPercent}%
                  </p>
                  <p className="text-xs mt-1 text-white/80">{growthText}</p>
                  <p className="text-[11px] mt-3 text-white/60">
                    Tip: Growth analysis is more meaningful when the month
                    filter is set to "All".
                  </p>
                </div>

                {/* Monthly bar chart */}
                <div className="lg:col-span-2 bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="text-indigo-500" size={18} />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Leads over time
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400">
                      Month-wise leads (filtered data)
                    </span>
                  </div>

                  {monthlyData.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                      No data available for current filters.
                    </div>
                  ) : (
                    <div className="h-56 flex items-end gap-3 md:gap-4 border-t border-gray-100 pt-4 overflow-x-auto">
                      {monthlyData.map((m) => {
                        const heightPercent = (m.count / maxMonthlyValue) * 100;
                        return (
                          <div
                            key={`${m.year}-${m.month}`}
                            className="flex flex-col items-center justify-end min-w-[44px] md:min-w-[52px] relative"
                          >
                            {/* Count on top of bar */}
                            <div className="text-xs font-bold text-indigo-600 mb-1">
                              {m.count}
                            </div>
                            <div className="flex-1 flex items-end">
                              <div
                                className="w-6 md:w-8 rounded-t-xl bg-gradient-to-t from-indigo-500/80 to-pink-400/80 shadow-sm relative group hover:from-indigo-600 hover:to-pink-500 transition-all"
                                style={{ height: `${heightPercent || 5}%` }}
                              >
                                {/* Tooltip on hover */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {m.count} leads
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-[10px] md:text-xs text-gray-500 text-center">
                              {m.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Service-wise + Recent contacted */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Service-wise breakdown */}
                <div className="lg:col-span-1 bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="text-pink-500" size={18} />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Service-wise leads
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400">Top services</span>
                  </div>

                  {serviceData.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                      No service data for current filters.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {serviceData.map(([serviceName, count]) => {
                        const value = count;
                        const percent = Math.round(
                          (value / totalServiceCount) * 100
                        );
                        return (
                          <div key={serviceName} className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span className="font-medium truncate max-w-[150px]">
                                {serviceName}
                              </span>
                              <span className="text-gray-500">
                                {value} ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recent contacted */}
                <div className="lg:col-span-2 bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PhoneCall size={18} className="text-emerald-500" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Recently contacted leads
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400">
                      Last {recentContacted.length} contacted lead
                      {recentContacted.length !== 1 && "s"}
                    </span>
                  </div>

                  {recentContacted.length === 0 ? (
                    <div className="text-sm text-gray-400 py-6 text-center">
                      No contacted leads found for current filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 text-sm">
                      {recentContacted.map((lead) => (
                        <div
                          key={lead._id}
                          className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {lead.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {lead.email}{" "}
                              {lead.phone && <>• {lead.phone}</>}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              {new Date(
                                lead.createdAt
                              ).toLocaleDateString()}{" "}
                              •{" "}
                              {new Date(lead.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                            {lead.status && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {String(lead.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status-wise leads graph */}
              <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="text-indigo-500" size={18} />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Status-wise leads
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    Based on current filters
                  </span>
                </div>

                {statusData.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                    No status data available for current filters.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statusData.map(([statusName, count]) => {
                      const value = count;
                      const percent = Math.round(
                        (value / totalStatusCount) * 100
                      );
                      const label = STATUS_LABELS[statusName] || statusName;
                      return (
                        <div
                          key={statusName}
                          className="space-y-1 text-xs md:text-sm"
                        >
                          <div className="flex justify-between text-gray-600">
                            <span className="font-medium capitalize">
                              {label}
                            </span>
                            <span className="text-gray-500">
                              {value} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PIE CHARTS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Time-Based Distribution Pie Chart */}
                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="text-indigo-500" size={18} />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Leads Distribution
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400">
                      Time-based breakdown
                    </span>
                  </div>

                  {/* Tabs for Daily/Monthly/Yearly */}
                  <div className="flex gap-2 mb-4 border-b border-gray-200">
                    {["daily", "monthly", "yearly"].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedTimePeriod(period)}
                        className={`px-3 py-1.5 text-xs font-medium capitalize border-b-2 transition-colors ${selectedTimePeriod === period
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  {/* Pie Chart SVG */}
                  <div className="flex flex-col items-center">
                    <svg width="200" height="200" viewBox="0 0 200 200" className="mb-4">
                      {(() => {
                        const data = timeDistributionData[selectedTimePeriod];
                        const total = data.reduce((sum, [, count]) => sum + count, 0);
                        let currentAngle = 0;

                        return data.map(([label, count], idx) => {
                          const percentage = (count / total) * 100;
                          const angle = (percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          currentAngle = endAngle;

                          const startRad = (startAngle - 90) * (Math.PI / 180);
                          const endRad = (endAngle - 90) * (Math.PI / 180);

                          const x1 = 100 + 80 * Math.cos(startRad);
                          const y1 = 100 + 80 * Math.sin(startRad);
                          const x2 = 100 + 80 * Math.cos(endRad);
                          const y2 = 100 + 80 * Math.sin(endRad);

                          const largeArc = angle > 180 ? 1 : 0;

                          return (
                            <path
                              key={label}
                              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={PIE_COLORS[idx % PIE_COLORS.length]}
                              stroke="white"
                              strokeWidth="2"
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Legend */}
                    <div className="w-full space-y-2">
                      {timeDistributionData[selectedTimePeriod].map(([label, count], idx) => {
                        const total = timeDistributionData[selectedTimePeriod].reduce((sum, [, c]) => sum + c, 0);
                        const percentage = Math.round((count / total) * 100);
                        return (
                          <div key={label} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                              />
                              <span className="text-gray-700 font-medium truncate max-w-[120px]">
                                {label}
                              </span>
                            </div>
                            <span className="text-gray-500">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Conversion Funnel Pie Chart */}
                <div className="bg-white/90 rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PieChart className="text-emerald-500" size={18} />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Conversion Funnel
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400">
                      Contact & conversion rate
                    </span>
                  </div>

                  {/* Tabs for Daily/Monthly/Yearly */}
                  <div className="flex gap-2 mb-4 border-b border-gray-200">
                    {["daily", "monthly", "yearly"].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedConversionPeriod(period)}
                        className={`px-3 py-1.5 text-xs font-medium capitalize border-b-2 transition-colors ${selectedConversionPeriod === period
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  {/* Pie Chart SVG */}
                  <div className="flex flex-col items-center">
                    {conversionFunnelData.length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                        📊 No records available for the selected period.
                      </div>
                    ) : (
                      <>
                        <svg width="200" height="200" viewBox="0 0 200 200" className="mb-4">
                          {(() => {
                            const total = conversionFunnelData.reduce((sum, item) => sum + item.count, 0);
                            let currentAngle = 0;

                            return conversionFunnelData.map((item, idx) => {
                              const percentage = (item.count / total) * 100;
                              const angle = (percentage / 100) * 360;
                              const startAngle = currentAngle;
                              const endAngle = currentAngle + angle;
                              currentAngle = endAngle;

                              const startRad = (startAngle - 90) * (Math.PI / 180);
                              const endRad = (endAngle - 90) * (Math.PI / 180);

                              const x1 = 100 + 80 * Math.cos(startRad);
                              const y1 = 100 + 80 * Math.sin(startRad);
                              const x2 = 100 + 80 * Math.cos(endRad);
                              const y2 = 100 + 80 * Math.sin(endRad);

                              const largeArc = angle > 180 ? 1 : 0;

                              return (
                                <path
                                  key={item.label}
                                  d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                  fill={item.color}
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              );
                            });
                          })()}
                        </svg>

                        {/* Legend */}
                        <div className="w-full space-y-3">
                          {conversionFunnelData.map((item, idx) => {
                            const total = conversionFunnelData.reduce((sum, i) => sum + i.count, 0);
                            const percentage = Math.round((item.count / total) * 100);
                            return (
                              <div key={item.label} className="border-b border-gray-100 pb-2 last:border-b-0">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-400 font-bold">{idx + 1}.</span>
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                      />
                                    </div>
                                    <span className="text-gray-700 font-semibold">
                                      {item.label}
                                    </span>
                                  </div>
                                  <span className="text-gray-500 font-bold">
                                    {item.count} ({percentage}%)
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 ml-7 italic">
                                  {item.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
