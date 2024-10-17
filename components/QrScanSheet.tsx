import { Show } from '@legendapp/state/react';
import { CameraView } from 'expo-camera';
import React from 'react';
import { Button, Sheet, View, H2 } from 'tamagui';

export const QrScanSheet = ({ open, setOpen, handleScanned }) => {
  return (
    <Sheet
      animation="bouncy"
      open={open}
      dismissOnOverlayPress={false}
      onOpenChange={setOpen}
      snapPoints={[75]}
      snapPointsMode="percent"
      zIndex={100_000}
      modal
      dismissOnSnapToBottom
      disableDrag
      forceRemoveScrollEnabled={open}>
      <Sheet.Overlay
        animation="bouncy"
        enterStyle={{ opacity: 1, pointerEvents: 'auto' }}
        exitStyle={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$4">
        <H2>Scan tag QR code</H2>
        <View width="100%" height={280} borderRadius={10} overflow="hidden">
          <Show if={open}>
            <CameraView
              onBarcodeScanned={(data) => {
                handleScanned(data);
              }}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              style={{ flex: 1 }}
            />
          </Show>
        </View>
        <Button width="100%" onPress={() => setOpen(false)}>
          Close
        </Button>
      </Sheet.Frame>
    </Sheet>
  );
};
