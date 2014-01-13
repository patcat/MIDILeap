var five = require('johnny-five'),
	Leap = require('leapjs'),
	//board = new five.Board(),
	led, frame;

var controller = new Leap.Controller({enableGestures: true});

controller.on("frame", function(frame) {
	for (var i = 0; i < frame.hands.length; i++) {
		var hand = frame.hands[i],
			direction = hand.direction,
			sphereCenter = hand.sphereCenter;

		//console.log(sphereCenter);

		// Create grid of LEDs, set up if statements or something to decide which are switched on
		if (sphereCenter[0] < -50) {
			console.log('Hand is on the left');
		} else if (sphereCenter[0] > 50) {
			console.log('Hand is on the right');
		} else if (sphereCenter[0] >= -50 && sphereCenter[0] <= 50) {
			console.log('Hand is about center');
		}

		if (sphereCenter[2] < -50) {
			console.log('Hand is on the top');
		} else if (sphereCenter[2] > 50) {
			console.log('Hand is on the bottom');
		} else if (sphereCenter[2] >= -50 && sphereCenter[2] <= 50) {
			console.log('Hand is about middle');
		}
	}
});

var frameCount = 0;
controller.on("frame", function(frame) {
  frameCount++;
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
