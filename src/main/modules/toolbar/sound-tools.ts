/// <reference path="./draw-sound.ts"/>

class SoundTools extends DomElement {
  private nameElement: JQW;

  private waveform: DrawSound;

  constructor() {
    super(new JQW('<div id="sound-tools" class="horizontal-column"></div>'));

    this.nameElement = new JQW('<div id="file_name">File Name</div>');
    this.asElement().append(this.nameElement);

    // create the name and waveform elements
    this.waveform = new DrawSound();
    this.asElement().append(this.waveform.asElement());
  }

  /**
   * inspect the given sound and show this element
   * @param sound the sound file
   * @param inOutControls flag to show the in and out controls
   */
  public inspectSound(sound: Sound, inOutControls: boolean) {
    this.asElement().show();

    this.waveform.setSound(sound, inOutControls);

    this.nameElement.html(sound.getLoc());
  }

  /**
   * clear the data in this object and hide this element
   */
  public clearData() {
    this.waveform.clearData();

    this.asElement().hide();
  }

  /**
   * called when the space bar is pressed
   * and the inspector is in the current mode
   */
  public pressSpace() {
    this.waveform.pressSpace();
  }
}
