/*
 *  SENDS:    Joystick X value (0–1023) → p5 controls wind force
 *  RECEIVES: 1 or 0 from p5 → LED turns on when ball bounces
 */

int ledPin = 5;   // external LED — controlled by p5

void setup() {
  Serial.begin(9600);

  // ── PIN MODES ──
  pinMode(LED_BUILTIN, OUTPUT);   // status indicator
  pinMode(ledPin, OUTPUT);        // bounce-triggered LED

  // ── WIRING CHECK ──
  // Quick blink to confirm the LED circuit is connected correctly.
  digitalWrite(ledPin, HIGH);
  delay(200);
  digitalWrite(ledPin, LOW);

  // ── HANDSHAKE ──
  // Arduino sends '0' repeatedly until p5 responds.
  // This synchronises both sides before the main loop starts.
  // Without this, Arduino might start reading before p5 is ready.
  while (Serial.available() <= 0) {
    digitalWrite(LED_BUILTIN, HIGH);   // blink = waiting for p5
    Serial.println("0");               // send initial prompt
    delay(300);
    digitalWrite(LED_BUILTIN, LOW);
    delay(50);
  }
}

void loop() {

  // ── WAIT FOR INCOMING DATA ──
  // p5 sends a bounce state (1 or 0) after every frame.
  // We only proceed when there is data in the buffer.
  while (Serial.available()) {
    digitalWrite(LED_BUILTIN, HIGH);   // lit = receiving data

    // ── READ LED STATE FROM p5 ──
    // p5 sends '1' when a bounce is detected, '0' otherwise.
    // parseInt() extracts the integer from the incoming string.
    int ledState = Serial.parseInt();

    // ── CONFIRM COMPLETE MESSAGE ──
    // Check for the newline that p5 appends with port.write().
    // This prevents acting on partial or corrupted values.
    if (Serial.read() == '\n') {

      // ── CONTROL LED ──
      // ledState is 1 (HIGH) when p5 detects a bounce → LED on.
      // ledState is 0 (LOW) otherwise → LED off.
      digitalWrite(ledPin, ledState);
    }

    // ── SEND JOYSTICK VALUE TO p5 ──
    // Read the joystick's horizontal axis from A0.
    // Returns 0–1023: left ≈ 0, centre ≈ 512, right ≈ 1023.
    // p5 maps this range to wind force (-1 to +1).
    int joystickX = analogRead(A0);
    Serial.println(joystickX);   // send with newline for p5 to parse
  }

  // Built-in LED off when idle
  digitalWrite(LED_BUILTIN, LOW);
}
