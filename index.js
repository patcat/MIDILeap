var five = require('johnny-five'),
	Leap = require('leapjs'),
	board = new five.Board(),
	shiftRegister,
	led, frame,
	allowLEDchange = true,

	// Pin definitions
	datapin = 2,
	clockpin = 3,
	latchpin = 4,

	// Global variable for data sending to shift register
	data = 0;

var controller = new Leap.Controller({enableGestures: true});

board.on("ready", function() {
	console.log('Board ready');
	shiftRegister = new five.ShiftRegister({
		pins: {
			data: datapin,
			clock: clockpin,
			latch: latchpin
		}
	});

	var value = 0;
	/*function next() {
		value = value > 0x11 ? value >> 1 : 0x88;
		shiftRegister.send( value );
		setTimeout(next, 300);
	}*/

	shiftRegister.send(0);
	//shiftRegister.send(0x10);

	// 5 6 7 8
	// 1 2 3 4

	this.repl.inject({
		sr: shiftRegister
	});

	//next();

	limitCalls();

	function limitCalls() {
		allowLEDchange = true;
		setTimeout(limitCalls, 300);
	}

	controller.on("frame", function(frame) {
		//console.log("Frame: " + frame.id + " @ " + frame.timestamp);

		if (allowLEDchange) {
			for (var i = 0; i < frame.hands.length; i++) {
				var hand = frame.hands[0],
					direction = hand.direction,
					sphereCenter = hand.sphereCenter;

				console.log(sphereCenter);

				allowLEDchange = false;
				shiftRegister.send(0);

				// Create grid of LEDs, set up if statements or something to decide which are switched on
				if (sphereCenter[0] < -50) {
					if (sphereCenter[2] < 0) {
						console.log('A1');
						shiftRegister.send(0x08);
					} else if (sphereCenter[2] >= 0) {
						console.log('B1');
						shiftRegister.send(0x80);
					}
				} else if (sphereCenter[0] > 50) {
					if (sphereCenter[2] < 0) {
						console.log('A4');
						shiftRegister.send(0x01);
					} else if (sphereCenter[2] >= 0) {
						console.log('B4');
						shiftRegister.send(0x10);
					}
				} else if (sphereCenter[0] >= -50 && sphereCenter[0] <= 0) {
					if (sphereCenter[2] < 0) {
						console.log('A2');
						shiftRegister.send(0x04);
					} else if (sphereCenter[2] >= 0) {
						console.log('B2');
						shiftRegister.send(0x40);
					}
				} else if (sphereCenter[0] > 0 && sphereCenter[0] <= 50) {
					if (sphereCenter[2] < 0) {
						console.log('A3');
						shiftRegister.send(0x02);
					} else if (sphereCenter[2] >= 0) {
						console.log('B3');
						shiftRegister.send(0x20);
					}
				}
			}
		}
	});
});

controller.on('ready', function() {
    console.log("ready");
});
controller.on('connect', function() {
    console.log("connect");
});
controller.on('disconnect', function() {
    console.log("disconnect");
});
controller.on('focus', function() {
    console.log("focus");
});
controller.on('blur', function() {
    console.log("blur");
});
controller.on('deviceConnected', function() {
    console.log("deviceConnected");
});
controller.on('deviceDisconnected', function() {
    console.log("deviceDisconnected");
});

controller.connect();
console.log("\nWaiting for device to connect...");
