document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "/data/vw_env_campground_visitors_by_residency_yearly.csv";

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
                yearlyTotals[year][site] += parseInt(value, 10) || 0; // Sum values for each site by year
            });

            // Extract unique years and filter for years > 2005
            const years = Object.keys(yearlyTotals)
                .filter(year => parseInt(year, 10) > 2005) // Keep only years > 2005
                .sort(); // Sort years in ascending order

            // Define custom order for sites
            const customOrder = [           
                "Unspecified",
                "Resident",
                "Non-resident"
                
            ];

            // Extended color scheme
            const colors = [
                "#3A95A8",
                "#502842",
                "#789A3B"
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
            Highcharts.chart('yearly-residency-container', {
                chart: {
                    type: 'column',
                    zoomType: 'x'
                },
                title: {
                    text: 'Visits by Residency'
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
