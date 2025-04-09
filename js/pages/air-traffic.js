import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const data = await loadCSVData('data/vw_kpi_air_arrivals_ytd_summary.csv?'+Math.random());
        
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
                const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
                const year = date.getUTCFullYear();
                
                ytdAmountElement.textContent = ytdTotal;
                ytdDateRangeElement.textContent = `January - ${month} ${year}`;
            }

            // Update YTD change
            const ytdChangeElement = document.getElementById('ytd-change');
            if (latestData && latestData[8]) {
                const ytdChangeValue = parseFloat(latestData[8]);
                let color;
                if (ytdChangeValue >= -1 && ytdChangeValue <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdChangeValue > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(ytdChangeValue);
                ytdChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${ytdChangeValue.toFixed(1)}% y/y</span>`;
            }

            // Update 2019 comparison
            const c2019ChangeElement = document.getElementById('c2019-change');
            if (latestData && latestData[9]) {
                const c2019ChangeValue = parseFloat(latestData[10]);
                let color;
                if (c2019ChangeValue >= -1 && c2019ChangeValue <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (c2019ChangeValue > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(c2019ChangeValue);
                c2019ChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${c2019ChangeValue.toFixed(1)}% from 2019</span>`;
            }
        }

        // Initialize charts for both views
        const monthlyConfig = {
            ...datasetConfigs.airArrivals,
            dataFile: 'data/vw_kpi_air_arrivals_ytd_summary.csv?'+Math.random()
        };

        const yearlyConfig = {
            chart: {
                type: 'column', 
                height: 400 
            },
            title: {
                text: 'Yearly airport arrivals'
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Year',
                }
            },
            yAxis: {
                title: {
                    text: 'Total Arrivals'
                }
            },
            series: [
                {
                    name: 'Arrivals',
                    data: [],
                    color: '#244c5a'
                }
            ],
            tooltip: {
                pointFormat: 'Arrivals: <b>{point.y}</b>'
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
