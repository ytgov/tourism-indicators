import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

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
                const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
                const year = date.getUTCFullYear();
                
                ytdAmountElement.textContent = ytdTotal;
                ytdDateRangeElement.textContent = `January - ${month} ${year}`;
            }

            // Update YTD change
            const ytdChangeElement = document.getElementById('ytd-change');
            if (latestData && latestData[8]) {
                const ytdChangeValue = parseFloat(latestData[8]);
                let color;
                if (ytdChangeValue >= -1 && ytdChangeValue <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (ytdChangeValue > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(ytdChangeValue);
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
                    color2019 = '#0f6723';  // Green for positive changes
                } else {
                    color2019 = '#a42330';  // Red for negative changes
                }
                const arrow2019 = createArrowSvg(ytdChangeValue2019);
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
