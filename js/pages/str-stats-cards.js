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
        const occupancyData = await loadCSVData('data/vw_kpi_str_occupancy_ytd_summary.csv');
        const adrData = await loadCSVData('data/vw_kpi_str_adr_ytd_summary.csv');
        const revparData = await loadCSVData('data/vw_kpi_str_revpar_ytd_summary.csv');
        
        // Update metric cards with latest data
        function updateMetricCards() {
            const sortedOccData = [...occupancyData.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
            const latestOccData = sortedOccData[0];

            const sortedAdrData = [...adrData.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
            const latestAdrData = sortedAdrData[0];

            const sortedRevparData = [...revparData.data].sort((a, b) => new Date(b[0]) - new Date(a[0]));
            const latestRevparData = sortedRevparData[0];
            
            // Update occupancy
            const occElement = document.getElementById('ytd-occupancy');
            const occChangeElement = document.getElementById('ytd-occ-change');
            const occDateElement = document.getElementById('latest-monthly-date');

            if (latestOccData) {
                // Get total YTD occupancy
                const monthlyTotal = parseFloat(latestOccData[6]).toFixed(1) + '%';
                const date = new Date(latestOccData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();

                // Get YTD change percentage
                const occChange = parseFloat(latestOccData[8]);
                let color;
                if (occChange >= -1 && occChange <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (occChange > 1) {
                    color = '#28a745';  // Green for positive changes
                } else {
                    color = '#dc3545';  // Red for negative changes
                }
                const arrow = createArrowSvg(occChange >= 0);

                // Update occupancy elements
                occElement.textContent = monthlyTotal;
                occChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${occChange.toFixed(1)}% y/y</span>`;
                occDateElement.textContent = `Jan - ${month} ${year}`;
            }


            // Update adr
            const adrElement = document.getElementById('ytd-adr');
            const adrChangeElement = document.getElementById('ytd-adr-change');
            const adrDateRangeElement = document.getElementById('ytd-adr-date-range');
            //console.log(latestAdrData);
            if (latestAdrData) {
                const ytdTotal = '$' + parseFloat(latestAdrData[6]).toLocaleString();
                const date = new Date(latestAdrData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();

                // Get YTD change percentage
                const adrChange = parseFloat(latestAdrData[8]);
                let color;
                if (adrChange >= -1 && adrChange <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (adrChange > 1) {
                    color = '#28a745';  // Green for positive changes
                } else {
                    color = '#dc3545';  // Red for negative changes
                }
                const arrow = createArrowSvg(adrChange >= 0);
                
                adrElement.textContent = ytdTotal;
                adrChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${adrChange.toFixed(1)}% y/y</span>`;
                adrDateRangeElement.textContent = `Jan - ${month} ${year}`;
            }

            // Update revpar
            const revElement = document.getElementById('ytd-revpar');
            const revChangeElement = document.getElementById('ytd-rev-change');
            const revDateRangeElement = document.getElementById('ytd-rev-date-range');
            if (latestRevparData) {
                const ytdTotal = '$' + parseFloat(latestRevparData[6]).toLocaleString();
                const date = new Date(latestRevparData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();

                // Get YTD change percentage
                const revChange = parseFloat(latestRevparData[8]);
                let color;
                if (revChange >= -1 && revChange <= 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (revChange > 1) {
                    color = '#28a745';  // Green for positive changes
                } else {
                    color = '#dc3545';  // Red for negative changes
                }
                const arrow = createArrowSvg(revChange >= 0);
                
                revElement.textContent = ytdTotal;
                revChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${revChange.toFixed(1)}% y/y</span>`;
                revDateRangeElement.textContent = `Jan - ${month} ${year}`;
            }
        }

        // Update metrics immediately
        updateMetricCards();


    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});
