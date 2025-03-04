import { loadCSVData } from '../utils/data-utils.js';

async function createGDPStatsChart() {
    try {
        const { data } = await loadCSVData('./data/vw_kpi_tc_revenue_estimates_revised.csv?' + Math.random());

        // Process data into series
        const seriesData = {
            value: [],
            range: [],
            target: []
        };

        let lastActualYear = null;
        let lastActualValue = null;
        let firstEstimateYear = null;
        let firstEstimateLow = null;
        let firstEstimateHigh = null;

        // First pass: Find the last 'Actual' year and first available estimate
        data.forEach(row => {
            const [year, value, low_estimate, high_estimate, type, target] = row;
            const numYear = parseInt(year);
            const numValue = parseFloat(value);
            const numLow = low_estimate ? parseFloat(low_estimate) : null;
            const numHigh = high_estimate ? parseFloat(high_estimate) : null;

            if (type === 'Actual') {
                lastActualYear = Math.max(lastActualYear || 0, numYear);
                lastActualValue = numValue;
            }

            if (type === 'Estimate' && firstEstimateYear === null) {
                firstEstimateYear = numYear;
                firstEstimateLow = numLow;
                firstEstimateHigh = numHigh;
            }
        });

        // Second pass: Process the data and apply the condition for the range
        data.forEach(row => {
            const [year, value, low_estimate, high_estimate, type, target] = row;
            const numYear = parseInt(year);
            const numValue = parseFloat(value);
            const numLow = low_estimate ? parseFloat(low_estimate) : null;
            const numHigh = high_estimate ? parseFloat(high_estimate) : null;
            const numTarget = target ? parseFloat(target) : null;

            // Include data from 2018 onwards
            if (numYear >= 2018) {
                // Line series for actual/estimated values
                seriesData.value.push({
                    x: numYear,
                    y: numValue,
                    dataLabels: {
                        enabled: true,
                        format: `$${Highcharts.numberFormat(numValue, 1)}M`,
                        style: {
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }
                    }
                });
                
                

                // Extend the range to smoothly transition after last 'Actual' year
                if (numYear === lastActualYear && firstEstimateYear) {
                    seriesData.range.push([numYear, lastActualValue, lastActualValue]); // Flat at last actual value
                }
                
                // Area range series (only after last 'Actual' year)
                if (numLow !== null && numHigh !== null && numYear >= lastActualYear) {
                    seriesData.range.push([numYear, numLow, numHigh]);
                }

                // Target values as dashed line
                if (numTarget !== null) {
                    seriesData.target.push([numYear, numTarget]);
                }
            }
        });

        // Sort data points by year
        Object.values(seriesData).forEach(series => series.sort((a, b) => a[0] - b[0]));

        // Create the chart
        Highcharts.chart('revenue-targets', {
            chart: {
                type: 'line'
            },
            credits: {
                enabled: false
            },
            title: {
                text: 'Gross business revenue attributed to tourism in the Yukon',
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
                min: 2018,
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
                    let tooltip = `<b>Year: ${this.x}</b><br/>`;
                    
                    let estimatedRevenue = '';
                    let estimateRange = '';
                    let targetValue = '';
            
                    this.points.forEach(point => {
                        if (point.series.type === 'arearange') {
                            estimateRange = `Estimate range: $${Highcharts.numberFormat(point.point.low, 1)}M - $${Highcharts.numberFormat(point.point.high, 1)}M<br/>`;
                        } else if (point.series.name.includes('Gross business revenue')) {
                            estimatedRevenue = `Gross business revenue attributable to tourism: $${Highcharts.numberFormat(point.y, 1)}M<br/>`;
                        } else if (point.series.name.includes('Target')) {
                            targetValue = `Target: $${Highcharts.numberFormat(point.y, 1)}M<br/>`;
                        }
                    });
            
                    return tooltip + estimatedRevenue + estimateRange + targetValue;
                }
            }
            
            ,
            legend: {
                enabled: true,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0,
                reversed: true
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: true,
                        radius: 4
                    }
                }
            },
            series: [
                {
                    type: 'arearange',
                    name: 'Estimate range',
                    data: seriesData.range,
                    color: '#3A97A9',
                    fillOpacity: 0.4,
                    zIndex: 1,
                    marker: {
                        enabled: false
                    }
                },
                {
                    type: 'line',
                    name: 'Gross business revenue attributed to tourism',
                    data: seriesData.value,
                    color: '#244C5A',
                    zIndex: 3,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return `$${Highcharts.numberFormat(this.y, 1)}M`;
                        },
                        allowOverlap: true,
                        style: {
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }
                    }
                }
                
                ,
                {
                    type: 'line',
                    name: 'Target',
                    data: seriesData.target,
                    color: '#231F20',
                    dashStyle: 'Dash',
                    marker: {
                        enabled: false
                    },
                    zIndex: 2
                }
            ]
        });
    } catch (error) {
        console.error('Error creating GDP stats chart:', error);
    }
}

// Create chart when DOM is loaded
document.addEventListener('DOMContentLoaded', createGDPStatsChart);
