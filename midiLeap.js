var serialPort = require("serialport"),
	SerialPort = serialPort.SerialPort,
	serialPort = new SerialPort("/dev/tty.usbmodem1431", {
		baudrate: 57600 //31250 //57600
	}),
	Leap = require('leapjs'),
	controller = new Leap.Controller({enableGestures: true}),
	allowNoteChange = true, // We set this to false to limit the calls
	minimumNote = 60,
	maximumNote = 90,
	noteRange = maximumNote - minimumNote,
	minimumInstrument = 0,
	maximumInstrument = 128,
	instrumentRange = maximumInstrument - minimumInstrument,
	currentInstrument = 0,
	currentNote = 30; // 30 is lowest note for now.

serialPort.on("open", function() {
	console.log('Serial port open');
	serialPort.on("data", function (data) {
		//console.log('Data received: ' + data);
	});

	setInterval(function() {
		var frame = controller.frame();
		if (frame.hands.length > 0) {
			var hand = frame.hands[0],
				direction = hand.direction,
				sphereCenter = hand.sphereCenter,
				palmNormal = hand.palmNormal,
				palmVelocity = hand.palmVelocity,
				fingerCount = frame.fingers.length;

			var noteRange = maximumNote - minimumNote,
				eachNote = noteRange / 300,
				eachInstrument = instrumentRange / 300;

			proposedNote = Math.floor(minimumNote + (frame.hands[0].sphereCenter[1] * eachNote));
			currentNote = proposedNote > minimumNote && proposedNote < maximumNote ? proposedNote : currentNote;

			proposedInstrument = Math.floor(minimumInstrument + ((frame.hands[0].sphereCenter[0] + 200) * eachInstrument));
			proposedInstrument = proposedInstrument > minimumInstrument && proposedInstrument < maximumInstrument ? proposedInstrument : currentInstrument;
			console.log(proposedInstrument);

			if (currentInstrument != proposedInstrument && fingerCount > 2) {
				currentInstrument = proposedInstrument;
				serialPort.write('{i:'+currentInstrument+'}');
			} else {
				serialPort.write('{o:2,c:0,n:'+currentNote+',v:60,d:20}');
			}
		}
	}, 100);
});

controller.connect();

/* --------------------------------------
 *	Message templates:
 *
 *	{i:1} - change to instrument one
 *	{o:0,c:0,n:30,v:60,d:50} - note on channel 1, note value 30, velocity middle (0x45), delay after of 50
 *	{o:1,c:0,n:30,v:60,d:50} - note off
 *	{o:2,c:0,n:30,v:60,d:50} - note on and off with d as a duration
 *
 * -------------------------------------- */