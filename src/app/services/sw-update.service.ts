import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { UpdateAvailableDialogComponent } from '../components/dialogs/update-available-dialog/update-available-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class SwUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly matDialog = inject(MatDialog);

  public initCheckingForUpdate(): void {
    this.swUpdate.versionUpdates.pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY')).subscribe(() => {
      this.matDialog.open(UpdateAvailableDialogComponent);
    });
  }
}
