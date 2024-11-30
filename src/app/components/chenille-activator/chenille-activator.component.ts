import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { UserAction } from 'src/app/shared/enums/user-action.enum';

@Component({
  selector: 'chenille-activator',
  templateUrl: './chenille-activator.component.html',
  imports: [CommonModule],
})
export class ChenilleActivatorComponent {
  @Input({ required: true }) chenilleIgnited = false;
  @Input({ required: true }) disabled = false;
  private readonly webSocketService = inject(WebSocketService);

  public sendChenille(): void {
    this.webSocketService.sendUserActionUpdateMessage(this.chenilleIgnited ? null : UserAction.ChenilleIgnition);
  }
}
