import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const data = await loadCSVData('data/vw_kpi_economic_accommodation_and_food_employment.csv?'+Math.random());
        const earningsData = await loadCSVData('data/vw_kpi_economic_accommodation_and_food_weekly_earnings.csv?'+Math.random());
        

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
            const ytdDateRangeElement2019 = document.getElementById('ytd-date-range-2019');
            if (latestData) {
                const ytdTotal = parseFloat(latestData[6]).toLocaleString();
                const date = new Date(latestData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getUTCFullYear();
                
                ytdAmountElement.textContent = ytdTotal;
                ytdDateRangeElement.textContent = `Jan - ${month} ${year}`;
                ytdDateRangeElement2019.textContent = `From 2019`;
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

            // Update 2019 change
            const ytdChangeElement2019 = document.getElementById('ytd-change-2019');
            if (latestData[10]) {
                const ytdChangeValue2019 = parseFloat(latestData[10]);
                let color2019;
                if (ytdChangeValue2019 >= -1 && ytdChangeValue2019 <= 1) {
                    color2019 = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdChangeValue2019 > 1) {
                    color2019 = '#0f6723';  // Green for positive changes
                } else {
                    color2019 = '#a42330';  // Red for negative changes
                }
                const arrow2019 = createArrowSvg(ytdChangeValue2019);
                ytdChangeElement2019.innerHTML = `<span style="color: ${color2019};">${arrow2019}${ytdChangeValue2019.toFixed(1)}% y/y</span>`;
            }

            // Update Average weekly earnings
            const ytdEarningsAmountElement = document.getElementById('ytd-earn-amount');
            const ytdEarningsDateRangeElement = document.getElementById('ytd-earn-date-range');
            const ytdEarningsDateRangeElement2019 = document.getElementById('ytd-earn-date-range-2019');
            if (latestEData) {
                const ytdTotal = parseFloat(latestEData[6]).toLocaleString();
                const date = new Date(latestEData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getUTCFullYear();
                
                ytdEarningsAmountElement.textContent = `$${ytdTotal}`;
                ytdEarningsDateRangeElement.textContent = `Jan - ${month} ${year}`;
                ytdEarningsDateRangeElement2019.textContent = `From 2019`;
            }


            const ytdEarningsChangeElement = document.getElementById('ytd-earn-change');
            if (latestEData && latestEData[8]) {
                const ytdEChangeValue = parseFloat(latestEData[8]);
                let color;
                if (ytdEChangeValue >= -1 && ytdEChangeValue <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdEChangeValue > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(ytdEChangeValue);
                ytdEarningsChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${ytdEChangeValue.toFixed(1)}% y/y</span>`;
            }

            const ytdEarningsChangeElement2019 = document.getElementById('ytd-earn-change-2019');
            if (latestEData[10]) {
                const ytdEChangeValue2019 = parseFloat(latestEData[10]);
                let color2019;
                if (ytdEChangeValue2019 >= -1 && ytdEChangeValue2019 <= 1) {
                    color2019 = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdEChangeValue2019 > 1) {
                    color2019 = '#0f6723';  // Green for positive changes
                } else {
                    color2019 = '#a42330';  // Red for negative changes
                }
                const arrow2019 = createArrowSvg(ytdEChangeValue2019);
                ytdEarningsChangeElement2019.innerHTML = `<span style="color: ${color2019};">${arrow2019}${ytdEChangeValue2019.toFixed(1)}% y/y</span>`;
            }
        }

        // Initialize charts for both views
        const monthlyConfig = {
            ...datasetConfigs.accommodationEmployment,
            dataFile: 'data/vw_kpi_economic_accommodation_and_food_employment.csv?'+Math.random()
        };
        // Initialize charts for both views
        const monthlyConfig2 = {
            ...datasetConfigs.accommodationEarnings,
            dataFile: 'data/vw_kpi_economic_accommodation_and_food_weekly_earnings.csv?'+Math.random()
        };

        const yearlyConfig = {
            chart: {
                type: 'column', // Vertical bar chart
                height: 400
            },
            title: {
                text: 'Average monthly employment and weekly earnings in accommodation and food services'
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
                        text: 'Weekly earnings'
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
                    name: 'Weekly earnings',
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
