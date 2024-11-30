import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'update-available-dialog',
  templateUrl: './update-available-dialog.component.html',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class UpdateAvailableDialogComponent {
  reloadApplication() {
    document.location.reload();
  }
}
