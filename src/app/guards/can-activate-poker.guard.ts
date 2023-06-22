import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs';
import { JoinRoomDialogComponent } from '../components/join-room-dialog/join-room-dialog.component';
import { LocalStorageService } from '../services/local-storage.service';
import { ROOM_NAME_REGEX } from '../shared/regex/room-name.regex';

export const canActivatePoker: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  // First check if room name is available in URL
  const roomName: string | undefined = route.children[0]?.params['roomName'];
  if (roomName && !!roomName.match(ROOM_NAME_REGEX)) return true;
  const router = inject(Router);
  // If no, check if one was saved in local storage and redirect to this URL if it's valid
  const localStorageRoomName = inject(LocalStorageService).getRoomNameFromLocalStorage();
  if (localStorageRoomName && !!localStorageRoomName.match(ROOM_NAME_REGEX)) return router.parseUrl(`/poker/${localStorageRoomName}`);
  // Else, open dialog to join a room of be redirected to a random one
  const dialog = inject(MatDialog);
  return dialog
    .open(JoinRoomDialogComponent)
    .afterClosed()
    .pipe(
      map((room: string | null) => {
        return room ? router.parseUrl(`/poker/${room}`) : router.parseUrl(`/poker/philippe-room-${Math.floor(Math.random() * 100000)}`);
      }),
    );
};
