device.telephony.on('incomingCall', function (signal) 
{
	device.notifications.createNotification("INCOMING! " + signal.phoneNumber).show();

	console.info(signal);

	device.scheduler.setTimer({
		name: "checkingForInCallInputs", 
		time: 0,
		interval: 5*1000,
		exact: false
	},
		function () {
			checkIfPhoneShouldBeSilent();
		}
	);
});

device.telephony.on('idle', function () {
	device.notifications.createNotification("No longer in a call, I'll stop asking.").show();

	device.scheduler.removeTimer("checkingForInCallInputs");

	returnToPhoneDefaults();
});

function checkIfPhoneShouldBeSilent() {
	device.notifications.createNotification('Asking if I should be silent...').show();

	device.ajax({
		url: 'http://androidcontroller.herokuapp.com/shouldibesilent',
		type: 'POST',
		dataType: 'json',
		data: '{"call":"incoming"}',
		headers: {'Content-Type':'application/json'}
	}, function onSuccess(body, textStatus, response) {
		console.info('successfully received http response!');
		device.notifications.createNotification('Got a response from server').show();
		console.info(response);
		device.notifications.createNotification('It said ' + response.callSound).show();

		if (response.callSound === false) {
			device.audio.ringerVolume = 0;
		}

	}, function onError(textStatus, response) {
		var error = {};
		error.message = textStatus;
		error.statusCode = response.status;
		console.error('error: ',error);
	});
}

function returnToPhoneDefaults() {
	device.audio.ringerVolume = 80;
}