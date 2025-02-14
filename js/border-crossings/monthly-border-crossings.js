import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_kpi_intl_travellers_entering_canada_ytd_summary.csv?"+Math.random();

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
                const data = rows.slice(1)
                    .filter(row => row.length > 1)
                    .filter(row => {
                        const location = row[3] ? row[3].replace(/"/g, "") : "";
                        return location.toLowerCase() === "yukon";
                    })
                    .map(row => {
                        const dateStr = row[0].replace(/"/g, "");
                        const monthlyTotal = parseFloat(row[4]) || 0; // monthly_total
                        const ytdTotal = parseFloat(row[7]) || 0; // ytd_total
                        const ytdChange = parseFloat(row[9]) || 0; // ytd_percentage_difference
                        const ytdDateRange = row[12] ? row[12].replace(/"/g, "") : ""; // ytd_month_range
                        const c2019Change = parseFloat(row[11]) || 0; // c2019_percentage_difference

                        return {
                            date: new Date(dateStr).getTime(),
                            dateString: dateStr,
                            monthlyTotal: monthlyTotal,
                            ytdTotal: ytdTotal,
                            ytdDateRange: ytdDateRange,
                            ytdChange: ytdChange,
                            c2019Change: c2019Change
                        };
                    })
                    .filter(item => !isNaN(item.date) && !isNaN(item.monthlyTotal))
                    .sort((a, b) => a.date - b.date); // Sort by date ascending

                if (data.length === 0) throw new Error("No valid Yukon data points found after parsing");

                // Display metrics cards
                updateMetricsCards(data);

                // Prepare and render chart
                const seriesData = data.map(item => [item.date, item.monthlyTotal]);
                renderChart(seriesData);
            })
            .catch(error => {
                console.error("Error processing data:", error);
                // Display error message to user
                const container = document.getElementById("ybcm-container");
                if (container) {
                    container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
                }
            });
    }

    function updateMetricsCards(data) {
        try {
            const latestEntry = data[data.length - 1];
            const date = new Date(latestEntry.date);
            const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
            const year = date.getFullYear();

            // Update "Latest monthly crossings"
            const latestMonthly = document.getElementById("latest-monthly");
            const latestMonthlyDate = document.getElementById("latest-monthly-date");
            if (latestMonthly) latestMonthly.textContent = latestEntry.monthlyTotal.toLocaleString();
            if (latestMonthlyDate) latestMonthlyDate.textContent = month + " " + year;

            // Update "Year-to-date crossings"
            const ytdAmount = document.getElementById("ytd-amount");
            const ytdDateRange = document.getElementById("ytd-date-range");
            if (ytdAmount) ytdAmount.textContent = latestEntry.ytdTotal.toLocaleString();
            if (ytdDateRange) ytdDateRange.textContent = latestEntry.ytdDateRange + year;

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

    function renderChart(seriesData) {
        Highcharts.stockChart("ybcm-container", {
            chart: {
                height: 400
            },
            rangeSelector: {
                selected: 2,
                buttons: [{
                    type: "year",
                    count: 1,
                    text: "1y"
                }, {
                    type: "year",
                    count: 5,
                    text: "5y"
                }, {
                    type: "year",
                    count: 10,
                    text: "10y"
                }, {
                    type: "all",
                    text: "All"
                }]
            },
            title: {
                text: "Yukon border crossings by date"
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: "Date"
                }
            },
            yAxis: {
                title: {
                    text: "Total Crossings"
                },
                labels: {
                    formatter: function () {
                        return this.value.toLocaleString();
                    }
                }
            },
            series: [{
                name: "Monthly Total",
                data: seriesData,
                color: '#3a97a9',
                tooltip: {
                    valueDecimals: 0,
                    valueSuffix: " crossings"
                }
            }],
            tooltip: {
                valueDecimals: 0,
                pointFormatter: function () {
                    return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${this.y.toLocaleString()} crossings</b><br/>`;
                }
            }
        });
    }

    fetchDataAndRender();
});
