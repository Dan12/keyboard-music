/// <reference path="../midi/midiConfig.ts"/>
/// <reference path="../midi/playConfig.ts"/>

class MidiIO extends AbstractIO<PadMessage, void> {

  private soundpack = 0;

  public receiveMessage(msg: PadMessage) {
    Globals.audioCtx.resume();
    let c = Globals.playerConfig.getPadConfig(msg.pack, msg.row, msg.col);
    if (c !== PadConfiguration.NoConfig) {

      let timeOffset = 0;

      if (c.quantization !== 0) {
        // smallest increment of 1/32 needs 10000 (64 would need 10 times)
        let scalar = 10000;

        // beats per second
        let bps = Globals.BPM / 60;
        let quantTime = c.quantization / bps;
        let currTime = Globals.audioCtx.currentTime;
        let alreadyElapsed = (currTime * scalar) % (quantTime * scalar);
        timeOffset = currTime + quantTime - (alreadyElapsed / scalar);
      }

      if (msg.dirn === KeyDirection.DOWN) {
        let playing = Globals.midiConfig.playing(msg.pack, msg.row, msg.col);

        // Stop all sounds in group (including this one)
        for (let sound of c.groups) {
          sound.stop(timeOffset);
        }
        Globals.midiConfig.stop(msg.pack, msg.row, msg.col, timeOffset);

        // if toggle and was playing, leave in stopped state
        if (!(c.toggle && playing)) {
          Globals.midiConfig.start(msg.pack, msg.row, msg.col, timeOffset);
        }
      } else if (msg.dirn === KeyDirection.UP) {
        if (!c.toggle && c.holdToPlay) {
          Globals.midiConfig.stop(msg.pack, msg.row, msg.col, timeOffset);
        }
      }
    }
  }
}