/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const prettierConfig = {
  singleQuote: true,
  overrides: [
    {
      files: '**/*.md',
      options: {
        proseWrap: 'always',
      },
    },
  ],
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindFunctions: ['twMerge', 'twJoin'],
};

export default prettierConfig;
