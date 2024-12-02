class DataTable {
    constructor(containerId, csvUrls) {
        this.containerId = containerId;
        this.csvUrls = csvUrls; // Array of predefined CSV URLs
        this.data = {};
        this.columns = [];
        this.selectedMonthYear = null;
    }

    async initialize() {
        const container = document.getElementById(this.containerId);

        if (!container) {
            console.error(`Container with ID "${this.containerId}" not found.`);
            return;
        }

        try {
            // Fetch and process all CSVs
            await Promise.all(this.csvUrls.map(url => this.fetchData(url)));

            if (Object.keys(this.data).length === 0) {
                console.error('No data available for rendering the table.');
                return;
            }

            this.renderDropdown(container);
            this.renderTable(container);
        } catch (error) {
            console.error('Error initializing DataTable:', error);
        }
    }

    async fetchData(csvUrl) {
        try {
            const response = await fetch(csvUrl);
            const csvText = await response.text();

            const rows = csvText
                .split('\n')
                .map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()))
                .filter(row => row.length > 1); // Skip incomplete rows

            if (rows.length === 0) {
                throw new Error(`No valid data found in the CSV file at ${csvUrl}.`);
            }

            const csvName = csvUrl.split('/').pop().replace('.csv', ''); // Use filename as key
            this.columns[csvName] = rows[0]; // First row is the header
            this.data[csvName] = rows.slice(1); // Remaining rows are the data
        } catch (error) {
            console.error(`Error fetching or processing CSV data from ${csvUrl}:`, error);
            throw error;
        }
    }

    renderDropdown(container) {
        let monthYearOptions = new Set();

        // Extract unique month-year combinations from all datasets
        Object.values(this.data).forEach(rows => {
            rows.forEach(row => {
                const year = row[1]; // Assuming the second column contains the year
                const month = row[2]; // Assuming the third column contains the month
                if (year && month) {
                    const monthYear = `${this.getMonthName(month)} ${year}`;
                    monthYearOptions.add(monthYear);
                }
            });
        });

        monthYearOptions = Array.from(monthYearOptions).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const monthIndexA = this.getMonthIndex(monthA);
            const monthIndexB = this.getMonthIndex(monthB);

            return yearA !== yearB
                ? parseInt(yearB) - parseInt(yearA)
                : monthIndexB - monthIndexA;
        });

        this.selectedMonthYear = monthYearOptions[0]; // Default to the most recent month-year

        // Create dropdown
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'mb-4 mt-3 month-year-select-container col-md-4';
        dropdownContainer.innerHTML = `
            <div class="row align-items-center">
                <div class="col-auto">
                    <label for="month-year-select" class="form-label mb-0">Select Month and Year:</label>
                </div>
                <div class="col">
                    <select id="month-year-select" class="form-control custom-select">
                        ${monthYearOptions.map(option =>
                            `<option value="${option}" ${option === this.selectedMonthYear ? 'selected' : ''}>${option}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;

        container.insertBefore(dropdownContainer, container.firstChild);

        // Event listener for dropdown change
        const monthYearSelect = container.querySelector('#month-year-select');
        monthYearSelect.addEventListener('change', (event) => {
            this.selectedMonthYear = event.target.value;
            this.renderTable(container);
        });
    }

    renderTable(container) {
        let tableContainer = container.querySelector('.table-responsive');
        if (!tableContainer) {
            tableContainer = document.createElement('div');
            tableContainer.className = 'table-responsive';
            container.appendChild(tableContainer);
        }

        tableContainer.innerHTML = '';

        const datasetLabels = {
            "vw_kpi_cbre_occupancy_rate_ytd_summary": "Occupancy Rate",
            "vw_kpi_cbre_avg_daily_room_rate_ytd_summary": "Average Daily Room Rate",
            "vw_kpi_cbre_revpar_ytd_summary": "RevPAR"
        };

        const datasetFormats = {
            "vw_kpi_cbre_occupancy_rate_ytd_summary": "%", // Use % for Occupancy Rate
            "vw_kpi_cbre_avg_daily_room_rate_ytd_summary": "$", // Use $ for Average Daily Room Rate
            "vw_kpi_cbre_revpar_ytd_summary": "$" // Use $ for RevPAR
        };

        // Define the desired order of datasets
        const datasetOrder = [
            "vw_kpi_cbre_occupancy_rate_ytd_summary",
            "vw_kpi_cbre_avg_daily_room_rate_ytd_summary",
            "vw_kpi_cbre_revpar_ytd_summary"
        ];
            

        // Create table with filtered and formatted columns
        const table = document.createElement('table');
        table.className = 'table table-bordered table-striped';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>${this.selectedMonthYear.split(' ')[0]} (${this.selectedMonthYear.split(' ')[1] -1})</th>
                    <th>${this.selectedMonthYear.split(' ')[0]} (${this.selectedMonthYear.split(' ')[1]})</th>
                    <th>% Change</th>
                    <th>Jan - ${this.selectedMonthYear.split(' ')[0]} ${this.selectedMonthYear.split(' ')[1] -1} (YTD)</th>
                    <th>Jan - ${this.selectedMonthYear.split(' ')[0]} ${this.selectedMonthYear.split(' ')[1]} (YTD)</th>
                    <th>% Change (YTD)</th>
                </tr>
            </thead>
            <tbody>
                    ${datasetOrder.map(datasetName => {
                        const rows = this.data[datasetName] || [];
                        const filteredRows = rows.filter(row => {
                        const year = row[1];
                        const month = row[2];
                        const monthYear = `${this.getMonthName(month)} ${year}`;
                        return monthYear === this.selectedMonthYear;
                    });
                    if (filteredRows.length === 0) return ''; // Skip if no data for selected month-year
                    
                    // Determine the prefix or suffix for the dataset
                    const format = datasetFormats[datasetName] || ''; // Default to no formatting
                    
                    return filteredRows.map(row =>
                        `<tr>
                            <td style="width:25%">${datasetLabels[datasetName]}</td>
                            <td style="width:10%">${format === "$" ? "$" : ""}${parseFloat(row[4]).toFixed(1) || ''}${format === "%" ? "%" : ""}</td>
                            <td style="width:10%">${format === "$" ? "$" : ""}${parseFloat(row[3]).toFixed(1) || ''}${format === "%" ? "%" : ""}</td>
                            <td style="width:10%">${this.createChangeCell(row[5])}</td>
                            <td style="width:15%">${format === "$" ? "$" : ""}${parseFloat(row[7]).toFixed(1) || ''}${format === "%" ? "%" : ""}</td>
                            <td style="width:15%">${format === "$" ? "$" : ""}${parseFloat(row[6]).toFixed(1) || ''}${format === "%" ? "%" : ""}</td>
                            <td style="width:15%">${this.createChangeCell(row[8])}</td>
                        </tr>`
                    ).join('');
                }).join('')}
            </tbody>
        `;

        tableContainer.appendChild(table);
    }

    createChangeCell(change) {
        const numericChange = parseFloat(change) || 0;
        const changeClass = numericChange > 0 ? 'text-success' : numericChange < 0 ? 'text-danger' : '';
        const arrow = numericChange > 0 ? '↑' : numericChange < 0 ? '↓' : '';
        return `<span class="${changeClass}">${arrow} ${Math.abs(numericChange).toFixed(1)}%</span>`;
    }

    getMonthName(monthNumber) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[parseInt(monthNumber, 10) - 1];
    }

    getMonthIndex(monthName) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames.indexOf(monthName);
    }
}

// Example Usage
document.addEventListener('DOMContentLoaded', function () {
    const csvUrls = [
        'data/vw_kpi_cbre_occupancy_rate_ytd_summary.csv',
        'data/vw_kpi_cbre_avg_daily_room_rate_ytd_summary.csv',
        'data/vw_kpi_cbre_revpar_ytd_summary.csv'
    ];



    const dataTable = new DataTable('data-table-container', csvUrls);
    dataTable.initialize();
});
