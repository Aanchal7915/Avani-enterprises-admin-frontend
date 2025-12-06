import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import { Download, Calendar, Search, Filter } from "lucide-react";
import clsx from "clsx";

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const months = [
        "All", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/leads`);
            setLeads(res.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch leads");
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter((lead) => {
        const date = new Date(lead.createdAt);
        const monthName = date.toLocaleString("default", { month: "long" });

        const matchesMonth = selectedMonth === "All" || monthName === selectedMonth;
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            lead.name?.toLowerCase().includes(search) ||
            lead.email?.toLowerCase().includes(search) ||
            lead.phone?.includes(searchTerm);

        return matchesMonth && matchesSearch;
    });

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            filteredLeads.map((lead) => ({
                Name: lead.name,
                Email: lead.email,
                Phone: lead.phone,
                Services: Array.isArray(lead.services)
                    ? lead.services.join(", ")
                    : lead.service,
                Notes: lead.notes || "",
                Date: new Date(lead.createdAt).toLocaleDateString(),
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        XLSX.writeFile(
            workbook,
            `Leads_Export_${new Date().toISOString().split("T")[0]}.xlsx`
        );
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
            <Sidebar />

            {/* YAHAN BAS ek chhota change: mt-16 md:mt-0 add kiya hai */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
                <div className="max-w-6xl mx-auto space-y-6 pt-8 md:pt-4">
                    {/* Top Header Area */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Leads Dashboard
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm md:text-base">
                                Manage, track, and export your incoming leads with ease.
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

                    {/* Filters & Search */}
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
                                <div className="relative w-full md:w-52">
                                    <Calendar
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg 
                                        focus:outline-none focus:ring-2 focus:ring-indigo-400/30 
                                        focus:border-indigo-400 bg-white/90 text-sm"
                                    >
                                        {months.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Small info text */}
                        <div className="mt-3 text-xs text-gray-400">
                            Showing{" "}
                            <span className="font-semibold text-gray-600">
                                {filteredLeads.length}
                            </span>{" "}
                            lead{filteredLeads.length !== 1 && "s"} for{" "}
                            <span className="font-medium text-indigo-500">
                                {selectedMonth === "All" ? "all months" : selectedMonth}
                            </span>
                            .
                        </div>
                    </div>

                    {/* Content */}
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
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/80 text-gray-600 text-xs uppercase font-semibold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3.5">Name</th>
                                            <th className="px-6 py-3.5">Contact</th>
                                            <th className="px-6 py-3.5">Services</th>
                                            <th className="px-6 py-3.5">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                        {filteredLeads.length > 0 ? (
                                            filteredLeads.map((lead, idx) => (
                                                <tr
                                                    key={lead._id}
                                                    className={clsx(
                                                        "transition-colors",
                                                        idx % 2 === 0
                                                            ? "bg-white"
                                                            : "bg-slate-50/40",
                                                        "hover:bg-indigo-50/40"
                                                    )}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">
                                                            {lead.name || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-sm text-gray-900">
                                                                {lead.email}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {lead.phone}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {Array.isArray(lead.services) &&
                                                                lead.services.length > 0 ? (
                                                                lead.services.map((s, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100"
                                                                    >
                                                                        {s}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-500 text-sm">
                                                                    {lead.service || "—"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {lead.notes && (
                                                            <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                                                {lead.notes}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(
                                                            lead.createdAt
                                                        ).toLocaleDateString()}
                                                        <div className="text-xs text-gray-400">
                                                            {new Date(
                                                                lead.createdAt
                                                            ).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="px-6 py-12 text-center text-gray-500 text-sm"
                                                >
                                                    🌤️ No leads found for the current filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {filteredLeads.map((lead) => (
                                    <div
                                        key={lead._id}
                                        className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {lead.name || "N/A"}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(
                                                        lead.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 font-medium">
                                                Contact
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                {lead.email}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                {lead.phone}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">
                                                Services
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {Array.isArray(lead.services) &&
                                                    lead.services.length > 0 ? (
                                                    lead.services.map((s, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-700">
                                                        {lead.service || "—"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {lead.notes && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium mb-1">
                                                    Notes
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {lead.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {filteredLeads.length === 0 && (
                                    <div className="text-center text-gray-500 py-10 bg-white/80 border border-gray-100 rounded-2xl text-sm">
                                        No leads match your current filter.
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

export default Dashboard;
