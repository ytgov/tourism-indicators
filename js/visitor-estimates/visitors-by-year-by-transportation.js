document.addEventListener("DOMContentLoaded", function () {

    fetch('./data/vw_tc_vis_estimates_by_year_by_transportation_2026.csv?' + Math.random())
        .then(response => response.text())
        .then(csvData => {

            const rows = csvData
                .split(/\r?\n/)
                .map(row => row.trim())
                .filter(row => row)
                .map(row => row.split(','))
                .filter(row => row.length >= 3 && row[0].toLowerCase() !== 'year')
                .map(row => ({
                    year: parseInt(row[0]),
                    visitors: parseFloat(row[1]),
                    transportation_type: row[2].trim()
                }))
                .filter(row =>
                    !isNaN(row.year) &&
                    !isNaN(row.visitors) &&
                    row.transportation_type
                )
                .filter(row => row.year >= 2025)
                .sort((a, b) => a.year - b.year);

            const years = [...new Set(rows.map(r => r.year))].sort((a, b) => b - a);

            const transportationTypes = [
                "Air",
                "Train",
                "Bus",
                "Vehicles"
            ];

            const colorMap = {
                "Air": "#947b89",
                "Train": "#f2a900",
                "Bus": "#dc4405",
                "Vehicles": "#244c5a"
            };

            const container = document.getElementById('visitor-estimates-by-transportation-container');

            const controls = document.createElement('div');
            controls.className = 'd-flex justify-content-end align-items-center mt-4 mb-2';
            controls.innerHTML = `
                <label for="transportation-year-select" class="mr-2 mb-0"><strong>Year:</strong></label>
                <select id="transportation-year-select" class="form-control" style="width:auto;">
                    ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
                </select>
            `;

            container.parentNode.insertBefore(controls, container);

            function getPieData(selectedYear) {
                return transportationTypes.map(type => {
                    const match = rows.find(r =>
                        r.year === selectedYear &&
                        r.transportation_type === type
                    );

                    return {
                        name: type,
                        y: match ? match.visitors : 0,
                        color: colorMap[type]
                    };
                }).filter(point => point.y > 0);
            }

            function renderChart(selectedYear) {
                const pieData = getPieData(selectedYear);
                const total = pieData.reduce((sum, point) => sum + point.y, 0);

                Highcharts.chart('visitor-estimates-by-transportation-container', {

                    credits: {
                        enabled: false
                    },

                    chart: {
                        type: 'pie',
                        height: 500
                    },

                    title: {
                        text: `Visitors by transportation type, ${selectedYear}`
                    },

                    subtitle: {
                        text: `Total: ${Highcharts.numberFormat(total, 0)} visitors`
                    },

                    tooltip: {
                        pointFormat: `
                            <b>{point.percentage:.1f}%</b><br>
                            Visitors: <b>{point.y:,.0f}</b>
                        `
                    },

                    accessibility: {
                        point: {
                            valueSuffix: '%'
                        }
                    },

                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f}%'
                            },
                            showInLegend: true
                        }
                    },

                    series: [{
                        name: 'Transportation type',
                        colorByPoint: false,
                        data: pieData
                    }]
                });
            }

            renderChart(years[0]);

            document.getElementById('transportation-year-select').addEventListener('change', function () {
                renderChart(parseInt(this.value));
            });

        })
        .catch(error => {
            console.error('Error loading or processing transportation data:', error);
        });
});