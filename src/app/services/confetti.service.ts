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

  private confettiInterval: number | null = null;

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

  public sendConfettisFromTop(): void {
    setTimeout(() => {
      const distances = [0, 0.2, 0.4, 0.6, 0.8, 1];
      distances.forEach((distance) => {
        this.sendConfettis({
          angle: -90,
          origin: { x: distance, y: -0.6 },
        });
      });
      this.confettiInterval = globalThis.setInterval(() => {
        const distances = [0, 0.2, 0.4, 0.6, 0.8, 1];
        distances.forEach((distance) => {
          this.sendConfettis({
            angle: -90,
            origin: { x: distance, y: -0.6 },
          });
        });
      }, 1000) as unknown as number;
    }, 350);
  }

  public clearConfettiInterval(): void {
    if (this.confettiInterval) globalThis.clearInterval(this.confettiInterval);
  }

  private sendConfettis(options: confetti.Options): void {
    this.CONFETTI_FACTORY({ ...this.CONFETTI_BASIC_OPTIONS, ...options });
  }
}
