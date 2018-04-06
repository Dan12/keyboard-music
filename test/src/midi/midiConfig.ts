class MidiConfiguration {
  private sounds: Sound[][][];

  constructor(sounds: Sound[][][]) {
    this.sounds = sounds;
  }

  public start(p: number, r: number, c: number, w: number): Promise<Sound> {
    if (this.verifyPRC(p, r, c)) {
      return this.sounds[p][r][c].start(w);
    }
  }

  public stop(p: number, r: number, c: number, w: number): Promise<Sound> {
    if (this.verifyPRC(p, r, c)) {
      return this.sounds[p][r][c].stop(w);
    }
  }

  public playing(p: number, r: number, c: number): boolean {
    if (this.verifyPRC(p, r, c)) {
      return this.sounds[p][r][c].playing();
    }
    return false;
  }

  private verifyPRC(p: number, r: number, c: number): boolean {
    return p >= 0 && r >= 0 && c >= 0 &&
      p < this.sounds.length && r < this.sounds[p].length && c < this.sounds[p][r].length &&
      this.sounds[p][r][c] !== undefined;
  }
}