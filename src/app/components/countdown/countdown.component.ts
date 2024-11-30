import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { interval, take } from 'rxjs';

@Component({
  selector: 'countdown',
  imports: [CommonModule],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit {
  @Input({ required: true }) launchAuthorized = false;

  public countDown = 10;

  public ngOnInit(): void {
    interval(1000)
      .pipe(take(10))
      .subscribe(() => {
        this.countDown -= 1;
      });
  }
}
