document.addEventListener("DOMContentLoaded", function () {
    fetch('./data/tc_tourism_industry_performance_index.csv?' + Math.random())
        .then(response => response.text())
        .then(csvData => {
            const rows = csvData
                .split(/\r?\n/)
                .map(row => row.trim())
                .filter(row => row)
                .map(row => row.replace(/"/g, '').split(','))
                .filter(row => row.length >= 2 && row[0] !== 'Year')
                .map(row => ({
                    year: parseInt(row[0]),
                    value: parseFloat(row[1])
                }))
                .filter(row => !isNaN(row.year) && !isNaN(row.value))
                .sort((a, b) => a.year - b.year);

            Highcharts.chart('tipi-by-year-container', {
                credits: { enabled: false },
                chart: {
                    type: 'line',
                    height: 500
                },
                title: {
                    text: 'Yukon Tourism Industry Performance Index'
                },
                xAxis: {
                    title: { text: 'Year' },
                    tickInterval: 1,
                    maxPadding: 0.05
                },
                yAxis: {
                    title: { text: 'Index (2018 = 100)' },
                    min: 25,
                    max: 150
                },
                tooltip: {
                    formatter: function () {
                        return `<b>${this.x}</b><br/>Index: ${this.y.toFixed(1)}`;
                    }
                },
                series: [{
                    name: 'TIPI',
                    color: '#244C5A',
                    data: rows.map(d => ({ x: d.year, y: d.value })),
                    marker: { enabled: true },
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return this.y.toFixed(1);
                        },
                        style: {
                            fontSize: '10px',
                            fontWeight: 'bold',
                            textOutline: 'none'
                        },
                        y: -10
                    },
                    showInLegend: false
                }]
            });
        })
        .catch(error => console.error('Error loading TIPI chart data:', error));
});
