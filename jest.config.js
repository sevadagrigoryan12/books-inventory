module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: '\\.(spec|test)\\.ts?$',
  moduleFileExtensions: ['js', 'ts'],
  modulePaths: ['<rootDir>/src/'],
  setupFilesAfterEnv: ['<rootDir>/jest.config.js'],
  clearMocks: true,
  forceExit: true,
};
