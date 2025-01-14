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
        const data = await loadCSVData('data/vw_kpi_economic_accommodation_and_food_employment.csv');
        const earningsData = await loadCSVData('data/vw_kpi_economic_accommodation_and_food_weekly_earnings.csv');
        

        if (!data || !data.data) {
            console.error('No data available');
            return;
        }

        // Update metric cards with latest data
        function updateMetricCards() {
            //employment
            const sortedData = [...data.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
            const latestData = sortedData[0];

            //earnings
            const sortedEData = [...earningsData.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
            const latestEData = sortedEData[0];
            
            if (!latestData) {
                console.error('No latest data available');
                return;
            }

            // Update latest monthly amount
            const latestMonthlyElement = document.getElementById('latest-monthly');
            const latestMonthlyDateElement = document.getElementById('latest-monthly-date');
            if (latestData) {
                const monthlyTotal = parseFloat(latestData[3]).toLocaleString();
                const date = new Date(latestData[0]);
                const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
                latestMonthlyElement.textContent = monthlyTotal;
                latestMonthlyDateElement.textContent = monthYear;
            }

            // Update YTD amount
            const ytdAmountElement = document.getElementById('ytd-amount');
            const ytdDateRangeElement = document.getElementById('ytd-date-range');
            if (latestData) {
                const ytdTotal = parseFloat(latestData[6]).toLocaleString();
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

            // Update Average Weekly Earnings
            const ytdEarningsAmountElement = document.getElementById('ytd-earn-amount');
            const ytdEarningsDateRangeElement = document.getElementById('ytd-earn-date-range');
            if (latestEData) {
                const ytdTotal = parseFloat(latestEData[6]).toLocaleString();
                const date = new Date(latestEData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();
                
                ytdEarningsAmountElement.textContent = `$${ytdTotal}`;
                ytdEarningsDateRangeElement.textContent = `Jan - ${month} ${year}`;
            }


            const ytdEarningsChangeElement = document.getElementById('ytd-earn-change');
            if (latestEData && latestEData[8]) {
                const ytdEChangeValue = parseFloat(latestEData[8]);
                let color;
                if (ytdEChangeValue >= -1 && ytdEChangeValue <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdEChangeValue > 1) {
                    color = '#28a745';  // Green for positive changes
                } else {
                    color = '#dc3545';  // Red for negative changes
                }
                const arrow = createArrowSvg(ytdEChangeValue >= 0);
                ytdEarningsChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${ytdEChangeValue.toFixed(1)}%</span>`;
            }
        }

        // Initialize charts for both views
        const monthlyConfig = {
            ...datasetConfigs.accommodationEmployment,
            dataFile: 'data/vw_kpi_economic_accommodation_and_food_employment.csv'
        };
        // Initialize charts for both views
        const monthlyConfig2 = {
            ...datasetConfigs.accommodationEarnings,
            dataFile: 'data/vw_kpi_economic_accommodation_and_food_weekly_earnings.csv'
        };

        const yearlyConfig = {
            chart: {
                type: 'column' // Vertical bar chart
            },
            title: {
                text: 'Average Monthly Employment and Weekly Earnings in Accommodation and Food Services'
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Year',
                }
            },
            yAxis: [
                {
                    title: {
                        text: 'Employment'
                    },
                    opposite: false // Employment will be on the left
                },
                {
                    title: {
                        text: 'Weekly Earnings'
                    },
                    opposite: true // Weekly earnings will be on the right
                }
            ],
            series: [
                {
                    name: 'Employment',
                    data: [],
                    color: '#244c5a',
                    yAxis: 0 // Maps to the first y-axis
                },
                {
                    name: 'Weekly Earnings',
                    data: [],
                    color: '#f39c12',
                    type: 'spline', // Line type for earnings
                    yAxis: 1 // Maps to the second y-axis
                }
            ],
            tooltip: {
                shared: true,
                formatter: function () {
                    let tooltip = `<b>${this.x}</b><br/>`;
                    this.points.forEach(point => {
                        tooltip += `${point.series.name}: <b>${point.y}</b><br/>`;
                    });
                    return tooltip;
                }
            },
            time: {
                timezone: 'UTC' // Ensure data uses UTC
            },
            credits: {
                enabled: false
            },
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
            const month = date.getUTCMonth(); // Zero-based: 11 = December
        
            // Only process rows for December
            if (month === 11) {
                const arrivals = parseFloat(row[6]);
                // Set the December arrivals value for the year in the accumulator
                acc[year] = arrivals;
            }
        
            return acc;
        }, {});


        const yearlyEarningsData = earningsData.data.reduce((acc, row) => {
            const date = new Date(row[0]);
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth(); // Zero-based: 11 = December
        
            // Only process rows for December
            if (month === 11) {
                const earnings = parseFloat(row[6]);
                // Set the December earnings value for the year in the accumulator
                acc[year] = earnings;
            }
        
            return acc;
        }, {});

        // Populate yearly chart data
        yearlyConfig.series[0].data = Object.entries(yearlyData).map(([year, total]) => ({
            name: year.toString(),
            y: total
        }));

        yearlyConfig.series[1].data = Object.entries(yearlyEarningsData).map(([year, total]) => ({
            name: year.toString(),
            y: total
        }));

        // Initialize charts
        const yearlyChart = Highcharts.chart('yearly-chart', yearlyConfig); // Default Highcharts
        const monthlyChart = new ChartBuilder('indicator-chart', monthlyConfig);
        const monthlyChart2 = new ChartBuilder('indicator-chart2', monthlyConfig2);

        await monthlyChart.initialize();
        await monthlyChart2.initialize();

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
