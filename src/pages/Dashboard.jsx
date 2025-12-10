import { useState, useEffect, useMemo, Fragment } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Sidebar from "../components/Sidebar";
import {
  Download,
  Calendar,
  Search,
  Filter,
  Users,
  PhoneCall,
  BarChart3,
  Menu,
  MessageSquare,
  X,
  Send,
  StickyNote,
  Trash2,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import { useNavigate, useLocation } from "react-router-dom";
import AdvancedFilter from "../components/AdvancedFilter";
import { filterLeads } from "../utils/filterLogic";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ dates: [], months: [], years: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [leadStatus, setLeadStatus] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Note System State
  const [expandedRow, setExpandedRow] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [editingNote, setEditingNote] = useState(null); // { leadId, index, text }

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/leads`);
      const data = res.data || [];
      setLeads(data);

      const initialStatuses = {};
      data.forEach((lead) => {
        initialStatuses[lead._id] = lead.status || "not responded";
      });
      setLeadStatus(initialStatuses);

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch leads");
      setLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    const dateFiltered = filterLeads(leads, filters);

    return dateFiltered.filter((lead) => {
      const search = searchTerm.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.phone?.includes(searchTerm)
      );
    });
  }, [leads, filters, searchTerm]);

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLeads.map((lead) => ({
        Name: lead.name,
        Email: lead.email,
        Phone: lead.phone,
        Location: lead.cityState || "N/A",
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

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/leads/${id}`, {
        status,
      });

      setLeadStatus((prev) => ({
        ...prev,
        [id]: status,
      }));
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const toggleNotes = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
      setNoteInput("");
      setEditingNote(null);
    } else {
      setExpandedRow(id);
      setNoteInput("");
      setEditingNote(null);
    }
  };

  const handleAddNote = async (id, currentNotes) => {
    if (!noteInput.trim()) return;

    const timestamp = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newNoteEntry = `[${timestamp}] By Admin:\n${noteInput}`;
    const updatedNotes = currentNotes
      ? currentNotes + "\n\n" + newNoteEntry
      : newNoteEntry;

    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/leads/${id}`, {
        notes: updatedNotes,
      });

      setLeads((prev) =>
        prev.map((l) => (l._id === id ? { ...l, notes: updatedNotes } : l))
      );
      setNoteInput("");
    } catch (err) {
      console.error("Failed to add note", err);
      alert("Failed to save note. Please try again.");
    }
  };

  const handleUpdateNotes = async (id, newNotesString) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/leads/${id}`, {
        notes: newNotesString,
      });

      setLeads((prev) =>
        prev.map((l) => (l._id === id ? { ...l, notes: newNotesString } : l))
      );
      return true;
    } catch (err) {
      console.error("Failed to update note", err);
      alert("Failed to update note. Please try again.");
      return false;
    }
  };

  const handleDeleteNote = async (leadId, noteIndex, currentNotes) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    const notesArray = currentNotes.split("\n\n");
    notesArray.splice(noteIndex, 1);
    const newNotesString = notesArray.join("\n\n");

    await handleUpdateNotes(leadId, newNotesString);
  };

  const saveEditedNote = async () => {
    if (!editingNote) return;
    const { leadId, index, text } = editingNote;

    const lead = leads.find(l => l._id === leadId);
    if (!lead || !lead.notes) return;

    const notesArray = lead.notes.split("\n\n");
    notesArray[index] = text;
    const newNotesString = notesArray.join("\n\n");

    const success = await handleUpdateNotes(leadId, newNotesString);
    if (success) setEditingNote(null);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />

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

          {/* Quick Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  All Leads
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  View & manage all incoming leads
                </p>
              </div>
              <Users size={24} className="text-indigo-500" />
            </button>

            <button
              onClick={() => navigate("/contacted-leads")}
              className="flex items-center justify-between p-4 rounded-2xl 
                bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wide">
                  Contacted Leads
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  All leads that have been contacted or followed up.
                </p>
              </div>
              <PhoneCall size={24} />
            </button>

            <button
              onClick={() => navigate("/analytics")}
              className="flex items-center justify-between p-4 rounded-2xl 
                bg-gradient-to-br from-indigo-600 to-pink-500 text-white shadow-sm hover:shadow-md transition"
            >
              <div className="text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wide">
                  Analytics
                </h3>
                <p className="text-xs text-white/80 mt-1">
                  See stats & performance of leads
                </p>
              </div>
              <BarChart3 size={24} />
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-indigo-50 shadow-sm relative z-20">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
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
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {filteredLeads.length}
              </span>{" "}
              lead{filteredLeads.length !== 1 && "s"} based on{" "}
              <span className="font-medium text-indigo-500">
                active filters
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
                      <th className="px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Services</th>
                      <th className="px-6 py-3.5">Notes</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead, idx) => (
                        <Fragment key={lead._id}>
                          <tr
                            className={clsx(
                              "transition-colors",
                              idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                              "hover:bg-indigo-50/40",
                              expandedRow === lead._id && "bg-indigo-50/60"
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
                              <span className="text-sm text-gray-700">
                                {lead.cityState || "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {Array.isArray(lead.services) &&
                                  lead.services.length > 0 ? (
                                  lead.services.map((s, idx2) => (
                                    <span
                                      key={idx2}
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
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => toggleNotes(lead._id)}
                                className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors relative group"
                                title={
                                  lead.notes
                                    ? lead.notes.split("\n\n").pop()
                                    : "No notes yet"
                                }
                              >
                                <MessageSquare size={18} />
                                {lead.notes && (
                                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400 border border-white" />
                                )}
                              </button>
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
                            <td className="px-6 py-4">
                              <select
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white/90 focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
                                value={
                                  leadStatus[lead._id] || "not responded"
                                }
                                onChange={(e) =>
                                  handleStatusChange(
                                    lead._id,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="not interested">
                                  Not Interested
                                </option>
                                <option value="not responded">
                                  Not Responded
                                </option>
                                <option value="interested">Interested</option>
                                <option value="contacted">Contacted</option>
                                <option value="converted">Converted</option>
                              </select>
                            </td>
                          </tr>

                          {/* Expanded Notes Panel */}
                          {expandedRow === lead._id && (
                            <tr>
                              <td colSpan={7} className="px-0">
                                <div className="bg-indigo-50/30 p-4 border-b border-indigo-100 shadow-inner animate-in slide-in-from-top-2 duration-200">
                                  <div className="max-w-3xl mx-auto">
                                    <div className="flex justify-between items-center mb-3">
                                      <h4 className="text-sm font-semibold text-indigo-900 flex items-center">
                                        <StickyNote
                                          size={16}
                                          className="mr-2"
                                        />
                                        Notes / History
                                        <span className="ml-2 text-xs font-normal text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">
                                          by Admin
                                        </span>
                                      </h4>
                                      <button
                                        onClick={() =>
                                          setExpandedRow(null)
                                        }
                                        className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full p-1 transition-colors"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>

                                    <div className="bg-white rounded-xl border border-indigo-100 p-4 mb-3 max-h-60 overflow-y-auto custom-scrollbar shadow-sm space-y-3">
                                      {lead.notes ? (
                                        lead.notes.split("\n\n").map((noteBlock, nIdx) => (
                                          <div key={nIdx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group hover:bg-white hover:shadow-sm transition-all">
                                            {editingNote?.leadId === lead._id && editingNote?.index === nIdx ? (
                                              <div className="space-y-2">
                                                <textarea
                                                  value={editingNote.text}
                                                  onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                                                  className="w-full text-xs p-2 border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                                                  rows={3}
                                                />
                                                <div className="flex justify-end gap-2">
                                                  <button
                                                    onClick={() => setEditingNote(null)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                                                  >
                                                    Cancel
                                                  </button>
                                                  <button
                                                    onClick={saveEditedNote}
                                                    className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
                                                  >
                                                    <Save size={12} /> Save
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <>
                                                <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                                                  {noteBlock}
                                                </p>
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity bg-white/80 p-1 rounded-md shadow-sm">
                                                  <button
                                                    onClick={() => setEditingNote({ leadId: lead._id, index: nIdx, text: noteBlock })}
                                                    className="p-1 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded"
                                                    title="Edit Note"
                                                  >
                                                    <Edit2 size={12} />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteNote(lead._id, nIdx, lead.notes)}
                                                    className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded"
                                                    title="Delete Note"
                                                  >
                                                    <Trash2 size={12} />
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <span className="italic text-gray-400 text-xs">
                                          No notes added yet. Start a conversation...
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex gap-2 items-start">
                                      <textarea
                                        value={noteInput}
                                        onChange={(e) =>
                                          setNoteInput(e.target.value)
                                        }
                                        placeholder="Type a new note here..."
                                        className="flex-1 text-sm border border-indigo-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none shadow-sm bg-white"
                                        rows={2}
                                      />
                                      <button
                                        onClick={() =>
                                          handleAddNote(
                                            lead._id,
                                            lead.notes
                                          )
                                        }
                                        className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md shadow-indigo-200 active:scale-95"
                                      >
                                        Add <Send size={14} />
                                      </button>
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
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500 text-sm"
                        >
                          🌤️ No records found for this period.
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
                      <p className="text-sm text-gray-700">
                        {lead.cityState || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Services
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(lead.services) &&
                          lead.services.length > 0 ? (
                          lead.services.map((s, idx2) => (
                            <span
                              key={idx2}
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

                    {/* Collapsible Notes Section */}
                    <div>
                      <button
                        onClick={() => toggleNotes(lead._id)}
                        className="w-full flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-100/50 transition-colors mb-2"
                      >
                        <span className="flex items-center gap-2">
                          <StickyNote size={14} />
                          Notes & History {lead.notes ? <span className="bg-white text-indigo-600 px-1.5 py-0.5 rounded-full text-[10px] shadow-sm ml-1">{lead.notes.split('\n\n').length}</span> : ''}
                        </span>
                        {expandedRow === lead._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {expandedRow === lead._id && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-white rounded-xl border border-gray-100 p-3 max-h-64 overflow-y-auto custom-scrollbar shadow-sm space-y-3 mb-3">
                            {lead.notes ? (
                              lead.notes.split("\n\n").map((noteBlock, nIdx) => (
                                <div key={nIdx} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 relative group shadow-sm transition-all">
                                  {editingNote?.leadId === lead._id && editingNote?.index === nIdx ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={editingNote.text}
                                        onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                                        className="w-full text-xs p-2.5 border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                                        rows={3}
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => setEditingNote(null)}
                                          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={saveEditedNote}
                                          className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
                                        >
                                          <Save size={12} /> Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {noteBlock}
                                      </p>
                                      <div className="flex justify-end gap-3 mt-2.5 pt-2 border-t border-gray-100">
                                        <button
                                          onClick={() => setEditingNote({ leadId: lead._id, index: nIdx, text: noteBlock })}
                                          className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
                                        >
                                          <Edit2 size={10} /> Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteNote(lead._id, nIdx, lead.notes)}
                                          className="text-red-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
                                        >
                                          <Trash2 size={10} /> Delete
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="italic text-gray-400 text-xs text-center block py-4">
                                No notes added yet.
                                <br />Start a conversation below!
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2 items-start mb-4">
                            <textarea
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Type a new note..."
                              className="flex-1 text-xs border border-indigo-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none shadow-sm bg-white"
                              rows={1}
                            />
                            <button
                              onClick={() => handleAddNote(lead._id, lead.notes)}
                              className="bg-indigo-600 text-white p-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 active:scale-95"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        Status
                      </p>
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white/90 w-full focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
                        value={
                          leadStatus[lead._id] || "not responded"
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            lead._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="not interested">
                          Not Interested
                        </option>
                        <option value="not responded">
                          Not Responded
                        </option>
                        <option value="interested">Interested</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>
                ))}

                {filteredLeads.length === 0 && (
                  <div className="text-center text-gray-500 py-10 bg-white/80 border border-gray-100 rounded-2xl text-sm">
                    No records found for this period.
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
