var five = require('johnny-five'),
	leapjs = require('leapjs'),
	board = new five.Board(),
	led, frame;

var controller = new Leap.Controller({enableGestures: true});

controller.on("frame", function(frame) {
	//console.log("Frame: " + frame.id + " @ " + frame.timestamp);

	for (var i = 0; i < frame.hands.length; i++) {
		var hand = frame.hands[i],
			direction = hand.direction;

		console.log(direction);
	}
});