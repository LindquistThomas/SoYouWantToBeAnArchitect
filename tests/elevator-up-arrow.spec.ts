import { test, expect } from '@playwright/test';
import { waitForGame, waitForScene, seedFullProgressSave } from './helpers/playwright';

test('pressing Up after walking onto cab rides up', async ({ page }) => {
  await seedFullProgressSave(page);
  await page.goto('/');
  await waitForGame(page);
  await page.keyboard.press('Enter');
  await waitForScene(page, 'ElevatorScene');
  await page.waitForTimeout(400);

  // Walk right until we mount the cab
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(50);
    const onElev = await page.evaluate(() => {
      const g: any = (window as any).__game;
      const s = g.scene.getScene('ElevatorScene') as any;
      return !!s?.elevatorCtrl?.isOnElevator;
    });
    if (onElev) break;
  }
  await page.keyboard.up('ArrowRight');

  const y0 = await page.evaluate(() => {
    const g: any = (window as any).__game;
    return (g.scene.getScene('ElevatorScene') as any).elevatorCtrl.elevator.getY();
  });

  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(1500);
  await page.keyboard.up('ArrowUp');

  const y1 = await page.evaluate(() => {
    const g: any = (window as any).__game;
    return (g.scene.getScene('ElevatorScene') as any).elevatorCtrl.elevator.getY();
  });

  expect(y1).toBeLessThan(y0 - 50);
});
