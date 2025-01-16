import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';

// Function to create arrow SVG
function createArrowSvg(isPositive) {
    return `<svg class="svg-arrow" width="20" height="20" viewBox="0 0 448 512" style="transform: ${isPositive ? 'none' : 'rotate(180deg)'}">
        <path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5-9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3-9.8-24.8-10-34.3.4z"></path>
    </svg>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const data = await loadCSVData('data/vw_kpi_economic_retail_spending.csv');
        
        if (!data || !data.data) {
            console.error('No data available');
            return;
        }

        // Update metric cards with latest data
        function updateMetricCards() {
            const sortedData = [...data.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
            const latestData = sortedData[0];
            
            if (!latestData) {
                console.error('No latest data available');
                return;
            }

            // Update latest monthly amount
            const latestMonthlyElement = document.getElementById('latest-monthly');
            const latestMonthlyDateElement = document.getElementById('latest-monthly-date');
            if (latestData) {
                const monthlyTotal = '$' + (parseFloat(latestData[3]) / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';
                const date = new Date(latestData[0]);
                const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
                latestMonthlyElement.textContent = monthlyTotal;
                latestMonthlyDateElement.textContent = monthYear;
            }

            // Update YTD amount
            const ytdAmountElement = document.getElementById('ytd-amount');
            const ytdDateRangeElement = document.getElementById('ytd-date-range');
            if (latestData) {
                const ytdTotal = '$' + (parseFloat(latestData[6]) / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';
                const date = new Date(latestData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();
                
                ytdAmountElement.textContent = ytdTotal;
                ytdDateRangeElement.textContent = `Jan - ${month} ${year}`;
            }

            // Update YTD change
            const ytdChangeElement = document.getElementById('ytd-change');
            if (latestData && latestData[8]) {
                const ytdChangeValue = parseFloat(latestData[8]);
                let color;
                if (ytdChangeValue >= -1 && ytdChangeValue <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdChangeValue > 1) {
                    color = '#28a745';  // Green for positive changes
                } else {
                    color = '#dc3545';  // Red for negative changes
                }
                const arrow = createArrowSvg(ytdChangeValue >= 0);
                ytdChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${ytdChangeValue.toFixed(1)}%</span>`;
            }
        }

        // Initialize charts for both views
        const monthlyConfig = {
            ...datasetConfigs.retailSpending,
            dataFile: 'data/vw_kpi_economic_retail_spending.csv',
            
        };

        const yearlyConfig = {
            chart: {
                type: 'column' // Vertical bar chart
            },
            title: {
                text: 'Yearly Retail Sales'
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Year',
                }
            },
            yAxis: {
                title: {
                    text: 'Total Sales ($M)'
                }
            },
            series: [
                {
                    name: 'Sales',
                    data: [],
                    color: '#244c5a'
                }
            ],
            tooltip: {
                formatter: function () {
                    return 'Sales: <b>$' + Highcharts.numberFormat(this.y/1000000, 1) + 'M</b>';
                }
            },
            time: {
                timezone: 'UTC' // Ensure data uses UTC
            },
            credits: {
                enabled: false
            }
            ,
            plotOptions: {
                column: {
                    stacking: 'normal',
                    pointPadding: 0.1,
                    groupPadding: 0
                }
            }
        };

        // Prepare yearly data
        const currentYear = new Date().getUTCFullYear();

        const yearlyData = data.data.reduce((acc, row) => {
            const date = new Date(row[0]);
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth() + 1; // JavaScript months are zero-based (0 = January, 11 = December)
            const arrivals = parseFloat(row[3]);
        
            // Check if the year is already being processed
            if (!acc[year]) {
                // Check if there is a row for December for this year
                const hasDecember = data.data.some(r => {
                    const rDate = new Date(r[0]);
                    return rDate.getUTCFullYear() === year && rDate.getUTCMonth() === 11; // December
                });
        
                if (!hasDecember) {
                    // Skip this year if it does not have a December row
                    return acc;
                }
        
                // Initialize the year in the accumulator
                acc[year] = 0;
            }
        
            // Add arrivals to the year
            acc[year] += arrivals;
        
            return acc;
        }, {});

        // Populate yearly chart data
        yearlyConfig.series[0].data = Object.entries(yearlyData).map(([year, total]) => ({
            name: year.toString(),
            y: total
        }));

        // Initialize charts
        const yearlyChart = Highcharts.chart('yearly-chart', yearlyConfig); // Default Highcharts
        const monthlyChart = new ChartBuilder('indicator-chart', monthlyConfig);

        await monthlyChart.initialize();

        // Update metrics immediately
        updateMetricCards();

        // Add tab change listener to refresh charts
        $('#data-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if (e.target.id === 'by-year-tab') {
                yearlyChart.reflow(); // Ensure yearly chart updates when tab is shown
            } else if (e.target.id === 'by-month-tab') {
                monthlyChart.chart.reflow();
            }
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});
