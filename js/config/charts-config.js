// Common chart configurations
const commonChartConfig = {
    chart: {
        type: 'line',
        zoomType: 'x',
        style: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial'
        }
    },
    credits: {
        enabled: false
    },
    title: {
        style: {
            fontSize: '18px',
            fontWeight: '500'
        }
    },
    xAxis: {
        type: 'datetime',
        labels: {
            format: '{value:%b %Y}'
        },
        ordinal: false,
        title: {
            text: 'Date'
        }
    },
    yAxis: {
        opposite: false,
        title: {
            style: {
                fontSize: '14px'
            }
        },
        labels: {
            align: 'left',
            x: 0,
            style: {
                fontSize: '12px'
            }
        }
    },
    legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom'
    },
    plotOptions: {
        series: {
            color: '#3a97a9',
            marker: {
                enabled: false,
                radius: 4
            },
            lineWidth: 2,
            states: {
                hover: {
                    lineWidth: 3
                }
            }
        }
    },
    tooltip: {
        shared: true,
        crosshairs: true,
        dateTimeLabelFormats: {
            day: '%B %e, %Y',
            week: '%B %e, %Y',
            month: '%B %Y',
            year: '%Y'
        }
    },
    rangeSelector: {
        enabled: true,
        buttons: [{
            type: 'month',
            count: 3,
            text: '3m'
        }, {
            type: 'month',
            count: 6,
            text: '6m'
        }, {
            type: 'year',
            count: 1,
            text: '1y'
        }, {
            type: 'year',
            count: 5,
            text: '5y'
        }, {
            type: 'year',
            count: 10,
            text: '10y'
        }, {
            type: 'all',
            text: 'All'
        }]
    },
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    enabled: false
                },
                yAxis: {
                    labels: {
                        align: 'left',
                        x: 0,
                        y: -5
                    }
                }
            }
        }]
    }
};

// Dataset specific configurations
const datasetConfigs = {
    airArrivals: {
        id: 'air-arrivals',
        title: 'Airport arrivals',
        dataFile: 'data/vw_kpi_air_arrivals_ytd_summary.csv?'+Math.random(),
        yAxisTitle: 'Passengers deplaning',
        valueFormat: 'number',
        description: 'Monthly passengers deplaning from Erik Nielsen Whitehorse International Airport. This dataset provides arrival statistics showing passenger traffic trends.',
        chart: {
            height: 400
        },
        color: '#3a97a9'
    },
    monthlyVisitors:{
        id: 'monthly-visitors',
        title: 'Monthly visitors',
        dataFile: 'data/vw_kpi_estimated_visitation_ytd_summary.csv?'+Math.random(),
        yAxisTitle: 'Number of visitors',
        valueFormat: 'number',
        description: 'Monthly visitors to the Yukon. This dataset provides visitor statistics showing visitor traffic trends.',
        chart: {
            height: 400
        },
        color: '#3a97a9'
    },
    consumerConfidence: {
        id: 'consumer-confidence',
        title: 'Consumer confidence',
        yAxisTitle: 'Consumer confidence',
        valueFormat: 'number',
        chart: {
            height: 400
        }
    },
    restaurantSpending: {
        id: 'restaurant-spending',
        title: 'Monthly restaurant spending',
        chart: {
            height: 400
        },
        yAxisTitle: 'Spending ($M)',
        valueFormat: 'number',
        tooltip: {
            formatter: function () {
                return 'Spending: <b>$' + Highcharts.numberFormat(this.y / 1000000, 1) + 'M</b>';
            }
        },
        yAxis: {
            labels: {
                formatter: function () {
                    return '$' + Highcharts.numberFormat(this.value / 1000000, 1) + 'M';
                }
            },
            title: {
                text: 'Spending ($M)'
            }
        }
    },
    retailSpending: {
        id: 'retail-spending',
        title: 'Monthly retail spending',
        chart: {
            height: 400
        },
        yAxisTitle: 'Spending ($M)',
        valueFormat: 'number',
        tooltip: {
            formatter: function () {
                return 'Spending: <b>$' + Highcharts.numberFormat(this.y / 1000000, 1) + 'M</b>';
            }
        },
        yAxis: {
            labels: {
                formatter: function () {
                    return '$' + Highcharts.numberFormat(this.value / 1000000, 1) + 'M';
                }
            },
            title: {
                text: 'Spending ($M)'
            }
        }
    },
    tourismBusinessCount: {
        id: 'tourism-business-counts',
        title: 'Estimated Tourism Business Counts',
        yAxisTitle: 'Number of Businesses',
        valueFormat: 'number',
        chart: {
            height: 400
        }
    },
    accommodationEmployment: {
        id: 'accommodation-employment',
        title: 'Employment in the Accommodation and food services industry',
        yAxisTitle: 'Employment',
        valueFormat: 'number',
        chart: {
            height: 400
        }
    },
    accommodationEarnings: {
        id: 'accommodation-earnings',
        title: 'Average weekly earnings in the Accommodation and food services industry',
        yAxisTitle: 'Weekly earnings ($)',
        valueFormat: 'number',
        chart: {
            height: 400
        }
    },
    intlTravelers: {
        id: 'intl-travelers',
        title: 'Border Crossings',
        dataFile: './data/vw_kpi_intl_travellers_entering_canada_ytd_summary.csv?'+Math.random(),
        yAxisTitle: 'International Travelers',
        valueFormat: 'number',
        description: 'Monthly international travelers entering Canada through Yukon border crossings. This dataset provides border crossing statistics showing visitor traffic trends.'
    },
    vicVisitors: {
        id: 'vic-visitors',
        title: 'Visitor Information Center Traffic',
        dataFile: './data/vw_kpi_vic_visitors_ytd_summary.csv?'+Math.random(),
        yAxisTitle: 'Number of Visitors',
        valueFormat: 'number',
        description: 'Monthly visitor counts at information centers.'
    },
    pcVisitors: {
        id: 'pc-visitors',
        title: 'Parks Canada Visitor Traffic',
        dataFile: './data/vw_kpi_pc_site_visitation_ytd_summary.csv?'+Math.random(),
        yAxisTitle: 'Number of Visitors',
        valueFormat: 'number',
        description: 'Monthly visitor counts at Parks Canada sites.'
    },
    scFuelPrices: {
        id: 'sc-fuel-prices',
        title: 'Motor Fuel Prices',
        dataFile: './data/vw_kpi_sc_gas_prices_ytd_summary.csv?'+Math.random(),
        yAxisTitle: 'Price (c/L)',
        valueFormat: 'number',
        description: 'Monthly average prices for regular gasoline.',
    },
    hotelStats: {
        id: 'hotel-stats',
        title: 'Monthly occupancy rate',
        dataFile: './data/vw_kpi_cbre_occupancy_rate_ytd_summary.csv?'+Math.random(),
        yAxisTitle: 'Occupancy rate (%)',
        valueFormat: 'number',
        description: 'Occupancy rate at select hotels.',
        chart: {
            height: 400
        }
    },
    strStats: {
        id: 'str-stats',
        title: 'STR Key Performance Indicators',
        chart: {
            height: 400
        },
        dataFiles: {
            occupancy: './data/vw_kpi_str_occupancy_ytd_summary.csv?'+Math.random(),
            adr: './data/vw_kpi_str_adr_ytd_summary.csv?'+Math.random(),
            revpar: './data/vw_kpi_str_revpar_ytd_summary.csv?'+Math.random()
        },
        series: [
            {
                name: 'Occupancy rate',
                dataFile: './data/vw_kpi_str_occupancy_ytd_summary.csv?'+Math.random(),
                yAxis: 0, // Left axis
                tooltip: {
                    valueSuffix: '%'
                }
            },
            {
                name: 'ADR',
                dataFile: './data/vw_kpi_str_adr_ytd_summary.csv?'+Math.random(),
                yAxis: 1, // Right axis
                tooltip: {
                    valuePrefix: '$'
                }
            },
            {
                name: 'RevPAR',
                dataFile: './data/vw_kpi_str_revpar_ytd_summary.csv?'+Math.random(),
                yAxis: 1, // Right axis
                tooltip: {
                    valuePrefix: '$'
                }
            }
        ],
        yAxes: [
            {
                title: {
                    text: 'Occupancy r  ate (%)'
                },
                opposite: false // Left axis
            },
            {
                title: {
                    text: 'ADR and RevPAR ($)'
                },
                opposite: true // Right axis
            }
        ],
        description: 'Monthly occupancy rates, ADR, and RevPAR for short-term rentals.'
    }
    
    // Add configurations for other datasets...
};

export { commonChartConfig, datasetConfigs };
