import { Image, StyleSheet, Platform, Text, View, Button, Modal } from 'react-native';
import { useState } from 'react';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import ColorPicker, { Panel5, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const onSelectColor = ({ hex }: { hex: string }) => {
    console.log(hex);
  }
  return (
    <View style={styles.container}>
      <Button title='Color Picker' onPress={() => setShowModal(true)} />

      <Modal visible={showModal} animationType='slide'>
        <ColorPicker style={{ width: '70%' }} value='red' onComplete={onSelectColor}>

          <Preview />
          <Panel5 />
          <HueSlider />
          <OpacitySlider />
        </ColorPicker>

        <Button title='Close' onPress={() => setShowModal(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

