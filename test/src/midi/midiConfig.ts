class MidiConfiguration {
  private sounds: Sound[][][];

  constructor(sounds: Sound[][][]) {
    this.sounds = sounds;
  }

  public start(p: number, r: number, c: number, w: number): Promise<Sound> {
    if (this.sounds[p][r][c] !== undefined) {
      return this.sounds[p][r][c].start(w);
    }
  }

  public stop(p: number, r: number, c: number, w: number): Promise<Sound> {
    if (this.sounds[p][r][c] !== undefined) {
      return this.sounds[p][r][c].stop(w);
    }
  }

  public playing(p: number, r: number, c: number): boolean {
    if (this.sounds[p][r][c] !== undefined) {
      return this.sounds[p][r][c].playing();
    }
    return false;
  }
}