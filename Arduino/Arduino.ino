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

void setup()
{
  Serial.begin(9600);
  FastLED.addLeds<WS2812, DATA_PIN>(leds, NUM_LEDS);
  FastLED.clear();
  FastLED.show();

  while (!Serial)
    ;

  while (status != WL_CONNECTED)
  {
    Serial.print("CONNECTING TO WIFI.");
    status = WiFi.begin(ssid, pass);

    delay(10000);
    Serial.print("status:");
    Serial.print(status);
  }
  Serial.println("CONNECTED TO WIFI");
  Serial.println(status);

  // Test LEDs to ensure they are working
  for (int i = 0; i < NUM_LEDS; i++)
  {
    leds[i] = CRGB::Red;
  }
  FastLED.show();
  delay(1000);
  FastLED.clear();
  FastLED.show();
}

void loop()
{
  if (!client.connected())
  {
    Serial.println();
    Serial.println("DISCONNECTING FROM SERVER.");
    client.stop();

    // Attempt to reconnect to the server
    while (!client.connect(server, 3000))
    {
      Serial.println("RECONNECTING TO SERVER.");
      delay(2000);
    }
    Serial.println("CONNECTED TO SERVER.");
  }

  if (Serial.available() > 0)
  {
    String color = Serial.readStringUntil('\n');
    Serial.print("Received RGB values and brightness: ");
    Serial.println(color);

    char colorArray[color.length() + 1];
    color.toCharArray(colorArray, color.length() + 1);

    int brightness = 255; // Default brightness
    int r, g, b;
    char *token = strtok(colorArray, ";");
    int i = 0;

    while (token != NULL)
    {
      if (i < NUM_LEDS)
      {
        sscanf(token, "%d,%d,%d", &r, &g, &b);
        leds[i] = CRGB(r, g, b);
        Serial.print("LED ");
        Serial.print(i);
        Serial.print(": ");
        Serial.print(r);
        Serial.print(", ");
        Serial.print(g);
        Serial.print(", ");
        Serial.println(b);
      }
      else
      {
        brightness = atoi(token);
        Serial.print("Brightness: ");
        Serial.println(brightness);
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