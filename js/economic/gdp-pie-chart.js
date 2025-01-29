import { loadCSVData } from '../utils/data-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Load data directly
    const data = await loadCSVData('data/ybs_gdp_percentage.csv?'+Math.random());

    // Convert data into an array of objects using the headers
    const parsedData = data.data.map(row => {
        return data.headers.reduce((obj, header, index) => {
            obj[header] = isNaN(row[index]) ? row[index] : parseFloat(row[index]);
            return obj;
        }, {});
    });

    // Populate year selector
    const yearSelector = document.getElementById('year-selector');
    const availableYears = [...new Set(parsedData.map(row => row.year))].sort((a, b) => b - a);
    

    // Set default to latest year
    yearSelector.value = availableYears[0];

    // Function to calculate GDP composition for a specific year
    function getGDPComposition(selectedYear) {
        // Filter data for the selected year
        const selectedYearData = parsedData.filter(row => row.year === selectedYear);

        if (selectedYearData.length === 0) {
            console.error('No data found for the selected year');
            return { selectedYear: null, gdpData: [] };
        }

        // Define a color palette for different sectors
        const colorPalette = [
            '#4e79a7', // Blue for Tourism
            '#f28e2c', // Orange
            '#e15759', // Red
            '#76b7b2', // Teal
            '#59a14f', // Green
            '#edc948', // Yellow
            '#b07aa1', // Purple
            '#ff9da7', // Pink
            '#9c755f', // Brown
            '#bab0ac'  // Gray
        ];

        // Create GDP data for all sectors
        const gdpData = selectedYearData.map((row, index) => ({
            name: row.sector,
            y: row.percent_of_gdp,
            color: colorPalette[index % colorPalette.length]
        }));

        // Calculate the sum of known sectors
        const knownSectorsSum = gdpData.reduce((sum, sector) => sum + sector.y, 0);

        // Add 'Other' category if the sum is less than 100
        if (knownSectorsSum < 100) {
            gdpData.push({
                name: 'Other',
                y: 100 - knownSectorsSum,
                color: '#bab0ac' // Gray color for 'Other'
            });
        }

        return {
            selectedYear: selectedYear,
            tourismGDPValue: gdpData.find(item => item.name === 'Tourism')?.y || 0,
            GDPPercentage: gdpData.find(item => item.name === 'Tourism')?.y || 0,
            gdpData: gdpData
        };
    }

    // Function to update GDP chart
    function updateGDPChart(selectedYear) {
        const { selectedYear: year, tourismGDPValue, GDPPercentage, gdpData } = getGDPComposition(selectedYear);

        if (!year) {
            console.error('Unable to create chart');
            return;
        }

        const chartTitle = `${GDPPercentage.toFixed(1)}% of Yukon's GDP was attributable to tourism in ${year}.`;

        // Create GDP composition pie chart
        Highcharts.chart('gdp-pie-chart', {
            chart: { type: 'pie', height: 500 },
            title: { text: chartTitle },
            tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.percentage:.1f}%' }
                }
            },
            series: [{ name: 'Share of GDP', colorByPoint: true, data: gdpData }],
            credits: { enabled: false }
        });
    }

    // Initial chart render
    updateGDPChart(availableYears[0]);

    // Add event listener for year selector
    yearSelector.addEventListener('change', (event) => {
        updateGDPChart(parseInt(event.target.value));
    });
});