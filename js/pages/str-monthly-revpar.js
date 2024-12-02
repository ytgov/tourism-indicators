import { loadCSVData } from '../utils/data-utils.js';

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
]

// Load the data
async function generateChart() {
    const csvData = await loadCSVData('data/vw_kpi_str_revpar_ytd_summary.csv');
    if (!csvData) {
        console.error('Failed to load CSV data.');
        return;
    }

    const { headers, data } = csvData;

    // Define all months in order
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(2024, i).toLocaleString('default', { month: 'short' })
    );

    // Extract relevant fields and ensure all months are represented
    const dataByYear = {};
    data.forEach(row => {
        const year = row[headers.indexOf('year')];
        const month = parseInt(row[headers.indexOf('month')], 10) - 1; // Month index (0-based)
        const occupancyRate = Math.round(parseFloat(row[headers.indexOf('monthly_avg_revpar')]) * 10) / 10;

        if (!dataByYear[year]) {
            dataByYear[year] = Array(12).fill(null); // Pre-fill with null for all months
        }
        dataByYear[year][month] = occupancyRate; // Assign occupancy rate for the correct month
    });


    // Prepare series for Highcharts
    const series = Object.keys(dataByYear).map((year, index) => ({
        name: year,
        data: dataByYear[year].map((rate, monthIndex) => ({
            name: allMonths[monthIndex],
            y: rate !== null ? rate : null
        })),
        color: colors[index % colors.length], // Apply the color scheme in a loop
        visible: !['2014', '2015', '2016', '2017', '2018', '2020', '2021', '2022'].includes(year) // Disable specific years by default
    }));

    // Generate the chart
    Highcharts.chart('monthly-revpar', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'RevPAR'
        },
        xAxis: {
            categories: allMonths, // Ensure x-axis categories are always January to December
            title: {
                text: 'Month',
                enabled: false
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels:{
                format: '${value}'
            }
        },
        tooltip: {
            shared: true,
            valuePrefix: '$'
        },
        series: series,
        credits: {
            enabled: false
        }
    });
}

document.addEventListener('DOMContentLoaded', generateChart);
