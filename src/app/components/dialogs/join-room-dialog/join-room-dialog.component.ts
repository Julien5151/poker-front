import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { StringHelper } from 'src/app/helpers/string.helper';
import { ROOM_NAME_REGEX } from 'src/app/shared/regex/room-name.regex';

@Component({
  selector: 'join-room-dialog',
  templateUrl: './join-room-dialog.component.html',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatInputModule, ReactiveFormsModule],
})
export class JoinRoomDialogComponent {
  public readonly roomNameControl = new FormControl<string | null>(null, [Validators.required, Validators.pattern(ROOM_NAME_REGEX)]);
  public readonly roomSelectionFormGroup = new FormGroup({ roomName: this.roomNameControl });
  public readonly RANDOM_ROOM_NAME = StringHelper.generateRandomPhilippeRoomName();

  constructor(public dialogRef: MatDialogRef<JoinRoomDialogComponent>) {}

  closeDialog() {
    if (this.roomSelectionFormGroup.valid) this.dialogRef.close(this.roomNameControl.value);
  }
}
