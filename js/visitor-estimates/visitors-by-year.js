// Fetch and process visitor data with fan chart and forecast range
fetch('./data/vw_ve_estimated_visitors_by_year_historic.csv?' + Math.random())
    .then(response => response.text())
    .then(csvData => {
        // Parse CSV data and sort by year ascending
        const rows = csvData
            .split('\n')
            .map(row => row.split(','))
            .filter(row => row.length === 3) // Ensure valid rows
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

        // Process data into series
        const seriesData = {
            value: [],
            range: []
        };

        let referenceYear = 2019;
        let referenceValue = null;

        // First pass: Identify 2019's visitor value and process data
        rows.slice(1).forEach(row => {
            const [yearStr, visitorsStr, type] = row;
            const year = parseInt(yearStr);
            const visitors = parseFloat(visitorsStr);

            if (!isNaN(year) && !isNaN(visitors)) {
                // Add to value series
                seriesData.value.push([year, visitors]);

                if (year === referenceYear) {
                    referenceValue = visitors; // Store 2019 visitor value
                }

                // Create range data based on the new method
                if (year >= referenceYear) {
                    if (year === referenceYear) {
                        // Set 2019's range to be the exact value
                        seriesData.range.push([year, referenceValue, referenceValue]);
                    } else {
                        // For years after 2019, calculate ±10% range
                        const lowEstimate = Math.round((visitors * 0.90) / 100) * 100;
                        const highEstimate = Math.round((visitors * 1.10) / 100) * 100;
                        seriesData.range.push([year, lowEstimate, highEstimate]);
                    }
                }
            }
        });

        // Sort data points by year
        seriesData.value.sort((a, b) => a[0] - b[0]);
        seriesData.range.sort((a, b) => a[0] - b[0]);

        // Populate year dropdown
        const yearSelect = document.getElementById('yearSelect');
        const yearOptions = [
            { value: 1987, text: 'All time' },
            { value: 2018, text: 'Since 2018' }
        ];

        yearOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text;
            yearSelect.appendChild(optionElement);
        });

        // Set default to 2018
        yearSelect.value = 2018;

        // Function to create or update chart
        function createOrUpdateChart(filteredValueData, filteredRangeData) {
            Highcharts.chart('visitor-estimates-container', {
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
                        text: 'Number of Visitors'
                    },
                    labels: {
                        formatter: function () {
                            return Highcharts.numberFormat(this.value, 0, '.', ',');
                        }
                    }
                },
                tooltip: {
                    shared: true,
                    formatter: function () {
                        let tooltip = `<b>Year: ${this.x}</b><br/>`;
                        this.points.forEach(point => {
                            if (point.series.type === 'arearange') {
                                tooltip += `Estimate range: ${Highcharts.numberFormat(point.point.low, 0)} - ${Highcharts.numberFormat(point.point.high, 0)} visitors<br/>`;
                            } else {
                                tooltip += `Visitors: ${Highcharts.numberFormat(point.y, 0)}<br/>`;
                            }
                        });
                        return tooltip;
                    }
                },
                legend: {
                    enabled: true,
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',
                    borderWidth: 0,
                    reversed: true
                },
                series: [
                    {
                        type: 'arearange',
                        name: 'Estimate range',
                        data: filteredRangeData,
                        color: '#3A97A9',
                        fillOpacity: 0.3,
                        zIndex: 0,
                        marker: {
                            enabled: false
                        }
                    },
                    {
                        type: 'line',
                        name: 'Visitors',
                        data: filteredValueData,
                        color: '#244C5A',
                        zIndex: 1,
                        marker: {
                            enabled: true
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                return `${Highcharts.numberFormat(this.y, 0)}`;
                            },
                            allowOverlap: false,
                            style: {
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }
                        }
                    }
                ],
                credits: {
                    enabled: false
                }
            });
        }

        // Initial chart with default filtering (from 2018 onwards)
        const defaultFilteredValueData = seriesData.value.filter(row => row[0] >= 2018);
        const defaultFilteredRangeData = seriesData.range.filter(row => row[0] >= 2018);
        createOrUpdateChart(defaultFilteredValueData, defaultFilteredRangeData);

        // Add event listener for year selection
        yearSelect.addEventListener('change', function () {
            const selectedYear = parseInt(this.value);
            const filteredValueData = seriesData.value.filter(row => row[0] >= selectedYear);
            const filteredRangeData = seriesData.range.filter(row => row[0] >= selectedYear);
            createOrUpdateChart(filteredValueData, filteredRangeData);
        });
    })
    .catch(error => {
        console.error('Error loading or processing data:', error);
    });
