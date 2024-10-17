import { observable } from '@legendapp/state';

export const inventoryState$ = observable({
  rooms: new Map([
    [
      'Living Room',
      new Map([
        [
          1235,
          {
            id: 1235,
            description: 'Table',
            damages: new Map([
              ['Top', ['Scratches', 'Chips']],
              ['Bottom', ['Cracks']],
              ['Leg', ['Broken']],
            ]),
            parts: new Map([
              [1011, { id: 1011, description: 'Leg' }],
              [1314, { id: 1314, description: 'Leg' }],
              [4563, { id: 4563, description: 'Leg' }],
            ]),
          },
        ],
        [
          1234,
          {
            id: 1234,
            description: 'Chair',
            damages: new Map([['Top', ['Scratches', 'Chips']]]),
            parts: new Map([[456, { id: 456, description: 'Leg' }]]),
          },
        ],
        [
          1233,
          {
            id: 1233,
            description: 'Thing',
            damages: new Map([['Top', ['Scratches', 'Chips']]]),
            parts: new Map([[456, { id: 456, description: 'Leg' }]]),
          },
        ],
      ]),
    ],
  ]),
  addRoom: (room: string) => {
    if (!inventoryState$.rooms.has(room)) {
      inventoryState$.rooms.set(room, new Map());
    }
  },
  addTagToRoom: (room: string, tag: any) => {
    console.log('Adding tag to room', room, tag);
    if (inventoryState$.rooms.has(room)) {
      const roomMap = inventoryState$.rooms.get(room);
      if (roomMap) {
        roomMap.set(tag.id, tag);
      }
    }
  },
  //* Selected stands for the room and item that is currently being edited
  progress: 0,
  selectedItem: '' as any,
  selectedRoom: '' as any,
  selectedDescription: '' as any,
  selectedParts: new Map(),
  selectedDamages: new Map(),
  resetSelected: () => {
    inventoryState$.progress.set(0);
    inventoryState$.selectedItem.set();
    inventoryState$.selectedRoom.set('');
    inventoryState$.selectedDescription.set('');
    inventoryState$.selectedParts.clear();
    inventoryState$.selectedDamages.clear();
    inventoryState$.history.clear();
  },
  //* Focused stands for the room and item that is currently being viewed
  focusedItem: '' as any,
  focusedRoom: () => {
    // Return the first room in the map or an empty string
    return inventoryState$.rooms.keys().next().value || '';
  },
  //* Inventory is a map of all items in all rooms
  inventory: () => {
    const inventory = new Map();
    inventoryState$.rooms.forEach((room, roomKey) => {
      room.forEach((tag, tagKey) => {
        // Add the room key to the tag
        tag.room = roomKey;
        inventory.set(tagKey, tag);
      });
    });
    return inventory;
  },
  history: new Set(),
});

export const availableRooms$ = observable([
  'Living Room',
  'Kitchen',
  'Bedroom',
  'Bathroom',
  'Room',
]);

export const scanningState$ = observable({
  itemScanning: true,
  partsScanning: false,
  resetScanning: () => {
    scanningState$.itemScanning.set(true);
    scanningState$.partsScanning.set(false);
  },
});

export const reorderNfcId = (id: string) => {
  //Split every 2 characters
  const split = id.match(/.{1,2}/g);
  //Reverse the array
  const reversed = split ? split.reverse() : [];

  //Join the array
  const joined = reversed.join('');

  // Get the last 12 characters
  const last12 = getLast12Chars(joined);
  return last12;
};

export const getLast12Chars = (id: string) => {
  return id.slice(-12);
};
