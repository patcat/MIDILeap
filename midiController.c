#include <SoftwareSerial.h>
#define BUFLENGTH 32
#define DEBUG true

char buf[BUFLENGTH]; // character buffer for json message processing
int bufCount; // counter for the string buffer.

SoftwareSerial mySerial(2, 3); // RX, TX
byte note = 0; //The MIDI note value to be played
byte resetMIDI = 4; //Tied to VS1053 Reset line
byte ledPin = 13; //MIDI traffic inidicator
int instrument = 0;

void setup() {
	Serial.begin(57600);
	mySerial.begin(31250);
	
	//Reset the VS1053
	pinMode(resetMIDI, OUTPUT);
	digitalWrite(resetMIDI, LOW);
	delay(100);
	digitalWrite(resetMIDI, HIGH);
	delay(100);
	talkMIDI(0xB0, 0x07, 120); // Set volume to near max
}

void loop() {
	if (Serial.available() > 10) {
		SerialParse();
	}
	
	delay(1);
}


void SerialParse(void) {
	bufCount = -1; // reset it
	bufCount = Serial.readBytesUntil('\n', buf, BUFLENGTH);

	if (bufCount > 0) {
		String message = String(buf);
		
		int msg_index = message.lastIndexOf('{');
		if (msg_index >= 0) {
			parse_message(message, msg_index);
		}
	}
}


void parse_message(String& message, int message_start) {
	String msg_string = message.substring(message_start);
	msg_string = msg_string.substring(1, msg_string.lastIndexOf("}"));
	msg_string.replace(" ", "");
	msg_string.replace("\"", "");
	
	// Turn our string into an array of characters
	msg_string.toCharArray(buf, BUFLENGTH);
	
	// Iterate over each char in the array
	char *p = buf;
	char *str;
	
	// Storage of potential keys
	int16_t opt_i = -1; // Instrument
	int16_t opt_o = -1; // Note on/off
	int16_t opt_c = 0; // Channel
	int16_t opt_n = 0; // Note value
	int16_t opt_v = 60; // Velocity
	int16_t opt_d = 50; // Delay
	
	while ((str = strtok_r(p, ",", &p)) != NULL) {
		char *tp = str;
		char *key; char *val;

		// get the key
		key = strtok_r(tp, ":", &tp);
		val = strtok_r(NULL, ":", &tp);
		
		if (*key == 'i') opt_i = atoi(val);
		if (*key == 'o') opt_o = atoi(val);
		if (*key == 'c') opt_c = atoi(val);
		if (*key == 'n') opt_n = atoi(val);
		if (*key == 'v') opt_v = atoi(val);
		if (*key == 'd') opt_d = atoi(val);
		
		// Do we have an instrument change?
		if (opt_i != -1) {
		  talkMIDI(0xC0, opt_i, 0);
		}
		// Are we turning a note on/off?
		if (opt_o == 2) {
		  Serial.println(opt_n);
		  noteOn(opt_c, opt_n, opt_v);
		  delay(opt_d);
		  noteOff(opt_c, opt_n, opt_v);
		}
	}
}

//Send a MIDI note-on message.  Like pressing a piano key
//channel ranges from 0-15
void noteOn(byte channel, byte note, byte attack_velocity) {
  talkMIDI( (0x90 | channel), note, attack_velocity);
}

//Send a MIDI note-off message.  Like releasing a piano key
void noteOff(byte channel, byte note, byte release_velocity) {
  talkMIDI( (0x80 | channel), note, release_velocity);
}

//Plays a MIDI note. Doesn't check to see that cmd is greater than 127, or that data values are less than 127
void talkMIDI(byte cmd, byte data1, byte data2) {
  digitalWrite(ledPin, HIGH);
  mySerial.write(cmd);
  mySerial.write(data1);

  //Some commands only have one data byte. All cmds less than 0xBn have 2 data bytes 
  //(sort of: http://253.ccarh.org/handout/midiprotocol/)
  if( (cmd & 0xF0) <= 0xB0)
	mySerial.write(data2);

  digitalWrite(ledPin, LOW);
}
