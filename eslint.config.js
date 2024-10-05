import js from '@eslint/js'
import globals from 'globals'
import jest from 'eslint-plugin-jest'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
        Javy: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'warn'
    }
  },
  {
    files: ['test/**'],
    ...jest.configs['flat/recommended']
  }
]
