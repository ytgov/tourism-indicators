import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';



document.addEventListener('DOMContentLoaded', async () => {
    try {

        const monthlyConfig = {
            ...datasetConfigs.hotelStats,
            navigator: { enabled: false }, 
            scrollbar: { enabled: false }
        };

        const monthlyChart = new ChartBuilder('indicator-chart', monthlyConfig);

        await monthlyChart.initialize();

        // Add tab change listener to refresh charts
        $('#data-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if (e.target.id === 'by-year-tab') {
                //yearlyChart.reflow(); // Ensure yearly chart updates when tab is shown
            } else if (e.target.id === 'by-month-tab') {
                monthlyChart.chart.reflow();
            }
        });

    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});
