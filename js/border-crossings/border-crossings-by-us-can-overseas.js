document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_bc_yearly_border_crossings_by_us_can_overseas.csv";
    let globalData = []; // Store parsed CSV data globally
    let barChart; // Store Highcharts bar chart instance globally

    const COUNTRY_COLOR_MAP = {
        'Canada': '#F25D1F',
        'United States': '#244C5A',
        'Overseas': '#F6C21A'
    };

    function getCountryColor(countryName) {
        return COUNTRY_COLOR_MAP[countryName] || '#ccc'; // Default to gray if color not found
    }

    function createBarChart(year) {

        const filteredData = globalData.filter(row => {
            const yearMatch = row[0] === year.toString();
            return yearMatch;
        });


        const barData = filteredData
            .map(row => ({
                name: row[1].trim(), // Traveller_characteristics
                y: parseInt(row[2], 10), // value
                color: getCountryColor(row[1].trim())
            }))
            .sort((a, b) => b.y - a.y);

        if (barChart) {
            barChart.update({
                title: { text: `Border Crossings by Origin (${year})` },
                series: [{
                    data: barData,
                    showInLegend: false
                }]
            });
        } else {
            barChart = Highcharts.chart('can-us-bar-container', {
                chart: { type: 'bar' },
                title: { text: `Border Crossings by Origin (${year})` },
                xAxis: {
                    type: 'category',
                    title: { text: 'Origin' }
                },
                yAxis: {
                    title: { text: 'Number of Crossings' }
                },
                series: [{
                    name: 'Crossings',
                    data: barData,
                    showInLegend: false,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            const total = this.series.data.reduce((sum, point) => sum + point.y, 0);
                            const percentage = ((this.y / total) * 100).toFixed(1);
                            return `${percentage}%`; // Display percentage with two decimal places
                        },
                        style: {
                            fontSize: '12px',
                            color: '#333333' // Optional: Customize text color
                        }
                    }
                }],
                exporting: {
                    enabled: true
                },
                credits: {
                    enabled: false
                }
            });
        }
    }

    fetch(csvUrl)
        .then(response => response.text())
        .then(csv => {
            const rows = csv.split("\n").map(row => row.split(","));
            const data = rows.slice(1).filter(row => row.length === 3);

            globalData = data.map(row => [
                row[0].trim(), // year
                row[1].trim(), // Traveller_characteristics
                row[2].trim()  // value
            ]);

            const uniqueYears = [...new Set(globalData.map(row => row[0]))]
                .map(Number)
                .sort((a, b) => b - a);

            const yearSelect = document.getElementById('year-select');
            uniqueYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });

            if (uniqueYears.length > 0) {
                yearSelect.value = uniqueYears[0];
                createBarChart(uniqueYears[0]);
            }

            yearSelect.addEventListener('change', function () {
                const selectedYear = this.value;
                createBarChart(selectedYear);
            });

        })
        .catch(error => console.error('Error loading CSV:', error));
});
