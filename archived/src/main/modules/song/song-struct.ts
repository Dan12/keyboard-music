/**
 * define the song json structure
 */
interface SongStruct {
  name: string;
  bpms: number[][];
  files: string[];
  keyboard_type: string;
  /**                  location, pitches settings, hold to play, quaternize, loop */
  container_settings: [number, (string|number)[][], boolean, number, boolean][][];
  /** pitches settings: [file location, start time?, end time?] */
  linked_areas: number[][][];
  colors: any;
}
