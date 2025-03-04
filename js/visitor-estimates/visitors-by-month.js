import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_kpi_estimated_visitors.csv?"+Math.random();

    function updateMetricsCards(data) {
        if (!data || data.length === 0) {
            console.error('No data available to update metrics cards.');
            return;
        }

        // Sort data by date ascending to ensure we get the correct latest data
        data.sort((a, b) => a.date - b.date);

        // Find the most recent data point
        const latestData = data[data.length - 1];

        // Safely access properties of the latest data
        const monthlyTotal = latestData.monthlyTotal || 0;
        const ytdTotal = latestData.ytdTotal || 0;
        const ytdChange = latestData.ytdChange || 0;
        const c2019Change = latestData.c2019Change || 0;

        // Update Latest Monthly Visitors
        document.getElementById('latest-monthly').textContent = monthlyTotal.toLocaleString();
        document.getElementById('latest-monthly-date').textContent = latestData.date.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });

        // Calculate current year if not already provided
        const currentYear = latestData.date.getFullYear();

        // Update YTD Amount
        document.getElementById('ytd-amount').textContent = ytdTotal.toLocaleString();
        document.getElementById('ytd-date-range').textContent = `January - ${latestData.date.toLocaleString('default', {
            month: 'long',
            timeZone: 'UTC'
        })} ${currentYear}`;

        // Calculate and update Year-to-date change
        const changeElement = document.getElementById('ytd-change');
        const arrow = createArrowSvg(ytdChange);
        changeElement.innerHTML = `${arrow}${ytdChange.toFixed(1)}% y/y`;

        // Calculate and update 2019 Change
        const c2019ChangeElement = document.getElementById('c2019-change');
        const cArrow = createArrowSvg(c2019Change);
        c2019ChangeElement.innerHTML = `${cArrow}${Math.abs(c2019Change.toFixed(1))}% from 2019`;

        // Safely update classes without overwriting existing ones
        changeElement.classList.remove('text-success', 'text-danger', 'text-neutral');
        c2019ChangeElement.classList.remove('text-success', 'text-danger', 'text-neutral');

        if (ytdChange >= 1) {
            changeElement.classList.add('text-success');
        } else if (ytdChange <= -1) {
            changeElement.classList.add('text-danger');
        } else {
            changeElement.classList.add('text-neutral');
        }

        if (c2019Change >= 1) {
            c2019ChangeElement.classList.add('text-success');
        } else if (c2019Change <= -1) {
            c2019ChangeElement.classList.add('text-danger');
        } else {
            c2019ChangeElement.classList.add('text-neutral');
        }

    }

    // Fetch and process data
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            const rows = csvText.split('\n')
                .map(row => row.split(','));

            // Remove header row
            //rows.shift();

            // Parse data and ensure it's sorted by date ascending
            const data = rows
                .filter(row => row.length > 1 && row[3].trim() === 'All') // Filter for 'All' transportation type
                .map(row => ({
                    date: new Date(row[0].replace(/"/g, '')),
                    monthlyTotal: parseInt(row[4]) || 0,
                    ytdTotal: parseInt(row[7]) || 0,
                    ytdChange: parseFloat(row[9]) || 0,
                    c2019Change: parseFloat(row[11]) || 0
                }))
                .filter(item => !isNaN(item.date) && !isNaN(item.monthlyTotal))
                .sort((a, b) => a.date - b.date); // Sort by date ascending

            // Double check the sort before passing to functions
            data.sort((a, b) => a.date - b.date);

            updateMetricsCards(data);
        })
        .catch(error => {
            console.error('Error loading or processing data:', error);
            const container = document.getElementById('monthly-visitors-chart');
            if (container) {
                container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
            }
        });
});
