var express = require('express'); // Module xử lí chung
var mysql = require('mysql2'); // Module cho phép sử dụng cơ sở dữ liệu mySQL
var mqtt = require('mqtt'); // Module cho phép sử dụng giao thức mqtt

var app = express();
var port = 9999; // Port của localhost

var exportCharts = require('./export.js'); // Require file export.js

app.use(express.static('public'));
app.set('views engine', 'ejs');
app.set('views', './views');

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/index', function (req, res) {
	res.render('index.ejs');
});

app.get('/table', function (req, res) {
	res.render('table.ejs');
});

server.listen(port, function () {
	console.log('Server listening on port ' + port);
});

//---------------------------------------------MQTT---------------------------------------------
var options = {
	username: "IB12345",
	password: "12345",
	clientId: "serverjs",
};

// initialize the MQTT client
var client = mqtt.connect("mqtt://203.162.10.118:8800", options);

// declare topics
var topicSensors = 'esp8266/sensors/hum-temp-light';

console.log('connected flag  ' + client.connected);
client.on('connect', function () {
	console.log('connected mqtt ' + client.connected);
});

client.on('error', function (error) {
	console.log("Can't connect" + error);
	process.exit(1);
});

client.subscribe(topicSensors);

//--------------------------------------------------SQL-------------------------------------------------
var con = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'Mothai34',
	database: 'test_database',
});

//---------------------------------------------CREATE TABLE---------------------------------------------
con.connect(function (err) {
	if (err) throw err;
	console.log('mysql connected');
	var sql =
		'CREATE TABLE IF NOT EXISTS sensors11(ID int(10) not null primary key auto_increment, Time datetime not null, Temperature int(3) not null, Humidity int(3) not null, Light int(5) not null )';
	con.query(sql, function (err) {
		if (err) throw err;
		console.log('Table created');
	});
});

//---------------------------------------------INSERT DATA---------------------------------------------
var newTemp;
var newHumi;
var newLight;
var cnt_check = 0;

client.on('message', function (topic, message, packet) {
	console.log('message is ' + message);
	console.log('topic is ' + topic);
	const objData = JSON.parse(message);
	if (topic == topicSensors) {
		cnt_check = cnt_check + 1;
		newTemp = objData.Temperature;
		newHumi = objData.Humidity;
		newLight = objData.Light;
	}

	if (cnt_check == 1) {
		cnt_check = 0;

		console.log('ready to save');
		var n = new Date();
		var month = n.getMonth() + 1;
		var Date_and_Time =
			n.getFullYear() +
			'-' +
			month +
			'-' +
			n.getDate() +
			' ' +
			n.getHours() +
			':' +
			n.getMinutes() +
			':' +
			n.getSeconds();

		var sql =
			"INSERT INTO sensors11 (Time, Temperature, Humidity, Light) VALUES ('" +
			Date_and_Time.toString() +
			"', '" +
			newTemp +
			"', '" +
			newHumi +
			"', '" +
			newLight +
			"')";
		con.query(sql, function (err, result) {
			if (err) throw err;
			console.log('Table inserted');
			console.log(
				Date_and_Time + ' ' + newTemp + ' ' + newHumi + ' ' + newLight
			);
		});
		exportCharts(con, io);
	}
});

//---------------------------------------------Control LED---------------------------------------------
io.on('connection', function (socket) {
	console.log('dashboard connected');
	socket.on('disconnect', function () {
		console.log('dashboard disconnected');
	});

	socket.on('LED1Change', function (data) {
		if (data == 'on') {
			console.log('LED1 ON');
			client.publish('led1', 'On');
		} else {
			console.log('LED1 OFF');
			client.publish('led1', 'Off');
		}
	});
	socket.on('LED2Change', function (data) {
		if (data == 'on') {
			console.log('LED2 ON');
			client.publish('led2', 'On');
		} else {
			console.log('LED2 OFF');
			client.publish('led2', 'Off');
		}
	});

	// Send data to History page
	var sql1 = 'SELECT * FROM sensors11 ORDER BY ID';
	con.query(sql1, function (err, result, fields) {
		if (err) throw err;
		console.log('Table updated');
		var fullData = [];
		result.forEach(function (value) {
			var m_time = value.Time.toString().slice(4, 24);
			fullData.push({
				id: value.ID,
				time: m_time,
				temp: value.Temperature,
				humi: value.Humidity,
				light: value.Light
			});
		});
		io.sockets.emit('send-full', fullData);
	});
});
