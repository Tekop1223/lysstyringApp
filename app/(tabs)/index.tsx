

// must have imports
import { StyleSheet, View, Modal, Pressable, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { FlatList } from 'react-native-reanimated/lib/typescript/Animated';

// custom imports
import Slider from '@react-native-community/slider';
import ColorPicker, { Panel1, Preview, HueSlider } from 'reanimated-color-picker';
import { array } from 'prop-types';


// expo imports
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


// custom types
type Color = {
  hex: string;
};


export default function HomeScreen() {
  const [showModal, setShowModal] = useState<number | false>(false);
  const [selectedColor, setSelectedColor] = useState<string>('#ff0000');
  const [brightness, setBrightness] = useState<number>(255);
  const [ledColors, setLedColors] = useState<string[]>(Array(60).fill('#000000'));


  useEffect(() => {
    const fetchLedColors = async () => {
      try {
        const response = await fetch(`http://${process.env.SERVER_IP}:3000/led/colors`)
        const data = await response.json();
        setLedColors(data.colors);
        setBrightness(data.brightness);
      } catch (err) {
        console.error('Error fetching led colors:', err);
      }
    };

    fetchLedColors();
  }, []);


  const onSelectColor = (color: Color, index: number) => {
    const newColors = [...ledColors];
    newColors[index] = color.hex;
    setLedColors(newColors);
    sendColorToServer(newColors, brightness)
  };

  const sendColorToServer = async (color: string[], brightness: number) => {
    try {
      await fetch(`http://${process.env.SERVER_IP}:3000/led/colors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ color, brightness }),
      });
    } catch (error) {
      console.error('Error:', error);
    };
  }
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={ledColors}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => setShowModal(index)}>
            <View style={[styles.led, { backgroundColor: item }]} />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={10}
      />

      <Modal visible={showModal !== false} animationType='slide'>
        <ThemedView style={styles.colorSelector}>
          <ColorPicker
            value={selectedColor}
            onComplete={(color) => onSelectColor(color, showModal as number)}
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

