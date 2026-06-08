// Define the color scheme
const colors = [
    "#006D6F",
    "#7A9A01",
    "#512A44",
    "#244C5A",
    "#0097A9",
    "#DC4405",
    "#F2A900",
    "#006D6F8C",
    "#7A9A018C",
    "#512A448C",
    "#244C5A8C",
    "#0097A98C",
    "#DC44058C",
    "#F2A9008C"
];

// Load CSV data
async function loadCSVData(csvUrl) {

    try {

        const response = await fetch(csvUrl);
        const csvText = await response.text();

        const rows = csvText
            .split('\n')
            .filter(row => row.trim())
            .map(row => row.replace(/"/g, ''))
            .map(row => row.split(','));

        const data = rows
            .slice(1)
            .filter(row => row.length >= 2)
            .map(row => {

                // Parse YYYY-MM-DD safely in local timezone
                const [year, month, day] = row[0]
                    .trim()
                    .split('-')
                    .map(Number);

                return {
                    date: new Date(year, month - 1, day),
                    visitors: parseFloat(row[1])
                };
            })
            .filter(row =>
                row.date instanceof Date &&
                !isNaN(row.date) &&
                !isNaN(row.visitors)
            )
            .sort((a, b) => a.date - b.date);

        return data;

    } catch (error) {

        console.error('Error loading CSV data:', error);
        return [];
    }
}

// Generate chart
async function generateChart() {

    const rawData = await loadCSVData(
        'data/vw_tc_vis_estimates_by_month_2026.csv?' + Math.random()
    );

    if (!rawData.length) {
        console.error('Failed to load CSV data.');
        return;
    }

    // Month labels
    const allMonths = Array.from({ length: 12 }, (_, i) =>
        new Date(2024, i).toLocaleString('default', {
            month: 'short'
        })
    );

    // Organize by year
    const dataByYear = {};

    rawData.forEach(row => {

        const year = row.date.getFullYear().toString();
        const month = row.date.getMonth();

        if (!dataByYear[year]) {
            dataByYear[year] = Array(12).fill(null);
        }

        dataByYear[year][month] = row.visitors;
    });

    // Build Highcharts series
    const series = Object.keys(dataByYear)
        .sort()
        .map((year, index) => ({

            name: year,
            data: dataByYear[year],
            color: colors[index % colors.length],

            // Show 2019 and recent years by default
            visible:
                year === '2019' ||
                parseInt(year) >= 2025
        }));

    // Render chart
    Highcharts.chart('monthly-stacked-chart', {

        chart: {
            type: 'line',
            height: 400
        },

        title: {
            text: 'Estimated visitors by month'
        },

        xAxis: {
            categories: allMonths,
            title: {
                enabled: false
            }
        },

        yAxis: {

            title: {
                enabled: false
            },

            labels: {
                formatter: function () {
                    return Highcharts.numberFormat(this.value, 0);
                }
            }
        },

        tooltip: {

            shared: true,

            formatter: function () {

                let tooltip =
                    '<b>' +
                    allMonths[this.points[0].point.index] +
                    '</b><br/>';

                this.points.forEach(point => {

                    tooltip +=
                        '<span style="color:' + point.color + '">●</span> ' +
                        point.series.name +
                        ': ' +
                        Highcharts.numberFormat(point.y, 0) +
                        ' visitors<br/>';
                });

                return tooltip;
            }
        },

        series: series,

        credits: {
            enabled: false
        }
    });
}

// Run chart on page load
document.addEventListener(
    'DOMContentLoaded',
    generateChart
);