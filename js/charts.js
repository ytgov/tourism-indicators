// Function to load and parse CSV data
async function loadAirportData() {
    try {
        const response = await fetch('/data/vw_kpi_air_arrivals_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Get the most recent row (last row in the CSV)
        const mostRecent = data[data.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: parseInt(mostRecent[6]),
            ytdPercentageChange: parseFloat(mostRecent[8]),
            monthlyData: data.map(row => ({
                date: new Date(row[0]),
                value: parseInt(row[3])
            }))
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

// Function to load international travelers data
async function loadIntlTravelersData() {
    try {
        const response = await fetch('/data/vw_kpi_intl_travellers_entering_canada_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim())
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));

        // Get total for all locations for each month
        const monthlyTotals = new Map(); // key: date, value: {total, ytdTotal, ytdChange}
        
        rows.slice(1).forEach(row => {
            if (row.length < 8) return; // Skip incomplete rows
            
            const date = row[0];
            const monthly = parseFloat(row[4]) || 0;
            const ytdTotal = parseFloat(row[7]) || 0;
            const ytdChange = parseFloat(row[9]) || 0;
            
            if (monthlyTotals.has(date)) {
                const current = monthlyTotals.get(date);
                monthlyTotals.set(date, {
                    total: current.total + monthly,
                    ytdTotal: Math.max(current.ytdTotal, ytdTotal),
                    ytdChange: current.ytdChange || ytdChange
                });
            } else {
                monthlyTotals.set(date, {
                    total: monthly,
                    ytdTotal: ytdTotal,
                    ytdChange: ytdChange
                });
            }
        });

        // Convert to array and sort by date
        const data = Array.from(monthlyTotals.entries())
            .map(([date, values]) => ({
                date: new Date(date),
                total: values.total,
                ytdTotal: values.ytdTotal,
                ytdChange: values.ytdChange
            }))
            .sort((a, b) => b.date - a.date); // Sort descending

        const mostRecent = data[0];
        
        return {
            monthYear: mostRecent.date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: mostRecent.ytdTotal,
            ytdPercentageChange: mostRecent.ytdChange,
            monthlyData: data
                .sort((a, b) => a.date - b.date) // Sort ascending for chart
                .map(item => ({
                    date: item.date,
                    value: item.total
                }))
        };
        
    } catch (error) {
        console.error('Error loading international travelers data:', error);
        return null;
    }
}

// Function to load spending data
async function loadSpendingData() {
    try {
        const response = await fetch('/data/vw_kpi_lasr_spending_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim()) // Remove empty lines
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));
        
        // Remove header row and ensure all rows are complete
        const data = rows.slice(1)
            .filter(row => row.length > 1 && row[0].trim())
            .map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3]),  // Using monthly_total for the chart
                year: parseInt(row[1]),
                month: parseInt(row[2])
            }))
            .sort((a, b) => b.date - a.date);  // Sort by date descending
        
        // Get the most recent row
        const mostRecent = data[0];
        const ytdTotal = parseFloat(rows.find(row => 
            row[1] === mostRecent.year.toString() && 
            row[2] === mostRecent.month.toString()
        )[6]); // Using YTD total for the display
        
        return {
            monthYear: mostRecent.date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: ytdTotal,
            ytdPercentageChange: parseFloat(rows.find(row => 
                row[1] === mostRecent.year.toString() && 
                row[2] === mostRecent.month.toString()
            )[8]),
            monthlyData: data
                .sort((a, b) => a.date - b.date)  // Sort ascending for chart data
        };
    } catch (error) {
        console.error('Error loading spending data:', error);
        return null;
    }
}

async function loadEstimatedVisitorsData() {
    try {
        const response = await fetch('/data/vw_kpi_estimated_visitors.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim()) // Remove empty lines
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));
        
        // Remove header row and filter for 'All' transportation type
        const data = rows.slice(1)
            .filter(row => row.length > 1 && row[3].trim() === 'All') // Only include 'All' rows
            .map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[4]),  // Using monthly_total for the chart
                year: parseInt(row[1]),
                month: parseInt(row[2])
            }))
            .sort((a, b) => b.date - a.date);  // Sort by date descending
        
        // Get the most recent row
        const mostRecent = data[0];
        const ytdTotal = parseFloat(rows.find(row => 
            row[1] === mostRecent.year.toString() && 
            row[2] === mostRecent.month.toString() &&
            row[3].trim() === 'All' // Ensure it's the 'All' row
        )[7]); // Using YTD total for the display
        
        return {
            monthYear: mostRecent.date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: ytdTotal,
            ytdPercentageChange: parseFloat(rows.find(row => 
                row[1] === mostRecent.year.toString() && 
                row[2] === mostRecent.month.toString() &&
                row[3].trim() === 'All' // Ensure it's the 'All' row
            )[9]),
            monthlyData: data
                .sort((a, b) => a.date - b.date)  // Sort ascending for chart data
        };
    } catch (error) {
        console.error('Error loading estimated visitors data:', error);
        return null;
    }
}


// Function to load occupancy rate data
async function loadOccupancyData() {
    try {
        const response = await fetch('/data/vw_kpi_cbre_occupancy_rate_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim()) // Remove empty lines
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));
        
        // Remove header row and ensure all rows are complete
        const data = rows.slice(1)
            .filter(row => row.length > 1 && row[0].trim())
            .map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3]),  // monthly_avg_occupancy_rate
                year: parseInt(row[1]),
                month: parseInt(row[2])
            }))
            .sort((a, b) => b.date - a.date);  // Sort by date descending
        
        // Get the most recent row
        const mostRecent = data[0];
        const ytdAverage = parseFloat(rows.find(row => 
            row[1] === mostRecent.year.toString() && 
            row[2] === mostRecent.month.toString()
        )[6]); // ytd_avg_occupancy_rate
        
        return {
            monthYear: mostRecent.date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: ytdAverage,  // Using average instead of total
            ytdPercentageChange: parseFloat(rows.find(row => 
                row[1] === mostRecent.year.toString() && 
                row[2] === mostRecent.month.toString()
            )[8]),
            monthlyData: data
                .sort((a, b) => a.date - b.date)  // Sort ascending for chart data
        };
    } catch (error) {
        console.error('Error loading occupancy rate data:', error);
        return null;
    }
}

// Function to load daily room rate data
async function loadRoomRateData() {
    try {
        const response = await fetch('/data/vw_kpi_cbre_avg_daily_room_rate_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim())
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));
        
        const data = rows.slice(1)
            .filter(row => row.length > 1 && row[0].trim())
            .map(row => ({
                date: new Date(row[0]),
                value: formatCurrency(parseFloat(row[3])),  // monthly_avg_daily_room_rate
                year: parseInt(row[1]),
                month: parseInt(row[2])
            }))
            .sort((a, b) => b.date - a.date);
        
        const mostRecent = data[0];
        const ytdAverage = parseFloat(rows.find(row => 
            row[1] === mostRecent.year.toString() && 
            row[2] === mostRecent.month.toString()
        )[6]); // ytd_avg_daily_room_rate
        
        return {
            monthYear: mostRecent.date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: formatCurrency(ytdAverage),
            ytdPercentageChange: parseFloat(rows.find(row => 
                row[1] === mostRecent.year.toString() && 
                row[2] === mostRecent.month.toString()
            )[8]),
            monthlyData: data.sort((a, b) => a.date - b.date)
        };
    } catch (error) {
        console.error('Error loading room rate data:', error);
        return null;
    }
}

// Function to load revenue per room data
async function loadRevenuePerRoomData() {
    try {
        const response = await fetch('/data/vw_kpi_cbre_revpar_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim())
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));
        
        const data = rows.slice(1)
            .filter(row => row.length > 1 && row[0].trim())
            .map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3]),  // monthly_avg_revpar
                year: parseInt(row[1]),
                month: parseInt(row[2])
            }))
            .sort((a, b) => b.date - a.date);
        
        const mostRecent = data[0];
        const ytdAverage = parseFloat(rows.find(row => 
            row[1] === mostRecent.year.toString() && 
            row[2] === mostRecent.month.toString()
        )[6]); // ytd_avg_revpar
        
        return {
            monthYear: mostRecent.date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: formatCurrency(ytdAverage),
            ytdPercentageChange: parseFloat(rows.find(row => 
                row[1] === mostRecent.year.toString() && 
                row[2] === mostRecent.month.toString()
            )[8]),
            monthlyData: data.sort((a, b) => a.date - b.date)
        };
    } catch (error) {
        console.error('Error loading revenue per room data:', error);
        return null;
    }
}

// Function to load VIC visitors data
async function loadVICVisitorsData() {
    try {
        const response = await fetch('/data/vw_kpi_vic_visitors_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim())
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));
        
        const data = rows.slice(1)
            .filter(row => row.length > 1 && row[0].trim())
            .map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3]),  // monthly_avg_vic_visitors
                year: parseInt(row[1]),
                month: parseInt(row[2])
            }))
            .sort((a, b) => b.date - a.date);
        
        const mostRecent = data[0];
        const ytdAverage = parseFloat(rows.find(row => 
            row[1] === mostRecent.year.toString() && 
            row[2] === mostRecent.month.toString()
        )[6]); // ytd_avg_vic_visitors
        
        return {
            monthYear: mostRecent.date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: ytdAverage,
            ytdPercentageChange: parseFloat(rows.find(row => 
                row[1] === mostRecent.year.toString() && 
                row[2] === mostRecent.month.toString()
            )[8]),
            monthlyData: data.sort((a, b) => a.date - b.date)
        };
    } catch (error) {
        console.error('Error loading VIC visitors data:', error);
        return null;
    }
}

// Function to load highway counts data
async function loadHighwayCountsData() {
    try {
        const response = await fetch('/data/vw_kpi_wlws_highway_counts_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n')
            .filter(row => row.trim())
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));
        
        const data = rows.slice(1)
            .filter(row => row.length > 1 && row[0].trim())
            .map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3]),  // monthly_avg_highway_counts
                year: parseInt(row[1]),
                month: parseInt(row[2])
            }))
            .sort((a, b) => b.date - a.date);
        
        const mostRecent = data[0];
        const ytdAverage = parseFloat(rows.find(row => 
            row[1] === mostRecent.year.toString() && 
            row[2] === mostRecent.month.toString()
        )[6]); // ytd_avg_highway_counts
        
        return {
            monthYear: mostRecent.date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: ytdAverage,
            ytdPercentageChange: parseFloat(rows.find(row => 
                row[1] === mostRecent.year.toString() && 
                row[2] === mostRecent.month.toString()
            )[8]),
            monthlyData: data.sort((a, b) => a.date - b.date)
        };
    } catch (error) {
        console.error('Error loading highway counts data:', error);
        return null;
    }
}

// Load STR Occupancy Rate Data
async function loadSTROccupancyData() {
    try {
        const response = await fetch('/data/vw_kpi_str_occupancy_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Get the most recent row
        const mostRecent = data[data.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: parseFloat(mostRecent[6]),
            ytdPercentageChange: parseFloat(mostRecent[8]),
            monthlyData: data.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3])
            }))
        };
    } catch (error) {
        console.error('Error loading STR Occupancy data:', error);
        return null;
    }
}

// Load STR Average Daily Rate Data
async function loadSTRADRData() {
    try {
        const response = await fetch('/data/vw_kpi_str_adr_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Get the most recent row
        const mostRecent = data[data.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: formatCurrency(parseFloat(mostRecent[6])),
            ytdPercentageChange: parseFloat(mostRecent[8]),
            monthlyData: data.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3])
            }))
        };
    } catch (error) {
        console.error('Error loading STR ADR data:', error);
        return null;
    }
}

// Load STR RevPAR Data
async function loadSTRRevPARData() {
    try {
        const response = await fetch('/data/vw_kpi_str_revpar_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Get the most recent row
        const mostRecent = data[data.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: parseFloat(mostRecent[6]),
            ytdPercentageChange: parseFloat(mostRecent[8]),
            monthlyData: data.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3])
            }))
        };
    } catch (error) {
        console.error('Error loading STR RevPAR data:', error);
        return null;
    }
}

// Function to load PC Visitor Data
async function loadPCVisitorData() {
    try {
        const response = await fetch('/data/vw_kpi_pc_site_visitation_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const headers = rows[0];
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Filter for rows where site is 'all'
        const allSiteData = data.filter(row => row[3].toLowerCase().trim() === 'all');
        
        // Get the most recent row from filtered data
        const mostRecent = allSiteData[allSiteData.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: parseFloat(mostRecent[7]),  // ytd_total column
            ytdPercentageChange: parseFloat(mostRecent[9]),  // ytd_percentage_difference column
            monthlyData: allSiteData.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[4])  // monthly_total column
            }))
        };
    } catch (error) {
        console.error('Error loading PC Site Visitation data:', error);
        return null;
    }
}

// Function to load Campground Visitor Data
async function loadCampgroundVisitorData() {
    try {
        const response = await fetch('/data/vw_kpi_env_campground_visitors_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const headers = rows[0];
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Filter for rows where site is 'all'
        const allSiteData = data;

        // Sort data by ref_date (column 0) in ascending order
        const sortedData = allSiteData.sort((a, b) => new Date(a[0]) - new Date(b[0]));
        
        // Get the most recent row from sorted data
        const mostRecent = sortedData[sortedData.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: parseFloat(mostRecent[6]),  // ytd_total column
            ytdPercentageChange: parseFloat(mostRecent[8]),  // ytd_percentage_difference column
            monthlyData: allSiteData.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[3])  // monthly_total column
            }))
        };
    } catch (error) {
        console.error('Error loading Campground Site Visitation data:', error);
        return null;
    }
}

// Function to load SC Fuel Prices
//removed by request
/*async function loadFuelPrices() {
    try {
        const response = await fetch('/data/vw_kpi_sc_gas_prices_ytd_summary.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Get the most recent row
        const mostRecent = data[data.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: parseFloat(mostRecent[6]) + (' c/L'),  
            ytdPercentageChange: parseFloat(mostRecent[8]),  
            monthlyData: data.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[1])
            }))
        };
    } catch (error) {
        console.error('Error loading Fuel Prices data:', error);
        return null;
    }
}*/

// Function to load Accommodation Employment
async function loadAccommodationEmployment() {
    try {
        const response = await fetch('/data/vw_kpi_economic_accommodation_and_food_employment.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Get the most recent row
        const mostRecent = data[data.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: parseFloat(mostRecent[6]),  
            ytdPercentageChange: parseFloat(mostRecent[8]),  
            monthlyData: data.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[1])
            }))
        };
    } catch (error) {
        console.error('Error loading Accomodation Employment data:', error);
        return null;
    }
}

async function loadRestaurantSales() {
    try {
        const response = await fetch('/data/vw_kpi_economic_restaurant_spending.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Get the most recent row
        const mostRecent = data[data.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: '$' + (parseFloat(mostRecent[6]) / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M CAD',
            ytdPercentageChange: parseFloat(mostRecent[8]),  
            monthlyData: data.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[1])
            }))
        };
    } catch (error) {
        console.error('Error loading Restaurant Sales data:', error);
        return null;
    }
}

async function loadRetailSales() {
    try {
        const response = await fetch('/data/vw_kpi_economic_retail_spending.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.replace(/"/g, '')).map(row => row.split(','));
        const data = rows.slice(1).filter(row => row.length > 1);
        
        // Get the most recent row
        const mostRecent = data[data.length - 1];
        const date = new Date(mostRecent[0]);
        
        return {
            monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone:'UTC' }),
            ytdTotal: '$' + (parseFloat(mostRecent[6]) / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M CAD',
            ytdPercentageChange: parseFloat(mostRecent[8]),  
            monthlyData: data.map(row => ({
                date: new Date(row[0]),
                value: parseFloat(row[1])
            }))
        };
    } catch (error) {
        console.error('Error loading Retail Sales data:', error);
        return null;
    }
}

// Function to create arrow SVG
function createArrowSvg(isPositive) {
    return `<svg class="svg-arrow" width="20" height="20" viewBox="0 0 448 512" style="transform: ${isPositive ? 'none' : 'rotate(180deg)'}">
        <path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"></path>
    </svg>`;
}

// Function to format spending in millions
function formatSpendingInMillions(value) {
    return `$${(value / 1000000).toFixed(1)}M`;
}

// Function to format numbers in thousands
function formatInThousands(value) {
    return `${(Math.round((value / 1000))*1000).toLocaleString()}`;
}

// Function to format percentage
function formatPercentage(value) {
    const sign = value < 0 ? '-' : '';
    return `${sign}${Math.abs(value).toFixed(1)}%`;
}

// Function to format currency
function formatCurrency(value) {
    return `$${value.toFixed(2)} CAD`;
}

// Function to update KPI content
function updateKPIContent(containerId, data, title) {
    const container = document.getElementById(containerId);
    let formattedTotal = data.ytdTotal.toLocaleString();
    let subheading = '';
    let isAccommodationIndicator = containerId.startsWith('additional');
    
    // Special formatting for different indicators
    if (title === 'Visitor Spending') {
        formattedTotal = formatSpendingInMillions(data.ytdTotal);
        subheading = 'Total visitor spending';
    } else if (title === 'Air Arrivals') {
        formattedTotal = formatInThousands(data.ytdTotal);
        subheading = 'Erik Nielsen Whitehorse International Airport';
    } else if (title === 'Border Crossings') {
        formattedTotal = formatInThousands(data.ytdTotal);
        subheading = 'Travelers entering through Canadian customs';
    } else if (title === 'Estimated Visitors') {
        subheading = 'Total unique visitors to Yukon';
    } else if (title === 'Hotel Occupancy Rate') {
        formattedTotal = formatPercentage(data.ytdTotal);
        subheading = 'Average room occupancy rate';
    } else if (title === 'Average Daily Room Rate') {
        formattedTotal = formatCurrency(data.ytdTotal);
        subheading = 'Average daily room rate';
    } else if (title === 'Average Revenue Per Room') {
        formattedTotal = formatCurrency(data.ytdTotal);
        subheading = 'Average revenue per available room';
    } else if (title === 'VIC Visitors') {
        formattedTotal = formatInThousands(Math.round(data.ytdTotal / 1000) * 1000);
        subheading = 'Visitor Information Centre visitors';
    } else if (title === 'WLWS Northbound Traffic') {
        formattedTotal = formatInThousands(Math.round(data.ytdTotal / 1000) * 1000);
        subheading = 'Northbound vehicles through Watson Lake';
    } else if (title === 'Highway Traffic') {
        formattedTotal = formatInThousands(Math.round(data.ytdTotal / 1000) * 1000);
        subheading = 'Total highway traffic';
    } else if (title === 'STR Occupancy Rate') {
        formattedTotal = formatPercentage(data.ytdTotal);
        subheading = 'Average STR occupancy rate';
    } else if (title === 'STR Average Daily Rate') {
        formattedTotal = formatCurrency(data.ytdTotal);
        subheading = 'Average STR daily rate';
    } else if (title === 'STR Revenue Per Room') {
        formattedTotal = formatCurrency(data.ytdTotal);
        subheading = 'Average STR revenue per room';
    }

    if (isAccommodationIndicator) {
        container.innerHTML = `
            <div class="ytd-change ${
                data.ytdPercentageChange >= 1 ? 'positive' :
                data.ytdPercentageChange <= -1 ? 'negative' : 'neutral'
            }">
                ${createArrowSvg(data.ytdPercentageChange >= 0)} <!-- Original logic for SVG arrows -->
            </div>
            <div class="dataset-name">${title}</div>
            <div class="ytd-total">${formattedTotal}</div>
            <div class="percentage-change ${
                data.ytdPercentageChange >= 1 ? 'positive' :
                data.ytdPercentageChange <= -1 ? 'negative' : 'neutral'
            }">
                ${data.ytdPercentageChange < 0 ? '-' : ''}${Math.abs(data.ytdPercentageChange).toFixed(1)}% y/y
            </div>
            <div class="current-month">${data.monthYear}</div>
        `;
    } else {
        container.innerHTML = `
            <div class="current-month">${data.monthYear}</div>
            <div class="dataset-name">${title}</div>
            <div class="dataset-subheading">${subheading}</div>
            <div class="ytd-total">${formattedTotal}</div>
            <div class="ytd-change ${
                data.ytdPercentageChange >= 1 ? 'positive' :
                data.ytdPercentageChange <= -1 ? 'negative' : 'neutral'
            }">
                ${createArrowSvg(data.ytdPercentageChange >= 0)} <!-- Original logic for SVG arrows -->
                ${data.ytdPercentageChange < 0 ? '-' : ''}${Math.abs(data.ytdPercentageChange).toFixed(1)}% y/y
            </div>
        `;
    }
}

// Function to create a KPI chart
function createKPIChart(containerId, data, ytdPercentageChange) {
    let color;
    if (ytdPercentageChange > -1 && ytdPercentageChange < 1) {
        color = '#6c757d';  // Dark grey for neutral changes
    } else if (ytdPercentageChange > 1) {
        color = '#28a745';  // Green for positive changes
    } else {
        color = '#dc3545';  // Red for negative changes
    }

    const currentDate = new Date();
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(currentDate.getFullYear() - 10);
    
    const tenYearData = data
        .filter(item => item.date >= tenYearsAgo)
        .sort((a, b) => a.date - b.date)  // Sort by date ascending
        .map(item => [item.date.getTime(), item.value]);
    
    Highcharts.chart(containerId, {
        chart: {
            type: 'area',
            height: 100,
            margin: [0, 0, 0, 0],
            backgroundColor: 'transparent',
            style: {
                overflow: 'visible'
            }
        },
        title: null,
        credits: { enabled: false },
        xAxis: { visible: false },
        yAxis: { visible: false, min: 0 },
        legend: { enabled: false },
        tooltip: { enabled: false },
        plotOptions: {
            area: {
                marker: { enabled: false },
                lineWidth: 2,
                states: { hover: { enabled: false } },
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.color(color).setOpacity(0.3).get()],
                        [1, Highcharts.color(color).setOpacity(0).get()]
                    ]
                },
                color: color
            }
        },
        series: [{
            data: tenYearData,
            showInLegend: false
        }]
    });
}

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', async function() {
    // First KPI - Airport Arrivals
    const airportData = await loadAirportData();
    if (airportData) {
        updateKPIContent('indicator2-content', airportData, 'Air Arrivals');
        createKPIChart('indicator2-chart', airportData.monthlyData, airportData.ytdPercentageChange);
    }

    // Second KPI - Border Crossings
    const intlData = await loadIntlTravelersData();
    if (intlData) {
        updateKPIContent('indicator3-content', intlData, 'Border Crossings');
        createKPIChart('indicator3-chart', intlData.monthlyData, intlData.ytdPercentageChange);
    }

    // Third KPI - Visitor Spending
    const spendingData = await loadSpendingData();
    if (spendingData) {
        updateKPIContent('indicator4-content', spendingData, 'Visitor Spending');
        createKPIChart('indicator4-chart', spendingData.monthlyData, spendingData.ytdPercentageChange);
    }

    // Fourth KPI - Estimated Visitors
    const visitorsData = await loadEstimatedVisitorsData();
    if (visitorsData) {
        updateKPIContent('indicator1-content', visitorsData, 'Estimated Visitors');
        createKPIChart('indicator1-chart', visitorsData.monthlyData, visitorsData.ytdPercentageChange);
    }

    // Additional indicators
    const occupancyData = await loadOccupancyData();
    if (occupancyData) {
        updateKPIContent('additional1-content', occupancyData, 'Hotel Occupancy Rate');
    }

    const roomRateData = await loadRoomRateData();
    if (roomRateData) {
        updateKPIContent('additional2-content', roomRateData, 'Avg. Daily Room Rate');
    }

    const revenuePerRoomData = await loadRevenuePerRoomData();
    if (revenuePerRoomData) {
        updateKPIContent('additional3-content', revenuePerRoomData, 'Avg. Revenue Per Room');
    }

    /*const vicVisitorsData = await loadVICVisitorsData();
    if (vicVisitorsData) {
        updateKPIContent('additional4-content', vicVisitorsData, 'VIC Visits');
    }*/

    /*const highwayCountsData = await loadHighwayCountsData();
    if (highwayCountsData) {
        updateKPIContent('additional5-content', highwayCountsData, 'Highway Counts');
    }*/

    const strOccupancyData = await loadSTROccupancyData();
    if (strOccupancyData) {
        updateKPIContent('additional6-content', strOccupancyData, 'STR Occupancy Rate');
    }

    const strADRData = await loadSTRADRData();
    if (strADRData) {
        updateKPIContent('additional7-content', strADRData, 'STR Avg. Daily Rate');
    }

    const strRevPARData = await loadSTRRevPARData();
    if (strRevPARData) {
        updateKPIContent('additional8-content', strRevPARData, 'STR Revenue Per Room');
    }

    const pcVisitorsData = await loadPCVisitorData();
    if (pcVisitorsData) {
        updateKPIContent('additional9-content', pcVisitorsData, 'Parks Canada Visits');
    }

    /*const scFuelPrices = await loadFuelPrices();
    if (scFuelPrices) {
        updateKPIContent('additional10-content', scFuelPrices, 'Average Fuel Price');
    }*/

    const envCampgroundData = await loadCampgroundVisitorData();
    if (envCampgroundData) {
        updateKPIContent('additional11-content', envCampgroundData, 'Campground Visits');
    }

    const scAccommodationEmployment = await loadAccommodationEmployment();
    if (scAccommodationEmployment) {
        updateKPIContent('additional12-content', scAccommodationEmployment, 'Employment in Accom.');
    }

    const scRestaurantSales = await loadRestaurantSales();
    if (scRestaurantSales) {
        updateKPIContent('additional13-content', scRestaurantSales, 'YTD Restaurant Sales');
    }

    const scRetailSales = await loadRetailSales();
    if (scRetailSales) {
        updateKPIContent('additional14-content', scRetailSales, 'YTD Retail Sales');
    }

});
