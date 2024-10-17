import { batch, observable } from '@legendapp/state';
import {
  Switch,
  For,
  useObservable,
  useObservableReducer,
  useSelector,
  Show,
  observer,
} from '@legendapp/state/react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import NfcManager, { NfcEvents, TagEvent } from 'react-native-nfc-manager';
import {
  Sheet,
  SizableText,
  Button,
  ToggleGroup,
  H2,
  ScrollView,
  XStack,
  Progress,
  YStack,
  Form,
  Accordion,
  H4,
} from 'tamagui';

import { Container } from '~/components/Container';
import { PartsScreen } from '~/components/PartsScreen';

const reorderId = (id: string) => {
  //Split every 2 characters
  const split = id.match(/.{1,2}/g);
  //Reverse the array
  const reversed = split ? split.reverse() : [];

  //Join the array
  const joined = reversed.join('');

  // Get the last 12 characters
  const last12 = joined.slice(-12);
  return last12;
};


export default observer(function Home() {
  const [open, setOpen] = useState(false);
  const [sheetPosition, setSheetPosition] = useState(0);

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
  const availableRooms$ = useObservable([
    'Room 1',
    'Room 2',
    'Room 3',
    'Room 4',
    'Room 5',
    'Room 6',
  ]);

  const modalState$ = useObservable({
    open: false,
    setOpen: (value: boolean) => {
      modalState$.open.set(value);
    },
  });

  const scanningState$ = useObservable({
    itemScanning: true,
    partsScanning: false,
    resetScanning: () => {
      scanningState$.itemScanning.set(true);
      scanningState$.partsScanning.set(false);
    },
  });

  const roomsState$ = useObservable({
    rooms: new Map(),
    selectedRoom: '',
    roomsEntries: () => roomsState$.rooms.get().keys(),
    addRoom: (room: string) => {
      if (!roomsState$.rooms.has(room)) {
        roomsState$.rooms.set(room, new Map());
      }
    },
    addTagToRoom: (room: string, tag: any) => {
      if (roomsState$.rooms.has(room)) {
        roomsState$.rooms.get().get(room).set(tag.id, tag);
      }
    },
    resetSelectedRoom: () => {
      roomsState$.selectedRoom.set('');
    },
  });

  useEffect(() => {}, []);

  return (
    <>
      <Stack.Screen options={{ title: 'QR' }} />
      <Container>
        <YStack justifyContent="center" alignItems="center">
          <Accordion overflow="hidden" type="multiple">
            <For each={roomsState$.rooms} optimized>
              {(room, entry) => {
                console.log('Room', room.get());
                console.log('Entry', entry);
                return (
                  <Accordion.Item key={entry} value={entry ?? ''}>
                    <Accordion.Trigger flexDirection="row" justifyContent="space-evenly">
                      <SizableText>{entry}</SizableText>
                    </Accordion.Trigger>
                    <Accordion.Header>
                      <SizableText>{entry}</SizableText>
                    </Accordion.Header>
                    <Accordion.Content>
                      {/* <For each={room}>
                        {(tag, entry) => {
                          console.log('Tag', tag.get());
                          // return <InventoryItem tag$={tag.get()} />;
                          return <SizableText>{entry}</SizableText>;
                        }}
                      </For> */}
                    </Accordion.Content>
                  </Accordion.Item>
                );
              }}
            </For>
          </Accordion>
          <Button
            onPress={() => {
              setOpen(true);
            }}>
            <SizableText>Open</SizableText>
          </Button>
        </YStack>
        <Sheet
          animation="bouncy"
          open={open}
          disableDrag
          dismissOnOverlayPress={false}
          onOpenChange={setOpen}
          position={sheetPosition}
          onPositionChange={setSheetPosition}
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
                value={useSelector(() => progressState.progress.get())}
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
                        <Show
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
                        </Show>
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
                              roomsState$.selectedRoom.set(value);
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
                      <SizableText>Room: {roomsState$.selectedRoom.get()}</SizableText>
                      <Form
                        onSubmit={() => {
                          setOpen(false);
                          const tag = {
                            id: inventoryState$.scannedTagId.peek(),
                            description: inventoryState$.selectedDescription.peek(),
                            damages: inventoryState$.selectedDamages.peek(),
                            parts: inventoryState$.selectedParts.peek(),
                          };
                          roomsState$.addRoom(roomsState$.selectedRoom.get());
                          roomsState$.addTagToRoom(roomsState$.selectedRoom.get(), tag);
                          inventoryState$.addTag(tag);
                          setIndexState({ type: 'reset' });
                          setProgressState({ type: 'reset' });
                          inventoryState$.clearInventorySelections();
                          scanningState$.resetScanning();
                          roomsState$.resetSelectedRoom();
                          console.log('Form submitted', tag);
                          console.log('Rooms', roomsState$.rooms.peek());
                          console.log('Inventory', inventoryState$.inventory.peek());
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
                    setIndexState({ type: 'reset' });
                    setProgressState({ type: 'reset' });
                    scanningState$.resetScanning();
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
    </>
  );
});
