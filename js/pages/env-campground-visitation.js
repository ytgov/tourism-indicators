
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

async function updateMetricCards(){
    
};


async function initChart(csvPath) {
    const rawData = await loadCSVData(csvPath);

    if (!rawData) {
        console.error('No data available for chart.');
        return;
    }


    //get latest data
    const sortedData = [...rawData].sort((a, b) => new Date(b.ref_date) - new Date(a.ref_date));
    const latestData = sortedData[0];
    
    // Calculate monthly change
    const previousMonth = sortedData[1];
    const monthlyChange = previousMonth ? ((latestData.visitors - previousMonth.visitors) / previousMonth.visitors * 100).toFixed(1) : 0;

    // Calculate YTD metrics
    const currentYear = new Date(latestData.ref_date).getFullYear();
    const currentMonth = new Date(latestData.ref_date).getMonth();
    
    // Calculate YTD visits for current year
    const ytdVisits = sortedData
        .filter(d => {
            const date = new Date(d.ref_date);
            return date.getFullYear() === currentYear && date.getMonth() <= currentMonth;
        })
        .reduce((sum, d) => sum + parseInt(d.visitors), 0);

    // Calculate YTD visits for previous year
    const previousYearYTD = sortedData
        .filter(d => {
            const date = new Date(d.ref_date);
            return date.getFullYear() === (currentYear - 1) && date.getMonth() <= currentMonth;
        })
        .reduce((sum, d) => sum + parseInt(d.visitors), 0);

    // Calculate YTD change
    const ytdChange = previousYearYTD ? ((ytdVisits - previousYearYTD) / previousYearYTD * 100).toFixed(1) : 0;

    //update metric cards
    const monthlyVisitorsElement = document.getElementById('latest-monthly');
    const monthlyVisitorsDateElement = document.getElementById('latest-monthly-date');
    const ytdVisitorsElement = document.getElementById('ytd-amount');
    const ytdDateRangeElement = document.getElementById('ytd-date-range');
    const ytdChangeElement = document.getElementById('ytd-change');

    // Update the DOM elements
    if (monthlyVisitorsElement) monthlyVisitorsElement.textContent = parseInt(latestData.visitors).toLocaleString();
    if (monthlyVisitorsDateElement) monthlyVisitorsDateElement.textContent = new Date(latestData.ref_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (ytdVisitorsElement) ytdVisitorsElement.textContent = ytdVisits.toLocaleString();
    if (ytdDateRangeElement) {
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(latestData.ref_date);
        ytdDateRangeElement.textContent = `${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    }
    if (ytdChangeElement) {
        ytdChangeElement.textContent = `${ytdChange}%`;
        ytdChangeElement.classList.remove('text-success', 'text-danger');
        ytdChangeElement.classList.add(ytdChange >= 0 ? 'text-success' : 'text-danger');
    }

    // Create a map to aggregate total visitors by date
    const visitorsByDate = new Map();
    
    rawData.forEach(item => {
        const date = new Date(item.ref_date);
        const year = date.getFullYear();
    
        // Only process data for years > 2005
        if (year > 2005) {
            const timestamp = date.getTime();
            const visitors = parseInt(item.visitors) || 0;
            
            if (visitorsByDate.has(timestamp)) {
                visitorsByDate.set(timestamp, visitorsByDate.get(timestamp) + visitors);
            } else {
                visitorsByDate.set(timestamp, visitors);
            }
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
            text: 'Total Monthly Visits - All Sites'
        },
        legend: {
            enabled: false
        },
        xAxis: {
            type: 'datetime',
            ordinal: false
        },
        yAxis: {
            title: {
                text: 'Monthly Visits'
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
const csvPath = 'data/vw_kpi_env_campground_visitors_by_month.csv';
initChart(csvPath);
updateMetricCards();
