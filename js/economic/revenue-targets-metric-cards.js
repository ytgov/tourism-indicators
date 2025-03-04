import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_kpi_tc_revenue_estimates_revised.csv?" + Math.random();

    function fetchDataAndRender() {
        fetch(csvUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csv => {
                const rows = csv.split("\n").map(row => row.split(","));
                if (rows.length < 2) throw new Error("CSV data is empty or malformed");

                // Skip header row and empty rows, filter for Yukon data, and parse
                let data = rows.slice(1)
                    .filter(row => row.length > 1)
                    .map(row => {
                        const dateStr = row[0].replace(/"/g, "");
                        const target = parseFloat(row[5]) || 0; // monthly_total
                        const ytdTotal = parseFloat(row[1]) || 0; // ytd_total
                        const ytdChange = parseFloat(row[6]) || 0; // ytd_percentage_difference
                        const ytdDateRange = row[12] ? row[12].replace(/"/g, "") : ""; // ytd_month_range
                        const year = new Date(dateStr).getFullYear();

                        return {
                            date: new Date(dateStr).getTime(),
                            dateString: dateStr,
                            year: year,
                            target: target,
                            ytdTotal: ytdTotal,
                            ytdDateRange: ytdDateRange,
                            ytdChange: ytdChange
                        };
                    })
                    .filter(item => !isNaN(item.date) && !isNaN(item.target))
                    .sort((a, b) => a.date - b.date); // Sort by date ascending

                if (data.length === 0) throw new Error("No valid Yukon data points found after parsing");

                // Calculate % Change from 2019
                const ytd2019 = data.find(d => d.dateString === '2019')?.ytdTotal || 0;
                const latestEntry = data[data.length - 1]; // Most recent entry
                const currentYTD = latestEntry.ytdTotal;

                let c2019Change = 0;
                if (ytd2019 > 0) {
                    c2019Change = ((currentYTD - ytd2019) / ytd2019) * 100;
                }

                latestEntry.c2019Change = c2019Change;

                // Display metrics cards
                updateMetricsCards(latestEntry);
            })
            .catch(error => {
                console.error("Error processing data:", error);
                const container = document.getElementById("ybcm-container");
                if (container) {
                    container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
                }
            });
    }

    function updateMetricsCards(latestEntry) {
        try {
            const date = new Date(latestEntry.date);
            const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
            const year = date.getFullYear();

            // Update "Target"
            const target = document.getElementById("target");
            const targetDate = document.getElementById("target-date");
            if (target) target.textContent = '$' + latestEntry.target.toLocaleString() + 'M';
            if (targetDate) targetDate.textContent = month + " " + year;

            // Update "Year-to-date "
            const ytdAmount = document.getElementById("ytd-amount");
            const ytdDateRange = document.getElementById("ytd-date-range");
            if (ytdAmount) ytdAmount.textContent = '$' + latestEntry.ytdTotal.toLocaleString() + 'M';
            if (ytdDateRange) ytdDateRange.textContent = latestEntry.ytdDateRange + " " + year;

            // Update "Year-to-date change"
            const ytdChangeElement = document.getElementById("ytd-change");
            if (ytdChangeElement) {
                let color;
                if (latestEntry.ytdChange >= -1 && latestEntry.ytdChange <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (latestEntry.ytdChange > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(latestEntry.ytdChange);
                ytdChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${latestEntry.ytdChange.toFixed(1)}% y/y</span>`;
            }

            // Update 2019 Change comparison
            const c2019ChangeElement = document.getElementById("c2019-change");
            if (c2019ChangeElement) {
                let color;
                if (latestEntry.c2019Change >= -1 && latestEntry.c2019Change <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (latestEntry.c2019Change > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(latestEntry.c2019Change);
                c2019ChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${latestEntry.c2019Change.toFixed(1)}% from 2019</span>`;
            }
        } catch (error) {
            console.error("Error updating metrics cards:", error);
        }
    }

    fetchDataAndRender();
});
