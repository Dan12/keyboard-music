/// <reference path="../libraries/jszip.d.ts" />

class Backend {
  public static getAsAudioBuffer(filename: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest();
      req.open("GET", filename, true);
      req.responseType = "arraybuffer";

      req.onload = (event) => {
        resolve(req.response);
      };

      req.onerror = (event) => {
        reject(event);
      };

      req.send();
    });
  }

  public static getJSON(filename: string): Promise<SongJSON> {
    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest();
        req.open("GET", filename, true);
        req.responseType = "json";

        req.onload = (event) => {
          resolve(req.response);
        };

        req.onerror = (event) => {
          reject(event);
        };

        req.send();
    });
  }
}

interface SoundJSON {
  groups: number[];
  hold_to_play: boolean;
  loop: boolean;
  pitches: string[];
  quantization: number;
}

interface SongJSON {
  bpm: number;
  name: string;
  soundpacks: SoundJSON[][][];
}