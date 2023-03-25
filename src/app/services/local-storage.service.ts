import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  public setUserNameToLocalStorage(userName: string): void {
    globalThis.localStorage.setItem('userName', userName);
  }

  public getUserNameFromLocalStorage(): string | null {
    return globalThis.localStorage.getItem('userName');
  }
}
