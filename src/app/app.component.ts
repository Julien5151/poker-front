import { Component, OnInit, inject } from '@angular/core';
import { SwUpdateService } from './services/sw-update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly swUpdateService = inject(SwUpdateService);
  public ngOnInit(): void {
    this.swUpdateService.initCheckingForUpdate();
  }
}
