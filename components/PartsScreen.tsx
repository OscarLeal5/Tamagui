import { observer, For } from '@legendapp/state/react';
import React from 'react';
import { H2, SizableText } from 'tamagui';

import { inventoryState$ } from '~/utils/inventory';

function PartsScreen() {
  return (
    <>
      <H2>Parts</H2>
      <For each={inventoryState$.selectedParts} optimized>
        {(part, entry) => {
          const partId = part.id.get();
          return <SizableText>{partId}</SizableText>;
        }}
      </For>
    </>
  );
}

export default observer(PartsScreen);
