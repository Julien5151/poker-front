import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PokerComponent } from './components/poker/poker.component';
import { canActivatePoker } from './guards/can-activate-poker.guard';

const routes: Routes = [
  { path: 'poker', canActivate: [canActivatePoker], children: [{ path: ':roomName', component: PokerComponent }] },
  { path: '', redirectTo: 'poker', pathMatch: 'full' },
  { path: '**', redirectTo: 'poker' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
