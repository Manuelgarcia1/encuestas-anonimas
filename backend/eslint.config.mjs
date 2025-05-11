// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  // configuración de lenguaje y parserOptions ya venía así
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // aquí añadimos la parte de reglas
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // ← override para que ignore tus decoradores
      '@typescript-eslint/no-unsafe-call': [
        'error',
        {
          allow: [
            '^IsString$',
            '^IsNotEmpty$',
            '^IsArray$',
            '^ArrayNotEmpty$',
            '^ArrayMinSize$',
            '^ValidateNested$',
            '^Type$',
          ],
        },
      ],
    },
  },
);
