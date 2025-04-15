
# Hardware Setup for Plant Monitoring System

## Components Needed:
1. Arduino (Uno, Nano, or similar)
2. Soil Moisture Sensor (capacitive recommended for longer life)
3. 2 Relay Modules (for water and fertilizer motors/pumps)
4. Small Water Pump (5-12V DC)
5. Small Fertilizer Pump (5-12V DC)
6. Power Supply (suitable for your pumps)
7. Jumper Wires
8. USB Cable (for Arduino to computer connection)
9. Optional: Project Box for housing electronics

## Wiring Instructions:

### Soil Moisture Sensor:
- VCC → Arduino 5V
- GND → Arduino GND
- DO → Not used (digital output)
- AO → Arduino A0 (analog output)

### Water Pump Relay:
- VCC → Arduino 5V
- GND → Arduino GND
- IN → Arduino D7
- Connect relay COM to power supply positive
- Connect relay NO to water pump positive
- Connect water pump negative to power supply negative

### Fertilizer Pump Relay:
- VCC → Arduino 5V
- GND → Arduino GND
- IN → Arduino D8
- Connect relay COM to power supply positive
- Connect relay NO to fertilizer pump positive
- Connect fertilizer pump negative to power supply negative

## Physical Setup Recommendations:
1. Mount the moisture sensor in the plant pot, ensuring good soil contact
2. Place water and fertilizer reservoirs near the plant
3. Position the pumps so they can draw from reservoirs and deliver to plant
4. Keep electronics in a waterproof container if used in humid environments
5. Ensure proper insulation of all electrical connections

## Communication with Web App:
The Arduino connects to your computer via USB, and the web application communicates with it via the Serial port. The Arduino sketch included in this project handles all the necessary communication protocols.
