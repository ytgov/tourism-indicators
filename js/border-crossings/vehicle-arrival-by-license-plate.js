document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_bc_vehicle_arrivals_by_license_plate.csv";
    let globalData = []; // Store parsed CSV data globally
    let barChart; // Store Highcharts bar chart instance globally

    const LICENSE_PLATE_COLOR_MAP = {
        'Alaska': '#244C5A',
        'Yukon': '#F25D1F',
        'British Columbia': '#B5D99C',
        'Alberta': '#FFD700',
        'Washington': '#FF6347',
        'California': '#98D8D8',
        'Florida': '#947B89',
        'Arizona': '#8FB996',
        'Utah': '#FFCBA4',
        'Texas': '#F5A9D0',
        'Oregon': '#FFB347',
        'Colorado': '#97C1CD',
        'Minnesota': '#F2A900',
        'Montana': '#4682B4',
        'Ontario': '#DC4405',
        'Quebec': '#7A9A01',
        'Michigan': '#7CB9E8',
        'Idaho': '#FFDEAD',
        'Wisconsin': '#2E8B57'
    };

    function getLicensePlateColor(plate) {
        return LICENSE_PLATE_COLOR_MAP[plate] || '#ccc'; // Default to gray if color not found
    }

    function createBarChart(year) {

        const filteredData = globalData.filter(row => {
            const yearMatch = row[0] === year.toString();
            return yearMatch;
        });

        const barData = filteredData
            .map(row => ({
                name: row[1].trim(), // Vehicle_licence_plate
                y: parseInt(row[2], 10), // value
                color: getLicensePlateColor(row[1].trim())
            }))
            .sort((a, b) => b.y - a.y);

        if (barChart) {
            barChart.update({
                title: { text: `Vehicle Arrivals by License Plate (${year})` },
                series: [{
                    data: barData,
                    showInLegend: false
                }]
            });
        } else {
            barChart = Highcharts.chart('license-container', {
                chart: {
                    type: 'bar',
                    scrollablePlotArea: {
                        minHeight: 500, // Adjust as per the number of bars
                        scrollPositionY: 0
                    }
                },
                title: { text: `Vehicle Arrivals by License Plate (${year})` },
                xAxis: {
                    type: 'category',
                    title: { text: 'License Plate' }
                },
                yAxis: {
                    title: { text: 'Number of Arrivals' }
                },
                series: [{
                    name: 'Arrivals',
                    data: barData,
                    showInLegend: false,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            const total = this.series.data.reduce((sum, point) => sum + point.y, 0);
                            const percentage = ((this.y / total) * 100).toFixed(1);
                            return `${percentage}%`; // Display percentage with one decimal place
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
                row[1].trim(), // Vehicle_licence_plate
                row[2].trim()  // value
            ]);

            const uniqueYears = [...new Set(globalData.map(row => row[0]))]
                .map(Number)
                .sort((a, b) => b - a);

            const yearSelect = document.getElementById('license-year-filter');

            console.log(uniqueYears);
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
