import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';

// Function to create arrow SVG
function createArrowSvg(isPositive) {
    return `<svg class="svg-arrow" width="20" height="20" viewBox="0 0 448 512" style="transform: ${isPositive ? 'none' : 'rotate(180deg)'}">
        <path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"></path>
    </svg>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create bar chart for border crossing types
        Highcharts.chart('border-types-chart', {
            chart: {
                type: 'column'
            },
            title: {
                text: null
            },
            xAxis: {
                categories: ['Americans', 'Canadians', 'Overseas'],
                title: {
                    text: 'Traveler Type'
                }
            },
            yAxis: {
                title: {
                    text: 'Number of Crossings'
                },
                labels: {
                    formatter: function() {
                        return Highcharts.numberFormat(this.value, 0);
                    }
                }
            },
            series: [{
                name: 'Border Crossings',
                data: [365239, 85711, 50802],
                color: '#2f7ed8'
            }],
            tooltip: {
                formatter: function() {
                    return '<b>' + this.x + '</b><br/>' +
                        'Crossings: ' + Highcharts.numberFormat(this.y, 0);
                }
            },
            credits: {
                enabled: false
            }
        });

        const chartBuilder = new ChartBuilder('indicator-chart', datasetConfigs.intlTravelers);
        await chartBuilder.initialize();

        // Get data for month selector
        const data = chartBuilder.getData();
        if (!data || !data.data) {
            console.error('No data available');
            return;
        }

        // Populate month selector
        const monthSelector = document.getElementById('monthSelector');
        
        // Format dates and populate dropdown
        const monthOptions = data.data.map(row => {
            const date = new Date(row[0]);
            return {
                value: row[0],
                label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
            };
        }).reverse(); // Most recent first

        monthOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.label;
            monthSelector.appendChild(optElement);
        });

        // Function to create and update the data table
        function updateDataTable(selectedDate = null) {
            const tableContainer = document.getElementById('indicator-chart-table');
            let filteredData = data.data;

            if (selectedDate) {
                filteredData = data.data.filter(row => row[0] === selectedDate);
            }

            const table = document.createElement('table');
            table.className = 'table table-striped table-hover';
            
            // Create dynamic headers based on selected date
            const thead = document.createElement('thead');
            let headerRow = '<tr>';
            
            if (selectedDate) {
                const date = new Date(selectedDate);
                const prevYear = date.getFullYear() - 1;
                const monthName = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
                const shortMonthName = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                
                headerRow += `
                    <th>${monthName} ${prevYear}</th>    
                    <th>${monthName} ${date.getFullYear()}</th>                   
                    <th>% Change</th>
                    <th>Jan - ${shortMonthName} ${prevYear} (YTD)</th>
                    <th>Jan - ${shortMonthName} ${date.getFullYear()} (YTD)</th>
                    <th>% Change</th>
                </tr>`;
            } else {
                headerRow += `                   
                    <th>Previous Year Monthly</th>
                    <th>Monthly Total</th>
                    <th>% Change</th>
                    <th>Previous Year YTD</th>
                    <th>YTD Total</th>
                    <th>% Change</th>
                </tr>`;
            }
            
            thead.innerHTML = headerRow;
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            filteredData.forEach(row => {
                const tr = document.createElement('tr');
                
                // Format the values
                const monthlyTotal = parseFloat(row[3]).toLocaleString();
                const prevYearMonthly = row[4] ? parseFloat(row[4]).toLocaleString() : 'N/A';
                
                // Format monthly change with color and arrow
                let monthlyChange = 'N/A';
                if (row[5]) {
                    const monthlyChangeValue = parseFloat(row[5]);
                    let color;
                    if (monthlyChangeValue >= -1 && monthlyChangeValue <= 1) {
                        color = '#6c757d';  // Dark grey for neutral changes
                    } else if (monthlyChangeValue > 1) {
                        color = '#28a745';  // Green for positive changes
                    } else {
                        color = '#dc3545';  // Red for negative changes
                    }
                    const arrow = createArrowSvg(monthlyChangeValue >= 0);
                    monthlyChange = `<span style="color: ${color}; font-weight: bold;">${arrow}${monthlyChangeValue.toFixed(1)}%</span>`;
                }

                const ytdTotal = parseFloat(row[6]).toLocaleString();
                const prevYearYtd = row[7] ? parseFloat(row[7]).toLocaleString() : 'N/A';
                
                // Format YTD change with color and arrow
                let ytdChange = 'N/A';
                if (row[8]) {
                    const ytdChangeValue = parseFloat(row[8]);
                    let color;
                    if (ytdChangeValue >= -1 && ytdChangeValue <= 1) {
                        color = '#6c757d';  // Dark grey for neutral changes
                    } else if (ytdChangeValue > 1) {
                        color = '#28a745';  // Green for positive changes
                    } else {
                        color = '#dc3545';  // Red for negative changes
                    }
                    const arrow = createArrowSvg(ytdChangeValue >= 0);
                    ytdChange = `<span style="color: ${color}; font-weight: bold;">${arrow}${ytdChangeValue.toFixed(1)}%</span>`;
                }

                tr.innerHTML = `
                    <td>${prevYearMonthly}</td>
                    <td>${monthlyTotal}</td>
                    <td>${monthlyChange}</td>
                    <td>${prevYearYtd}</td>
                    <td>${ytdTotal}</td>
                    <td>${ytdChange}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            // Clear and update table container
            tableContainer.innerHTML = '';
            tableContainer.appendChild(table);
        }

        // Initial table creation
        updateDataTable(monthSelector.value);

        // Add event listener for month selection
        monthSelector.addEventListener('change', (e) => {
            updateDataTable(e.target.value);
        });
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
});
