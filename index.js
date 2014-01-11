var http = require('http'),
	express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	port = process.env.PORT || 5000,
	call = {};
 
app.use(express.bodyParser());

app.get('/', function(request, response) {
	response.sendfile('public/index.html');
});

app.get('/shouldibesilent', function(request, response) {
	console.log('That phone wants to know if it should be silent...', request);
	response.json({callSound: call.sound});
});
 
app.post('/call', function(request, response) {
	io.sockets.emit('call'+ request.body.action);
	response.json({success: true});
});
 
app.get(/^(.+)$/, function(req, res) {
	res.sendfile('public/' + req.params[0]);
});
 
server.listen(port, function() {
	console.log('Listening on ' + port);
});

io.configure(function() {
	io.set('transports', ['xhr-polling']);
	io.set('polling duration', 10);
});

io.sockets.on('connection', function(socket) {
	socket.on('callmute', function(data) {
		console.log(data);
		call.sound = false;
	});
	socket.on('callsound', function(data) {
		console.log(data);
		call.sound = true;
	});
});