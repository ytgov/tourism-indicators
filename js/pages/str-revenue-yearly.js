import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const data = await loadCSVData('data/vw_kpi_str_rev_ytd_summary.csv?'+Math.random());
        
        if (!data || !data.data) {
            console.error('No data available');
            return;
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
                text: 'Short term rental revenue by year'
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Year',
                }
            },
            yAxis: {
                title: {
                    text: 'Revenue'
                }
            },
            series: [
                {
                    name: 'Revenue',
                    data: [],
                    color: '#244c5a'
                }
            ],
            tooltip: {
                pointFormat: 'Revenue: <b>${point.y}</b>'
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
            const revenue = Math.round(parseFloat(row[3]));
        
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
        
            // Add revenue to the year
            acc[year] += revenue;
        
            return acc;
        }, {});

        // Populate yearly chart data
        yearlyConfig.series[0].data = Object.entries(yearlyData).map(([year, total]) => ({
            name: year.toString(),
            y: total
        }));

        // Initialize charts
        const yearlyChart = Highcharts.chart('revenue-chart', yearlyConfig); // Default Highcharts
        //const monthlyChart = new ChartBuilder('indicator-chart', monthlyConfig);

        //await monthlyChart.initialize();

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
