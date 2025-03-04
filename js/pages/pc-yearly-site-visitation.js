document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_pc_yearly_site_visitation.csv?"+Math.random();

    fetch(csvUrl)
        .then(response => response.text())
        .then(csv => {
            const rows = csv.split("\n").map(row => row.split(","));
            const data = rows.slice(1).filter(row => row.length === 3); // Skip header row and filter valid rows

            // Process data to calculate yearly totals
            const yearlyTotals = {};
            data.forEach(row => {
                const [date, site, value] = row;
                const year = date.split("-")[0]; // Extract year from date
                if (!yearlyTotals[year]) yearlyTotals[year] = {};
                if (!yearlyTotals[year][site]) yearlyTotals[year][site] = 0;
                yearlyTotals[year][site] += parseInt(value, 10) || 0; // Sum values for each site By year
            });

            // Extract unique years
            const years = Object.keys(yearlyTotals).sort();

            // Define custom order for sites
            const customOrder = [
                "Chilkoot Trail",
                "Klondike National Historic Site",
                "SS Klondike",
                "Kluane National Park"
            ];

            // Extended color scheme
            const colors = [
                "#947b89",
                "#f2a900",
                "#dc4405",
                "#244c5a"
            ];

            // Prepare series data for Highcharts
            const seriesData = customOrder.map((site, index) => {
                const siteData = years.map(year => yearlyTotals[year][site] || 0); // Use 0 if no data for a year
                return {
                    name: site,
                    data: siteData,
                    color: colors[index % colors.length] // Assign colors based on the index
                };
            });

            // Render Highcharts
            Highcharts.chart('pc-container', {
                chart: {
                    type: 'column',
                    zoomType: 'x'
                },
                title: {
                    text: 'Visits to National Parks and Historic Sites By year'
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
                        text: 'Total Visitors'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    shared: true,
                    valueSuffix: ' visitors'
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
        })
        .catch(error => console.error("Error loading CSV data:", error));
});
