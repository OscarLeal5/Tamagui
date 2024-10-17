import { observer, useMount } from '@legendapp/state/react';
import { useCameraPermissions } from 'expo-camera';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, Touchable, TouchableOpacity, View } from 'react-native';
import NfcManager from 'react-native-nfc-manager';
import { H2, TamaguiProvider, YStack } from 'tamagui';
import { Button } from '~/components/Button';
import { startActivityAsync, ActivityAction } from 'expo-intent-launcher';

import config from '~/tamagui.config';
import { device$ } from '~/utils/device';

export default observer(function Layout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  const [permission, requestPermission] = useCameraPermissions();
  const [hasNfc, setHasNfc] = useState(null);
  const [nfcEnabled, setNfcEnabled] = useState(null);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }

    async function initNfc() {
      const supported = await NfcManager.isSupported();
      if (supported) {
        console.log('NFC is supported');
        await NfcManager.start();
        device$.nfcSupported.set(true);
      } else {
        console.log('NFC is not supported');
        device$.nfcSupported.set(false);
        device$.nfcEnabled.set(false);
      }

      // For android only
      // const enabled = await NfcManager.isEnabled();
      // if (enabled) {
      //   device$.nfcEnabled.set(true);
      // } else {
      //   device$.nfcEnabled.set(false);
      // }
    }
    initNfc();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config}>
      <Stack />
    </TamaguiProvider>
  );
});
