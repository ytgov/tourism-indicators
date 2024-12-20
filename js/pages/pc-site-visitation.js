async function loadCSVData(csvUrl) {
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        
        // Parse the header row and remove quotes
        const headers = rows[0].split(',').map(header => header.replace(/"/g, '').trim());

        // Parse the data rows
        const data = rows.slice(1).map(row => {
            const values = row.split(',').map(value => value.replace(/"/g, '').trim());
            return headers.reduce((acc, header, index) => {
                acc[header] = values[index];
                return acc;
            }, {});
        });

        return data;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return null;
    }
}

async function initChart(csvPath) {
    const rawData = await loadCSVData(csvPath);

    if (!rawData) {
        console.error('No data available for chart.');
        return;
    }

    // Create a map to aggregate total visitors by date
    const visitorsByDate = new Map();
    
    rawData.forEach(item => {
        const date = new Date(item.ref_date).getTime();
        const visitors = parseInt(item.monthly_total) || 0;
        
        if (visitorsByDate.has(date)) {
            visitorsByDate.set(date, visitorsByDate.get(date) + visitors);
        } else {
            visitorsByDate.set(date, visitors);
        }
    });

    // Convert the map to an array of [date, total] pairs and sort by date
    const totalVisitors = Array.from(visitorsByDate.entries())
        .sort((a, b) => a[0] - b[0]);

    // Configure the Highcharts chart
    Highcharts.stockChart('indicator-chart', {
        chart: {
            type: 'line',
            height: 500
        },
        title: {
            text: 'Total Monthly Visitors - All Sites'
        },
        legend: {
            enabled: false
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Monthly Visitors'
            },
            labels: {
                formatter: function() {
                    return Highcharts.numberFormat(this.value, 0, '.', ',');
                }
            },
            opposite: false,
            allowDecimals: false
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        rangeSelector: {
            enabled: true,
            selected: 2, 
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
            },
            {
                type: 'year',
                count: 20,
                text: '20y'
            }, {
                type: 'all',
                text: 'All'
            }]
        },
        series: [{
            name: 'Total Visitors',
            data: totalVisitors,
            color: '#244c5a',
            tooltip: {
                valueDecimals: 0,
                pointFormatter: function() {
                    return `Total Visitors: <b>${Highcharts.numberFormat(this.y, 0, '.', ',')}</b><br/>`;
                }
            }
        }]
    });
}

// Example usage
const csvPath = 'data/vw_kpi_pc_site_visitation_ytd_summary.csv';
initChart(csvPath);
