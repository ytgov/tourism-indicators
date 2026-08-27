import { ChartBuilder } from '../components/chart-builder.js';
import { datasetConfigs } from '../config/charts-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const chart = new ChartBuilder('indicator-chart', datasetConfigs.visitorSpending);
        await chart.initialize();
    } catch (error) {
        console.error('Error initializing visitor spending chart:', error);
    }
});
