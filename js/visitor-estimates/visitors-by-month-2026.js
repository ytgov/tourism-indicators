import { createArrowSvg } from '../utils/svg-utils.js';
import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js'; // Import datasetConfigs

document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_tc_vis_estimates_by_month_2026.csv?"+Math.random();

    // Fetch and process data
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            const rows = csvText.split('\n')
                .map(row => row.split(','));

            // Remove header row
            //rows.shift();

            // Parse data and ensure it's sorted by date ascending
            const data = rows
                .filter(row => row.length > 1) 
                .map(row => ({
                    date: new Date(row[0].replace(/"/g, '')),
                    visitors: parseInt(row[1]) || 0
                }))
                .filter(item => !isNaN(item.date) && !isNaN(item.visitors))
                .sort((a, b) => a.date - b.date); // Sort by date ascending

            // Double check the sort before passing to functions
            data.sort((a, b) => a.date - b.date);

            // Prepare and render chart
            const seriesData = data.map(item => [item.date.getTime(), item.visitors]);
            renderChart(seriesData);



        })
        .catch(error => {
            console.error('Error loading or processing data:', error);
            const container = document.getElementById('monthly-chart');
            if (container) {
                container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
            }
        });

        function renderChart(seriesData) {
            Highcharts.stockChart("monthly-chart", {
                chart: {
                    height: 400
                },
                title: {
                    text: "Monthly visitors"
                },
                rangeSelector: {
                    buttons: [
                        {
                            type: 'month',
                            count: 6,
                            text: '6m'
                        },
                        {
                            type: 'year',
                            count: 1,
                            text: '1y'
                        },
                        {
                            type: 'all',
                            text: 'All'
                        }
                    ],
                    selected: 2 // Default to YTD
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value:%b %Y}'
                    },
                    title: {
                        text: "Date"
                    }
                },
                yAxis: {
                    opposite: false, // Puts labels on the left
                },
                series: [{
                    name: "Monthly Total",
                    data: seriesData,
                    color: '#3a97a9',
                    tooltip: {
                        valueDecimals: 0,
                        valueSuffix: ""
                    }
                }],
                credits: { enabled: false },
                tooltip: {
                    valueDecimals: 0,
                    pointFormatter: function () {
                        return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${this.y.toLocaleString()} visitors</b><br/>`;
                    }
                }
            });
        }
        
});
