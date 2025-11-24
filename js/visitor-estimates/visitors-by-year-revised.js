document.addEventListener("DOMContentLoaded", function () {
    // Fetch and process visitor data
    fetch('./data/vw_estimated_visitors_by_year_revised.csv?' + Math.random())
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
                    inc_yukoners: parseFloat(row[2])
                }))
                .filter(row => !isNaN(row.year) && !isNaN(row.inc_yukoners))
                .sort((a, b) => a.year - b.year);

            // Process data into series
            const seriesData = {
                value: rows.map(row => ({
                    year: row.year,
                    visitors: row.inc_yukoners
                }))
            };

            // Set up year filter
            const yearSelect = document.getElementById('yearSelect');
            yearSelect.innerHTML = ''; // Clear existing options
            
            // Add 'All time' option
            const allTimeOption = document.createElement('option');
            allTimeOption.value = Math.min(...seriesData.value.map(d => d.year));
            allTimeOption.text = 'All time';
            yearSelect.appendChild(allTimeOption);
            
            // Add 'Since 2018' option
            const since2018Option = document.createElement('option');
            since2018Option.value = 2018;
            since2018Option.text = 'Since 2018';
            yearSelect.appendChild(since2018Option);
            
            // Set default to 2018
            yearSelect.value = 2018;

            // Function to create or update chart
            function createOrUpdateChart(filteredValueData) {
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
                        data: filteredValueData.map(d => ({
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

            // Initial chart with default filtering (from 2018 onwards)
            const defaultFilteredData = seriesData.value.filter(row => row.year >= 2018);
            createOrUpdateChart(defaultFilteredData);

            // Event listener for year filter
            yearSelect.addEventListener('change', function() {
                const minYear = parseInt(this.value);
                const filteredData = seriesData.value.filter(row => row.year >= minYear);
                createOrUpdateChart(filteredData);
            });
        })
        .catch(error => {
            console.error('Error loading or processing data:', error);
        });
});