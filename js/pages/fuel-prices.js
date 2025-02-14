import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const data = await loadCSVData('data/vw_kpi_sc_gas_prices_ytd_summary.csv?'+Math.random());
        
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
                const monthlyTotal = parseFloat(latestData[3]).toLocaleString()+ ' c/L';
                const date = new Date(latestData[0]);
                const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
                latestMonthlyElement.textContent = monthlyTotal;
                latestMonthlyDateElement.textContent = monthYear;
            }

            // Update YTD amount
            const ytdAmountElement = document.getElementById('ytd-amount');
            const ytdDateRangeElement = document.getElementById('ytd-date-range');
            if (latestData) {
                const ytdTotal = parseFloat(latestData[6]).toLocaleString() + ' c/L';
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
                if (ytdChangeValue > -1 && ytdChangeValue < 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdChangeValue > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(ytdChangeValue);
                ytdChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${ytdChangeValue.toFixed(1)}%</span>`;
            }
        }

        // Initialize charts for both views
        const monthlyConfig = {
            ...datasetConfigs.scFuelPrices
        };


        const yearlyConfig = {
            chart: {
                type: 'column' // Vertical bar chart
            },
            title: {
                text: 'Average Price for Regular Gasoline'
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Year'
                }
            },
            yAxis: {
                title: {
                    text: 'Price (c/L)'
                }
            },
            series: [
                {
                    name: 'Regular Gasoline',
                    data: [],
                    color: '#244c5a'
                }
            ],
            tooltip: {
                pointFormat: 'Price (c/L): <b>{point.y}</b>'
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
            const month = date.getUTCMonth() + 1; // getUTCMonth returns 0-based month
            const cost = parseFloat(row[6]);
        
            // Only include data for the 12th month of each year, excluding the current year
            if (month === 12 && year < currentYear) {
                acc[year] = (acc[year] || 0) + cost;
            }
        
            return acc;
        }, {});
        
        //console.log(yearlyData);
        
        // Populate yearly chart data
        yearlyConfig.series[0].data = Object.entries(yearlyData).map(([year, total]) => ({
            name: year.toString(),
            y: total
        }));

        const yearlyChart = Highcharts.chart('yearly-chart', yearlyConfig); // Default Highcharts
        const monthlyChart = new ChartBuilder('indicator-chart', monthlyConfig);

        await monthlyChart.initialize();

        // Update metrics immediately
        updateMetricCards();

        // Add tab change listener to refresh charts
        $('#data-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if (e.target.id === 'by-year-tab') {
                //yearlyChart.reflow(); // Ensure yearly chart updates when tab is shown
            } else if (e.target.id === 'by-month-tab') {
                monthlyChart.chart.reflow();
            }
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});
