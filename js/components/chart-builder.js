import { commonChartConfig } from '../config/charts-config.js';
import { loadCSVData, formatters, analytics } from '../utils/data-utils.js';

export class ChartBuilder {
    constructor(containerId, config) {
        this.containerId = containerId;
        this.config = config;
        this.data = null;
        this.chart = null;
    }

    async initialize() {
        await this.loadData();
        this.createChart();
        this.createDataTable();
        this.createAnalysis();
    }

    async loadData() {
        this.data = await loadCSVData(this.config.dataFile);
        // Sort data by date ascending
        if (this.data && this.data.data) {
            this.data.data.sort((a, b) => new Date(a[0]) - new Date(b[0]));
        }
        return this.data;
    }

    createChart() {
        const chartData = this.processChartData();
        const valueFormat = this.config.valueFormat;
        
        const chartOptions = {
            ...commonChartConfig,
            chart: {
                ...commonChartConfig.chart,
                renderTo: this.containerId
            },
            title: {
                text: null
            },
            yAxis: {
                ...commonChartConfig.yAxis,
                title: {
                    text: this.config.yAxisTitle
                },
                labels: {
                    formatter: function() {
                        return formatters[valueFormat](this.value);
                    }
                }
            },
            series: [{
                name: this.config.title,
                data: chartData,
                tooltip: {
                    valueDecimals: 0,
                    valueFormatter: function(value) {
                        return formatters[valueFormat](value);
                    }
                }
            }],
            navigator: {
                enabled: false,
                series: {
                    fillOpacity: 0.05,
                    lineWidth: 1
                },
                xAxis: {
                    labels: {
                        format: '{value:%b %Y}'
                    }
                }
            },
            scrollbar: {
                enabled: false
            }
        };

        this.chart = Highcharts.stockChart(chartOptions);
    }

    calculateMovingAverage(data, period) {
        const values = data.map(point => point[1]);
        const result = [];
        
        for (let i = period - 1; i < values.length; i++) {
            const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            const average = sum / period;
            result.push([data[i][0], average]);
        }
        
        return result;
    }

    processChartData() {
        return this.data.data.map(row => [
            new Date(row[0]).getTime(),
            parseFloat(row[3])
        ]);
    }

    createDataTable() {
        const tableContainer = document.getElementById(`${this.containerId}-table`);
        if (!tableContainer) return;

        const table = document.createElement('table');
        table.className = 'table table-striped';
        
        // Create header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Date</th>
                <th>Value</th>
                <th>YoY Change</th>
            </tr>
        `;
        
        // Create body
        const tbody = document.createElement('tbody');
        this.data.data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(row[0]).toLocaleDateString()}</td>
                <td>${formatters[this.config.valueFormat](row[3])}</td>
                <td>${formatters.percentage(row[5])}</td>
            `;
            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }

    createAnalysis() {
        const analysisContainer = document.getElementById(`${this.containerId}-analysis`);
        if (!analysisContainer) return;

        const monthlyData = this.data.data.map(row => ({
            date: new Date(row[0]),
            value: parseFloat(row[3])
        }));

        const seasonalPattern = analytics.findSeasonalPattern(monthlyData);
        const recentTrend = analytics.calculateMovingAverage(
            monthlyData.slice(-12).map(d => d.value)
        );
        const highLowPoints = this.findHighAndLowPoints();

        const analysis = document.createElement('div');
        analysis.innerHTML = `
            <h4>Key Insights</h4>
            <ul>
                <li>All-time high: ${formatters[this.config.valueFormat](highLowPoints.high.value)} (${highLowPoints.high.date})</li>
                <li>All-time low: ${formatters[this.config.valueFormat](highLowPoints.low.value)} (${highLowPoints.low.date})</li>
                <li>Peak months: ${this.findPeakMonths(seasonalPattern)}</li>
                <li>Recent trend: ${this.describeTrend(recentTrend)}</li>
                <li>Year-over-year change: ${this.getYoYChange()}</li>
            </ul>
        `;

        analysisContainer.appendChild(analysis);
    }

    findHighAndLowPoints() {
        const monthlyData = this.data.data.map(row => ({
            date: new Date(row[0]),
            value: parseFloat(row[3])
        }));

        const high = monthlyData.reduce((max, current) => 
            current.value > max.value ? current : max
        , monthlyData[0]);

        const low = monthlyData.reduce((min, current) => 
            current.value < min.value ? current : min
        , monthlyData[0]);

        return {
            high: {
                date: high.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone:'UTC' }),
                value: high.value
            },
            low: {
                date: low.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone:'UTC' }),
                value: low.value
            }
        };
    }

    findPeakMonths(seasonalPattern) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const max = Math.max(...seasonalPattern);
        return months
            .filter((_, i) => seasonalPattern[i] > max * 0.8)
            .join(', ');
    }

    describeTrend(recentTrend) {
        // Remove null values that come from the moving average calculation
        const validTrend = recentTrend.filter(value => value !== null);
        
        // Calculate overall change
        const start = validTrend[0];
        const end = validTrend[validTrend.length - 1];
        const overallChange = ((end - start) / start) * 100;
        
        // Calculate volatility (standard deviation of period-to-period changes)
        const periodChanges = validTrend.slice(1).map((value, index) => 
            ((value - validTrend[index]) / validTrend[index]) * 100
        );
        const avgChange = periodChanges.reduce((sum, val) => sum + val, 0) / periodChanges.length;
        const volatility = Math.sqrt(
            periodChanges.reduce((sum, val) => sum + Math.pow(val - avgChange, 2), 0) / periodChanges.length
        );

        // Count consecutive increases and decreases
        let increases = 0;
        let decreases = 0;
        let maxConsecutive = { increases: 0, decreases: 0 };
        
        for (let i = 1; i < validTrend.length; i++) {
            if (validTrend[i] > validTrend[i-1]) {
                increases++;
                decreases = 0;
                maxConsecutive.increases = Math.max(maxConsecutive.increases, increases);
            } else if (validTrend[i] < validTrend[i-1]) {
                decreases++;
                increases = 0;
                maxConsecutive.decreases = Math.max(maxConsecutive.decreases, decreases);
            }
        }

        // Determine trend characteristics
        let trend = '';
        if (Math.abs(overallChange) < 3) {
            trend = 'Stable';
        } else if (overallChange > 0) {
            trend = maxConsecutive.increases >= 3 ? 'Consistently increasing' : 'Generally increasing';
        } else {
            trend = maxConsecutive.decreases >= 3 ? 'Consistently decreasing' : 'Generally decreasing';
        }

        // Add volatility description
        if (volatility > 10) {
            trend += ' with high volatility';
        } else if (volatility > 5) {
            trend += ' with moderate volatility';
        }

        // Add percentage
        trend += ` (${overallChange.toFixed(1)}% overall change)`;

        return trend;
    }

    getYoYChange() {
        const recent = this.data.data[this.data.data.length - 1];
        return formatters.percentage(recent[5]);
    }

    getData() {
        return this.data;
    }

    processChartData() {
        return this.data.data.map(row => [
            new Date(row[0]).getTime(),
            parseFloat(row[3])
        ]);
    }
}
