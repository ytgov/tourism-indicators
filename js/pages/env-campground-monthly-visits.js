// Define the color scheme
const colors = [
    "#F2A9008C", // 55% Opacity
    "#DC44058C",
    "#0097A98C",
    "#244C5A8C",
    "#512A448C",
    "#7A9A018C",
    "#F2A900", // Original
    "#DC4405",
    "#0097A9",
    "#244C5A",
    "#512A44",
    "#7A9A01"
];

// Load the data
async function loadCSVData(csvUrl) {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        
        // Parse the header row and remove quotes
        const headers = rows[0].split(',').map(header => header.replace(/"/g, '').trim());

        // Parse the data rows
        const data = rows.slice(1).map(row => {
            const values = row.split(',').map(value => value.replace(/"/g, '').trim());
            return headers.reduce((acc, header, index) => {
                acc[header] = values[index];
                return acc;
            }, {});
        });

        return data;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return null;
    }
}

async function generateChart() {
    const rawData = await loadCSVData('data/vw_kpi_env_campground_visitors_by_month.csv');
    if (!rawData) {
        console.error('Failed to load CSV data.');
        return;
    }

    // Define months March through September
    const displayMonths = [2, 3, 4, 5, 6, 7, 8]; // Indexes for March to September
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(2024, i).toLocaleString('default', { month: 'short' })
    );

    // Extract relevant fields and ensure all months are represented
    const dataByYear = {};
    rawData.forEach(row => {
        const date = new Date(row.ref_date);
        const year = date.getFullYear().toString();
        const month = date.getMonth();
        const visitors = parseInt(row.visitors) || 0;

        if (displayMonths.includes(month)) { // Only include selected months
            if (!dataByYear[year]) {
                dataByYear[year] = Array(12).fill(null); // Pre-fill with null for all months
            }
            dataByYear[year][month] = visitors;
        }
    });

    // Prepare series for Highcharts
    const series = Object.keys(dataByYear)
        .sort() // Sort years chronologically
        .map((year, index) => ({
            name: year,
            data: displayMonths.map(monthIndex => ({
                name: allMonths[monthIndex],
                y: dataByYear[year][monthIndex] !== null ? dataByYear[year][monthIndex] : null
            })),
            color: colors[index % colors.length], // Apply the color scheme in a loop
            visible: year === '2019' || parseInt(year) >= 2022 // Show 2019 and years >= 2022
        }));

    // Generate the chart
    Highcharts.chart('monthly-visits', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Monthly vists (March to September)'
        },
        xAxis: {
            categories: displayMonths.map(index => allMonths[index]), // Only show March to September
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                formatter: function() {
                    return Highcharts.numberFormat(this.value, 0);
                }
            }
        },
        tooltip: {
            shared: true,
            formatter: function() {
                let tooltip = '<b>' + this.x + '</b><br/>';
                this.points.forEach(point => {
                    tooltip += point.series.name + ': ' + 
                        Highcharts.numberFormat(point.y, 0) + ' campers<br/>';
                });
                return tooltip;
            }
        },
        series: series,
        credits: {
            enabled: false
        }
    });
}

document.addEventListener('DOMContentLoaded', generateChart);


document.addEventListener('DOMContentLoaded', generateChart);
