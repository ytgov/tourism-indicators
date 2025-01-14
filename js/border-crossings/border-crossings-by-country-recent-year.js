document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "./data/vw_bc_yearly_border_crossings_by_country_of_origin.csv";
    let globalData = []; // Store parsed CSV data globally
    let barChart; // Store Highcharts bar chart instance globally
    let pieChart; // Store Highcharts pie chart instance globally

    const COUNTRY_COLOR_MAP = {
        'Canada': '#F25D1F',
        'United States': '#244C5A',
        'Austria': '#B5D99C',
        'Belgium': '#FFD700',
        'China': '#FF6347',
        'Czechia': '#98D8D8',
        'Germany': '#947B89',
        'Ireland': '#8FB996',
        'Israel': '#FFCBA4',
        'Netherlands': '#F5A9D0',
        'Sweden': '#FFB347',
        'United Kingdom': '#97C1CD',
        'Colombia': '#F2A900',
        'Denmark': '#4682B4',
        'Hungary': '#DC4405',
        'Japan': '#7A9A01',
        'Mexico': '#7CB9E8',
        'Thailand': '#FFDEAD',
        'Brazil': '#2E8B57',
        'France': '#D6A5C0',
        'Hong Kong': '#A17A74',
        'Italy': '#DCB6CC',
        'Korea, South': '#D2691E',
        'Malaysia': '#B6C390',
        'New Zealand': '#D4E157',
        'Philippines': '#00CED1',
        'Singapore': '#E67350',
        'Spain': '#FFD700',
        'Switzerland': '#4682B4',
        'Taiwan': '#DC4405',
        'Viet Nam': '#20B2AA',
        'Australia': '#7A9A01',
        'India': '#8B4513',
        'Indonesia': '#F08080',
        'Latvia': '#7EBDC2'
    };

    function getCountryColor(countryName) {
        return COUNTRY_COLOR_MAP[countryName] || '#ccc'; // Default to gray if color not found
    }

    function createBarChart(year) {
        const filteredData = globalData.filter(row => {
            const yearMatch = row[0] === year.toString();
            const excludeCountries = !['United States', 'Canada'].includes(row[1].trim());
            return yearMatch && excludeCountries; // Exclude Canada and the United States
        });

        const barData = filteredData
            .map(row => ({
                name: row[1].trim(),
                y: parseInt(row[2], 10),
                color: getCountryColor(row[1].trim())
            }))
            .sort((a, b) => b.y - a.y);

        if (barChart) {
            barChart.update({
                title: { text: `Border Crossings by Overseas Country (${year})`},
                series: [{
                    data: barData,
                    showInLegend: false
                }]
            });
        } else {
            barChart = Highcharts.chart('country-bar-container', {
                chart: { type: 'bar' },
                title: { text: `Border Crossings by Overseas Country (${year})` },
                xAxis: {
                    type: 'category',
                    title: { text: 'Country' }
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
                credits: {
                    enabled: false
                }
            });
        }
    }

    function createPieChart(year) {
        const filteredData = globalData.filter(row => {
            const yearMatch = row[0] === year.toString();
            const excludeCountries = ['United States', 'Canada'].includes(row[1].trim());
            return yearMatch && !excludeCountries; // Include only overseas countries
        });
    
        const pieData = filteredData
            .map(row => ({
                name: row[1].trim(),
                y: parseInt(row[2], 10),
                color: getCountryColor(row[1].trim())
            }))
            .sort((a, b) => b.y - a.y);
    
        // Split into top 10 and "Other"
        const top10Data = pieData.slice(0, 10);
        const otherData = pieData.slice(10);
    
        const otherTotal = otherData.reduce((sum, item) => sum + item.y, 0);
    
        if (otherTotal > 0) {
            top10Data.push({
                name: 'Other',
                y: otherTotal,
                color: '#CCCCCC' // Default gray color for "Other"
            });
        }
    
        if (pieChart) {
            pieChart.update({
                title: { text: `Overseas Border Crossings Breakdown (${year})` },
                series: [{
                    data: top10Data,
                    showInLegend: true
                }]
            });
        } else {
            pieChart = Highcharts.chart('country-pie-container', {
                chart: { type: 'pie' },
                title: { text: `Overseas Border Crossings Breakdown (${year})` },
                series: [{
                    name: 'Crossings',
                    data: top10Data,
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return `<b>${this.point.name}</b>: ${Highcharts.numberFormat(this.y, 0)}`; // Format with thousands separator
                            
                        }
                    }
                }],
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
                row[0].trim(),
                row[1].trim(),
                row[2].trim()
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
                createPieChart(uniqueYears[0]);
            }

            yearSelect.addEventListener('change', function() {
                const selectedYear = this.value;
                createBarChart(selectedYear);
                createPieChart(selectedYear);
            });

        })
        .catch(error => console.error('Error loading CSV:', error));
});
