import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: process.env.AURUM_VISUAL_CANDIDATES === '06104b'
    ? '{testDir}/candidates-06104b/{testFilePath}/{arg}{ext}'
    : process.env.AURUM_VISUAL_CANDIDATES === '06104'
    ? '{testDir}/candidates-06104/{testFilePath}/{arg}{ext}'
    : process.env.AURUM_VISUAL_CANDIDATES === '0663'
    ? '{testDir}/candidates-0663/{testFilePath}/{arg}{ext}'
    : process.env.AURUM_VISUAL_CANDIDATES === '1'
    ? '{testDir}/candidates/{testFilePath}/{arg}{ext}'
    : '{testDir}/baselines/{testFilePath}/{arg}{ext}',
  updateSnapshots: 'none',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    browserName: 'chromium',
    launchOptions: process.env.AURUM_CHROME_PATH ? { executablePath: process.env.AURUM_CHROME_PATH } : {},
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  },
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.001 } },
});
