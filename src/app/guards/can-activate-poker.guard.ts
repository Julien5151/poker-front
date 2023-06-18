import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

export const canActivatePoker: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  if (route.children[0]?.params['roomName']) return true;
  const router = inject(Router);
  const tree: UrlTree = router.parseUrl(`/poker/philippe-room-${Math.floor(Math.random() * 100000)}`);
  return tree;
};
