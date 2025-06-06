// Define the color scheme
const colors = [
    "#006D6F",    // New: Deep Teal
    "#7A9A01",
    "#512A44",
    "#244C5A",
    "#0097A9",
    "#DC4405",
    "#F2A900",   // Original
    "#006D6F8C", // New: Deep Teal with 55% Opacity
    "#7A9A018C",
    "#512A448C",
    "#244C5A8C",
    "#0097A98C",
    "#DC44058C",
    "#F2A9008C"  // 55% Opacity
];



// Load the data
async function loadCSVData(csvUrl) {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim())
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));

        const data = rows.slice(1)
            .filter(row => row.length > 1 && row[3].toLowerCase().trim() === 'all') // Filter for 'All' transportation type
            .map(row => ({
                date: new Date(row[0]),
                year: parseInt(row[1]),
                month: parseInt(row[2]) - 1, // Adjust to 0-based month index
                value: parseFloat(row[4]) // Monthly total
            }))
            .sort((a, b) => a.date - b.date); // Sort ascending for chart

        return data;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return [];
    }
}

// Generate the chart
async function generateChart() {
    const rawData = await loadCSVData('data/vw_kpi_estimated_visitation_ytd_summary.csv?'+Math.random());
    if (!rawData.length) {
        console.error('Failed to load CSV data.');
        return;
    }

    // Define all months
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(2024, i).toLocaleString('default', { month: 'short' })
    );

    // Aggregate data By year
    const dataByYear = {};
    rawData.forEach(row => {
        const year = row.year.toString();
        const month = row.month;

        if (!dataByYear[year]) {
            dataByYear[year] = Array(12).fill(null); // Pre-fill with null for all months
        }
        dataByYear[year][month] = row.value;
    });

    // Prepare series for Highcharts
    const series = Object.keys(dataByYear)
        .sort()
        .map((year, index) => ({
            name: year,
            data: allMonths.map((_, monthIndex) => dataByYear[year][monthIndex] || null),
            color: colors[index % colors.length],
            visible: year === '2019' || parseInt(year) >= 2024 // Show 2018 and years >= 2022
        }));

    // Generate the chart
    Highcharts.chart('monthly-stacked-chart', {
        chart: {
            type: 'line',
            height: 400
        },
        title: {
            text: 'Estimated visitors by month'
        },
        xAxis: {
            categories: allMonths, // Show all months
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                formatter: function () {
                    return Highcharts.numberFormat(this.value, 0);
                }
            }
        },
        tooltip: {
            shared: true,
            formatter: function () {
                // Match x-axis category (month index) with month names
                let tooltip = '<b>' + allMonths[this.points[0].point.index] + '</b><br/>';
                this.points.forEach(point => {
                    tooltip += point.series.name + ': ' +
                        Highcharts.numberFormat(point.y, 0) + ' visitors<br/>';
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
