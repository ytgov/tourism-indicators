document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_kpi_sc_tourism_business_count.csv?"+Math.random();

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
                const headers = rows[0].map(header => header.replace(/"/g, ''));

                // Skip header row and empty rows, filter for Total data, and parse
                const data = rows.slice(1)
                    .filter(row => row.length > 1)
                    .filter(row => {
                        const location = row[headers.indexOf('industry')].replace(/"/g, "") || "";
                        return location.toLowerCase() === "total tourism industry";
                    })
                    .map(row => {
                        const dateStr = row[headers.indexOf('date')].replace(/"/g, "");
                        const monthlyTotal = parseFloat(row[headers.indexOf('monthly_total')]) || 0;

                        return {
                            date: new Date(dateStr).getTime(), // Convert to milliseconds
                            monthlyTotal: monthlyTotal
                        };
                    })
                    .filter(item => !isNaN(item.monthlyTotal) && !isNaN(item.date))
                    .sort((a, b) => a.date - b.date); // Sort by date ascending

                if (data.length === 0) throw new Error("No valid Yukon data points found after parsing");

                // Prepare and render chart
                const seriesData = data.map(item => [item.date, item.monthlyTotal]);
                renderChart(seriesData);

            })
            .catch(error => {
                console.error("Error processing data:", error);
                // Display error message to user
                const container = document.getElementById("indicator-chart");
                if (container) {
                    container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
                }
            });
    }

    function renderChart(seriesData) {
        Highcharts.stockChart("indicator-chart", {
            chart: {
                height: 400
            },
            credits: {
                enabled: false
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
                text: "Estimated tourism business counts by month"
            },
            xAxis: {
                type: "datetime",
                title: {
                    text: "Date"
                }
            },
            yAxis: {
                title: {
                    text: "Total Businesses"
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
                tooltip: {
                    valueDecimals: 0,
                    valueSuffix: " businesses"
                }
            }],
            tooltip: {
                valueDecimals: 0,
                pointFormatter: function () {
                    return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${this.y.toLocaleString()} businesses</b><br/>`;
                }
            }
        });
    }

    fetchDataAndRender();
});
