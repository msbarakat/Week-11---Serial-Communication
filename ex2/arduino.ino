/*
 *  Waits for a brightness value (0–255) sent from p5.
 *  Uses analogWrite() to set the LED brightness via PWM.
 *  Nothing is sent back to p5 — one-directional only.
 */

int ledPin = 5;   // must be a PWM pin (~) for analogWrite()

void setup() {

  // ── SERIAL ──
  Serial.begin(9600);   // must match p5 baudrate

  // ── PIN MODES ──
  pinMode(LED_BUILTIN, OUTPUT);   // built-in LED used as status indicator
  pinMode(ledPin, OUTPUT);        // external LED controlled by p5

  // ── WIRING CHECK ──
  // Blink the external LED once at startup so we can confirm the LED and resistor are wired correctly before any serial data arrives.
  digitalWrite(ledPin, HIGH);
  delay(200);
  digitalWrite(ledPin, LOW);

  // ── HANDSHAKE ──
  // p5 will not send data until it receives something first.
  // So we loop here — blinking the built-in LED and sending '0' — until p5 responds. 
  // Once Serial.available() > 0, we know p5 is connected and the loop exits.
  while (Serial.available() <= 0) {
    digitalWrite(LED_BUILTIN, HIGH);   // blink = still waiting
    Serial.println("0");               // prompt p5 to start sending
    delay(300);
    digitalWrite(LED_BUILTIN, LOW);
    delay(50);
  }
}

void loop() {

  // ── WAIT FOR DATA ──
  // Only act when there are bytes waiting in the serial buffer.
  while (Serial.available()) {
    digitalWrite(LED_BUILTIN, HIGH);   // lit = actively receiving

    // ── READ BRIGHTNESS ──
    // parseInt() reads digits from the buffer and returns them as an integer. 
    // It stops at any non-digit character (including the newline).
    int brightness = Serial.parseInt();

    // ── CONFIRM COMPLETE MESSAGE ──
    // After parseInt(), the next character should be '\n'.
    // This confirms we received a full message and not a partial one, preventing corrupted values.
    if (Serial.read() == '\n') {

      // ── SET LED BRIGHTNESS ──
      // analogWrite(pin, 0–255) uses PWM to control brightness.
      // 0 = fully off, 255 = fully on, values in between = dimmed.
      analogWrite(ledPin, brightness);
    }
  }

  // Built-in LED off when not receiving — acts as idle indicator
  digitalWrite(LED_BUILTIN, LOW);
}
