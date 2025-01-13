import { loadCSVData } from '../utils/data-utils.js';

async function createGDPStatsChart() {
    try {
        const { data } = await loadCSVData('../../data/vw_kpi_tc_revenue_estimates_adj_inflation_2024.csv');
        
        // Process data into series
        const seriesData = {
            target: [],
            actual: [],
            estimated: [],
            forecast: []
        };

        const actualYears = new Set();

        // Process each row of data
        data.forEach(row => {
            const [year, value, adjusted_value, type, notes] = row;
            const numYear = parseInt(year);
            const numValue = parseFloat(adjusted_value);
            const currentYear = new Date().getFullYear();

            // Only include data from 2016 onwards
            if (numYear > 2016 && numYear <= currentYear+1) {
                switch (type) {
                    case 'Target Revenue':
                        seriesData.target.push([numYear, numValue]);
                        break;
                    case 'Actual revenue':
                        seriesData.actual.push([numYear, numValue]);
                        actualYears.add(numYear); // Track years with actual revenue
                        break;
                    case 'Estimated revenue':
                        // Only include Estimated Revenue if Actual Revenue doesn't exist for the year
                        if (!actualYears.has(numYear)) {
                            seriesData.estimated.push([numYear, numValue]);
                        }
                        break;
                    case 'Forecast revenue':
                        seriesData.forecast.push([numYear, numValue]);
                        break;
                }
            }
        });


        // Sort data points by year
        Object.values(seriesData).forEach(series => series.sort((a, b) => a[0] - b[0]));

        // Create the chart
        Highcharts.chart('revenue-targets', {
            chart: {
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            credits:{
                enabled: false
            },
            title: {
                text: 'Gross Business Revenue attributed to Tourism in Yukon',
                style: {
                    fontSize: '20px',
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                title: {
                    text: 'Year'
                },
                type: 'linear',
                labels: {
                    format: '{value}'
                },
                min: 2017.5,
                maxPadding: 0.05
            },
            yAxis: {
                title: {
                    text: 'Revenue (Millions CAD)'
                },
                labels: {
                    formatter: function () {
                        return `$${Highcharts.numberFormat(this.value, 0)}M`;
                    }
                }
            },
            tooltip: {
                shared: true,
                formatter: function () {
                    let tooltip = '<b>Year: ' + this.x + '</b><br/>';
                    this.points.forEach(point => {
                        tooltip += `${point.series.name}: $${Highcharts.numberFormat(point.y, 1)}M<br/>`;
                    });
                    return tooltip;
                }
            },
            legend: {
                enabled: true,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },
            plotOptions: {
                series:{
                    grouping: false,
                    pointPlacement: 0,
                    pointwidth: 15
                },
                column: {
                    borderWidth: 0,
                    pointPlacement: 'on',
                    pointPadding: 0.2,
                    groupPadding: 0,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return `$${Highcharts.numberFormat(this.y, 1)}M`;
                        }
                    }
                },
                line: {
                    marker: {
                        enabled: true,
                        radius: 4
                    }
                }
            },
            series: [{
                type: 'line',
                name: 'Target',
                data: seriesData.target,
                color: '#231F20',
                dashStyle: 'Dash',
                marker:{
                    enabled: false
                },
                zIndex: 3
            }, {
                type: 'column',
                name: 'Actual',
                data: seriesData.actual,
                color: '#244C5A',
                zIndex: 2
            }, {
                type: 'column',
                name: 'Estimated',
                data: seriesData.estimated,
                color: '#3B97AB',
                zIndex: 2
            }, {
                type: 'column',
                name: 'Forecast',
                data: seriesData.forecast,
                color: 'rgba(59, 151, 171, 0.5)',
                borderColor: '#3B97AB',
                borderWidth: 2,
                dashStyle: 'Dash',
                zIndex: 2
            },]
        });
    } catch (error) {
        console.error('Error creating GDP stats chart:', error);
    }
}

// Create chart when DOM is loaded
document.addEventListener('DOMContentLoaded', createGDPStatsChart);
