document.addEventListener('DOMContentLoaded', function() {
    const pm25Chart = document.getElementById('pm25-chart');
    const pm10Chart = document.getElementById('pm10-chart');
    const datePickerStart = document.getElementById('date-picker-start');
    const datePickerEnd = document.getElementById('date-picker-end');

    function fetchData() {
        return fetch('https://haze.sabah.io/feed.php?range=hourly&type=json')
            .then(response => response.json())
            .then(data => {
                const data_list = Object.keys(data).map(key => ({
                    block: data[key]["block"],
                    uts: data[key]["uts"],
                    count: data[key]["count"],
                    average_PM2.5: data[key]["average"]["PM2.5"],
                    average_PM10: data[key]["average"]["PM10"]
                }));
                return data_list;
            });
    }

    function updateCharts(data, startDate, endDate) {
        const filteredData = data.filter(d => {
            const date = new Date(d.uts * 1000);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const dates = filteredData.map(d => new Date(d.uts * 1000));
        const pm25Values = filteredData.map(d => d.average_PM2.5);
        const pm10Values = filteredData.map(d => d.average_PM10);

        Plotly.newPlot(pm25Chart, [{
            x: dates,
            y: pm25Values,
            type: 'scatter'
        }], {
            title: 'Average PM2.5 Over Time'
        });

        Plotly.newPlot(pm10Chart, [{
            x: dates,
            y: pm10Values,
            type: 'scatter'
        }], {
            title: 'Average PM10 Over Time'
        });
    }

    function updateDatePicker(data) {
        const dates = data.map(d => new Date(d.uts * 1000));
        const minDate = new Date(Math.min.apply(null, dates));
        const maxDate = new Date(Math.max.apply(null, dates));

        datePickerStart.value = minDate.toISOString().split('T')[0];
        datePickerEnd.value = maxDate.toISOString().split('T')[0];

        datePickerStart.min = minDate.toISOString().split('T')[0];
        datePickerStart.max = maxDate.toISOString().split('T')[0];
        datePickerEnd.min = minDate.toISOString().split('T')[0];
        datePickerEnd.max = maxDate.toISOString().split('T')[0];
    }

    fetchData().then(data => {
        updateDatePicker(data);

        datePickerStart.addEventListener('change', () => {
            updateCharts(data, datePickerStart.value, datePickerEnd.value);
        });

        datePickerEnd.addEventListener('change', () => {
            updateCharts(data, datePickerStart.value, datePickerEnd.value);
        });

        updateCharts(data, datePickerStart.value, datePickerEnd.value);
    });
});
