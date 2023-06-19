import { Component, Input, OnInit } from '@angular/core';
import { UserEffect } from 'src/app/shared/enums/user-effect.enum';

@Component({
  selector: 'speech-bubble',
  templateUrl: './speech-bubble.component.html',
  standalone: true,
})
export class SpeechBubbleComponent implements OnInit {
  @Input({ required: true }) effect: UserEffect = UserEffect.Philippe;

  private readonly BASE_ASSETS_URL = '../../../assets';

  public svgUrl = '';
  public soundUrl = '';
  public volume = 1;

  public ngOnInit(): void {
    this.svgUrl = `${this.BASE_ASSETS_URL}/images/${this.effect === UserEffect.Philippe ? 'speech-bubble-philippe.svg' : 'speech-bubble-issou.svg'}`;
    this.soundUrl = `${this.BASE_ASSETS_URL}/sounds/${this.effect === UserEffect.Philippe ? 'philippe.mp3' : 'issou.mp3'}`;
    this.volume = this.effect === UserEffect.Philippe ? 0.3 : 0.7;
  }
}
