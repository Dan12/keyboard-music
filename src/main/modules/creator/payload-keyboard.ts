class PayloadKeyboard extends PayloadReceiver {

  private addKeyCallback: (r: number, c: number, sound: SoundFile) => void;

  private keyboard: Keyboard;

  constructor(type: KeyBoardType) {
    super($('<div class="horizontal-column"></div>'));

    this.keyboard = new Keyboard(type);

    this.asElement().append(this.keyboard.asElement());
  }

  public getKeyboard(): Keyboard {
    return this.keyboard;
  }

  public setAddSoundCallback(callback: (r: number, c: number, sound: SoundFile) => void) {
    this.addKeyCallback = callback;
  }

  private runAddKeyCallback(r: number, c: number, payload: any) {
    if (payload instanceof SoundFile)
      if (this.addKeyCallback)
        this.addKeyCallback(r, c, <SoundFile> payload);
      else
        collectErrorMessage('Key Callback does not exist on keyboard');
    else
      collectErrorMessage('Payload type does not match soundfile type in keyboard', payload);
  }

  // keyboard can only recieve directory payload
  public canReceive(payload: Payload): boolean {
    return payload instanceof Directory;
  }

  // called when a directory payload is recieved
  public receivePayload(payload: Payload) {
    if (payload instanceof Directory) {
      // find the lowest directory with a file, stop if no subdirectory
      let lowestDir = <Directory> payload;
      while (lowestDir.numFiles() === 0 && lowestDir.numDirs() > 0) {
        lowestDir = lowestDir.getFirstDir();
      }

      let sounds = lowestDir.getFiles();
      for (let sound of sounds) {
        // place sounds based on the grid convention a-d, 0-15
        let sLetter = sound.toLowerCase().charCodeAt(0) - 97;
        let sNum = parseInt(sound.substring(1, sound.length));
        if (sLetter >= 0 && sLetter <= 3 && sNum >= 0 && sNum <= 15) {
          let r = Math.floor(sLetter / 2) * 4 + Math.floor(sNum / 4);
          let c = (sLetter % 2) * 4 + (sNum % 4);

          this.runAddKeyCallback(r, c, lowestDir.getFile(sound));
        }
      }
    } else {
      collectErrorMessage('Payload is not directory in keyboard');
    }
  }
}
