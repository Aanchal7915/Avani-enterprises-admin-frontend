
export const filterLeads = (leads, { years = [], months = [], dates = [], customRange = {} }) => {
    // Check if custom range is active (both start and end dates are present)
    const hasCustomRange = customRange?.start && customRange?.end;

    // If no filters are active, return all leads
    if (years.length === 0 && months.length === 0 && dates.length === 0 && !hasCustomRange) {
        return leads;
    }

    return leads.filter((lead) => {
        const d = new Date(lead.createdAt);
        const leadYear = d.getFullYear(); // e.g. 2024
        const leadMonth = d.toLocaleString("default", { month: "long" }); // e.g. "January"

        // Normalize date to YYYY-MM-DD for comparison with selected dates
        const leadDateStr = d.toLocaleDateString("en-CA"); // YYYY-MM-DD format local time

        // Custom Range Logic
        if (hasCustomRange) {
            const startDate = new Date(customRange.start);
            const endDate = new Date(customRange.end);

            // Set endDate to end of day to include the full day
            endDate.setHours(23, 59, 59, 999);

            // Set startDate to beginning of day (default, but explicit doesn't hurt)
            startDate.setHours(0, 0, 0, 0);

            // Compare timestamps
            if (d < startDate || d > endDate) {
                return false;
            }
        }

        // Strict Intersection Logic (Drill-down) for other filters
        // If a filter category has selections, the lead MUST match that category.

        // If custom range is active, we can technically still apply others, but usually custom range overrides "years/months".
        // However, let's keep it composable. If you select Year 2023 AND Custom Range 2024, it currently returns 0, which is correct (intersection).
        // But most likely user uses Custom Range INSTEAD of others. 
        // The user didn't specify. I'll leave the intersection logic as is for years/months/dates, as it provides maximum flexibility.

        const matchesYear = years.length === 0 || years.includes(leadYear);
        const matchesMonth = months.length === 0 || months.includes(leadMonth);
        const matchesDate = dates.length === 0 || dates.includes(leadDateStr);

        // Result: Matches Range AND (SelectedYears ? Match : True) AND (SelectedMonths ? Match : True) AND (SelectedDates ? Match : True)
        return matchesYear && matchesMonth && matchesDate;
    });
};
