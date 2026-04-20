// ── SERIAL VARIABLES ──
let port;
let connectBtn;
let baudrate = 9600;   // must match Serial.begin(9600) in Arduino

function setup() {
  createCanvas(400, 400);
  background(220);

  // ── SERIAL SETUP ──
  // Creates the port object. Does not open the connection yet.
  port = createSerial();

  // ── CONNECT BUTTON ──
  // Browser security requires a user gesture (a click)
  // before we are allowed to open a serial port.
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(10, 10);
  connectBtn.mousePressed(connectToSerial);
}

function draw() {
  background(220);

  // ── CALCULATE BRIGHTNESS ──
  // Map the mouse's horizontal position across the canvas
  // to a brightness value in the range 0–255.
  // This matches the range that analogWrite() accepts on Arduino.
  let brightness = int(map(mouseX, 0, width, 0, 255));

  // ── CONSTRAIN ──
  // Clamp the value so it never exceeds 0–255,
  // even if the mouse moves outside the canvas.
  brightness = constrain(brightness, 0, 255);

  // ── VISUAL FEEDBACK ──
  // Draw a rectangle whose fill matches the brightness value.
  // This gives a visual preview of what the LED will look like.
  fill(brightness);
  rect(100, 150, 200, 100);

  // Label showing the exact brightness number being sent
  fill(0);
  textSize(16);
  text("Brightness: " + brightness, 120, 130);

  // ── SEND TO ARDUINO ──
  // Only write if the port is open (i.e., user has connected).
  // We append '\n' so Arduino's Serial.read() can detect
  // the end of the message after parseInt() runs.
  if (port.opened()) {
    port.write(brightness + "\n");
  }
}

// ── CONNECT FUNCTION ──
// Opens the serial port when the button is clicked.
function connectToSerial() {
  if (!port.opened()) {
    port.open(baudrate);
  }
}
