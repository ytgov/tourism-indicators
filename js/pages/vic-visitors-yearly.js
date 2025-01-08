document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_kpi_vic_visitors_by_location_ytd_summary.csv";

    let allData = []; // To store the fetched CSV data
    let years = []; // To store unique years

    // Define desired order and colors
    const desiredOrder = [
        "Beaver Creek VIC",
        "Watson Lake VIC",
        "Haines Junction VIC",
        "Dawson VIC",
        "Carcross VIC",
        "Whitehorse VIC"
    ];

    const colors = [
        "#5e4b56",
        "#7a9a01",
        "#97c1cd",
        "#b6c390",
        "#947b89",
        "#f2a900",
        "#dc4405",
        "#244c5a"
    ];

    // Function to prepare and render chart based on filtered data
    function renderChart(filteredData) {
        // Summarize data by location and year
        //console.log(filteredData);
        const seriesData = desiredOrder.map((location, index) => {
            return {
                name: location,
                data: years.map(year => {
                    const entry = filteredData.find(
                        row => row.year === year && row.location === location
                    );
                    return entry ? parseInt(entry.ytd_total_visitors, 10) : 0; // Use `ytd_total_visitors`
                }),
                color: colors[index] // Assign corresponding color
            };
        });

        // Render the chart
        Highcharts.chart('yearly-chart', {
            chart: {
                type: 'column', // Vertical bar chart
                zoomType: 'x'
            },
            title: {
                text: "Yearly Visits by Location"
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
                    text: 'Total Visits'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                shared: true,
                valueSuffix: ' visits'
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

    // Fetch data and initialize chart
    fetch(csvUrl)
        .then(response => response.text())
        .then(csv => {
            const rows = csv.split("\n").map(row => row.split(","));
            allData = rows.slice(1).map(row => ({
                date: row[0],
                year: row[1],
                month: parseInt(row[2], 10), // Convert month to integer
                location: row[3],
                monthly_total_visitors: row[4],
                ytd_total_visitors: row[7]
            }));
        
            // Filter data to use only the last month of each year per location
            const lastMonthData = allData
                .sort((a, b) => a.month - b.month) // Ensure data is sorted by month
                .reduce((acc, row) => {
                    const key = `${row.year}-${row.location}`;
                    if (!acc[key] || acc[key].month < row.month) {
                        acc[key] = row; // Keep the latest month entry for each year-location pair
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
