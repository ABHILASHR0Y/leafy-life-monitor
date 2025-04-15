/*
 * Plant Monitoring System - Arduino Code
 * Compatible with Leafy Life Monitor Dashboard
 * 
 * This code reads soil moisture sensor data and controls water and fertilizer motors
 * based on commands received from the React application via Serial communication.
 */
 
// Pin definitions
const int MOISTURE_SENSOR_PIN = A0;    // Analog pin for soil moisture sensor
const int WATER_MOTOR_PIN = 7;         // Digital pin for water motor relay
const int FERTILIZER_MOTOR_PIN = 8;    // Digital pin for fertilizer motor relay

// Variables for sensor readings
int moistureLevel = 0;
int moisturePercent = 0;

// Motor states
bool waterMotorActive = false;
bool fertilizerMotorActive = false;

// Timer variables
unsigned long waterMotorStartTime = 0;
unsigned long fertilizerMotorStartTime = 0;
unsigned long waterDuration = 10000;  // Default 10 seconds (in milliseconds)
unsigned long fertilizerDuration = 10000;  // Default 10 seconds (in milliseconds)
unsigned long lastStatusTime = 0;     // Last time status was sent
unsigned long lastPingTime = 0;       // Last time a ping was received
unsigned long connectionTimeout = 10000; // 10 second timeout for connection

// System settings
bool automaticMode = false;
int optimalMoistureMin = 60;
int optimalMoistureMax = 80;

// Communication
String inputString = "";
bool stringComplete = false;
bool isConnected = false;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize motor control pins
  pinMode(WATER_MOTOR_PIN, OUTPUT);
  pinMode(FERTILIZER_MOTOR_PIN, OUTPUT);
  
  // Ensure motors are off at startup
  digitalWrite(WATER_MOTOR_PIN, LOW);
  digitalWrite(FERTILIZER_MOTOR_PIN, LOW);
  
  // Reserve memory for input string
  inputString.reserve(50);
  
  // Send initial status after boot
  sendStatus();
  Serial.println("Arduino ready");
}

void loop() {
  // Read moisture sensor
  readMoistureSensor();
  
  // Check if motors need to be turned off
  checkMotorTimers();
  
  // Check if we need to activate water motor in automatic mode
  if (automaticMode && !waterMotorActive && moisturePercent < (optimalMoistureMin * 0.8)) {
    activateWaterMotor(waterDuration);
  }
  
  // Process any incoming serial commands
  processSerialCommands();
  
  // Check connection status - if no ping received within timeout period, consider disconnected
  if (isConnected && (millis() - lastPingTime > connectionTimeout)) {
    isConnected = false;
    Serial.println("disconnected:timeout");
  }
  
  // Send status update every 2 seconds if connected, or send "alive" ping if not
  if (millis() - lastStatusTime > 2000) {
    if (isConnected) {
      sendStatus();
    } else {
      Serial.println("alive");
    }
    lastStatusTime = millis();
  }
  
  // Small delay to prevent excessive readings
  delay(100);
}

void readMoistureSensor() {
  // Read the analog value from the moisture sensor
  moistureLevel = analogRead(MOISTURE_SENSOR_PIN);
  
  // Convert to percentage (adjust these values based on your sensor's characteristics)
  // Assuming 0 is completely wet and 1023 is completely dry
  moisturePercent = map(moistureLevel, 1023, 0, 0, 100);
  
  // Constrain to valid range
  moisturePercent = constrain(moisturePercent, 0, 100);
}

void checkMotorTimers() {
  // Check if water motor needs to be turned off
  if (waterMotorActive && (millis() - waterMotorStartTime >= waterDuration)) {
    digitalWrite(WATER_MOTOR_PIN, LOW);
    waterMotorActive = false;
    Serial.println("water_motor:off");
  }
  
  // Check if fertilizer motor needs to be turned off
  if (fertilizerMotorActive && (millis() - fertilizerMotorStartTime >= fertilizerDuration)) {
    digitalWrite(FERTILIZER_MOTOR_PIN, LOW);
    fertilizerMotorActive = false;
    Serial.println("fertilizer_motor:off");
  }
}

void activateWaterMotor(unsigned long duration) {
  if (!waterMotorActive) {
    digitalWrite(WATER_MOTOR_PIN, HIGH);
    waterMotorActive = true;
    waterMotorStartTime = millis();
    waterDuration = duration;
    Serial.println("water_motor:on");
  }
}

void activateFertilizerMotor(unsigned long duration) {
  if (!fertilizerMotorActive) {
    digitalWrite(FERTILIZER_MOTOR_PIN, HIGH);
    fertilizerMotorActive = true;
    fertilizerMotorStartTime = millis();
    fertilizerDuration = duration;
    Serial.println("fertilizer_motor:on");
  }
}

void processSerialCommands() {
  // Process completed command string
  if (stringComplete) {
    inputString.trim();
    
    // Update connection status and last ping time
    lastPingTime = millis();
    if (!isConnected) {
      isConnected = true;
      Serial.println("connected");
    }
    
    if (inputString.startsWith("ping")) {
      // Just a ping to keep connection alive
      Serial.println("pong");
    }
    else if (inputString.startsWith("water:on")) {
      // Extract duration if provided
      int colonIndex = inputString.indexOf(':', 6);
      if (colonIndex > 0) {
        int duration = inputString.substring(colonIndex + 1).toInt();
        activateWaterMotor(duration * 1000);  // Convert seconds to milliseconds
      } else {
        activateWaterMotor(waterDuration);
      }
    }
    else if (inputString.startsWith("fertilizer:on")) {
      // Extract duration if provided
      int colonIndex = inputString.indexOf(':', 12);
      if (colonIndex > 0) {
        int duration = inputString.substring(colonIndex + 1).toInt();
        activateFertilizerMotor(duration * 1000);  // Convert seconds to milliseconds
      } else {
        activateFertilizerMotor(fertilizerDuration);
      }
    }
    else if (inputString == "mode:auto") {
      automaticMode = true;
      Serial.println("mode:auto");
    }
    else if (inputString == "mode:manual") {
      automaticMode = false;
      Serial.println("mode:manual");
    }
    else if (inputString.startsWith("water_duration:")) {
      int duration = inputString.substring(15).toInt();
      if (duration > 0) {
        waterDuration = duration * 1000;  // Convert seconds to milliseconds
        Serial.println("water_duration:" + String(duration));
      }
    }
    else if (inputString.startsWith("fertilizer_duration:")) {
      int duration = inputString.substring(20).toInt();
      if (duration > 0) {
        fertilizerDuration = duration * 1000;  // Convert seconds to milliseconds
        Serial.println("fertilizer_duration:" + String(duration));
      }
    }
    else if (inputString == "status") {
      sendStatus();
    }
    
    // Clear the input string for the next command
    inputString = "";
    stringComplete = false;
  }
}

void sendStatus() {
  // Send complete status update as JSON
  Serial.print("{\"moisture\":");
  Serial.print(moisturePercent);
  Serial.print(",\"water_motor\":");
  Serial.print(waterMotorActive ? "true" : "false");
  Serial.print(",\"fertilizer_motor\":");
  Serial.print(fertilizerMotorActive ? "true" : "false");
  Serial.print(",\"mode\":\"");
  Serial.print(automaticMode ? "automatic" : "manual");
  Serial.print("\",\"water_duration\":");
  Serial.print(waterDuration / 1000);
  Serial.print(",\"fertilizer_duration\":");
  Serial.print(fertilizerDuration / 1000);
  Serial.print(",\"connected\":");
  Serial.print(isConnected ? "true" : "false");
  Serial.println("}");
  
  lastStatusTime = millis(); // Update last status time
}

// SerialEvent occurs whenever new data comes in the hardware serial RX
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    // Add character to input string
    if (inChar != '\n') {
      inputString += inChar;
    }
    // End of command
    else {
      stringComplete = true;
    }
  }
}
