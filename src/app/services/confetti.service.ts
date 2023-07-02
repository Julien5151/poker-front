import { Injectable } from '@angular/core';
import * as confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  private readonly CONFETTI_FACTORY = confetti.create(document.getElementById('myCanvas') as HTMLCanvasElement, {
    resize: true,
    useWorker: true,
  });
  private readonly CONFETTI_BASIC_OPTIONS: confetti.Options = {
    particleCount: 200,
    spread: 70,
  };

  public sendConfettisFromBottomCorners(): void {
    const intervals = [0, 500, 1000, 1500, 2000, 2500];
    intervals.forEach((interval) => {
      setTimeout(() => {
        this.sendConfettis({
          angle: 45,
          origin: { x: -0.1, y: 1.1 },
        });
        this.sendConfettis({
          angle: 135,
          origin: { x: 1.1, y: 1.1 },
        });
      }, interval);
    });
  }

  private sendConfettis(options: confetti.Options): void {
    this.CONFETTI_FACTORY({ ...this.CONFETTI_BASIC_OPTIONS, ...options });
  }
}
