import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { UserAction } from 'src/app/shared/enums/user-action.enum';

@Component({
  selector: 'nuclear-activator',
  templateUrl: './nuclear-activator.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class NuclearActivatorComponent {
  @Input({ required: true }) disabled = false;
  private readonly webSocketService = inject(WebSocketService);

  public sendNuclearIgnition(): void {
    this.webSocketService.sendUserActionUpdateMessage(UserAction.NuclearIgnition);
  }
}
