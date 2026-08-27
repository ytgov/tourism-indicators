import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await loadCSVData('data/vw_kpi_moneris_total_spending_ytd_summary.csv?' + Math.random());

        if (!data || !data.data) {
            console.error('No data available');
            return;
        }

        const sortedData = [...data.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
        const latestData = sortedData[0];

        if (!latestData) {
            console.error('No latest data available');
            return;
        }

        const formatMillions = (value) => '$' + (parseFloat(value) / 1000000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';

        // Latest monthly spend
        const latestMonthlyElement = document.getElementById('latest-monthly');
        const latestMonthlyDateElement = document.getElementById('latest-monthly-date');
        if (latestMonthlyElement) {
            const date = new Date(latestData[0]);
            latestMonthlyElement.textContent = formatMillions(latestData[3]);
            latestMonthlyDateElement.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        }

        // Year-to-date spend
        const ytdAmountElement = document.getElementById('ytd-amount');
        const ytdDateRangeElement = document.getElementById('ytd-date-range');
        if (ytdAmountElement) {
            const date = new Date(latestData[0]);
            const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
            const year = date.getUTCFullYear();
            ytdAmountElement.textContent = formatMillions(latestData[6]);
            ytdDateRangeElement.textContent = `January - ${month} ${year}`;
        }

        // Year-to-date change
        const ytdChangeElement = document.getElementById('ytd-change');
        if (ytdChangeElement && latestData[8]) {
            const ytdChangeValue = parseFloat(latestData[8]);
            let color;
            if (ytdChangeValue >= -1 && ytdChangeValue <= 1) {
                color = '#6c757d';  // Neutral
            } else if (ytdChangeValue > 1) {
                color = '#0f6723';  // Positive
            } else {
                color = '#a42330';  // Negative
            }
            const arrow = createArrowSvg(ytdChangeValue);
            ytdChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${ytdChangeValue.toFixed(1)}% y/y</span>`;
        }
    } catch (error) {
        console.error('Error loading visitor spending metric cards:', error);
    }
});
