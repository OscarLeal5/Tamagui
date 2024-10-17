module.exports = function (api) {
  api.cache(true);
  const plugins = [];

  plugins.push([
    '@tamagui/babel-plugin',
    {
      components: ['tamagui'],
      config: './tamagui.config.ts',
    },
    '@legendapp/state/babel'
  ]);

  return {
    presets: ['babel-preset-expo'],

    plugins,
  };
};
