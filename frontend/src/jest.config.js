module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest', // Transpile TypeScript files with ts-jest
      '^.+\\.(js|jsx)$': 'babel-jest', // Transpile JS/JSX files with babel-jest
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Handle CSS imports in tests
    },
  };
  