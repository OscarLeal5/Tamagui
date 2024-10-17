import { For, observer, useMount } from '@legendapp/state/react';
import { Trash } from '@tamagui/lucide-icons';
import React from 'react';
import {
  Button,
  Sheet,
  ListItem,
  ListItemTitle,
  ListItemSubtitle,
  XStack,
  YStack,
  SizableText,
  Separator,
  ScrollView,
  YGroup,
  XGroup,
} from 'tamagui';

import { inventoryState$ } from '~/utils/inventory';

export const DetailsSheet = observer(function DetailsSheet({ open, setOpen }) {
  const parts =
    inventoryState$.rooms
      .get(inventoryState$.focusedRoom.get())
      .get(inventoryState$.focusedItem.get())?.parts || new Map();

  const damages =
    inventoryState$.rooms
      .get(inventoryState$.focusedRoom.get())
      .get(inventoryState$.focusedItem.get())?.damages || new Map();

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
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center">
        <ListItem height={200}>
          <YStack>
            <ListItemTitle size="$7">Parts</ListItemTitle>
            <ScrollView width={300} padding="$4">
              <YGroup separator={<Separator />}>
                <For each={parts}>
                  {(value, partKey) => {
                    return (
                      <XStack gap="$6">
                        <YStack>
                          <ListItemTitle>Id</ListItemTitle>
                          <ListItemSubtitle>{partKey}</ListItemSubtitle>
                        </YStack>
                        <YStack>
                          <ListItemTitle>Description</ListItemTitle>
                          <ListItemSubtitle>{value.get().description}</ListItemSubtitle>
                        </YStack>
                      </XStack>
                    );
                  }}
                </For>
              </YGroup>
            </ScrollView>
          </YStack>
        </ListItem>
        <ListItem height={200}>
          <YStack>
            <ListItemTitle size="$7">Damages</ListItemTitle>
            <XGroup padding="$4" flexWrap="wrap" gap="$4" separator={<Separator />}>
              <For each={damages}>
                {(value, damageKey) => {
                  return (
                    <XStack gap="$6">
                      <YStack>
                        <ListItemTitle>{damageKey}</ListItemTitle>
                        <ListItemSubtitle>{value.get().join(', ')}</ListItemSubtitle>
                      </YStack>
                    </XStack>
                  );
                }}
              </For>
            </XGroup>
          </YStack>
        </ListItem>
        <XStack space>
          <Button
            onPress={() => {
              inventoryState$.focusedItem.set(undefined);
              setOpen(false);
            }}>
            <SizableText>Close</SizableText>
          </Button>
          <Button
            iconAfter={<Trash />}
            onPress={() => {
              inventoryState$.rooms
                .get(inventoryState$.focusedRoom.get())
                .delete(inventoryState$.focusedItem.get());
              setOpen(false);
            }}>
            <SizableText>Delete item</SizableText>
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  );
});
