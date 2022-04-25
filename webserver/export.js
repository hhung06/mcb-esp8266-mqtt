function exportChart(con, io) {
    var m_time
    var newTemp
    var newHumi
    var newLight
    var sql1 = "SELECT * FROM sensors11 ORDER BY ID DESC limit 1"

    con.query(sql1, function (err, result, fields) {
        if (err) throw err;
        console.log("Data selected");
        result.forEach(function (value) {
            m_time = value.Time.toString().slice(4, 24);
            newTemp = value.Temperature
            newHumi = value.Humidity
            newLight = value.Light

            io.sockets.emit('server-update-data', { 
                id: value.ID,
                time: m_time,
                temp: value.Temperature,
                humi: value.Humidity,
                light: value.Light
            })
        })
    });
}

module.exports = exportChart