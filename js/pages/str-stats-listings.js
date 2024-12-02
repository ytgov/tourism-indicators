import { loadCSVData } from '../utils/data-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const containerId = 'listings-chart';

        const config = {
            id: 'str-stats',
            title: 'Occupancy Rate and Available Listings',
            dataFiles: {
                occupancy: '/data/vw_kpi_str_occupancy_ytd_summary.csv',
                listings: '/data/vw_kpi_str_available_listings_ytd_summary.csv'
            },
            series: {
                occupancy: {
                    name: 'Occupancy Rate',
                    yAxis: 0, // Left axis
                    tooltip: { valueFormat: 'percentage' },
                    color: '#244c5a'
                },
                listings: {
                    name: 'Available Listings',
                    yAxis: 1, // Right axis
                    color: '#dc4405'
                }
            },
            yAxes: [
                {
                    title: { text: 'Occupancy Rate (%)' },
                    labels: {
                        formatter: function () {
                            return `${this.value}%`;
                        }
                    },
                    opposite: false
                },
                {
                    title: { text: 'Available Listings' },
                    labels: {
                        formatter: function () {
                            return `${this.value}`;
                        }
                    },
                    opposite: true
                }
            ]
        };

        const data = await loadAllData(config.dataFiles);
        //console.log(data);

        const chartData = processChartData(data);

        createChart(containerId, config, chartData);

        // Add tab change listener to refresh charts
        $('#data-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if (e.target.id === 'by-year-tab') {
                // Future yearly chart logic
            } else if (e.target.id === 'by-month-tab') {
                Highcharts.charts.forEach(chart => chart?.reflow());
            }
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});

/**
 * Load multiple CSV files and sort data by date.
 */
async function loadAllData(dataFiles) {
    const data = {};
    for (const [key, file] of Object.entries(dataFiles)) {
        const dataset = await loadCSVData(file);
        if (dataset && dataset.data) {
            dataset.data.sort((a, b) => new Date(a[0]) - new Date(b[0]));
        }
        data[key] = dataset;
    }
    return data;
}

/**
 * Process data for each series into [timestamp, value] format.
 */
function processChartData(data) {
    const seriesData = {};

    // Iterate over the datasets
    for (const [key, dataset] of Object.entries(data)) {
        if (!dataset.data || !dataset.headers) {
            console.error(`Dataset for ${key} is not correctly formatted`, dataset);
            continue;
        }

        // Map rows to objects using headers
        const mappedData = dataset.data.map(row => {
            const obj = {};
            dataset.headers.forEach((header, index) => {
                const cleanHeader = header.trim().replace(/\r$/, ""); // Clean header names
                obj[cleanHeader] = row[index];
            });
            return obj;
        });

        // Process mapped data for chart series
        seriesData[key] = mappedData.map(row => {
            let value;
            switch(key) {
                case 'occupancy':
                    value = parseFloat(row.monthly_avg_occupancy_rate);
                    break;
                case 'listings':
                    value = parseFloat(row.monthly_avg_available_listings);
                    break;
            }
            return [
                new Date(row.date).getTime(), // Convert date to timestamp
                value
            ];
        });
    }

    return seriesData;
}


/**
 * Create the Highcharts stock chart.
 */
function createChart(containerId, config, chartData) {
    Highcharts.stockChart(containerId, {
        chart: {
            renderTo: containerId
        },
        title: {
            text: config.title
        },
        yAxis: config.yAxes,
        series: Object.entries(config.series).map(([key, seriesConfig]) => ({
            name: seriesConfig.name,
            data: chartData[key],
            yAxis: seriesConfig.yAxis,
            color: seriesConfig.color,
            tooltip: {
                valueDecimals: 2,
                valueFormatter: function (value) {
                    if (seriesConfig.tooltip.valueFormat === 'percentage') {
                        return `${value}%`;
                    } else if (seriesConfig.tooltip.valueFormat === 'currency') {
                        return `$${value}`;
                    }
                    return value;
                }
            }
        })),
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        legend: {
            enabled: true
        },
        credits: {
            enabled: false
        },
        rangeSelector: {
            enabled: true,
            selected: 1, 
            buttons: [{
                type: 'year',
                count: 1,
                text: '1y'
            }, {
                type: 'year',
                count: 5,
                text: '5y'
            }, {
                type: 'year',
                count: 10,
                text: '10y'
            }, {
                type: 'all',
                text: 'All'
            }]
        },

    });
}
