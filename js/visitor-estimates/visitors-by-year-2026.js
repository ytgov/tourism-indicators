document.addEventListener("DOMContentLoaded", function () {
    // Fetch and process visitor data
    fetch('./data/vw_tc_vis_estimates_summary_2026.csv?' + Math.random())
        .then(response => response.text())
        .then(csvData => {
            // Parse CSV data and sort by year ascending
            const rows = csvData
                .split(/\r?\n/) // Handles both Windows and Unix line endings
                .map(row => row.trim()) // Remove any extra whitespace
                .filter(row => row) // Remove empty lines
                .map(row => row.split(','))
                .filter(row => row.length === 4 && row[0] !== 'Year') // Ensure valid rows and skip header
                .map(row => ({
                    year: parseInt(row[0]),
                    inc_yukoners: parseFloat(row[1])
                }))
                .filter(row => !isNaN(row.year) && !isNaN(row.inc_yukoners))
                .filter(row => row.year >= 2018)
                .sort((a, b) => a.year - b.year);

            // Process data into series
            const seriesData = {
                value: rows.map(row => ({
                    year: row.year,
                    visitors: row.inc_yukoners
                }))
            };

            // Function to create or update chart
            function createOrUpdateChart() {
                // Find the 2018 peak value
                const peak2018 = seriesData.value.find(d => d.year === 2018)?.visitors;
                
                Highcharts.chart('visitor-estimates-container', {
                    credits: {
                        enabled: false
                    },
                    chart: {
                        type: 'line',
                        height: 500
                    },
                    title: {
                        text: 'Estimated annual visitors to the Yukon'
                    },
                    xAxis: {
                        title: {
                            text: 'Year'
                        },
                        tickInterval: 1,
                        maxPadding: 0.05
                    },
                    yAxis: {
                        title: {
                            text: 'Number of visitors'
                        }
                        /*plotLines: [{
                            color: '#244C5A',
                            width: 2,
                            dashStyle: 'Dash',
                            value: peak2018,
                            zIndex: 5,
                            label: {
                                text: 'Peak: ' + Highcharts.numberFormat(peak2018, 0, '.', ','),
                                align: 'center',
                                style: {
                                    color: '#244C5A',
                                    fontWeight: 'bold'
                                }
                            }
                        }]*/,
                        labels: {
                            formatter: function () {
                                if (this.value === 0) return '0';
                                if (Math.abs(this.value) < 1000) return Highcharts.numberFormat(this.value / 1000, 1, '.', ',')+'k';
                                return Highcharts.numberFormat(this.value / 1000, 1, '.', ',') + 'k';
                            }
                        }
                    },
                    tooltip: {
                        shared: true,
                        formatter: function () {
                            let tooltip = `<b>Year: ${this.x}</b><br/>`;
                            this.points.forEach(point => {
                                tooltip += `Visitors: ${Highcharts.numberFormat(point.y / 1000, 1)}k<br/>`;
                            });
                            return tooltip;
                        }
                    },
                    series: [{
                        name: 'Visitors',
                        color: '#244C5A',
                        data: seriesData.value.map(d => ({
                            x: d.year,
                            y: d.visitors
                        })),
                        marker: {
                            enabled: true
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return Highcharts.numberFormat(this.y / 1000, 1, '.', ',')+'k';
                            },
                            style: {
                                fontSize: '10px',
                                fontWeight: 'bold',
                                textOutline: 'none'
                            },
                            y: -10
                        },
                        showInLegend: false
                    }]
                });
            }

            // Initial chart
            createOrUpdateChart();
        })
        .catch(error => {
            console.error('Error loading or processing data:', error);
        });
});