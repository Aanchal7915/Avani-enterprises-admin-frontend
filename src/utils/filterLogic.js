
export const filterLeads = (leads, { years = [], months = [], dates = [] }) => {
    // If no filters are active, return all leads
    if (years.length === 0 && months.length === 0 && dates.length === 0) {
        return leads;
    }

    return leads.filter((lead) => {
        const d = new Date(lead.createdAt);
        const leadYear = d.getFullYear(); // e.g. 2024
        const leadMonth = d.toLocaleString("default", { month: "long" }); // e.g. "January"

        // Normalize date to YYYY-MM-DD for comparison with selected dates
        const leadDateStr = d.toLocaleDateString("en-CA"); // YYYY-MM-DD format local time

        // Strict Intersection Logic (Drill-down)
        // If a filter category has selections, the lead MUST match that category.

        const matchesYear = years.length === 0 || years.includes(leadYear);
        const matchesMonth = months.length === 0 || months.includes(leadMonth);
        const matchesDate = dates.length === 0 || dates.includes(leadDateStr);

        // Result: (SelectedYears ? Match : True) AND (SelectedMonths ? Match : True) AND (SelectedDates ? Match : True)
        return matchesYear && matchesMonth && matchesDate;
    });

    /* 
       Example Strict Scenarios:
       1. Years=[2023], Months=[Jan] -> Returns only Jan 2023 leads.
       2. Years=[2023], Dates=[2023-05-10] -> Returns only 10th May 2023.
       3. Years=[2024], Dates=[2023-05-10] -> Returns Nothing (Date is not in Year).
       This ensures "related data" means "data fitting ALL your criteria".
    */
};
