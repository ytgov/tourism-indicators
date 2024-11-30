document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "/data/vw_kpi_estimated_visitors.csv";

    function fetchDataAndRender() {
        fetch(csvUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const rows = data.split('\n').map(row => row.split(','));
                // Remove header row
                const header = rows.shift();
                
                // Parse and sort data
                const parsedData = rows
                    .filter(row => row.length > 1)
                    .map(row => ({
                        date: new Date(row[0].replace(/"/g, '')),
                        transportType: row[3].replace(/"/g, ''),
                        monthlyTotal: parseInt(row[4]) || 0
                    }))
                    .filter(item => !isNaN(item.date) && !isNaN(item.monthlyTotal));

                // Get unique dates for categories
                const dates = [...new Set(parsedData.map(item => 
                    Highcharts.dateFormat('%b %Y', item.date.getTime())
                ))].sort((a, b) => {
                    return new Date(a) - new Date(b);
                });

                // Define desired order and colors to match border crossings chart
                const desiredOrder = [
                    "bus",
                    "train",
                    "plane",
                    "automobile"
                ];

                const colors = [
                    "#947b89",
                    "#f2a900",
                    "#dc4405",
                    "#244c5a"
                ];

                // Group data by transportation type
                const seriesData = desiredOrder
                    .filter(type => parsedData.some(item => 
                        item.transportType.toLowerCase() === type.toLowerCase()
                    ))
                    .map((type, index) => ({
                        name: type,
                        data: dates.map(date => {
                            const monthData = parsedData.find(item => 
                                item.transportType.toLowerCase() === type.toLowerCase() &&
                                Highcharts.dateFormat('%b %Y', item.date.getTime()) === date
                            );
                            return monthData ? monthData.monthlyTotal : 0;
                        }),
                        color: colors[index]
                    }));

                renderChart(seriesData, dates);
            })
            .catch(error => {
                console.error('Error loading or processing data:', error);
                const container = document.getElementById('transportation-chart');
                if (container) {
                    container.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
                }
            });
    }

    function renderChart(seriesData, categories) {
        Highcharts.chart('transportation-chart', {
            chart: {
                type: 'column',
                zoomType: 'x'
            },
            title: {
                text: 'Visitors by Transportation Type'
            },
            xAxis: {
                categories: categories,
                title: {
                    text: 'Month'
                },
                scrollbar: {
                    enabled: false
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Number of Visitors'
                },
                labels: {
                    overflow: 'justify',
                    formatter: function() {
                        return this.value.toLocaleString();
                    }
                }
            },
            tooltip: {
                shared: true,
                formatter: function() {
                    const points = this.points;
                    let s = `<b>${this.x}</b>`;
                    
                    let total = 0;
                    points.forEach(point => {
                        s += `<br/><span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${point.y.toLocaleString()} visitors</b>`;
                        total += point.y;
                    });
                    
                    s += `<br/><br/>Total: <b>${total.toLocaleString()} visitors</b>`;
                    return s;
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    pointPadding: 0.1,
                    groupPadding: 0
                }
            },
            legend: {
                reversed: true
            },
            credits: {
                enabled: false
            },
            series: seriesData
        });
    }

    fetchDataAndRender();
});
