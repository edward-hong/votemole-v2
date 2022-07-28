/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testPathIgnorePatterns: ['./(node_modules|v1)/'],
  coveragePathIgnorePatterns: ['./(node_modules|tests/utils)/'],
  preset: 'ts-jest',
  testEnvironment: 'node',
}
