import { loadCSVData } from '../utils/data-utils.js';

// Define the color scheme
const colors = [
    "#7A9A018C", // 55% Opacity
    "#512A448C",
    "#244C5A8C",
    "#0097A98C",
    "#DC44058C",
    "#F2A9008C",
    "#7A9A01",
    "#512A44",
    "#244C5A",
    "#0097A9",
    "#DC4405",
    "#F2A900"
]
// Load the data
async function generateChart() {
    const csvData = await loadCSVData('data/vw_kpi_str_adr_ytd_summary.csv?'+Math.random());
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
        const occupancyRate = Math.round(parseFloat(row[headers.indexOf('monthly_avg_adr')]) * 10) / 10;

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
    Highcharts.chart('monthly-adr', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Average daily rate'
        },
        xAxis: {
            categories: allMonths, // Ensure x-axis categories are always January to December
            title: {
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
