// Fetch and process visitor data
fetch('./data/vw_ve_estimated_visitors_by_year_historic.csv')
    .then(response => response.text())
    .then(data => {
        // Parse CSV data
        const rows = data.split('\n').map(row => row.split(','));
        
        // Extract years and visitors (first two columns), skip header
        const seriesData = rows.slice(1)
            .map(row => {
                const year = parseInt(row[0]);
                const visitors = parseFloat(row[1]);
                return [year, visitors];
            })
            .filter(row => !isNaN(row[0]) && !isNaN(row[1])) // Remove any invalid rows
            .sort((a, b) => a[0] - b[0]); // Sort by year

        // Create the chart
        Highcharts.chart('visitor-estimates-container', {
            chart: {
                type: 'spline'
            },
            title: {
                text: 'Estimated Annual Visitors'
            },
            xAxis: {
                title: {
                    text: 'Year'
                },
                tickInterval: 1
            },
            yAxis: {
                title: {
                    text: 'Number of Visitors'
                },
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value, 0, '.', ',');
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    return `<b>${this.x}</b><br/>
                            Visitors: ${Highcharts.numberFormat(this.y, 0, '.', ',')}`;
                }
            },
            series: [{
                name: 'Visitors',
                data: seriesData,
                color: '#2f7ed8'
            }],
            credits: {
                enabled: false
            }
        });
    })
    .catch(error => {
        console.error('Error loading or processing data:', error);
    });
