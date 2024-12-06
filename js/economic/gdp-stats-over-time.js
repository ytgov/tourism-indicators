import { loadCSVData } from '../utils/data-utils.js';

async function createGDPStatsChart() {
    try {
        const { data } = await loadCSVData('../../data/vw_gdp_stats.csv');
        
        // Process data into series
        const seriesData = {
            gdp: [],
            tourismGdp: [],
            tourismRevenue: [],
            lasrSpend: []
        };

        // Process each row of data
        data.forEach(row => {
            const [year, measure, sector, value] = row;
            const numYear = parseInt(year);
            const numValue = parseFloat(value);

            // Only include data from 2008 onwards
            if (numYear >= 2008) {
                switch(measure) {
                    case 'GDP':
                        if (sector === 'Total') {
                            seriesData.gdp.push([numYear, numValue]);
                        }
                        break;
                    case 'GDP attributable to tourism':
                        if (sector === 'Total') {
                            seriesData.tourismGdp.push([numYear, numValue]);
                        }
                        break;
                    case 'Gross revenues attributable to tourism':
                        if (sector === 'Total') {
                            seriesData.tourismRevenue.push([numYear, numValue]);
                        }
                        break;
                }
            }
        });

        // Sort data points by year
        Object.values(seriesData).forEach(series => series.sort((a, b) => a[0] - b[0]));

        // Create the chart
        Highcharts.chart('gdp-stats-chart', {
            chart: {
                type: 'line',
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'GDP and Tourism Statistics Over Time',
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
                }
            },
            yAxis: [{
                // Left y-axis for tourism metrics
                title: {
                    text: 'Tourism Values (Millions CAD)',
                    style: {
                        color: '#0d233a'
                    }
                },
                labels: {
                    format: '${value:,.0f}M',
                    style: {
                        color: '#0d233a'
                    }
                }
            }, {
                // Right y-axis for total GDP
                title: {
                    text: 'Total GDP (Millions CAD)',
                    style: {
                        color: '#2f7ed8'
                    }
                },
                labels: {
                    format: '${value:,.0f}M',
                    style: {
                        color: '#2f7ed8'
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true,
                formatter: function() {
                    let tooltip = '<b>Year: ' + this.x + '</b><br/>';
                    this.points.forEach(point => {
                        tooltip += point.series.name + ': $' + 
                                 Highcharts.numberFormat(point.y, 1) + 'M<br/>';
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
                spline: {
                    marker: {
                        enabled: true,
                        radius: 4
                    }
                }
            },
            series: [{
                name: 'Tourism GDP',
                data: seriesData.tourismGdp,
                color: '#0d233a',
                yAxis: 0,
                zIndex: 2
            }, {
                name: 'Tourism Revenue',
                data: seriesData.tourismRevenue,
                color: '#8bbc21',
                yAxis: 0,
                zIndex: 2
            },  
            {
                name: 'Total GDP',
                data: seriesData.gdp,
                color: '#2f7ed8',
                yAxis: 1,
                zIndex: 1
            }]
        });
    } catch (error) {
        console.error('Error creating GDP stats chart:', error);
    }
}

// Create chart when DOM is loaded
document.addEventListener('DOMContentLoaded', createGDPStatsChart);