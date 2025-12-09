import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check } from "lucide-react";
import clsx from "clsx";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const AdvancedFilter = ({ onFilterChange, initialFilters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("dates"); // dates | months | years
    const [currentDate, setCurrentDate] = useState(new Date()); // For navigation
    const dropdownRef = useRef(null);

    // Selection State
    const [selectedDates, setSelectedDates] = useState(initialFilters?.dates || []);
    const [selectedMonths, setSelectedMonths] = useState(initialFilters?.months || []);
    const [selectedYears, setSelectedYears] = useState(initialFilters?.years || []);

    // Sync internal state
    useEffect(() => {
        if (initialFilters) {
            setSelectedDates(initialFilters.dates || []);
            setSelectedMonths(initialFilters.months || []);
            setSelectedYears(initialFilters.years || []);
        }
    }, [initialFilters]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    // --- Helpers ---
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handleDateClick = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString("en-CA");
        setSelectedDates(prev =>
            prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
        );
    };

    const handleMonthClick = (monthName) => {
        setSelectedMonths(prev =>
            prev.includes(monthName) ? prev.filter(m => m !== monthName) : [...prev, monthName]
        );
    };

    const handleYearClick = (year) => {
        setSelectedYears(prev =>
            prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
        );
    };

    const applyFilters = () => {
        onFilterChange({
            dates: selectedDates,
            months: selectedMonths,
            years: selectedYears
        });
        setIsOpen(false);
    };

    const clearFilters = () => {
        setSelectedDates([]);
        setSelectedMonths([]);
        setSelectedYears([]);
        onFilterChange({ dates: [], months: [], years: [] });
        setIsOpen(false);
    };

    // --- Renderers ---

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const blanks = Array(firstDay).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div className="p-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setCurrentDate(new Date(year, month - 1))}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="text-sm font-semibold text-gray-800">
                        {MONTHS[month]} {year}
                    </div>
                    <button
                        onClick={() => setCurrentDate(new Date(year, month + 1))}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                        <div key={d} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                    {days.map(day => {
                        const dateStr = new Date(year, month, day).toLocaleDateString("en-CA");
                        const isSelected = selectedDates.includes(dateStr);
                        const isToday = new Date().toLocaleDateString("en-CA") === dateStr;

                        return (
                            <button
                                key={day}
                                onClick={() => handleDateClick(day)}
                                className={clsx(
                                    "h-8 w-8 text-xs font-medium rounded-full flex items-center justify-center transition-all",
                                    isSelected
                                        ? "bg-indigo-600 text-white shadow-md scale-105"
                                        : isToday
                                            ? "bg-indigo-50 text-indigo-600 font-bold border border-indigo-200"
                                            : "text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonths = () => (
        <div className="grid grid-cols-2 gap-2 p-3 animate-in fade-in zoom-in-95 duration-200">
            {MONTHS.map((m) => (
                <button
                    key={m}
                    onClick={() => handleMonthClick(m)}
                    className={clsx(
                        "px-4 py-3 text-sm rounded-xl border transition-all flex justify-between items-center",
                        selectedMonths.includes(m)
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                            : "border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                    )}
                >
                    {m}
                    {selectedMonths.includes(m) && <Check size={16} className="text-indigo-600" />}
                </button>
            ))}
        </div>
    );

    const renderYears = () => {
        const currentYear = new Date().getFullYear();
        // Extended range: 10 years back and 50 years forward
        const years = Array.from({ length: 61 }, (_, i) => currentYear - 10 + i);

        return (
            <div className="grid grid-cols-3 gap-2 p-3 animate-in fade-in zoom-in-95 duration-200 h-[300px] overflow-y-auto custom-scrollbar">
                {years.map(y => (
                    <button
                        key={y}
                        onClick={() => handleYearClick(y)}
                        className={clsx(
                            "py-3 text-sm rounded-xl border transition-all text-center",
                            selectedYears.includes(y)
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium shadow-sm scale-105"
                                : "border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {y}
                    </button>
                ))}
            </div>
        );
    };

    // Improved Summary Text
    const getSummary = () => {
        const parts = [];

        // Years Logic
        if (selectedYears.length === 1) parts.push(`${selectedYears[0]}`);
        else if (selectedYears.length > 1) parts.push(`${selectedYears.length} Years`);

        // Months Logic
        if (selectedMonths.length === 1) parts.push(`${selectedMonths[0].slice(0, 3)}`);
        else if (selectedMonths.length > 1) parts.push(`${selectedMonths.length} Months`);

        // Dates Logic
        if (selectedDates.length === 1) {
            // Just show date like '12th'
            const d = new Date(selectedDates[0]);
            const day = d.getDate();
            parts.push(`Date: ${day}`);
        }
        else if (selectedDates.length > 1) parts.push(`${selectedDates.length} Dates`);

        return parts.length > 0 ? parts.join(" • ") : "Filter by Date";
    };

    // Checking active filters count for the badge
    const activeCount = selectedDates.length + selectedMonths.length + selectedYears.length;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={toggleOpen}
                className={clsx(
                    "w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2.5 rounded-lg border text-sm transition-all shadow-sm",
                    isOpen
                        ? "border-indigo-400 ring-2 ring-indigo-400/20 bg-white"
                        : "border-gray-200 bg-white/90 hover:bg-white hover:border-indigo-300"
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    <CalendarIcon size={16} className={clsx("shrink-0", activeCount > 0 ? "text-indigo-500" : "text-gray-400")} />
                    <span className={clsx("truncate max-w-[150px]", activeCount > 0 ? "text-gray-900 font-medium" : "text-gray-500")}>
                        {getSummary()}
                    </span>
                </div>
                {activeCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                        {activeCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-[340px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] animate-in fade-in slide-in-from-top-2">
                    {/* Close Button (Absolute Top Right) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 z-50 shadow-sm border border-gray-100"
                        title="Close"
                    >
                        <X size={14} />
                    </button>

                    {/* Header Tabs */}
                    <div className="flex border-b border-gray-100 bg-gray-50/80 rounded-t-2xl pr-8">
                        {["dates", "months", "years"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all relative outline-none focus:outline-none",
                                    activeTab === tab
                                        ? "text-indigo-600 bg-white"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                                )}
                            >
                                {tab === "dates" ? "Day Wise" : tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full mx-6" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Body */}
                    <div className="p-1 bg-white">
                        {activeTab === "dates" && renderCalendar()}
                        {activeTab === "months" && renderMonths()}
                        {activeTab === "years" && renderYears()}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 rounded-b-2xl">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={applyFilters}
                            className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600 rounded-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilter;
