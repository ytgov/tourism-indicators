document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_kpi_intl_travellers_entering_canada_ytd_summary.csv";

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
                        const ytdDateRange = row[10] ? row[10].replace(/"/g, "") : ""; // ytd_month_range

                        return {
                            date: new Date(dateStr).getTime(),
                            dateString: dateStr,
                            monthlyTotal: monthlyTotal,
                            ytdTotal: ytdTotal,
                            ytdDateRange: ytdDateRange,
                            ytdChange: ytdChange
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

            // Update "Latest Monthly Crossings"
            const latestMonthly = document.getElementById("latest-monthly");
            const latestMonthlyDate = document.getElementById("latest-monthly-date");
            if (latestMonthly) latestMonthly.textContent = latestEntry.monthlyTotal.toLocaleString();
            if (latestMonthlyDate) latestMonthlyDate.textContent = latestEntry.dateString;

            // Update "Year-to-Date Crossings"
            const ytdAmount = document.getElementById("ytd-amount");
            const ytdDateRange = document.getElementById("ytd-date-range");
            if (ytdAmount) ytdAmount.textContent = latestEntry.ytdTotal.toLocaleString();
            if (ytdDateRange) ytdDateRange.textContent = latestEntry.ytdDateRange;

            // Update "Year-to-Date Change"
            const ytdChangeElement = document.getElementById("ytd-change");
            if (ytdChangeElement) {
                ytdChangeElement.textContent = `${latestEntry.ytdChange.toFixed(1)}%`;
                ytdChangeElement.classList.remove("text-success", "text-danger");
                
                if (latestEntry.ytdChange > 0) {
                    ytdChangeElement.classList.add("text-success");
                } else if (latestEntry.ytdChange < 0) {
                    ytdChangeElement.classList.add("text-danger");
                }
            }
        } catch (error) {
            console.error("Error updating metrics cards:", error);
        }
    }

    function renderChart(seriesData) {
        Highcharts.stockChart("ybcm-container", {
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
                text: "Yukon Border Crossings by Date"
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
                    formatter: function() {
                        return this.value.toLocaleString();
                    }
                }
            },
            series: [{
                name: "Monthly Total",
                data: seriesData,
                tooltip: {
                    valueDecimals: 0,
                    valueSuffix: " crossings"
                }
            }],
            tooltip: {
                valueDecimals: 0,
                pointFormatter: function() {
                    return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${this.y.toLocaleString()} crossings</b><br/>`;
                }
            }
        });
    }

    fetchDataAndRender();
});
