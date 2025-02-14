import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const data = await loadCSVData("/data/vw_kpi_wlws_highway_counts_ytd_summary.csv?"+Math.random());
        
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
            ...datasetConfigs.vicVisitors,
            dataFile: 'data/vw_kpi_wlws_highway_counts_ytd_summary.csv?'+Math.random()
        };

        // Define desired order
        const desiredOrder = [
            "Airport",
            "Beaver Creek VIC",
            "Carcross public washroom",
            "Watson Lake VIC",
            "Haines Junction VIC",
            "Carcross VIC",
            "Dawson VIC",
            "Whitehorse VIC"
        ];

        const colors = [
            "#7a9a01",
            "#97c1cd",
            "#b6c390",
            "#947b89",
            "#f2a900",
            "#dc4405",
            "#244c5a"
        ];

        const yearlyConfig = {
            chart: {
                type: 'column' // Vertical bar chart
            },
            title: {
                text: 'YearlyVisitor Information Traffic'
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Year'
                }
            },
            yAxis: {
                title: {
                    text: 'Total Visitors'
                }
            },
            series: [
                {
                    name: 'Visitors',
                    data: [],
                    color: '#244c5a'
                }
            ],
            tooltip: {
                pointFormat: 'Visitors: <b>{point.y}</b>'
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
            const year = new Date(row[0]).getUTCFullYear();
            const arrivals = parseFloat(row[3]);
            
            // Exclude the most recent year
            if (year < currentYear) {
                acc[year] = (acc[year] || 0) + arrivals;
            }

            return acc;
        }, {});

        // Populate yearly chart data
        yearlyConfig.series[0].data = Object.entries(yearlyData).map(([year, total]) => ({
            name: year.toString(),
            y: total
        }));

        //const yearlyChart = Highcharts.chart('yearly-chart2', yearlyConfig); // Default Highcharts
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
