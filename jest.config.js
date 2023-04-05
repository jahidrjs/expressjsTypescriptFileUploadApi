module.exports = {
  // ...
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['js', 'mjs', 'jsx', 'json', 'node'],
  globals: {
    NODE_ENV: 'test',
  },
  testEnvironment: 'node',
  preset: 'ts-jest',
};
