// Function to fetch and display CSV data as a table
async function displayDataStatusTable() {
    try {
        // Fetch the CSV file
        const response = await fetch('../data/vw_etl_data_status.csv?'+Math.random());
        const csvText = await response.text();

        // Parse CSV into an array of rows
        const rows = csvText.trim().split('\n');
        const headers = rows[0].split(',');
        const data = rows.slice(1).map(row => row.split(','));

        // Get the table container
        const tableContainer = document.getElementById('data-status-table');

        // Create table element
        const table = document.createElement('table');
        table.classList.add('table', 'table-striped', 'table-sm', 'table-hover', 'w-100');

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.classList.add('table-light');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.classList.add('text-nowrap', 'px-2');
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        data.forEach(rowData => {
            const tr = document.createElement('tr');
            rowData.forEach((cellData, index) => {
                const td = document.createElement('td');

                // Format columns
                if (index === 0) {
                    const date = new Date(cellData);
                    td.textContent =  date.toISOString().split('T')[0];
                } else if (index === 2) {
                    td.textContent = cellData;
                    if (cellData === 'SUCCESS') {
                        td.style.color = '#0f6723';
                    } else {
                        td.style.color = '#a42330';
                        td.style.fontWeight = 'bold';
                    }
                } else if (index === 3 && rowData[1] === 'Export') {
                    // Format the 4th column as a hyperlink if the process (index 1) is 'Export'
                    const link = document.createElement('a');
                    link.href = './data/' + cellData + '.csv'; // Assume the cellData contains the URL
                    link.textContent = cellData + '.csv'; // Display text for the hyperlink
                    link.target = '_blank'; // Open the link in a new tab
                    td.appendChild(link);
                }
                else {
                    td.textContent = cellData;
                }
                td.classList.add('px-2');
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        // Add table to container
        const tableWrapper = document.createElement('div');
        tableWrapper.classList.add('table-responsive');
        tableWrapper.appendChild(table);
        tableContainer.appendChild(tableWrapper);
    } catch (error) {
        console.error('Error loading CSV:', error);
        const tableContainer = document.getElementById('data-status-table');
        tableContainer.innerHTML = `<p>Error loading data: ${error.message}</p>`;
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', displayDataStatusTable);