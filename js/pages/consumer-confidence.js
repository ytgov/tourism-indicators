import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';

// Function to create arrow SVG
function createArrowSvg(isPositive) {
    return `<svg class="svg-arrow" width="20" height="20" viewBox="0 0 448 512" style="transform: ${isPositive ? 'none' : 'rotate(180deg)'}">
        <path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5-9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3-9.8-24.8-10-34.3.4z"></path>
    </svg>`;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const data = await loadCSVData('data/vw_kpi_cboc_consumer_confidence.csv?'+Math.random());
        
        if (!data || !data.data) {
            console.error('No data available');
            return;
        }

        // Update metric cards with latest data
        function updateMetricCards() {
            const sortedData = [...data.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
            const latestData = sortedData[0];
            
            if (!latestData) {
                console.error('No latest data available');
                return;
            }

            // Update latest monthly amount
            const latestMonthlyElement = document.getElementById('latest-monthly');
            const latestMonthlyDateElement = document.getElementById('latest-monthly-date');
            if (latestData) {
                const monthlyTotal = parseFloat(latestData[3]);
                const date = new Date(latestData[0]);
                const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
                latestMonthlyElement.textContent = monthlyTotal;
                latestMonthlyDateElement.textContent = monthYear;
            }

            // Update YTD amount
            const ytdAmountElement = document.getElementById('ytd-amount');
            const ytdDateRangeElement = document.getElementById('ytd-date-range');
            if (latestData) {
                const ytdTotal = parseFloat(latestData[6]);
                const date = new Date(latestData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();
                
                ytdAmountElement.textContent = ytdTotal;
                ytdDateRangeElement.textContent = `Jan - ${month} ${year}`;
            }

            // Update YTD change
            const ytdChangeElement = document.getElementById('ytd-change');
            if (latestData && latestData[8]) {
                const ytdChangeValue = parseFloat(latestData[8]);
                let color;
                if (ytdChangeValue >= -1 && ytdChangeValue <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdChangeValue > 1) {
                    color = '#28a745';  // Green for positive changes
                } else {
                    color = '#dc3545';  // Red for negative changes
                }
                const arrow = createArrowSvg(ytdChangeValue >= 0);
                ytdChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${ytdChangeValue.toFixed(1)}% y/y</span>`;
            }

            // Update 2019 change
            const ytdChangeElement2019 = document.getElementById('ytd-change-2019');
            if (latestData[10]) {
                const ytdChangeValue2019 = parseFloat(latestData[10]);
                let color2019;
                if (ytdChangeValue2019 >= -1 && ytdChangeValue2019 <= 1) {
                    color2019 = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdChangeValue2019 > 1) {
                    color2019 = '#28a745';  // Green for positive changes
                } else {
                    color2019 = '#dc3545';  // Red for negative changes
                }
                const arrow2019 = createArrowSvg(ytdChangeValue2019 >= 0);
                ytdChangeElement2019.innerHTML = `<span style="color: ${color2019};">${arrow2019}${ytdChangeValue2019.toFixed(1)}% from 2019</span>`;
            }
        }

        // Initialize charts for both views
        const monthlyConfig = {
            ...datasetConfigs.consumerConfidence,
            dataFile: 'data/vw_kpi_cboc_consumer_confidence.csv?'+Math.random(),
            
        };
        
        const monthlyChart = new ChartBuilder('indicator-chart', monthlyConfig);

        await monthlyChart.initialize();

        // Update metrics immediately
        updateMetricCards();

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});
