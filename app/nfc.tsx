import {
  For,
  observer,
  Show,
  Switch,
  useObservableReducer,
  useSelector,
} from '@legendapp/state/react';
import { Info, QrCode } from '@tamagui/lucide-icons';
import { useCameraPermissions } from 'expo-camera';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import NfcManager, { NfcEvents, TagEvent } from 'react-native-nfc-manager';
import {
  Button,
  H2,
  ListItem,
  ListItemSubtitle,
  ListItemTitle,
  ScrollView,
  Separator,
  Sheet,
  SizableText,
  Tabs,
  XStack,
  YGroup,
  YStack,
  Progress,
  Form,
  ToggleGroup,
} from 'tamagui';

import { DetailsSheet } from '~/components/DetailsSheet';
import PartsScreen from '~/components/PartsScreen';
import { QrScanSheet } from '~/components/QrScanSheet';
import { Main, Container } from '~/tamagui.config';
import { availableRooms$, inventoryState$, reorderNfcId, scanningState$ } from '~/utils/inventory';

export default observer(function Home() {
  //* UI State
  const [open, setOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();

  const indexReducer = (state: { index: number }, action: { type: any }) => {
    switch (action.type) {
      case 'increment':
        // Prevent index from going over 3
        if (state.index === 4) {
          return state;
        }
        if (state.index === 1) {
          scanningState$.partsScanning.set(true);
        }
        return { index: state.index + 1 };
      case 'decrement':
        // Prevent index from going under 0
        if (state.index === 0) {
          return state;
        }
        if (state.index === 2) {
          scanningState$.partsScanning.set(false);
        } else if (state.index === 3) {
          scanningState$.itemScanning.set(true);
        }
        return { index: state.index - 1 };
      case 'reset':
        setOpen(false);
        return { index: 0 };
      default:
        return state;
    }
  };

  const progressReducer = (state: { progress: number }, action: { type: any }) => {
    switch (action.type) {
      case 'increment':
        return { progress: state.progress + 25 };
      case 'decrement':
        return { progress: state.progress - 25 };
      case 'reset':
        return { progress: 0 };
      default:
        return state;
    }
  };

  const [indexState, setIndexState] = useObservableReducer(indexReducer, { index: 0 });
  const [progressState, setProgressState] = useObservableReducer(progressReducer, { progress: 0 });

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setQrScannerOpen(false);
    const tag = {
      id: data,
      description: 'New Item',
      damages: new Map(),
      parts: new Map(),
    };
    inventoryState$.addTagToRoom(inventoryState$.focusedRoom.get(), tag);
    // Open add item sheet
  };

  useEffect(() => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
      // Reordering the tag id to match the format of the RFID EPC tags

      if (!tag) {
        return;
      }

      const tagId = reorderNfcId(tag.id);

      // Check if the tag is already scanned
      if (inventoryState$.history.has(tagId)) {
        console.log('Tag already scanned', tag);
        return;
      }

      // Check if the tag is an item or a part
      if (scanningState$.itemScanning.get()) {
        console.log('Item tag', tag);
        inventoryState$.selectedItem.set(tagId);
        inventoryState$.history.add(tagId);
        scanningState$.itemScanning.set(false);
        setOpen(true);
      } else if (scanningState$.partsScanning.get()) {
        console.log('Parts tag', tag);
        inventoryState$.selectedParts.set(tagId, { ...tag });
        inventoryState$.history.add(tagId);
      }
    });
    NfcManager.registerTagEvent();
    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.setEventListener(NfcEvents.SessionClosed, null);
    };
  }, []);

  inventoryState$.selectedParts.onChange(({ value }) => {
    console.log('Selected parts', value);
  });

  //* QR Scan permissions
  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Container>
        <H2>Camera permission required</H2>
        <Button onPress={requestPermission}>Request permission</Button>
      </Container>
    );
  }
  //*

  return (
    <>
      <Stack.Screen options={{ title: 'NFC' }} />
      <Main>
        <Container gap="$2">
          <Tabs
            defaultValue={inventoryState$.focusedRoom.get()}
            onValueChange={(value) => {
              console.log(value);
              inventoryState$.focusedRoom.set(value);
            }}
            orientation="horizontal"
            flexDirection="column"
            borderRadius="$4"
            borderWidth="$0.25"
            overflow="hidden"
            borderColor="$borderColor">
            <ScrollView horizontal>
              <Tabs.List disablePassBorderRadius="bottom" separator={<Separator vertical />}>
                <For each={inventoryState$.rooms} optimized>
                  {(room, key) => {
                    return (
                      <Tabs.Tab flex={1} value={key}>
                        <SizableText>{key}</SizableText>
                      </Tabs.Tab>
                    );
                  }}
                </For>
              </Tabs.List>
            </ScrollView>
            <Separator />
            <For each={inventoryState$.rooms} optimized>
              {(room, roomKey) => {
                return (
                  <Tabs.Content
                    backgroundColor="$background"
                    key={roomKey}
                    padding="$2"
                    alignItems="center"
                    justifyContent="center"
                    borderColor="$background"
                    borderRadius="$2"
                    borderTopLeftRadius={0}
                    borderTopRightRadius={0}
                    borderWidth="$2"
                    height={520}
                    value={String(roomKey)}>
                    <ScrollView>
                      <For each={room}>
                        {(item, itemKey) => {
                          return (
                            <>
                              <YGroup separator={<Separator />}>
                                <ListItem>
                                  <XStack gap="$8">
                                    <YStack>
                                      <ListItemTitle>Id</ListItemTitle>
                                      <ListItemSubtitle>
                                        {itemKey.toString().slice(-4)}
                                      </ListItemSubtitle>
                                    </YStack>
                                    <YStack>
                                      <ListItemTitle>Description</ListItemTitle>
                                      <ListItemSubtitle>{item.description.get()}</ListItemSubtitle>
                                    </YStack>
                                    <Button
                                      icon={<Info />}
                                      onPress={() => {
                                        setOpen(true);
                                        inventoryState$.focusedRoom.set(roomKey);
                                        inventoryState$.focusedItem.set(itemKey);
                                      }}
                                    />
                                  </XStack>
                                </ListItem>
                              </YGroup>
                            </>
                          );
                        }}
                      </For>
                    </ScrollView>
                  </Tabs.Content>
                );
              }}
            </For>
          </Tabs>
          <Button
            iconAfter={<QrCode />}
            onPress={() => {
              setQrScannerOpen(true);
            }}>
            <SizableText>Add item</SizableText>
          </Button>
          <DetailsSheet open={open} setOpen={setOpen} />
          <QrScanSheet
            open={qrScannerOpen}
            setOpen={setQrScannerOpen}
            handleScanned={handleBarcodeScanned}
          />
          <Sheet
            animation="bouncy"
            open={open}
            disableDrag
            dismissOnOverlayPress={false}
            onOpenChange={setOpen}
            snapPoints={[75]}
            snapPointsMode="percent"
            zIndex={100_000}
            modal
            dismissOnSnapToBottom
            forceRemoveScrollEnabled={open}>
            <Sheet.Overlay
              animation="bouncy"
              enterStyle={{ opacity: 1, pointerEvents: 'auto' }}
              exitStyle={{ opacity: 0, pointerEvents: 'none' }}
            />
            <Sheet.Handle />
            <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" space="$5">
              <YStack padding="$4" justifyContent="center" alignItems="center" space="$5">
                <Progress
                  size="$4"
                  value={progressState.progress.get()}
                  space="$5"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  max={100}>
                  <Progress.Indicator animation="quick" />
                </Progress>
                <Switch value={indexState.index}>
                  {{
                    0: () => {
                      return (
                        <>
                          <H2>Select room</H2>
                          {/* <Show
                            ifReady={roomsState$.rooms.size > 0}
                            else={() => {
                              return null;
                            }}>
                            <H2>Previously selected rooms</H2>
                            <For each={roomsState$.rooms} optimized>
                              {(room) => {
                                return <SizableText>{room.get()}</SizableText>;
                              }}
                            </For>
                          </Show> */}
                          <ScrollView borderWidth="$2" width={300}>
                            <ToggleGroup
                              type="single"
                              orientation="vertical"
                              disableDeactivation
                              alignItems="center"
                              justifyContent="center"
                              onValueChange={(value) => {
                                console.log('Value Change', value);
                                setIndexState({ type: 'increment' });
                                setProgressState({ type: 'increment' });
                                inventoryState$.selectedRoom.set(value);
                              }}>
                              <For each={availableRooms$} optimized>
                                {(room) => {
                                  return (
                                    <ToggleGroup.Item value={room.get()} width={300}>
                                      <SizableText>{room.get()}</SizableText>
                                    </ToggleGroup.Item>
                                  );
                                }}
                              </For>
                            </ToggleGroup>
                          </ScrollView>
                        </>
                      );
                    },
                    1: () => <H2>Select description</H2>,
                    2: () => <PartsScreen />,
                    3: () => {
                      scanningState$.partsScanning.set(false);
                      return <H2>Damage</H2>;
                    },
                    4: () => (
                      <YStack>
                        <H2>Summary</H2>
                        <SizableText>Room: {inventoryState$.selectedRoom.get()}</SizableText>
                        <Form
                          onSubmit={() => {
                            const tag = {
                              id: inventoryState$.selectedItem.peek(),
                              description: inventoryState$.selectedDescription.peek(),
                              damages: inventoryState$.selectedDamages.peek(),
                              parts: inventoryState$.selectedParts.peek(),
                            };
                            inventoryState$.addRoom(inventoryState$.selectedRoom.peek());
                            inventoryState$.addTagToRoom(inventoryState$.selectedRoom.peek(), tag);
                            inventoryState$.resetSelected();
                            scanningState$.resetScanning();
                            setIndexState({ type: 'reset' });
                            setProgressState({ type: 'reset' });
                          }}>
                          <Form.Trigger asChild>
                            <Button>
                              <SizableText>Submit</SizableText>
                            </Button>
                          </Form.Trigger>
                        </Form>
                      </YStack>
                    ),
                  }}
                </Switch>

                <XStack space="$5" justifyContent="center" alignItems="center" width="100%">
                  <Button
                    onPress={() => {
                      console.log('Close');
                      scanningState$.resetScanning();
                      setIndexState({ type: 'reset' });
                      setProgressState({ type: 'reset' });
                    }}>
                    <SizableText>Close</SizableText>
                  </Button>
                  <Button
                    onPress={() => {
                      console.log('Back');
                      setIndexState({ type: 'decrement' });
                      setProgressState({ type: 'decrement' });
                    }}>
                    <SizableText>Back</SizableText>
                  </Button>
                  <Button
                    onPress={() => {
                      console.log('Next');
                      setIndexState({ type: 'increment' });
                      setProgressState({ type: 'increment' });
                    }}>
                    <SizableText>Next</SizableText>
                  </Button>
                </XStack>
              </YStack>
            </Sheet.Frame>
          </Sheet>
        </Container>
      </Main>
    </>
  );
});
