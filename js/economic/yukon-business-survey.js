document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/ybs_revenue_and_gdp_attributable_to_tourism.csv";

        // Function to parse CSV with proper handling of quoted fields
        function parseCSV(csv) {
            const rows = csv.split("\n").slice(1).filter(row => row);
            return rows.map(row => {
                // Split while handling quoted commas
                const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g).map(value => {
                    return value.replace(/^"(.*)"$/, "$1"); // Remove surrounding quotes
                });
                const [year, measure, sector, value, reference] = values;
                return { year, measure, sector, value, reference };
            });
        }

    // Function to render the chart
    function renderChart(data, selectedYear) {
        // Filter data for the selected year
        const filteredData = data.filter(row => row.year === selectedYear && row.sector !== "Total");

        // Get unique sectors for the selected year
        const sectors = [...new Set(filteredData.map(row => row["sector"]))];

        // Extract values for each measure
        const grossRevenues = sectors.map(sector => {
            const entry = filteredData.find(row => row["measure"] === "Gross revenues attributable to tourism" && row["sector"] === sector);
            return entry ? parseFloat(entry["value"]) : 0;
        });
        const gdpValues = sectors.map(sector => {
            const entry = filteredData.find(row => row["measure"] === "GDP attributable to tourism" && row["sector"] === sector);
            return entry ? parseFloat(entry["value"]) : 0;
        });

        // Render Highcharts
        Highcharts.chart('yukon-business-survey', {
            chart: {
                type: 'column'
            },
            title: {
                text: `Revenue and GDP attributable to Tourism by Sector (${selectedYear})`
            },
            xAxis: {
                categories: sectors,
                title: {
                    text: 'Sector'
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Value (in millions)'
                }
            },
            tooltip: {
                shared: true,
                valuePrefix: '$',
                valueSuffix: 'M'
            },
            plotOptions: {
                column: {
                    grouping: true,
                    shadow: false,
                    borderWidth: 0
                }
            },
            series: [
                {
                    name: 'Gross Revenues',
                    data: grossRevenues,
                    color: '#7cb5ec'
                },
                {
                    name: 'GDP',
                    data: gdpValues,
                    color: '#434348'
                }
            ],
            credits: {
                enabled: false
            }
        });
    }

    // Populate year selector
    function populateYearSelector(years) {
        const yearSelector = document.getElementById("year-selector");
        years.forEach(year => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelector.appendChild(option);
        });
    }

    // Fetch data and parse CSV
    fetch(csvUrl)
        .then(response => response.text())
        .then(csv => {
            // Parse CSV data into an array of objects
            const rows = csv.split("\n").slice(1).filter(row => row).map(row => {
                const [year, measure, sector, value, reference] = row.split(",");
                return { year, measure, sector, value, reference };
            });

            // Extract unique years
            const years = [...new Set(rows.map(row => row.year))].sort().reverse();

            // Populate year selector
            populateYearSelector(years);

            // Set initial selected year and render chart
            const yearSelector = document.getElementById("year-selector");
            const initialYear = years[0];
            yearSelector.value = initialYear;
            renderChart(rows, initialYear);

            // Update chart on year selection change
            yearSelector.addEventListener("change", () => {
                const selectedYear = yearSelector.value;
                renderChart(rows, selectedYear);
            });
        })
        .catch(error => console.error("Error loading or processing CSV data:", error));
});
