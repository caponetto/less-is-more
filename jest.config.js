module.exports = {
  moduleFileExtensions: ['js', 'ts'],
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['html', 'text'],
  collectCoverageFrom: ['src/**/*.{js,ts}']
}
