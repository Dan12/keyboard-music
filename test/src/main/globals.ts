class Globals {
  public static audioCtx = new AudioContext();

  public static midiConfig: MidiConfiguration;
  public static playerConfig: PlayConfiguration;

  public static BPM: number;

  public static DefaultKeyStrings =
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=",
     "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]",
     "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "\\n",
     "Z", "X", "C", "V", "B", "N", "M", ", ", ".", "/", "\\s", "NA"];

  public static fromArray(arr: ArrayBuffer): Promise<AudioBuffer> {
    // decodeAudio returns promiseLike or something like that
    return Globals.audioCtx.decodeAudioData(arr) as Promise<AudioBuffer>;
  }

  private static recInitArr(size: number[], i: number, d: any): any {
    let result: any = new Array(size[i]);
    if (i < size.length - 1) {
      i += 1;
      for (let j = 0; j < size[i]; j++) {
        result[j] = this.recInitArr(size, i, d);
      }
    } else {
      for (let j = 0; j < result.length; j++) {
        result[j] = d;
      }
    }
    return result;
  }

  public static defaultArr(size: number[], d: any): any {
    return this.recInitArr(size, 0, d);
  }
}