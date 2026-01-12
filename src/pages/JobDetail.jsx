import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Building2,
  Clock,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Upload,
  Loader2,
} from "lucide-react";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentLocation: "",
    linkedinProfile: "",
    portfolioWebsite: "",
    experience: "",
    currentCompany: "",
    currentDesignation: "",
    currentCTC: "",
    expectedCTC: "",
    noticePeriod: "",
    highestQualification: "",
    otherQualification: "",
    resume: null,
    coverLetter: null,
    coverLetterText: "",
    howDidYouHear: "",
    willingToRelocate: "",
    additionalComments: "",
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      // Fetch from admin endpoint to get all jobs including inactive ones
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/jobs/${id}`
      );
      setJob(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch job", err);
      setJob(null);
      setLoading(false);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.experience || !formData.noticePeriod || !formData.highestQualification) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (!formData.resume) {
      alert("Please upload your resume");
      return;
    }
    
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("jobId", id);
      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("currentLocation", formData.currentLocation || "");
      data.append("linkedinProfile", formData.linkedinProfile || "");
      data.append("portfolioWebsite", formData.portfolioWebsite || "");
      data.append("positionAppliedFor", job?.title || "");
      data.append("experience", formData.experience);
      data.append("currentCompany", formData.currentCompany || "");
      data.append("currentDesignation", formData.currentDesignation || "");
      data.append("currentCTC", formData.currentCTC || "");
      data.append("expectedCTC", formData.expectedCTC || "");
      data.append("noticePeriod", formData.noticePeriod);
      data.append("highestQualification", formData.highestQualification);
      data.append("otherQualification", formData.otherQualification || "");
      data.append("coverLetterText", formData.coverLetterText || "");
      data.append("howDidYouHear", formData.howDidYouHear || "");
      data.append("willingToRelocate", formData.willingToRelocate || "");
      data.append("additionalComments", formData.additionalComments || "");

      if (formData.resume) {
        data.append("resume", formData.resume);
      }
      if (formData.coverLetter) {
        data.append("coverLetter", formData.coverLetter);
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/applications`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(response.data.message || "Application submitted successfully! We'll contact you soon.");
      navigate("/careers");
    } catch (err) {
      console.error("Failed to submit application", err);
      alert(err.response?.data?.message || "Failed to submit application. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Job not found</p>
          <button
            onClick={() => navigate("/careers")}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Back to Careers
          </button>
        </div>
      </div>
    );
  }

  const isActive = job.status === "Active" && job.isActive;
  const isFilled = job.status === "Filled";
  const isClosed = job.status === "Closed";
  
  // Allow applications for all jobs
  const canApply = true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
            onClick={() => navigate("/careers")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Jobs
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Job Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-pink-50 rounded-xl">
              <Briefcase size={32} className="text-indigo-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-3xl font-bold text-gray-900">
                  {job.title}
                </h2>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                    <CheckCircle size={12} />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 whitespace-nowrap">
                    {job.status === "filled" ? "Position Filled" : "Closed"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
            </div>
          </div>

          {canApply && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all shadow-md font-medium"
            >
              Apply for this Position
            </button>
          )}

          {!isActive && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center text-sm text-amber-700">
              {isFilled ? "This position has been filled, but you can still apply for future opportunities" : "This position is closed, but you can still submit your application"}
            </div>
          )}
        </div>

        {/* Job Details */}
        {!showForm && (
          <div className="space-y-6">
            {job.description && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Job Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Responsibilities
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {(Array.isArray(job.responsibilities) 
                    ? job.responsibilities 
                    : job.responsibilities.split("\n")
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.qualifications && job.qualifications.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Qualifications
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {(Array.isArray(job.qualifications)
                    ? job.qualifications
                    : job.qualifications.split("\n")
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Skills Required
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(job.skills)
                    ? job.skills
                    : job.skills.split(",")
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

            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Benefits
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {(Array.isArray(job.benefits)
                    ? job.benefits
                    : job.benefits.split("\n")
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Application Form */}
        {showForm && canApply && (
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Apply for {job.title}
              </h3>
              <p className="text-sm text-gray-600">
                Fill out the form below to submit your application
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                      placeholder="+91 1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Location (City, State)
                    </label>
                    <input
                      type="text"
                      value={formData.currentLocation}
                      onChange={(e) =>
                        setFormData({ ...formData, currentLocation: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                      placeholder="e.g., Mumbai, Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedinProfile}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedinProfile: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio/Website
                    </label>
                    <input
                      type="url"
                      value={formData.portfolioWebsite}
                      onChange={(e) =>
                        setFormData({ ...formData, portfolioWebsite: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position Applied For *
                    </label>
                    <input
                      type="text"
                      required
                      value={job?.title || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Years of Experience *
                    </label>
                    <select
                      required
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                    >
                      <option value="">Select experience</option>
                      <option value="0-1 years">0-1 years</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highest Qualification *
                    </label>
                    <select
                      required
                      value={formData.highestQualification}
                      onChange={(e) =>
                        setFormData({ ...formData, highestQualification: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                    >
                      <option value="">Select qualification</option>
                      <option value="High School">High School</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="PhD">PhD</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Conditional field for "Other" qualification */}
                  {formData.highestQualification === "Other" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Please specify your qualification *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.otherQualification}
                        onChange={(e) =>
                          setFormData({ ...formData, otherQualification: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                        placeholder="e.g., Professional Certification, Trade School, etc."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current/Last Company
                    </label>
                    <input
                      type="text"
                      value={formData.currentCompany}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentCompany: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current/Last Designation
                    </label>
                    <input
                      type="text"
                      value={formData.currentDesignation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentDesignation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                      placeholder="Your job title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current CTC (Annual)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 5 LPA"
                      value={formData.currentCTC}
                      onChange={(e) =>
                        setFormData({ ...formData, currentCTC: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected CTC (Annual)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 7 LPA"
                      value={formData.expectedCTC}
                      onChange={(e) =>
                        setFormData({ ...formData, expectedCTC: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notice Period *
                    </label>
                    <select
                      required
                      value={formData.noticePeriod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          noticePeriod: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                    >
                      <option value="">Select notice period</option>
                      <option value="Immediate">Immediate</option>
                      <option value="15 days">15 days</option>
                      <option value="1 month">1 month</option>
                      <option value="2 months">2 months</option>
                      <option value="3 months">3 months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Documents
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Resume * (PDF/DOC, max 5MB)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        required
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, "resume")}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label
                        htmlFor="resume-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors cursor-pointer bg-gray-50 hover:bg-indigo-50/50"
                      >
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formData.resume
                            ? formData.resume.name
                            : "Click to upload resume"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Cover Letter (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, "coverLetter")}
                        className="hidden"
                        id="cover-letter-upload"
                      />
                      <label
                        htmlFor="cover-letter-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors cursor-pointer bg-gray-50 hover:bg-indigo-50/50"
                      >
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formData.coverLetter
                            ? formData.coverLetter.name
                            : "Click to upload cover letter"}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Or Write Cover Letter (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.coverLetterText}
                      onChange={(e) =>
                        setFormData({ ...formData, coverLetterText: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none"
                      placeholder="Write your cover letter here..."
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Additional Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How did you hear about us?
                    </label>
                    <select
                      value={formData.howDidYouHear}
                      onChange={(e) =>
                        setFormData({ ...formData, howDidYouHear: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none"
                    >
                      <option value="">Select an option</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Job Portal">Job Portal (Naukri, Indeed, etc.)</option>
                      <option value="Company Website">Company Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Are you willing to relocate?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="relocate"
                          value="Yes"
                          checked={formData.willingToRelocate === "Yes"}
                          onChange={(e) =>
                            setFormData({ ...formData, willingToRelocate: e.target.value })
                          }
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="relocate"
                          value="No"
                          checked={formData.willingToRelocate === "No"}
                          onChange={(e) =>
                            setFormData({ ...formData, willingToRelocate: e.target.value })
                          }
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Comments/Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.additionalComments}
                      onChange={(e) =>
                        setFormData({ ...formData, additionalComments: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 outline-none resize-none"
                      placeholder="Any additional information you'd like to share..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-pink-600 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobDetail;
