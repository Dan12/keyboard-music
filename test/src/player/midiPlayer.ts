class MidiPlayer extends AbstractIO<void, KeyboardMessage> {
  private static instance: MidiPlayer = new MidiPlayer();

  private playing = false;
  private intervalID: number;
  private curBeat = 0;
  private apparentStartTime = 0;

  private playingNotes: Note[];

  private keycodes = [
    49, 50, 51, 52, 53, 54, 55, 56,  57,  48,  189, 187,
    81, 87, 69, 82, 84, 89, 85, 73,  79,  80,  219, 221,
    65, 83, 68, 70, 71, 72, 74, 75,  76,  186, 222, 13,
    90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16,
    37, 38, 40, 39
  ];

  public static MidiPlayer() {
    return MidiPlayer.instance;
  }

  private constructor() {
    super();

    this.playingNotes = [];
  }

  public stop() {
    this.curBeat = 0;
    // TODO do something with playing notes
  }

  public curBeatToSeconds() {
    return this.curBeat / Globals.BPM * 60;
  }

  public playPause(): boolean {
    if (this.playing) {
      clearInterval(this.intervalID);
    } else {
      // best possible resolution is 4ms (may be 10ms)
      this.intervalID = setInterval(() => {this.tick(); }, 4);

      // apparent start time is based on current beat and BPM
      // this keeps everything syncronized in terms of quatization
      this.apparentStartTime = Globals.audioCtx.currentTime - this.curBeatToSeconds();
    }

    this.playing = !this.playing;

    return this.playing;
  }

  public getCurrentTime() {
    return Globals.audioCtx.currentTime - this.apparentStartTime;
  }

  private tick() {
    let curTime = this.getCurrentTime();
    this.curBeat = (curTime / 60) * Globals.BPM;

    let nextNote = NoteManager.NoteManager().getNextNote(this.curBeat);
    while (nextNote) {
      let noteKeycode = this.keycodes[nextNote.noteID];
      this.sendMessage(new KeyboardMessage(noteKeycode, KeyDirection.DOWN, new KeyboardEvent("MIDI")));
      this.playingNotes.push(nextNote);
      nextNote = NoteManager.NoteManager().getNextNote(this.curBeat);
    }

    this.playingNotes.forEach(note => {
      if (note.isDone(this.curBeat)) {
        let noteKeycode = this.keycodes[note.noteID];
        this.sendMessage(new KeyboardMessage(noteKeycode, KeyDirection.UP, new KeyboardEvent("MIDI")));
      }
    });

    this.playingNotes = this.playingNotes.filter((note) => {return !note.isDone(this.curBeat); });
  }
}