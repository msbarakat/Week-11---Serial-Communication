/*
 *  Reads the potentiometer, maps it to 0–255, and sends the value to p5 over serial every 100ms.
 *  p5 uses this value to move an ellipse horizontally.
 *  Nothing is sent back from p5 — one-directional only.
 */

// ── TIMING ──
// We use a fixed delay of 100ms between readings.
// This keeps the data stream stable and avoids flooding the serial buffer with values.
int interval = 100;
int lastMessageTime = 0;

void setup() {
  // Start serial at 9600 baud — must match p5 baudrate
  Serial.begin(9600);
}

void loop() {

  // ── READ SENSOR ──
  // analogRead returns 0–1023 based on the voltage at A1.
  // At 0V (GND side) → 0. At 5V → 1023.
  int potentiometer = analogRead(A1);

  // ── MAP TO SMALLER RANGE ──
  // Compress 0–1023 to 0–255 so p5 can easily map it onto the canvas width.
  int mappedPotValue = map(potentiometer, 0, 1023, 0, 255);

  // ── SEND TO p5 ──
  // Serial.println() sends the number as a string followed by a newline character '\n'.
  // p5 uses that newline to know where one value ends and the next begins.
  Serial.println(mappedPotValue);

  // ── DELAY ──
  // Short pause for stable readings and to avoid sending data faster than p5 can process it.
  delay(100);
}
