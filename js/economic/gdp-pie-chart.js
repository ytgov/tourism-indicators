import { loadCSVData } from '../utils/data-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Load data directly
    const data = await loadCSVData('data/vw_gdp_stats.csv');

    // Convert data into an array of objects using the headers
    const parsedData = data.data.map(row => {
        return data.headers.reduce((obj, header, index) => {
            obj[header] = isNaN(row[index]) ? row[index] : parseFloat(row[index]);
            return obj;
        }, {});
    });

    // Function to calculate GDP composition for the latest year with tourism GDP data
    function getLatestGDPComposition() {
        // Find the latest year with a value for "GDP attributable to tourism"
        const years = parsedData
            .filter(row => row.measure === 'GDP attributable to tourism')
            .map(row => row.year);

        const latestTourismYear = Math.max(...years);

        // Find the tourism GDP for the latest year
        const tourismGDP = parsedData.find(row =>
            row.year === latestTourismYear && row.measure === 'GDP attributable to tourism'
        );

        // Find the total GDP for the same year
        const totalGDP = parsedData.find(row =>
            row.year === latestTourismYear && row.measure === 'GDP'
        );

        if (!tourismGDP || !totalGDP) {
            console.error('Missing data for GDP calculations.');
            return { latestTourismYear: null, gdpData: [] };
        }

        // Calculate other GDP as the difference
        const otherGDP = totalGDP.value - tourismGDP.value;
        const GDPPercentage = (tourismGDP.value / totalGDP.value) * 100;

        return {
            latestTourismYear,
            tourismGDPValue: tourismGDP.value,
            GDPPercentage,
            gdpData: [
                { name: 'Tourism GDP', y: tourismGDP.value, color: '#4e79a7' },
                { name: 'Other GDP', y: otherGDP, color: '#f28e2c', dataLabels: { enabled: false } }
            ]
        };
    }

    function updateGDPChart() {
        const { latestTourismYear, tourismGDPValue, GDPPercentage, gdpData } = getLatestGDPComposition();

        if (!latestTourismYear) {
            console.error('Could not generate chart due to missing data.');
            return;
        }
        console.log(gdpData);

        const chartTitle = `$${tourismGDPValue.toFixed(1)} million (${GDPPercentage.toFixed(1)}%) of Yukon's GDP was attributable to tourism in ${latestTourismYear}.`;

        // Create GDP composition pie chart
        Highcharts.chart('gdp-pie-chart', {
            chart: { type: 'pie' },
            title: { text: chartTitle },
            tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
            accessibility: { point: { valueSuffix: '%' } },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.percentage:.1f}%' }
                }
            },
            series: [{ name: 'Share of GDP', colorByPoint: true, data: gdpData }]
        });
    }

    updateGDPChart();
});
