import { useState, useEffect, Fragment } from "react";
import { Calendar, Mail, Phone, Building2, Briefcase, MessageSquare, Tag, Eye, Save, Edit2, Trash2, Send, StickyNote, X, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import clsx from "clsx";

const AvaniFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/avani-form`);
      if (response.data.success) {
        setForms(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (form) => {
    setSelectedForm(form);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedForm(null);
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

      setForms((prev) =>
        prev.map((f) => (f._id === id ? { ...f, notes: updatedNotes } : f))
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

      setForms((prev) =>
        prev.map((f) => (f._id === id ? { ...f, notes: newNotesString } : f))
      );
      return true;
    } catch (error) {
      console.error("Error updating notes:", error);
      return false;
    }
  };

  const handleDeleteNote = async (formId, noteIndex, currentNotes) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    const notesArray = currentNotes.split("\n\n");
    notesArray.splice(noteIndex, 1);
    const newNotesString = notesArray.join("\n\n");

    await handleUpdateNotes(formId, newNotesString);
  };

  const saveEditedNote = async () => {
    if (!editingNote) return;
    const { formId, index, text } = editingNote;

    const form = forms.find(f => f._id === formId);
    if (!form || !form.notes) return;

    const notesArray = form.notes.split("\n\n");
    notesArray[index] = text;
    const newNotesString = notesArray.join("\n\n");

    const success = await handleUpdateNotes(formId, newNotesString);
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
              Contact Submissions
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage all contact form submissions from the website.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm">
            <div className="text-left">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Submissions
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{forms.length}</p>
            </div>
            <MessageSquare size={24} className="text-indigo-500" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-sm">
            <div className="text-left">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                This Month
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {forms.filter(f => {
                  const date = new Date(f.createdAt);
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
                {forms.filter(f => {
                  const date = new Date(f.createdAt);
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
              {forms.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 text-sm">
                    🌤️ No contact submissions yet
                  </td>
                </tr>
              ) : (
                forms.map((form, idx) => (
                  <Fragment key={form._id}>
                    <tr
                      className={clsx(
                        "transition-colors",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                        "hover:bg-indigo-50/40",
                        expandedRow === form._id && "bg-indigo-50/60"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {form.fullName || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-gray-900">
                            {form.email}
                          </span>
                          <span className="text-xs text-gray-500">
                            {form.phoneNu}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {form.companyName || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(form.services) &&
                            form.services.length > 0 ? (
                            form.services.map((s, idx2) => (
                              <span
                                key={idx2}
                                className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {form.service || "—"}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleNotes(form._id)}
                          className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors relative group"
                          title={form.notes ? form.notes.split("\n\n").pop() : "No notes yet"}
                        >
                          <MessageSquare size={18} />
                          {form.notes && (
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400 border border-white" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(form.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(form.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(form)}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Notes Panel */}
                    {expandedRow === form._id && (
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
                                {form.notes ? (
                                  form.notes.split("\n\n").map((noteBlock, nIdx) => (
                                    <div key={nIdx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 relative group hover:bg-white hover:shadow-sm transition-all">
                                      {editingNote?.formId === form._id && editingNote?.index === nIdx ? (
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
                                              onClick={() => setEditingNote({ formId: form._id, index: nIdx, text: noteBlock })}
                                              className="p-1 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded"
                                              title="Edit Note"
                                            >
                                              <Edit2 size={12} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteNote(form._id, nIdx, form.notes)}
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
                                  onClick={() => handleAddNote(form._id, form.notes)}
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
          {forms.map((form) => (
            <div
              key={form._id}
              className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {form.fullName || "N/A"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(form.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Contact</p>
                <p className="text-sm text-gray-700">{form.email}</p>
                <p className="text-sm text-gray-700">{form.phoneNu}</p>
                <p className="text-sm text-gray-700">{form.companyName || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(form.services) &&
                    form.services.length > 0 ? (
                    form.services.map((s, idx2) => (
                      <span
                        key={idx2}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-700">
                      {form.service || "—"}
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Notes Section */}
              <div>
                <button
                  onClick={() => toggleNotes(form._id)}
                  className="w-full flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl text-xs font-semibold text-indigo-700 hover:bg-indigo-100/50 transition-colors mb-2"
                >
                  <span className="flex items-center gap-2">
                    <StickyNote size={14} />
                    Notes & History {form.notes ? <span className="bg-white text-indigo-600 px-1.5 py-0.5 rounded-full text-[10px] shadow-sm ml-1">{form.notes.split('\n\n').length}</span> : ''}
                  </span>
                  {expandedRow === form._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expandedRow === form._id && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-white rounded-xl border border-gray-100 p-3 max-h-64 overflow-y-auto custom-scrollbar shadow-sm space-y-3 mb-3">
                      {form.notes ? (
                        form.notes.split("\n\n").map((noteBlock, nIdx) => (
                          <div key={nIdx} className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 relative group shadow-sm transition-all">
                            {editingNote?.formId === form._id && editingNote?.index === nIdx ? (
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
                                    onClick={() => setEditingNote({ formId: form._id, index: nIdx, text: noteBlock })}
                                    className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
                                  >
                                    <Edit2 size={10} /> Edit
                                  </button>

                                  <button
                                    onClick={() => handleDeleteNote(form._id, nIdx, form.notes)}
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
                        onClick={() => handleAddNote(form._id, form.notes)}
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
                  onClick={() => openModal(form)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}

          {forms.length === 0 && (
            <div className="text-center text-gray-500 py-10 bg-white/80 border border-gray-100 rounded-2xl text-sm">
              No contact submissions yet.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
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
                    <p className="text-sm font-medium text-gray-900">{selectedForm.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedForm.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedForm.phoneNu || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Company</p>
                    <p className="text-sm font-medium text-gray-900">{selectedForm.companyName || "N/A"}</p>
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
                      {selectedForm.service || "N/A"}
                    </span>
                  </div>
                  {selectedForm.otherService && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Other Service Details</p>
                      <p className="text-sm font-medium text-gray-900">{selectedForm.otherService}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              {selectedForm.projectDetails && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Project Details</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedForm.projectDetails}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Submission Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submitted On</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedForm.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Request ID</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{selectedForm._id}</p>
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
                href={`mailto:${selectedForm.email}`}
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

export default AvaniFormsPage;
