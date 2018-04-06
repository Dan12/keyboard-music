/// <reference path="./sample.ts"/>

class Sound {
  private pitches: Sample[];
  public readonly loop: boolean;

  private curPos: number;

  constructor(pitch: Sample) {
    this.pitches = [pitch];
    this.loop = pitch.loop;
  }

  public start(when: number): Promise<Sound> {
    return this.promiseThis(this.pitches[0].start(when));
  }

  public stop(when: number): Promise<Sound> {
    return this.promiseThis(this.pitches[0].stop(when));
  }

  public playing(): boolean {
    return this.pitches[0].isPlaying();
  }

  private promiseThis(p: Promise<Sample>): Promise<Sound> {
    return new Promise((resolve, reject) => {
      p.then(() => {
        resolve(this);
      });
    });
  }
}