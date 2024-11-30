document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "https://raw.githubusercontent.com/btelliot/tc-public-data/refs/heads/main/vw_bc_border_crossings_by_country_recent_year.csv";

    fetch(csvUrl)
        .then(response => response.text())
        .then(csv => {
            // Parse CSV data
            const rows = csv.split("\n").map(row => row.split(","));
            const data = rows.slice(1).filter(row => row.length === 3); // Skip header row and filter valid rows

            // Extract the year from the first row of data
            const year = data.length > 0 ? data[0][0].trim() : 'Unknown Year';

            // Define custom color scheme
            const colors = [
                "#7a9a01",
                "#97c1cd",
                "#b6c390",
                "#947b89",
                "#f2a900",
                "#dc4405",
                "#244c5a"
            ];

            // Prepare data for Highcharts
            const treemapData = data
                .filter(row => !['United States', 'Canada'].includes(row[1].trim())) // Filter out USA and Canada
                .map((row, index) => ({
                    name: row[1].trim(), // Country name
                    value: parseInt(row[2], 10), // Visitors count
                    color: colors[index % colors.length] // Cycle through the custom colors
                }));

            // Create Highcharts treemap
            Highcharts.chart('ybccountry-container', {
                chart: {
                    type: 'treemap'
                },
                title: {
                    text: `Overseas Visitors by Country (${year})` // Dynamic title
                },
                colorAxis: {
                    min: 0,
                    stops: [
                        [0, '#f2f2f2'],
                        [0.5, '#7cb5ec'],
                        [1, '#244c5a']
                    ]
                },
                tooltip: {
                    pointFormat: '<b>{point.name}</b>: {point.value} crossings'
                },
                series: [{
                    type: 'treemap',
                    layoutAlgorithm: 'squarified',
                    data: treemapData
                }]
            });
        })
        .catch(error => console.error("Error loading CSV data:", error));
});
