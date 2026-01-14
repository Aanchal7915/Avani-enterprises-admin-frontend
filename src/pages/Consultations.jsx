import { useState, useEffect, Fragment } from "react";
import { Calendar, Mail, Phone, Building2, Briefcase, MessageSquare, Tag, Eye, Save, Edit2, Trash2, Send, StickyNote, X, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import clsx from "clsx";

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/avani-form`);
      if (response.data.success) {
        setConsultations(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedConsultation(null);
  };

  const toggleNotes = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
    setNoteInput("");
    setEditingNote(null);
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
    const updatedNotes = currentNotes ? currentNotes + "\n\n" + newNoteEntry : newNoteEntry;

    try {
      await axios.patch(`${API_BASE}/avani-form/${id}`, {
        notes: updatedNotes,
      });

      setConsultations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, notes: updatedNotes } : c))
      );
      setNoteInput("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const handleUpdateNotes = async (id, newNotesString) => {
    try {
      await axios.patch(`${API_BASE}/avani-form/${id}`, {
        notes: newNotesString,
      });

      setConsultations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, notes: newNotesString } : c))
      );
      return true;
    } catch (error) {
      console.error("Error updating notes:", error);
      return false;
    }
  };

  const handleDeleteNote = async (consultationId, noteIndex, currentNotes) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    const notesArray = currentNotes.split("\n\n");
    notesArray.splice(noteIndex, 1);
    const newNotesString = notesArray.join("\n\n");

    await handleUpdateNotes(consultationId, newNotesString);
  };

  const saveEditedNote = async () => {
    if (!editingNote) return;
    const { consultationId, index, text } = editingNote;

    const consultation = consultations.find(c => c._id === consultationId);
    if (!consultation || !consultation.notes) return;

    const notesArray = consultation.notes.split("\n\n");
    notesArray[index] = text;
    const newNotesString = notesArray.join("\n\n");

    const success = await handleUpdateNotes(consultationId, newNotesString);
    if (success) setEditingNote(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto space-y-6 pt-8 md:pt-4">
        {/* Top Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Consultation Requests
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage and track all consultation form submissions.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm">
            <div className="text-left">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Requests
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{consultations.length}</p>
            </div>
            <MessageSquare size={24} className="text-indigo-500" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm">
            <div className="text-left">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                This Month
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {consultations.filter(c => {
                  const date = new Date(c.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar size={24} className="text-green-500" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm">
            <div className="text-left">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Today
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {consultations.filter(c => {
                  const date = new Date(c.createdAt);
                  const now = new Date();
                  return date.toDateString() === now.toDateString();
                }).length}
              </p>
            </div>
            <Briefcase size={24} className="text-purple-500" />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 text-gray-600 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Services</th>
                <th className="px-6 py-3.5">Notes</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">

              {consultations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-sm">
                    🌤️ No consultation requests yet
                  </td>
                </tr>
              ) : (
                consultations.map((consultation, idx) => (
                  <Fragment key={consultation._id}>
                    <tr
                      className={clsx(
                        "transition-colors",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                        "hover:bg-indigo-50/40",
                        expandedRow === consultation._id && "bg-indigo-50/60"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {consultation.fullName || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-gray-900">
                            {consultation.email}
                          </span>
                          <span className="text-xs text-gray-500">
                            {consultation.phoneNu}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {consultation.companyName || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(consultation.services) &&
                            consultation.services.length > 0 ? (
                            consultation.services.map((s, idx2) => (
                              <span
                                key={idx2}
                                className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {consultation.service || "—"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleNotes(consultation._id)}
                          className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors relative group"
                          title={consultation.notes ? consultation.notes.split("\n\n").pop() : "No notes yet"}
                        >
                          <MessageSquare size={18} />
                          {consultation.notes && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400 border border-white" />
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(consultation.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(consultation.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(consultation)}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Notes Panel */}
                    {expandedRow === consultation._id && (
                      <tr>
                        <td colSpan={7} className="px-0">
                          <div className="bg-indigo-50/30 p-4 border-b border-indigo-100 shadow-inner animate-in slide-in-from-top-2 duration-200">
                            <div className="max-w-3xl mx-auto">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-semibold text-indigo-900 flex items-center">
                                  <StickyNote size={16} className="mr-2" />
                                  Notes / History
                                  <span className="ml-2 text-xs font-normal text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">
                                    by Admin
                                  </span>
                                </h4>
                                <button
                                  onClick={() => setExpandedRow(null)}
                                  className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full p-1 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="bg-white rounded-xl border border-indigo-100 p-4 mb-3 max-h-60 overflow-y-auto custom-scrollbar shadow-sm space-y-3">
                                {consultation.notes ? (
                                  consultation.notes.split("\n\n").map((noteBlock, nIdx) => (
                                    <div key={nIdx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group hover:bg-white hover:shadow-sm transition-all">

                                      {editingNote?.consultationId === consultation._id && editingNote?.index === nIdx ? (
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
                                              onClick={() => setEditingNote({ consultationId: consultation._id, index: nIdx, text: noteBlock })}
                                              className="p-1 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded"
                                              title="Edit Note"
                                            >
                                              <Edit2 size={12} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteNote(consultation._id, nIdx, consultation.notes)}
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
                                  onChange={(e) => setNoteInput(e.target.value)}
                                  placeholder="Type a new note here..."
                                  className="flex-1 text-sm border border-indigo-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none shadow-sm bg-white"
                                  rows={2}
                                />
                                <button
                                  onClick={() => handleAddNote(consultation._id, consultation.notes)}
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
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {consultations.map((consultation) => (
            <div
              key={consultation._id}
              className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {consultation.fullName || "N/A"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(consultation.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Contact</p>
                <p className="text-sm text-gray-700">{consultation.email}</p>
                <p className="text-sm text-gray-700">{consultation.phoneNu}</p>
                <p className="text-sm text-gray-700">{consultation.companyName || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(consultation.services) &&
                    consultation.services.length > 0 ? (
                    consultation.services.map((s, idx2) => (
                      <span
                        key={idx2}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-700">
                      {consultation.service || "—"}
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Notes Section */}
              <div>
                <button
                  onClick={() => toggleNotes(consultation._id)}
                  className="w-full flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-100/50 transition-colors mb-2"
                >
                  <span className="flex items-center gap-2">
                    <StickyNote size={14} />
                    Notes & History {consultation.notes ? <span className="bg-white text-indigo-600 px-1.5 py-0.5 rounded-full text-[10px] shadow-sm ml-1">{consultation.notes.split('\n\n').length}</span> : ''}
                  </span>
                  {expandedRow === consultation._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expandedRow === consultation._id && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-white rounded-xl border border-gray-100 p-3 max-h-64 overflow-y-auto custom-scrollbar shadow-sm space-y-3 mb-3">
                      {consultation.notes ? (
                        consultation.notes.split("\n\n").map((noteBlock, nIdx) => (
                          <div key={nIdx} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 relative group shadow-sm transition-all">
                            {editingNote?.consultationId === consultation._id && editingNote?.index === nIdx ? (
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
                                    onClick={() => setEditingNote({ consultationId: consultation._id, index: nIdx, text: noteBlock })}
                                    className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
                                  >
                                    <Edit2 size={10} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNote(consultation._id, nIdx, consultation.notes)}
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
                        onClick={() => handleAddNote(consultation._id, consultation.notes)}
                        className="bg-indigo-600 text-white p-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 active:scale-95"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openModal(consultation)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}

          {consultations.length === 0 && (
            <div className="text-center text-gray-500 py-10 bg-white/80 border border-gray-100 rounded-2xl text-sm">
              No consultation requests yet.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Consultation Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedConsultation.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedConsultation.email || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedConsultation.phoneNu || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Company</p>
                    <p className="text-sm font-medium text-gray-900">{selectedConsultation.companyName || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Service Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Requested Service</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {selectedConsultation.service || "N/A"}
                    </span>
                  </div>
                  {selectedConsultation.otherService && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Other Service Details</p>
                      <p className="text-sm font-medium text-gray-900">{selectedConsultation.otherService}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              {selectedConsultation.projectDetails && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Project Details</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedConsultation.projectDetails}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Submission Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submitted On</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedConsultation.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Request ID</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{selectedConsultation._id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <a
                href={`mailto:${selectedConsultation.email}`}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultations;
