document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_bc_yearly_border_crossings_by_vehicle_type.csv";

    let allData = []; // To store the fetched CSV data
    let years = []; // To store unique years
    const covidYears = [2020, 2021, 2022]; // Define COVID years

    // Function to prepare and render chart based on filtered data
    function renderChart(filteredData, selectedGeo) {
        // Define desired order
        const desiredOrder = [
            "Pedestrian",
            "Motorcycle",
            "Water",
            "Air",
            "Train",
            "Bus",
            "Automobile"
        ];


        const colors = [
            "#7a9a01",
            "#97c1cd",
            "#b6c390",
            "#947b89",
            "#f2a900",
            "#dc4405",
            "#244c5a"
        ];

        // Summarize data by traveler type (origin) and year
        const seriesData = desiredOrder.map((origin, index) => {
            return {
                name: origin,
                data: years.map(year => {
                    const entries = filteredData.filter(row => row[0] === year && row[1] === origin);
                    return entries.length > 0
                        ? entries.reduce((sum, row) => sum + parseInt(row[3], 10), 0) // Sum values for matching year and origin
                        : 0;
                }),
                color: colors[index]
            };
        });

        // Update chart title dynamically based on selected geo
        const titleText = selectedGeo === "All" ? "Vehicle type (All Locations)" : `Vehicle type (${selectedGeo})`;

        // Render the chart
        Highcharts.chart('ybcvt-container', {
            chart: {
                type: 'column', // Vertical bar chart
                zoomType: 'x'
            },
            title: {
                text: titleText
            },
            xAxis: {
                categories: years,
                title: {
                    text: 'Year'
                },
                scrollbar: {
                    enabled: false // Enable scrollbar for x-axis
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Total Crossings'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                shared: true,
                valueSuffix: ' crossings'
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    pointPadding: 0.1,
                    groupPadding: 0
                }
            },
            legend: {
                reversed: true
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
            allData = rows.slice(1).filter(row => row.length === 4); // Skip header row and filter valid rows
            years = [...new Set(allData.map(row => row[0]))].sort(); // Extract unique years

            // Render chart with default data (no geo, time, or COVID filtering)
            renderChart(allData, "All");

            // Add event listeners to dropdowns for filtering
            const geoDropdown = document.getElementById("geo-filter");
            const timeDropdown = document.getElementById("time-filter");
            const covidDropdown = document.getElementById("covid-filter");

            function applyFilters() {
                const selectedGeo = geoDropdown.value;
                const selectedTime = timeDropdown.value;
                const covidFilter = covidDropdown.value; // "include" or "exclude"

                // Filter data by geo
                let filteredData = selectedGeo === "All" ? allData : allData.filter(row => row[2] === selectedGeo);

                // Filter data by time
                if (selectedTime !== "All") {
                    const currentYear = new Date().getFullYear();
                    const startYear = currentYear - parseInt(selectedTime, 10);
                    filteredData = filteredData.filter(row => parseInt(row[0], 10) >= startYear);
                }

                // Filter data to include or exclude COVID years
                if (covidFilter === "exclude") {
                    filteredData = filteredData.filter(row => !covidYears.includes(parseInt(row[0], 10)));
                }

                // Update years dynamically for the x-axis
                years = [...new Set(filteredData.map(row => row[0]))].sort();

                console.log(filteredData);
                // Re-render the chart with filtered data
                renderChart(filteredData, selectedGeo);
            }

            // Attach change event listeners
            geoDropdown.addEventListener("change", applyFilters);
            timeDropdown.addEventListener("change", applyFilters);
            covidDropdown.addEventListener("change", applyFilters);
        })
        .catch(error => console.error("Error loading CSV data:", error));
});
