import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpotService {
  private spotInterval: number | null = null;
  private spots: Array<HTMLElement> = [];

  public initSpots(spots: Array<HTMLElement>): void {
    this.spots = spots;
  }

  public startTheShow(): void {
    setTimeout(() => {
      const randomSpot = this.spots[this.randomSpotIndex()];
      if (randomSpot.classList.contains('hidden')) {
        randomSpot.classList.remove('hidden');
      } else {
        randomSpot.classList.add('hidden');
      }
      this.spotInterval = globalThis.setInterval(() => {
        const randomSpot = this.spots[this.randomSpotIndex()];
        if (randomSpot.classList.contains('hidden')) {
          randomSpot.classList.remove('hidden');
        } else {
          randomSpot.classList.add('hidden');
        }
      }, 500) as unknown as number;
    }, 350);
  }

  public finishTheShow(): void {
    this.spots.forEach((spot) => {
      spot.classList.add('hidden');
    });
    if (this.spotInterval) globalThis.clearInterval(this.spotInterval);
  }

  private randomSpotIndex(): number {
    return Math.floor(Math.random() * this.spots.length);
  }
}
