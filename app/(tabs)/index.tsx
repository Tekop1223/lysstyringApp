import { StyleSheet, View, Modal, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';

import ColorPicker, { Panel1, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
import { useState } from 'react';


import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState('red');
  const [brightness, setBrightness] = useState(255);


  type Color = {
    hex: string
  };

  const onSelectColor = (color: Color) => {
    const hexColor = color.hex;
    setSelectedColor(hexColor);
    sendColorToServer(hexColor, brightness)
  };

  const sendColorToServer = async (color: string, brightness: number) => {
    try {
      await fetch('http://10.71.108.190:3000/led/color', {
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
      <Pressable onPress={() => setShowModal(true)} style={styles.Button}>
        <ThemedText>Open Color Picker</ThemedText>
      </Pressable>


      <Modal visible={showModal} animationType='slide'>
        <ThemedView style={styles.colorSelector}>
          <ColorPicker
            value={selectedColor}
            onComplete={onSelectColor}
            style={{ width: '70%' }} >

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
              onSlidingComplete={(value) => sendColorToServer(selectedColor, Math.round(value))}
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

