import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const data = await loadCSVData('data/vw_kpi_sc_tourism_business_count.csv?' + Math.random());

        if (!data || !data.data) {
            console.error('No data available');
            return;
        }

        // Filter data to only include 'Total Tourism industry'
        const filteredData = {
            ...data,
            data: data.data.filter(row => row[3] === 'Total Tourism industry')
        };

        // Update metric cards with latest data
        function updateMetricCards() {
            //business counts
            const sortedData = [...filteredData.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
            const latestData = sortedData[0];

            

            if (!latestData) {
                console.error('No latest data available');
                return;
            }

            // Update latest monthly amount
            const latestMonthlyElement = document.getElementById('latest-monthly');
            const latestMonthlyDateElement = document.getElementById('latest-monthly-date');
            if (latestData) {
                const monthlyTotal = parseFloat(latestData[4]).toLocaleString();
                const date = new Date(latestData[0]);
                const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
                latestMonthlyElement.textContent = monthlyTotal;
                latestMonthlyDateElement.textContent = monthYear;
            }

            // Update YTD amount
            const ytdAmountElement = document.getElementById('ytd-amount');
            const ytdDateRangeElement = document.getElementById('ytd-date-range');
            if (latestData) {
                const ytdTotal = parseFloat(latestData[8]).toLocaleString();
                const date = new Date(latestData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();

                ytdAmountElement.textContent = ytdTotal;
                ytdDateRangeElement.textContent = `Jan - ${month} ${year}`;
            }

            // Update YTD change
            const ytdChangeElement = document.getElementById('ytd-change');
            if (latestData && latestData[9]) {
                const ytdChangeValue = parseFloat(latestData[9]);
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
            if (latestData[11]) {
                const ytdChangeValue2019 = parseFloat(latestData[11]);
                let color2019;
                if (ytdChangeValue2019 >= -1 && ytdChangeValue2019 <= 1) {
                    color2019 = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdChangeValue2019 > 1) {
                    color2019 = '#0f6723';  // Green for positive changes
                } else {
                    color2019 = '#a42330';  // Red for negative changes
                }
                const arrow2019 = createArrowSvg(ytdChangeValue2019);
                ytdChangeElement2019.innerHTML = `<span style="color: ${color2019};">${arrow2019}${ytdChangeValue2019.toFixed(1)}% y/y from 2019</span>`;
            }


        }


        const yearlyConfig = {
            chart: {
                type: 'column', // Vertical bar chart
                height: 400
            },
            title: {
                text: 'Estimated tourism business counts by year'
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
                        text: 'Business Counts'
                    },
                    opposite: false // Employment will be on the left
                }
            ],
            series: [],
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

        // Define industry order and colors
        const industryConfig = [
            { 
                name: 'Air Transportation', 
                key: 'Air transportation (tourism)', 
                color: '#b6c390' 
            },
            { 
                name: 'Other', 
                key: 'Other', 
                color: '#947b89' 
            },
            { 
                name: 'Recreation and Entertainment', 
                key: 'Recreation and entertainment (tourism)', 
                color: '#f2a900' 
            },
            { 
                name: 'Accommodation', 
                key: 'Accommodation (tourism)', 
                color: '#dc4405' 
            },
            { 
                name: 'Food and Beverage', 
                key: 'Food and beverage services (tourism)', 
                color: '#244c5a' 
            },

        ];

        // Update yearly config series with new order and colors
        yearlyConfig.series = industryConfig.map(industry => ({
            name: industry.name,
            data: [],
            color: industry.color,
            yAxis: 0
        }));

        // Prepare yearly data
        const currentYear = new Date().getUTCFullYear();

        const targetIndustries = [
            'Accommodation (tourism)', 
            'Air transportation (tourism)', 
            'Food and beverage services (tourism)', 
            'Recreation and entertainment (tourism)'
        ];

        const yearlyData = data.data.reduce((acc, row) => {
            const year = parseInt(row[1]);
            const month = parseInt(row[2]);
            const industry = row[3];
            const counts = parseFloat(row[4]);

            // Only process rows for December
            if (month === 12) {
                // Initialize year if not exists
                if (!acc[year]) {
                    acc[year] = {
                        'Total Tourism industry': 0,
                        'Accommodation (tourism)': 0,
                        'Air transportation (tourism)': 0,
                        'Food and beverage services (tourism)': 0,
                        'Recreation and entertainment (tourism)': 0
                    };
                }

                // Track total and specific industries
                if (industry === 'Total Tourism industry') {
                    acc[year]['Total Tourism industry'] = counts;
                }

                if (targetIndustries.includes(industry)) {
                    acc[year][industry] = counts;
                }
            }

            return acc;
        }, {});


        // Populate yearly chart data
        const seriesData = {};
        industryConfig.forEach(industry => {
            seriesData[industry.name] = [];
        });

        Object.entries(yearlyData).forEach(([year, data]) => {
            // Calculate 'Other' by subtracting known industries from total
            const otherCount = data['Total Tourism industry'] - (
                data['Accommodation (tourism)'] + 
                data['Air transportation (tourism)'] + 
                data['Food and beverage services (tourism)'] + 
                data['Recreation and entertainment (tourism)']
            );

            // Populate series data in the specified order
            seriesData['Air Transportation'].push({
                name: year,
                y: data['Air transportation (tourism)'] || 0
            });
            seriesData['Recreation and Entertainment'].push({
                name: year,
                y: data['Recreation and entertainment (tourism)'] || 0
            });
            seriesData['Accommodation'].push({
                name: year,
                y: data['Accommodation (tourism)'] || 0
            });
            seriesData['Food and Beverage'].push({
                name: year,
                y: data['Food and beverage services (tourism)'] || 0
            });
            seriesData['Other'].push({
                name: year,
                y: otherCount
            });
        });

        // Update series data in the new order
        industryConfig.forEach((industry, index) => {
            yearlyConfig.series[index].data = seriesData[industry.name];
        });

        // Initialize charts
        const yearlyChart = Highcharts.chart('yearly-chart', yearlyConfig); // Default Highcharts

        // Update metrics immediately
        updateMetricCards();

        // Add tab change listener to refresh charts
        $('#data-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if (e.target.id === 'by-year-tab') {
                yearlyChart.reflow(); // Ensure yearly chart updates when tab is shown
            }
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});
