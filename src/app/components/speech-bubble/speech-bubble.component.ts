import { Component, Input, OnInit } from '@angular/core';
import { USER_EFFECTS_SOUND_MAP } from 'src/app/maps/user-effect-sound.map';
import { UserEffect } from 'src/app/shared/enums/user-effect.enum';
import { UserEffectData } from 'src/app/shared/interfaces/user-effect-data.interface';
import { USER_EFFECTS_MAP } from 'src/app/shared/maps/effects.map';

@Component({
  selector: 'speech-bubble',
  templateUrl: './speech-bubble.component.html',
  standalone: true,
})
export class SpeechBubbleComponent implements OnInit {
  @Input({ required: true }) effect: UserEffect = UserEffect.Philippe;
  public userEffectData!: UserEffectData;
  public soundUrl!: string;

  private readonly BASE_ASSETS_URL = '../../../assets';

  public ngOnInit(): void {
    this.userEffectData = USER_EFFECTS_MAP[this.effect];
    this.soundUrl = `${this.BASE_ASSETS_URL}/sounds/${USER_EFFECTS_SOUND_MAP[this.effect]}`;
  }
}
