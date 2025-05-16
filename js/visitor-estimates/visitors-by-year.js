// Fetch and process visitor data with fan chart and forecast range
Promise.all([
    fetch('./data/vw_ve_estimated_visitors_by_year_historic.csv?' + Math.random()).then(response => response.text()),
    fetch('./data/vw_kpi_estimated_visitation_forecast.csv?' + Math.random()).then(response => response.text())
])
    .then(([historicCsvData, forecastCsvData]) => {
        // --- Process Historic Data ---
        // Parse CSV data and sort by year ascending
        const historicRows = historicCsvData
            .split('\r\n') // Use \r\n for Windows line endings if applicable, otherwise \n
            .map(row => row.split(','))
            .filter(row => row.length === 4 && row[0] !== 'year') // Ensure valid rows and skip header
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

        // Process data into series
        const seriesData = {
            value: [],
            range: []
        };

        let referenceYear = 2023; // Keep existing reference year logic
        let referenceValue = null;
        let referenceNonYukonValue = null;

        // Variable to track the start of forecast data for styling
        let firstForecastYear = Infinity; 

        // First pass: Identify reference year's visitor value and process historic data
        historicRows.forEach(row => { // No need to slice(1) if header is filtered
            const [yearStr, visitorsStr, nonYukonVisitorsStr, type] = row;
            const year = parseInt(yearStr);
            const visitors = parseFloat(visitorsStr);
            const nonYukonVisitors = parseFloat(nonYukonVisitorsStr);

            if (!isNaN(year) && !isNaN(visitors) && !isNaN(nonYukonVisitors)) {
                // Add to value series for both visitor types
                seriesData.value.push({
                    year: year,
                    visitors: visitors,
                    non_yukoner_visitors: nonYukonVisitors
                });

                if (year === referenceYear) {
                    referenceValue = visitors; // Store reference total visitor value
                    referenceNonYukonValue = nonYukonVisitors; // Store reference non-Yukon visitor value
                }

                // Create range data based on the new method (using referenceYear)
                if (year >= referenceYear) {
                    if (year === referenceYear) {
                        // Set reference year's range to be the exact value
                        seriesData.range.push({
                            year: year,
                            visitors: { low: referenceValue, high: referenceValue },
                            non_yukoner_visitors: { low: referenceNonYukonValue, high: referenceNonYukonValue }
                        });
                    } else {
                        // For years after reference, calculate ±5% range (adjusted from 10% for consistency if needed)
                        const lowVisitors = Math.round((visitors * 0.95) / 100) * 100;
                        const highVisitors = Math.round((visitors * 1.05) / 100) * 100;
                        const lowNonYukon = Math.round((nonYukonVisitors * 0.95) / 100) * 100;
                        const highNonYukon = Math.round((nonYukonVisitors * 1.05) / 100) * 100;

                        seriesData.range.push({
                            year: year,
                            visitors: { low: lowVisitors, high: highVisitors },
                            non_yukoner_visitors: { low: lowNonYukon, high: highNonYukon }
                        });
                    }
                }
            }
        });

        // --- Process Forecast Data ---
        const forecastRows = forecastCsvData
            .split('\r\n') // Adjust line ending if needed
            .map(row => row.split(','))
            .filter(row => row.length === 3 && row[0] !== 'month'); // Ensure valid rows and skip header

        const forecastTotals = {}; // Use an object to store totals per year

        forecastRows.forEach(row => {
            const [monthStr, visitorsStr, type] = row;
            const year = parseInt(monthStr.substring(0, 4)); // Extract year from 'YYYY-MM'
            const visitors = parseFloat(visitorsStr);

            if (!isNaN(year) && !isNaN(visitors)) {
                firstForecastYear = Math.min(firstForecastYear, year); // Track the earliest forecast year
                if (!forecastTotals[year]) {
                    forecastTotals[year] = 0;
                }
                forecastTotals[year] += visitors;
            }
        });
        
        // Add aggregated forecast data to seriesData.value
        for (const yearStr in forecastTotals) {
            const year = parseInt(yearStr);
            const totalVisitors = forecastTotals[yearStr];
            // Estimate non-Yukoners as 84% of total visitors 
            const estimatedNonYukoners = Math.round((totalVisitors * 0.86)/100)*100;

            // Check if this year already exists from historic data (it shouldn't for forecast)
            if (!seriesData.value.some(d => d.year === year)) {
                 seriesData.value.push({
                     year: year,
                     visitors: totalVisitors,
                     non_yukoner_visitors: estimatedNonYukoners 
                 });

                // Calculate and add forecast range data (+-5%)
                const lowVisitors = Math.round((totalVisitors * 0.95) / 100) * 100;
                const highVisitors = Math.round((totalVisitors * 1.05) / 100) * 100;
                const lowNonYukon = Math.round((estimatedNonYukoners * 0.95) / 100) * 100;
                const highNonYukon = Math.round((estimatedNonYukoners * 1.05) / 100) * 100;

                seriesData.range.push({
                    year: year,
                    visitors: { low: lowVisitors, high: highVisitors },
                    non_yukoner_visitors: { low: lowNonYukon, high: highNonYukon }
                });
            }
         }
 
 
        // Sort combined data points by year
        seriesData.value.sort((a, b) => a.year - b.year);
        seriesData.range.sort((a, b) => a.year - b.year); // Keep range sorted too

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

        // Populate visitor type dropdown
        const visitorTypeSelect = document.getElementById('visitorTypeSelect');
        const visitorTypeOptions = [
            { value: 'visitors', text: 'Include Yukoners' },
            { value: 'non_yukoner_visitors', text: 'Exclude Yukoners' }
        ];

        visitorTypeOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text;
            visitorTypeSelect.appendChild(optionElement);
        });

        // Set default to visitors
        visitorTypeSelect.value = 'visitors';

        // Function to create or update chart with selected visitor type
        function createOrUpdateChart(filteredValueData, filteredRangeData, visitorType, firstForecastYear) {
            Highcharts.chart('visitor-estimates-container', {
                chart: {
                    type: 'line',
                    height: 500
                },
                title: {
                    text: visitorType === 'visitors' 
                        ? 'Estimated annual visitors to the Yukon' 
                        : 'Estimated annual visitors to the Yukon (excluding Yukoners)'
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
                    },
                    labels: {
                        formatter: function () {
                            if (this.value === 0) return '0';
                            if (Math.abs(this.value) < 1000) return Highcharts.numberFormat(this.value, 0, '.', ',');
                            return Highcharts.numberFormat(this.value / 1000, 1, '.', ',') + 'k';
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
                        data: filteredRangeData.map(row => [
                            row.year, 
                            row[visitorType].low, 
                            row[visitorType].high
                        ]),
                        color: '#3A97A9',
                        fillOpacity: 0.3,
                        zIndex: 0,
                        legendIndex: 0, // To appear last with reversed legend
                        marker: {
                            enabled: false
                        }
                    },
                    {
                        type: 'line', // Changed from line to spline
                        name: visitorType === 'visitors' ? 'Total visitors' : 'Non-Yukoner visitors',
                        data: filteredValueData.map(row => [row.year, row[visitorType]]),
                        color: '#244C5A', // Default color for the series (historical)
                        zIndex: 1,
                        legendIndex: 2, // To appear first with reversed legend
                        zoneAxis: 'x',
                        zones: firstForecastYear !== Infinity ? [
                          {
                            // Zone for historical data (solid blue)
                            value: firstForecastYear - 1 
                            // dashStyle will be the series default (Solid)
                            // Color will be the series default ('#244C5A')
                          }, {
                            // Zone for the forecast data (dashed orange)
                            // No 'value' property needed as it extends from the previous zone's end
                            color: '#244C5A',         // Apply orange color
                            dashStyle: 'ShortDash'   // Apply dashed style
                          }] : [], // Apply zones only if forecast data exists
                        marker: {
                            enabled: true
                        },
                        dataLabels: {
                            enabled: true,
                            formatter: function () {
                                if (this.y === 0) return '0';
                                if (Math.abs(this.y) < 1000) return Highcharts.numberFormat(this.y, 0, '.', ',');
                                return Highcharts.numberFormat(this.y / 1000, 1, '.', ',') + 'k';
                            },
                            allowOverlap: false,
                            style: {
                                fontWeight: 'bold',
                                fontSize: '12px'
                            }
                        }
                    },
                    {
                        name: 'Forecast visitors',
                        type: 'line', // Visually a line in legend
                        color: '#244C5A',
                        dashStyle: 'ShortDash',
                        legendIndex: 1, // To appear second with reversed legend
                        data: [], // No actual data
                        marker: { enabled: false },
                        enableMouseTracking: false, // Not interactive
                        showInLegend: firstForecastYear !== Infinity // Only show if there is a forecast
                    }
                ],
                credits: {
                    enabled: false
                }
            });
        }

        // Initial chart with default filtering (from 2018 onwards, total visitors)
        const defaultFilteredValueData = seriesData.value.filter(row => row.year >= 2018);
        const defaultFilteredRangeData = seriesData.range.filter(row => row.year >= 2018);
        createOrUpdateChart(defaultFilteredValueData, defaultFilteredRangeData, 'visitors', firstForecastYear);

        // Add event listeners for year and visitor type selection
        yearSelect.addEventListener('change', updateChart);
        visitorTypeSelect.addEventListener('change', updateChart);

        function updateChart() {
            const selectedYear = parseInt(yearSelect.value);
            const selectedVisitorType = visitorTypeSelect.value;
            const filteredValueData = seriesData.value.filter(row => row.year >= selectedYear);
            const filteredRangeData = seriesData.range.filter(row => row.year >= selectedYear);
            createOrUpdateChart(filteredValueData, filteredRangeData, selectedVisitorType, firstForecastYear);
        }
    })
    .catch(error => {
        console.error('Error loading or processing data:', error);
    });
