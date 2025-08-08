import type { Config } from 'jest';
import { createJsWithTsPreset, pathsToModuleNameMapper } from 'ts-jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/e2e/**/*.spec.ts'],
  setupFiles: ['<rootDir>/.jest/jest-setup.ts'],
  ...createJsWithTsPreset({
    tsconfig: 'tsconfig.json',
  }),
};

export default config;
