class MidiLoader {

  constructor(fileName: string) {
    Backend.getJSON<MidiJSON>(`resources/${fileName}.json`).then((midi) => {
      console.log(midi.name);
      NoteManager.NoteManager().clear();

      midi.song_data.forEach(note => {
        NoteManager.NoteManager().addNote(new Note(note.note, note.beat, note.length));
      });
    });
  }
}