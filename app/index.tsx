import { Stack, Link } from 'expo-router';
import React, { useEffect } from 'react';
import { YStack, H2 } from 'tamagui';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { device$ } from '~/utils/device';
import { observer } from '@legendapp/state/react';

export default observer(function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <Container>
        {device$.nfcSupported.get() ? (
          <Link href={{ pathname: '/nfc', params: { name: 'Dan' } }} asChild>
            <Button title="Inventory" />
          </Link>
        ) : (
          <Link href={{ pathname: '/qr', params: { name: 'Dan' } }} asChild>
            <Button title="QR" />
          </Link>
        )}
      </Container>
    </>
  );
});
