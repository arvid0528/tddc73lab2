import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

const MainScreen = require('./MainScreen').default;

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <MainScreen />
      </SafeAreaProvider>
    </PaperProvider>
  );
}