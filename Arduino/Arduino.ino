#include <string>
#include "WiFiS3.h"
#include "Arduino_secrets.h"
#include "FastLED.h"

#define NUM_LEDS 60
#define DATA_PIN 6

// Secrets
char ssid[] = WIFI_NETWORK_NAME;
char pass[] = WIFI_PASSWORD;
char server[] = WEB_ADDRESS;

WiFiClient client;
int status = WL_IDLE_STATUS;
CRGB leds[NUM_LEDS];

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<WS2812, DATA_PIN>(leds, NUM_LEDS);
  FastLED.clear();
  FastLED.show();

  while (!Serial);

  while (status != WL_CONNECTED) {
    Serial.print("CONNECTING TO WIFI.");
    status = WiFi.begin(ssid, pass);
    
    delay(10000);
    Serial.print("status:");
    Serial.print(status);
  }
  Serial.println("CONNECTED TO WIFI");
  Serial.println(status);
}

void loop() {
  if (!client.connected()) {
    Serial.println();
    Serial.println("DISCONNECTING FROM SERVER.");
    client.stop();

    // Attempt to reconnect to the server
    while (!client.connect(server, 3000)) {
      Serial.println("RECONNECTING TO SERVER.");
      delay(2000);
    }
    Serial.println("CONNECTED TO SERVER.");
  }

  if (Serial.available() > 0) {
    String color = Serial.readStringUntil('\n');
    Serial.print("Revived RGB values and brightness: ");
    Serial.println(color);

    char colorArray[color.length() + 1];
    color.toCharArray(colorArray, color.length() + 1);

 
    int brightness;
    int r, g, b;
    char* token = strtok(colorArray, ";");
    int i = 0;

    while (token != NULL && i < NUM_LEDS) {
      if (i == NUM_LEDS) {
      brightness = atoi(token);
      } else {
      sscanf(token, "%d,%d,%d", &r, &g, &b);
      leds[i] = CRGB(r, g, b);
      }
      token = strtok(NULL, ";");
      i++;
    }
    
    FastLED.setBrightness(brightness);
    FastLED.show();
    
    Serial.println("LEDs Updated.");
    Serial.println("Update complete.");
  }
}