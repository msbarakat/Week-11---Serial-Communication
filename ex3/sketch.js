// ── SERIAL VARIABLES ──
// port       : the serial connection object (from p5.webserial)
// connectBtn : button the user clicks to open the port
// baudrate   : must match Serial.begin(9600) in Arduino
// x          : horizontal position of the ellipse on screen
let port;
let connectBtn;
let baudrate = 9600;
let x = 200;   // starting position — centre of a 400px canvas

function setup() {
  createCanvas(400, 400);
  background(220);

  // ── CREATE SERIAL PORT ──
  port = createSerial();

  // ── CONNECT BUTTON ──
  // The user must click this to trigger the browser's serial port picker dialog.
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(10, 10);
  connectBtn.mousePressed(connectToSerial);
}

function draw() {
  background(220);

  // ── READ INCOMING DATA ──
  // readUntil('\n') reads all characters up to and including the newline that Arduino sends at the end of each Serial.println().
  // If nothing new has arrived yet, str will be ''.
  let str = port.readUntil("\n");

  if (str.length > 0) {
    // trim() removes the trailing '\n' (and any spaces).
    // int() converts the cleaned string into a number.
    let val = int(trim(str));

    // ── MAP VALUE TO CANVAS ──
    // Arduino sends 0–255. We stretch that range across
    // the full canvas width so the ellipse covers the
    // entire screen as the pot is turned.
    x = map(val, 0, 255, 0, width);
  }

  // ── DRAW ELLIPSE ──
  // x moves horizontally. 
  // y is fixed at height/2 so the ellipse stays on the vertical centre.
  ellipse(x, height / 2, 50, 50);
}

// ── CONNECT FUNCTION ──
// Called when the button is clicked.
// port.open(baudrate) launches the browser serial picker
// and opens the port at 9600 baud if the user selects one.
function connectToSerial() {
  if (!port.opened()) {
    port.open(baudrate);
  }
}