// must have imports
import { StyleSheet, View, Modal, Pressable, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

// custom imports
import Slider from '@react-native-community/slider';
import ColorPicker, { Panel1, Preview, HueSlider } from 'reanimated-color-picker';
import Animated from 'react-native-reanimated';

// expo imports
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export default function HomeScreen() {
  const [ledColors, setLedColors] = useState<string[]>(Array(60).fill('#ffffff'));
  const [brightness, setBrightness] = useState<number>(255);
  const [showModal, setShowModal] = useState<number | false>(false);
  const [selectedColor, setSelectedColor] = useState<string>('#ff0000');

  const serverIp = process.env.SERVER_IP;
  if (!serverIp) {
    console.error('Server IP is not defined in environment variables');
    return null;
  }

  const url = `http://${serverIp}:3000/led/colors`;

  useEffect(() => {
    const fetchLedColors = async () => {
      console.log(`Fetching LED colors from (fetchLedColors): ${url}`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        const colors: string[] = data.colors || [];

        // Ensures that there always are 60 colors
        const defaultColors = [...colors, ...Array(60 - colors.length).fill('#ffffff')];
        setLedColors(defaultColors);
        setBrightness(data.brightness);
      } catch (err) {
        console.error('Error fetching LED colors (fetchLedColors):', err);
      }
    };

    fetchLedColors();
  }, []);

  const onSelectColor = (color: { hex: string }, index: number) => {
    console.log(`Selected color: ${JSON.stringify(color)}, index: ${index}`);
    if (!color || !color.hex) {
      console.error('Invalid color selected', color);
      return;
    }

    const newColors = [...ledColors];
    newColors[index] = color.hex;
    setLedColors(newColors);
    sendColorToServer(newColors, brightness);
    console.log(`Sending color to server: ${color.hex}`);
    console.log(`New colors array: ${JSON.stringify(newColors)}`);
  };

  const sendColorToServer = async (colors: string[], brightness: number) => {
    console.log(`Sending request to ${url} with colors: ${JSON.stringify(colors)} and brightness: ${brightness}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ colors, brightness }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error response from server:', errorResponse);
      }
    } catch (err) {
      console.error('Error sending colors to server (sendColorToServer):', err);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Animated.FlatList
        style={{
          width: '100%', margin: 40
        }}
        data={ledColors}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => setShowModal(index)}>
            <View style={[styles.led, { backgroundColor: item }]} />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={6}
      />

      <Modal visible={showModal !== false} animationType='slide'>
        <ThemedView style={styles.colorSelector}>
          <ColorPicker
            value={selectedColor}
            onComplete={(colors) => onSelectColor(colors, showModal as number)}
            style={{ width: '70%' }}
          >

            <Preview />
            <Panel1 />
            <HueSlider />
          </ColorPicker>
          <ThemedView style={styles.BrightnessSliderContainer}>
            <ThemedText>Adjust Brightness</ThemedText>
            <Slider
              minimumValue={0}
              maximumValue={255}
              value={brightness}
              onValueChange={(value) => setBrightness(Math.round(value))}
              onSlidingComplete={(value) => sendColorToServer(ledColors, Math.round(value))}
            />
          </ThemedView>

          <Pressable onPress={() => setShowModal(false)} style={styles.Button}>
            <ThemedText>Close Color Picker</ThemedText>
          </Pressable>
        </ThemedView>
      </Modal >

    </ThemedView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  led: {
    width: 30,
    height: 30,
    margin: 5,
    borderRadius: 15,
  },

  BrightnessSliderContainer: {
    padding: 20,
  },

  Button: {
    padding: 10,
    backgroundColor: '#8D99AE',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',

  },
  colorSelector: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

