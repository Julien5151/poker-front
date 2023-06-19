import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ROOM_NAME_REGEX } from '../shared/regex/room-name.regex';

export const canActivatePoker: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const roomName: string | undefined = route.children[0]?.params['roomName'];
  if (roomName && !!roomName.match(ROOM_NAME_REGEX)) return true;
  const router = inject(Router);
  const tree: UrlTree = router.parseUrl(`/poker/philippe-room-${Math.floor(Math.random() * 100000)}`);
  return tree;
};
