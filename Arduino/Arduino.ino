#include <string>
#include "WiFiS3.h"
#include "Arduino_secrets.h"
#include "fastLED.h"

#define NUM_LEDS 60
#define DATA_PIN 6

char ssid[] = WIFI_NETWORK_NAME;
char pass[] = WIFI_PASSWORD;
char server[] = WEB_ADDRESS;
char host[] = HOST;

WiFiClient client;
int status = WL_IDLE_STATUS;

void setup() {
  Serial.begin(9600);
  FastLED.addLeds<60>

  while (!Serial);

  while (status != WL_CONNECTED){
    Serial.print("CONNECTING TO WIFI");
    status = WiFi.begin(ssid, pass);
    delay(10000);
  }
}

void loop() {
  if(!client.connected()) {
    Serial.println();
    Serial.println("DISCONNECTING FROM SERVER");
    client.stop();

    while(true);
  }

}