import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';
import { loadCSVData } from '../utils/data-utils.js';
import { createArrowSvg } from '../utils/svg-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data directly
        const occupancyData = await loadCSVData('data/vw_kpi_cbre_occupancy_rate_ytd_summary.csv?'+Math.random());
        const adrData = await loadCSVData('data/vw_kpi_cbre_avg_daily_room_rate_ytd_summary.csv?'+Math.random());
        const revparData = await loadCSVData('data/vw_kpi_cbre_revpar_ytd_summary.csv?'+Math.random());
        
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
            const occChangeElement2019 = document.getElementById('ytd-occ-change-2019');
            const occDateElement = document.getElementById('latest-monthly-date');
            const occDateElement2019 = document.getElementById('latest-monthly-date-2019');

            if (latestOccData) {
                // Get total YTD occupancy
                const monthlyTotal = parseFloat(latestOccData[6]).toFixed(1) + '%';
                const date = new Date(latestOccData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();

                // Get YTD change percentage
                const occChange = parseFloat(latestOccData[8]);
                let color;
                if (occChange > -1 && occChange < 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (occChange > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(occChange);

                // Get 2019 change percentage
                const occChange2019 = parseFloat(latestOccData[10]);
                let color2019;
                if (occChange2019 > -1 && occChange2019 < 1) {
                    color2019 = '#6c757d';  // Dark grey for neutral changes
                } else if (occChange2019 > 1) {
                    color2019 = '#0f6723';  // Green for positive changes
                } else {
                    color2019 = '#a42330';  // Red for negative changes
                }
                const arrow2019 = createArrowSvg(occChange2019);

                // Update occupancy elements
                occElement.textContent = monthlyTotal;
                occChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${occChange.toFixed(1)}% y/y</span>`;
                occChangeElement2019.innerHTML = `<span style="color: ${color2019};">${arrow2019}${occChange2019.toFixed(1)}% y/y</span>`;
                occDateElement.textContent = `Jan - ${month} ${year}`;
                occDateElement2019.textContent = `From 2019`;
            }


            // Update adr
            const adrElement = document.getElementById('ytd-adr');
            const adrChangeElement = document.getElementById('ytd-adr-change');
            const adrDateRangeElement = document.getElementById('ytd-adr-date-range');
            const adrChangeElement2019 = document.getElementById('ytd-adr-change-2019');
            const adrDateRangeElement2019 = document.getElementById('ytd-adr-date-range-2019');

            //console.log(latestAdrData);
            if (latestAdrData) {
                const ytdTotal = '$' + parseFloat(latestAdrData[6]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const date = new Date(latestAdrData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();

                // Get YTD change percentage
                const adrChange = parseFloat(latestAdrData[8]);
                let color;
                if (adrChange > -1 && adrChange < 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (adrChange > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(adrChange);

                // Get YTD change percentage
                const adrChange2019 = parseFloat(latestAdrData[10]);
                let color2019;
                if (adrChange2019 > -1 && adrChange2019 < 1) {
                    color2019 = '#6c757d';  // Dark grey for neutral changes
                } else if (adrChange2019 > 1) {
                    color2019 = '#0f6723';  // Green for positive changes
                } else {
                    color2019 = '#a42330';  // Red for negative changes
                }
                const arrow2019 = createArrowSvg(adrChange2019);
                
                adrElement.textContent = ytdTotal;
                adrChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${adrChange.toFixed(1)}% y/y</span>`;
                adrChangeElement2019.innerHTML = `<span style="color: ${color2019};">${arrow2019}${adrChange2019.toFixed(1)}% y/y</span>`;
                adrDateRangeElement.textContent = `Jan - ${month} ${year}`;
                adrDateRangeElement2019.textContent = `From 2019`;
            }

            // Update revpar
            const revElement = document.getElementById('ytd-revpar');
            const revChangeElement = document.getElementById('ytd-rev-change');
            const revDateRangeElement = document.getElementById('ytd-rev-date-range');
            const revChangeElement2019 = document.getElementById('ytd-rev-change-2019');
            const revDateRangeElement2019 = document.getElementById('ytd-rev-date-range-2019');

            if (latestRevparData) {
                const ytdTotal = '$' + parseFloat(latestRevparData[6]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const date = new Date(latestRevparData[0]);
                const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                const year = date.getFullYear();

                // Get YTD change percentage
                const revChange = parseFloat(latestRevparData[8]);
                let color;
                if (revChange > -1 && revChange < 1) {
                    color = '#6c757d';  // Dark grey for neutral changes
                } else if (revChange > 1) {
                    color = '#0f6723';  // Green for positive changes
                } else {
                    color = '#a42330';  // Red for negative changes
                }
                const arrow = createArrowSvg(revChange);

                // Get YTD change percentage
                const revChange2019 = parseFloat(latestRevparData[10]);
                let color2019;
                if (revChange2019 > -1 && revChange2019 < 1) {
                    color2019 = '#6c757d';  // Dark grey for neutral changes
                } else if (revChange2019 > 1) {
                    color2019 = '#0f6723';  // Green for positive changes
                } else {
                    color2019 = '#a42330';  // Red for negative changes
                }
                const arrow2019 = createArrowSvg(revChange2019);
                
                revElement.textContent = ytdTotal;
                revChangeElement.innerHTML = `<span style="color: ${color};">${arrow}${revChange.toFixed(1)}% y/y</span>`;
                revDateRangeElement.textContent = `Jan - ${month} ${year}`;
                revChangeElement2019.innerHTML = `<span style="color: ${color2019};">${arrow2019}${revChange2019.toFixed(1)}% y/y</span>`;
                revDateRangeElement2019.textContent = `From 2019`;
            }
        }

        // Update metrics immediately
        updateMetricCards();


    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});
