import { For } from '@legendapp/state/react';
import { Info } from '@tamagui/lucide-icons';
import React from 'react';
import {
  Button,
  ScrollView,
  Separator,
  Tabs,
  ListItem,
  ListItemTitle,
  ListItemSubtitle,
  YStack,
  XStack,
  YGroup,
} from 'tamagui';

import { inventoryState$ } from '~/utils/inventory';

export default function RoomsTabsContent({ roomKey, room, setOpen }) {
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
                        <ListItemSubtitle>{itemKey.toString().slice(-4)}</ListItemSubtitle>
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
}
