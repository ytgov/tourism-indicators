document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "/data/vw_kpi_wlws_highway_counts_ytd_summary.csv";

    let allData = []; // To store the fetched CSV data
    let years = []; // To store unique years

    // Function to prepare and render chart based on filtered data
    function renderChart(filteredData) {
        // Prepare the data for the single series
        const seriesData = [{
            name: 'Traffic counts',
            data: years.map(year => {
                const entry = filteredData.find(
                    row => row.year === year
                );
                return entry ? parseInt(entry.ytd_total_visitors, 10) : 0; // Use `ytd_total_visitors`
            }),
            color: '#244c5a' // Assign desired color
        }];

        // Render the chart
        Highcharts.chart('yearly-chart', {
            chart: {
                type: 'column', // Vertical bar chart
                zoomType: 'x'
            },
            title: {
                text: "Northbound Traffic at the Watson Lake Weigh Scales"
            },
            xAxis: {
                categories: years,
                title: {
                    text: 'Year'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Total Traffic Counts'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                shared: true,
                valueSuffix: ' counts'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    pointPadding: 0.1,
                    groupPadding: 0
                }
            },
            credits: {
                enabled: false
            },
            series: seriesData
        });
    }

    fetch(csvUrl)
    .then(response => response.text())
    .then(csv => {
        const rows = csv.split("\n").map(row => row.split(","));
        allData = rows.slice(1).map(row => ({
            date: row[0],
            year: row[1],
            month: parseInt(row[2], 10), // Convert month to integer
            monthly_total_visitors: row[3],
            ytd_total_visitors: row[6]
        }))
        // Filter out rows with invalid data
        .filter(row => row.date && row.year && row.month); // Ensure date, year, and month are valid

        // Filter data to use only the last month of each year
        const lastMonthData = allData
            .sort((a, b) => a.month - b.month) // Ensure data is sorted by month
            .reduce((acc, row) => {
                const key = row.year; // Use 'year' as the key
                if (!acc[key] || acc[key].month < row.month) {
                    acc[key] = row; // Keep the latest month entry for each year
                }
                return acc;
            }, {});

        // Flatten the filtered data into an array
        const filteredData = Object.values(lastMonthData);

        years = [...new Set(filteredData.map(row => row.year))].sort();

        // Render chart with filtered data
        renderChart(filteredData);
    })
    .catch(error => console.error("Error loading CSV data:", error));
});
