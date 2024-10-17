import React from 'react';
import { View, Text } from 'react-native';
import { SizableText } from 'tamagui';
import { Container, Main, Title } from 'tamagui.config';

export const ItemsScreen = () => {
  return (
    <Main>
      <Title alignSelf='center'>Items</Title>
      <Container alignItems='center'>
        <SizableText>thing</SizableText>
        <SizableText>thing</SizableText>
        <SizableText>thing</SizableText>
      </Container>
    </Main>
  );
};
