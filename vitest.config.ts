/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    clearMocks: true,
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
          exclude: ['src/**/*.dom.test.ts', 'tests/**/*.dom.test.ts'],
          setupFiles: ['./tests/setup/node.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'happy-dom',
          include: ['src/**/*.dom.test.ts', 'tests/**/*.dom.test.ts'],
          setupFiles: ['./tests/setup/dom.setup.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/config/**/*.ts',
        'src/lib/**/*.ts',
        'src/services/**/*.ts',
        'src/composables/**/*.ts',
      ],
      exclude: ['src/**/*.test.ts', 'src/**/*.dom.test.ts', 'src/**/*.d.ts'],
    },
  },
});
