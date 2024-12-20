document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_bc_yearly_border_crossings_by_continent.csv";

    let allData = []; // Store all the fetched CSV data
    let years = []; // Store unique years
    const covidYears = [2020, 2021, 2022]; // Define COVID years

    // Function to render the chart
    function renderChart(filteredData) {
        // Define the desired order of continents
        const desiredOrder = [
            "Africa",
            "Americas",
            "Oceania",
            "Asia",
            "Europe"
        ];

        // Extended color scheme
        const colors = [
            "#b6c390",
            "#947b89",
            "#f2a900",
            "#dc4405",
            "#244c5a"
        ];

        // Prepare seriesData for Highcharts
        const seriesData = desiredOrder.map((continent, index) => {
            const continentData = years.map(year => {
                const entry = filteredData.find(row => row[0] === year && row[1].trim() === continent); // Ensure matching with trimmed strings
                return entry ? parseInt(entry[2], 10) : 0; // Return value or 0 if not found
            });
            return {
                name: continent,
                data: continentData,
                color: colors[index % colors.length] // Cycle through colors
            };
        });

        // Render Highcharts
        Highcharts.chart('ybcc-container', {
            chart: {
                type: 'column',
                zoomType: 'x'
            },
            title: {
                text: 'Overseas visitors by Continent'
            },
            xAxis: {
                categories: years,
                title: {
                    text: 'Year'
                },
                scrollbar: {
                    enabled: false
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

    // Fetch data and initialize
    fetch(csvUrl)
        .then(response => response.text())
        .then(csv => {
            const rows = csv.split("\n").map(row => row.split(","));
            allData = rows.slice(1).filter(row => row.length === 3); // Skip header row and filter valid rows
            years = [...new Set(allData.map(row => row[0]))].sort(); // Extract unique years

            // Render chart with default data (no filtering)
            renderChart(allData);

            // Add event listeners for filters
            const geoDropdown = document.getElementById("geo-filter");
            const timeDropdown = document.getElementById("time-filter");
            const covidDropdown = document.getElementById("covid-filter");

            function applyFilters() {
                const selectedGeo = geoDropdown.value;
                const selectedTime = timeDropdown.value;
                const covidFilter = covidDropdown.value; // "include" or "exclude"

                // Filter data by geo
                let filteredData = selectedGeo === "All" ? allData : allData.filter(row => row[1].trim() === selectedGeo);

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

                // Re-render the chart with filtered data
                renderChart(filteredData);
            }

            // Attach change event listeners
            geoDropdown.addEventListener("change", applyFilters);
            timeDropdown.addEventListener("change", applyFilters);
            covidDropdown.addEventListener("change", applyFilters);
        })
        .catch(error => console.error("Error loading CSV data:", error));
});
