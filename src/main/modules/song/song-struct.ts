/**
 * define the song json structure
 */
interface SongStruct {
  name: string;
  bpms: number[][];
  files: string[];
  keyboard_type: string;
  container_settings: [number, (string|number)[][], boolean][][];
  linked_areas: number[][][];
  colors: any;
}
