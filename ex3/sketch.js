// ── PHYSICS VARIABLES ──
let velocity;       // how fast and in what direction the ball moves
let gravity;        // constant downward force
let position;       // ball's current x,y position on the canvas
let acceleration;   // accumulated forces this frame
let wind;           // horizontal force — controlled by joystick
let drag = 0.99;    // multiplied each frame to slowly reduce speed (air resistance)
let mass = 50;      // ball size; also used to scale forces

// ── SERIAL VARIABLES ──
let port;
let connectBtn;
let baudrate = 9600;

// ── SENSOR STATE ──
// Start at 512 (joystick centre) so wind begins at 0 before any serial data arrives.
let sensorValue = 512;

function setup() {
  createCanvas(640, 360);
  noFill();

  // ── INITIAL PHYSICS STATE ──
  // Ball starts at the top-centre of the canvas.
  position     = createVector(width / 2, 0);
  velocity     = createVector(0, 0);
  acceleration = createVector(0, 0);

  // Gravity pulls downward (+y). 
  // Scaled by mass so the force feels proportional to the ball's size.
  gravity = createVector(0, 0.5 * mass);
  wind    = createVector(0, 0);   // starts calm; updated each frame

  // ── SERIAL SETUP ──
  port = createSerial();
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(10, 10);
  connectBtn.mousePressed(connectToSerial);
}

function draw() {
  background(255);

  // ── READ JOYSTICK FROM ARDUINO ──
  // Arduino sends a new joystick value after every bounce message.
  // readUntil('\n') returns the latest complete line, or '' if nothing new has arrived yet.
  let str = port.readUntil("\n");
  if (str.length > 0) {
    sensorValue = int(trim(str));   // clean and convert to number
  }

  // ── MAP JOYSTICK TO WIND ──
  // 0   (full left)  → -1 (wind blows left)
  // 512 (centre)     →  0 (no wind)
  // 1023 (full right) → +1 (wind blows right)
  wind.x = map(sensorValue, 0, 1023, -1, 1);

  // ── APPLY FORCES ──
  // Both wind and gravity are added to acceleration this frame.
  // applyForce() divides by mass so heavier balls accelerate less.
  applyForce(wind);
  applyForce(gravity);

  // ── INTEGRATE PHYSICS ──
  velocity.add(acceleration);   // acceleration changes velocity
  velocity.mult(drag);          // drag slows velocity each frame
  position.add(velocity);       // velocity changes position
  acceleration.mult(0);         // reset — forces are reapplied next frame

  // ── DRAW BALL ──
  ellipse(position.x, position.y, mass, mass);

  // ── BOUNCE DETECTION ──
  let bounced = 0;                    // assume no bounce this frame
  let floorY = height - mass / 2;    // y where ball touches the floor

  if (position.y > floorY) {
    position.y = floorY;   // prevent ball from going below floor

    // ── VELOCITY THRESHOLD ──
    // Only count as a real bounce if the ball hits with enough
    // downward speed (> 2). This filters out the tiny movements when the ball is nearly at rest
    // Would otherwise cause the LED to flicker continuously.
    if (velocity.y > 2) {
      velocity.y *= -0.9;   // reverse and reduce (energy loss on impact)
      bounced = 1;           // signal a real bounce to Arduino
    } else {
      velocity.y = 0;        // ball has come to rest — stop it completely
    }
  }

  // ── SEND BOUNCE STATE TO ARDUINO ──
  // Sends 1 if a real bounce happened this frame, 0 otherwise.
  // Arduino uses this to briefly light the LED on each bounce.
  // '\n' is appended so Arduino can confirm end of message.
  if (port.opened()) {
    port.write(bounced + "\n");
  }
}

// ── APPLY FORCE HELPER ──
// Implements Newton's second law: a = F / m
// Dividing by mass means heavier balls accelerate less
// from the same force (wind feels weaker on a heavier ball).
function applyForce(force) {
  let f = p5.Vector.div(force, mass);
  acceleration.add(f);
}

// ── SPACEBAR — RESET BALL ──
// Press space to drop a new ball with a random mass.
// Resetting velocity to 0 ensures it falls cleanly from the top.
function keyPressed() {
  if (key == ' ') {
    mass = random(30, 80);   // randomise ball size
    position.y = -mass;      // start just above the canvas top
    velocity.mult(0);        // clear any existing velocity
  }
}

// ── CONNECT FUNCTION ──
function connectToSerial() {
  if (!port.opened()) {
    port.open(baudrate);
  }
}
