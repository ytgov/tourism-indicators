import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_tc_vis_estimates_summary_2026.csv?" + Math.random();

    function fetchDataAndRender() {
        fetch(csvUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csv => {
                const rows = csv.split(/\r?\n/).map(row => row.split(','));
                if (rows.length < 2) throw new Error("CSV data is empty or malformed");

                // Skip header row and empty rows, parse data
                let data = rows.slice(1)
                    .filter(row => row.length > 1 && row[0] !== '')
                    .map(row => {
                        const year = parseInt(row[0].replace(/"/g, ""));
                        const visitors = parseFloat(row[1]) || 0;
                        const yoyChange = parseFloat(row[2]) || 0;
                        const vs2019Change = parseFloat(row[3]) || 0;

                        return {
                            year: year,
                            visitors: visitors,
                            yoyChange: yoyChange,
                            vs2019Change: vs2019Change
                        };
                    })
                    .filter(item => !isNaN(item.year) && !isNaN(item.visitors))
                    .sort((a, b) => a.year - b.year); // Sort by year ascending

                if (data.length === 0) throw new Error("No valid data points found after parsing");

                // Get the latest year's data
                const latestEntry = data[data.length - 1];
                const previousYearEntry = data[data.length - 2];

                // Add previous year for comparison text
                latestEntry.previousYear = previousYearEntry ? previousYearEntry.year : latestEntry.year - 1;

                // Display metrics cards
                updateMetricsCards(latestEntry);
            })
            .catch(error => {
                console.error("Error processing data:", error);
            });
    }

    function updateMetricsCards(latestEntry) {
        try {
            // Update "Latest full year"
            const latestMonthly = document.getElementById("latest-monthly");
            const latestMonthlyDate = document.getElementById("latest-monthly-date");
            if (latestMonthly) {
                const roundedVisitors = Math.round(latestEntry.visitors / 100) * 100;
                latestMonthly.textContent = roundedVisitors.toLocaleString();
            }
            if (latestMonthlyDate) {
                latestMonthlyDate.textContent = "visitors in " + latestEntry.year;
            }

            // Update "vs previous year"
            const ytdAmount = document.getElementById("ytd-amount");
            const ytdDateRange = document.getElementById("ytd-date-range");
            if (ytdAmount) {
                let color;
                if (latestEntry.yoyChange >= -1 && latestEntry.yoyChange <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (latestEntry.yoyChange > 1) {
                    color = '#0f6726';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(latestEntry.yoyChange);
                ytdAmount.innerHTML = `<span style="color: ${color};">${arrow}${latestEntry.yoyChange.toFixed(1)}% y/y</span>`;
            }
            if (ytdDateRange) {
                ytdDateRange.textContent = "compared to " + latestEntry.previousYear;
            }

            // Update "vs pre-pandemic"
            const ytdChange = document.getElementById("ytd-change");
            const c2019Change = document.getElementById("c2019-change");
            if (ytdChange) {
                let color;
                if (latestEntry.vs2019Change >= -1 && latestEntry.vs2019Change <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (latestEntry.vs2019Change > 1) {
                    color = '#0f6726';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(latestEntry.vs2019Change);
                ytdChange.innerHTML = `<span style="color: ${color};">${arrow}${latestEntry.vs2019Change.toFixed(1)}%</span>`;
            }
            if (c2019Change) {
                c2019Change.textContent = "compared to 2019";
            }
        } catch (error) {
            console.error("Error updating metrics cards:", error);
        }
    }

    fetchDataAndRender();
});
