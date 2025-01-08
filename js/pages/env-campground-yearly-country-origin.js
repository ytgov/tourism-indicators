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

        // Parse the data rows and sort by year
        const data = rows.slice(1)
            .map(row => {
                const values = row.split(',').map(value => value.replace(/"/g, '').trim());
                return headers.reduce((acc, header, index) => {
                    // Convert visitors to number for proper sorting
                    if (header === 'visitors') {
                        acc[header] = parseFloat(values[index]) || 0;
                    } else {
                        acc[header] = values[index];
                    }
                    return acc;
                }, {});
            })
            .sort((a, b) => parseInt(a.year) - parseInt(b.year));

        return data;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return null;
    }
}

async function generateChart() {
    const rawData = await loadCSVData('data/vw_env_campground_yearly_visitors_by_country.csv');
    if (!rawData) {
        console.error('Failed to load CSV data.');
        return;
    }

    // Define colors for each region
    const regionColors = {
        Canada: '#244c5a', 
        'United States': '#dc4405', 
        Overseas: '#f2a900', 
        Unknown: '#947b89' 
    };

    // Get unique years and populate dropdown
    // Filter and extract unique years > 2005, then sort in descending order
    const years = [...new Set(rawData.map(row => row.year))]
        .filter(year => parseInt(year, 10) > 2005) // Keep only years > 2005
        .sort((a, b) => b.localeCompare(a)); // Sort in descending order


    const mostRecentYear = years[0]; // Get the most recent year
    
    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = ''; // Clear existing options
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        option.selected = (year === mostRecentYear);
        yearFilter.appendChild(option);
    });

    function updateChart(selectedYear) {
        // Filter data for selected year and sort by visitors (descending)
        const yearData = rawData
            .filter(row => row.year === selectedYear)
            .sort((a, b) => b.visitors - a.visitors); // Using numeric values for proper sorting

        // Prepare data for chart
        const categories = yearData.map(row => row.location);
        const seriesData = yearData.map(row => ({
            y: row.visitors, // Number of visitors
            color: regionColors[row.region] || '#6C757D' // Default color for undefined regions
        }));

        // Create the bar chart
        Highcharts.chart('country-origin-chart', {
            chart: {
                type: 'bar',
                height: Math.max(categories.length * 25, 400), // Adjust height based on number of entries
                scrollablePlotArea: {
                    minHeight: 400,
                    scrollPositionY: 1
                }
            },
            title: {
                text: `Visits by Region (${selectedYear})`
            },
            xAxis: {
                categories: categories,
                title: {
                    text: null
                },
                labels: {
                    style: {
                        whiteSpace: 'nowrap',
                        textOverflow: 'none'
                    }
                },
                min: 0,
                max: categories.length - 1,
                scrollbar: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    text: 'Number of Visitors',
                    align: 'high'
                },
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value, 0);
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + this.point.category + '</b><br/>' +
                        'Visitors: ' + Highcharts.numberFormat(this.y, 0);
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return Highcharts.numberFormat(this.y, 0);
                        }
                    }
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Visitors',
                data: seriesData
            }]
        });

        // Get the top 10 locations for pie chart
        const pieData = yearData
            .sort((a, b) => b.visitors - a.visitors)
            .slice(0, 10)  // Take top 10 locations
            .map(row => ({
                name: row.location,
                y: row.visitors,
                color: regionColors[row.region] || '#6C757D'
            }));

        // Calculate total for "Others"
        const topLocationsTotal = pieData.reduce((sum, item) => sum + item.y, 0);
        const allLocationsTotal = yearData.reduce((sum, row) => sum + row.visitors, 0);
        const othersTotal = allLocationsTotal - topLocationsTotal;

        // Add "Others" category if there are more locations
        if (othersTotal > 0) {
            pieData.push({
                name: 'Others',
                y: othersTotal,
                color: '#6C757D'
            });
        }

        // Create the pie chart
        Highcharts.chart('country-pie-chart', {
            chart: {
                type: 'pie',
                height: 400
            },
            title: {
                text: `Top 10 Regions (${selectedYear})`
            },
            subtitle: {
                text: 'By Number of Visitors'
            },
            tooltip: {
                pointFormat: '{point.percentage:.1f}%<br>Visitors: {point.y:,.0f}'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                        style: {
                            fontWeight: 'normal'
                        }
                    },
                    showInLegend: false
                }
            },
            series: [{
                name: 'Visitors',
                colorByPoint: true,
                data: pieData
            }],
            credits: {
                enabled: false
            }
        });
    }

    // Update chart when year selection changes
    yearFilter.addEventListener('change', (e) => {
        updateChart(e.target.value);
    });

    // Initial chart render with most recent year
    updateChart(mostRecentYear);
}

document.addEventListener('DOMContentLoaded', generateChart);