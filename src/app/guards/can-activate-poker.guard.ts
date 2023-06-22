import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs';
import { JoinRoomDialogComponent } from '../components/join-room-dialog/join-room-dialog.component';
import { ROOM_NAME_REGEX } from '../shared/regex/room-name.regex';

export const canActivatePoker: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const roomName: string | undefined = route.children[0]?.params['roomName'];
  if (roomName && !!roomName.match(ROOM_NAME_REGEX)) return true;
  const dialog = inject(MatDialog);
  const router = inject(Router);
  return dialog
    .open(JoinRoomDialogComponent)
    .afterClosed()
    .pipe(
      map((room: string | null) => {
        return room ? router.parseUrl(`/poker/${room}`) : router.parseUrl(`/poker/philippe-room-${Math.floor(Math.random() * 100000)}`);
      }),
    );
};
