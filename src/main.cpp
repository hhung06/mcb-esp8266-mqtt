#include <Arduino.h>
#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Home's Wifi
// #define wifiId "Hung"
// #define wifiPass "hungnh06"
// Phone's Wifi
#define wifiId "AndroidAP_4036"
#define wifiPass "244466666"

// MQTT
#define mqttServer IPAddress(203, 162, 10, 118)
#define mqttPort 8800
#define mqttUser "IB12345"
#define mqttPass "12345"
// HiveMQ
// #define mqtt_server "broker.hivemq.com"
// #define mqtt_port 1883

// Topic
#define sensors "esp8266/sensors/hum-temp-light"

// DHT11 Sensor
#define dhtPin D5
#define dhtType DHT11
DHT dht(dhtPin, dhtType);

// LDR Sensor
#define ldrPin A0

// LED Control
#define led1 D2
#define led2 D3

long lastMsg = 0;

// Creat instance
WiFiClient espClient;
PubSubClient client(espClient);

void setupWifi()
{
  delay(10);
  Serial.println();
  Serial.print("Connnecting to ");
  Serial.print(wifiId);
  WiFi.begin(wifiId, wifiPass);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Wifi connected!!!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void callbackFunction(char *topic, byte *payload, unsigned int length)
{
  Serial.print("New message: ");
  char p[length + 1];
  memcpy(p, payload, length);
  String message(p);

  if (String(topic) == "led1")
  {
    if (message == "On")
    {
      digitalWrite(led1, HIGH);
    }
    if (message == "Off")
    {
      digitalWrite(led1, LOW);
    }
  }
  if (String(topic) == "led2")
  {
    if (message == "On")
    {
      digitalWrite(led2, HIGH);
    }
    if (message == "Off")
    {
      digitalWrite(led2, LOW);
    }
  }

  Serial.print(topic);
  Serial.print(" ");
  Serial.println(message);
}

void reconnect()
{
  while (!client.connected())
  {
    // if (client.connect("esp8266"))
    if (client.connect("esp8266", mqttUser, mqttPass))
    {
      Serial.println("MQTT Connected!!!");
      // Subcribe
      client.subscribe("led1");
      client.subscribe("led2");
    }
    else
    {
      Serial.print("Error: rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(115200);

  setupWifi();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callbackFunction);

  if (!client.connected())
  {
    reconnect();
  }

  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);

  dht.begin();
}

void loop()
{
  client.loop();

  long now = millis();
  if (now - lastMsg > 5000)
  {
    lastMsg = now;
    // int hum = dht.readHumidity(); //Celcius
    // int temp = dht.readTemperature();
    int hum = random(84, 88);
    int temp = random(17, 23);
    int ldr = analogRead(ldrPin);

    int light = map(ldr, 0, 1023, 100, 0);

    char humiString[10];
    sprintf(humiString, "%d", hum);
    Serial.print("  Humidity: ");
    Serial.print(humiString);

    char tempString[10];
    sprintf(tempString, "%d", temp);
    Serial.print("  Temperature: ");
    Serial.print(tempString);

    char lightString[10];
    sprintf(lightString, "%d", light);
    Serial.print("  Light: ");
    Serial.println(lightString);

    StaticJsonDocument<100> doc;
    doc["Humidity"] = hum;
    doc["Temperature"] = temp;
    doc["Light"] = light;

    // Publish
    char buffer[100];
    serializeJson(doc, buffer);
    client.publish(sensors, buffer);
    Serial.print("Publishing: ");
    Serial.println(buffer);
  }
}