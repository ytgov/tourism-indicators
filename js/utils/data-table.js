class DataTable {
    constructor(containerId) {
        this.containerId = containerId;
        this.data = [];
        this.columns = [];
        this.monthOptions = [];
        this.selectedMonth = null;
    }

    async initialize() {
        const container = document.getElementById(this.containerId);

        if (!container) {
            console.error(`Container with ID "${this.containerId}" not found.`);
            return;
        }

        const csvUrl = container.getAttribute('data-csv-url');

        if (!csvUrl) {
            console.error('No CSV URL found in "data-csv-url" attribute of the container.');
            return;
        }

        try {
            await this.fetchData(csvUrl);

            if (this.monthOptions.length === 0) {
                console.error('No month options available for rendering the dropdown.');
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

            // Ensure rows are split properly and empty lines are removed
            const rows = csvText
                .split('\n')
                .map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()))
                .filter(row => row.length > 1); // Skip empty/incomplete rows

            if (rows.length === 0) {
                throw new Error('No valid data found in the CSV file.');
            }

            // Parse header and rows
            this.columns = rows[0]; // First row is the header
            this.data = rows.slice(1); // Remaining rows are the data

            // Sort data by date
            this.data.sort((a, b) => new Date(a[0]) - new Date(b[0]));

            // Extract unique months for dropdown
            this.monthOptions = [...new Set(this.data.map(row => `${this.getMonthName(row[2])} ${row[1]}`))];

            if (this.monthOptions.length === 0) {
                throw new Error('Failed to generate month options. Ensure the source data has valid dates.');
            }

            // Sort months in descending order
            this.monthOptions.sort((a, b) => {
                const [monthA, yearA] = a.split(' ');
                const [monthB, yearB] = b.split(' ');
                const monthIndexA = this.getMonthIndex(monthA);
                const monthIndexB = this.getMonthIndex(monthB);
                
                if (yearA !== yearB) {
                    return parseInt(yearB) - parseInt(yearA);
                }
                return monthIndexB - monthIndexA;
            });

            this.selectedMonth = this.monthOptions[0]; // Default to the most recent month
        } catch (error) {
            console.error('Error fetching or processing CSV data:', error);
            throw error;
        }
    }

    //sort table
    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const sortIndicator = table.querySelectorAll('.sort-indicator');
    
        // Determine current sort order (ascending or descending)
        let ascending = true;
        if (sortIndicator[columnIndex].classList.contains('sort-asc')) {
            ascending = false;
        }
    
        // Clear existing sort indicators
        sortIndicator.forEach(indicator => indicator.classList.remove('sort-asc', 'sort-desc'));
    
        // Add the new sort indicator
        sortIndicator[columnIndex].classList.add(ascending ? 'sort-asc' : 'sort-desc');
    
        // Sort rows based on the selected column
        rows.sort((a, b) => {
            const cellA = a.children[columnIndex].textContent.trim();
            const cellB = b.children[columnIndex].textContent.trim();
    
            // Try to parse numbers, fallback to string comparison
            const valueA = parseFloat(cellA.replace(/[^0-9.-]+/g, '')) || cellA;
            const valueB = parseFloat(cellB.replace(/[^0-9.-]+/g, '')) || cellB;
    
            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
        });
    
        // Re-append rows in the new order
        rows.forEach(row => tbody.appendChild(row));
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

    renderDropdown(container) {
        // Check if dropdown already exists
        let existingDropdown = container.querySelector('.month-select-container');
        if (existingDropdown) {
            // Update existing dropdown value if needed
            const monthSelect = existingDropdown.querySelector('select');
            if (monthSelect && monthSelect.value !== this.selectedMonth) {
                monthSelect.value = this.selectedMonth;
            }
            return;
        }

        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'mb-4 mt-3 month-select-container col-md-6';
        dropdownContainer.innerHTML = `
            <div class="row align-items-center">
                <div class="col-auto">
                    <label for="month-select" class="form-label mb-0">Select Month:</label>
                </div>
                <div class="col">
                    <select id="month-select" class="form-control custom-select">
                        ${this.monthOptions.map(option => 
                            `<option value="${option}" ${option === this.selectedMonth ? 'selected' : ''}>${option}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        `;

        // Insert at the beginning of the container
        container.insertBefore(dropdownContainer, container.firstChild);

        // Attach event listener for dropdown change
        const monthSelect = container.querySelector('#month-select');
        if (!monthSelect) {
            console.error('Failed to render month dropdown. Check container initialization.');
            return;
        }

        monthSelect.value = this.selectedMonth; // Ensure the default value is set
        monthSelect.addEventListener('change', (event) => {
            this.selectedMonth = event.target.value;
            this.renderTable(container);
        });
    }

    renderTable(container) {
        // Find or create the table container
        let tableContainer = container.querySelector('.table-responsive');
        if (!tableContainer) {
            tableContainer = document.createElement('div');
            tableContainer.className = 'table-responsive';
            container.appendChild(tableContainer);
        }
    
        // Clear existing table content
        tableContainer.innerHTML = '';
    
        // Filter data for the selected month
        const selectedData = this.data.filter(row => {
            if (row.length < 3) return false; // Skip incomplete rows
            const monthYear = `${this.getMonthName(row[2])} ${row[1]}`;
            return monthYear === this.selectedMonth;
        });
    
        // Handle case where no data is available
        if (!selectedData.length) {
            tableContainer.innerHTML = '<p>No data available for the selected month.</p>';
            return;
        }
    
        // Extract selected month and year
        const [month, year] = this.selectedMonth.split(' ');
        const prevYear = parseInt(year, 10) - 1;
        const ytdRange = selectedData[0][10] ? selectedData[0][10].replace(/January - /, 'Jan - ') : '';
    
        // Determine if the 4th column contains "monthly"
        const containsMonthly = this.columns[3]?.toLowerCase().includes('monthly');
        const offset = containsMonthly ? 1 : 0; // Adjust column indices dynamically
    
        // Format column headers by replacing underscores with spaces
        const formattedHeaders = this.columns.map(header => header.replace(/_/g, ' '));
    
        // Dynamically create column titles with percentages
        const headers = [
            containsMonthly ? null : { text: formattedHeaders[3] || '', width: '30%' }, // Optional 4th column
            { text: `${month} ${prevYear}`, width: '10%' },
            { text: `${month} ${year}`, width: '10%' },
            { text: '% Change', width: '10%' },
            { text: `${ytdRange} ${prevYear} (YTD)`, width: '15%' },
            { text: `${ytdRange} ${year} (YTD)`, width: '15%' },
            { text: '% Change', width: '10%' }
        ].filter(header => header); // Remove null headers if the 4th column is absent or skipped
    
        // Create table
        const table = document.createElement('table');
        table.className = 'table table-bordered table-striped';
        table.innerHTML = `
            <thead>
                <tr>
                    ${headers.map((header, index) =>
                        `<th style="width: ${header.width};" data-column="${index}">${header.text} <span class="sort-indicator"></span></th>`
                    ).join('')}
                </tr>
            </thead>
            <tbody>
                ${selectedData.map(row => this.createTableRow(row, offset)).join('')}
            </tbody>
        `;
    
        // Add sorting functionality
        const thElements = table.querySelectorAll('thead th');
        thElements.forEach(th => {
            th.addEventListener('click', () => this.sortTable(table, parseInt(th.getAttribute('data-column'), 10)));
        });
    
        tableContainer.appendChild(table);
    }
    
    
    
    createTableRow(row, offset = 0) {
        // Helper function to safely parse numerical values
        const getNumericValue = (index) => (row.length > index ? parseFloat(row[index]) || 0 : 0);
    
        // Safely extract values
        const optionalColumn = offset === 0 ? row[3] || '' : ''; // Only include the optional column if offset is 0
        const prevMonthly = getNumericValue(5 - offset);
        const monthly = getNumericValue(4 - offset);
        const monthlyChange = getNumericValue(6 - offset);
        const prevYTD = getNumericValue(8 - offset);
        const ytd = getNumericValue(7 - offset);
        const ytdChange = getNumericValue(9 - offset);
    
        // Format row data
        const rowData = [
            optionalColumn,
            prevMonthly.toLocaleString(),
            monthly.toLocaleString(),
            this.createChangeCell(monthlyChange),
            prevYTD.toLocaleString(),
            ytd.toLocaleString(),
            this.createChangeCell(ytdChange)
        ];
    
        // Filter out optionalColumn if it's empty
        const filteredRowData = offset === 1 ? rowData.slice(1) : rowData;
    
        // Construct HTML for the row
        return `
            <tr>
                ${filteredRowData.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
        `;
    }
    
    

    createChangeCell(change) {
        const changeClass = change > 0 ? 'text-success' : change < 0 ? 'text-danger' : '';
        const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '';
        return `<span class="${changeClass}">${arrow} ${Math.abs(change).toFixed(1)}%</span>`;
    }
}

// Example Usage
document.addEventListener('DOMContentLoaded', function () {
    const dataTable = new DataTable('data-table-container');
    dataTable.initialize();
});
