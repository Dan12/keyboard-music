// TODO: add soundpack switcher to gui and wire up to keyboard
/**
 * the soundpack gui element. Makes calls to the song manager to
 */
class SoundPackSwitcher extends DomElement {

  private soundPackElements: JQW[];
  private soundPackInfo: JQW;
  private type: SoundPackSwitcherType;

  constructor(type: SoundPackSwitcherType) {
    super(new JQW('<div id="soundpack_switcher"></div>'));

    this.type = type;

    this.soundPackElements = [];

    if (this.type === SoundPackSwitcherType.ARROWS) {
      let elem = new JQW('<div class="sound_pack_button"><</div>');
      this.soundPackElements.push(elem);
      elem = new JQW('<div class="sound_pack_button">^</div>');
      this.soundPackElements.push(elem);
      elem = new JQW('<div class="sound_pack_button">v</div>');
      this.soundPackElements.push(elem);
      elem = new JQW('<div class="sound_pack_button">></div>');
      this.soundPackElements.push(elem);

      this.soundPackElements[1].addClass('sound_pack_block');
      this.asElement().append(this.soundPackElements[1]);
      this.asElement().append(this.soundPackElements[0]);
      this.asElement().append(this.soundPackElements[2]);
      this.asElement().append(this.soundPackElements[3]);

      for (let i = SongManager.getSong().getNumPacks(); i < 4; i++) {
        SongManager.getSong().addPack();
      }
    } else {
      for (let i = 1; i <= SongManager.getSong().getNumPacks(); i++) {
        let elem = new JQW('<div class="sound_pack_button">' + i + '</div>');
        this.soundPackElements.push(elem);
        this.asElement().append(elem);
      }
    }

    this.soundPackInfo = new JQW('<div></div>');
    this.setSoundPackInfo();

    this.asElement().append(this.soundPackInfo);

    this.highlightCurrent();

    this.setScale();
  }

  private setSoundPackInfo() {
    this.soundPackInfo.html('Sound Pack: ' + (SongManager.getInstance().getCurrentSoundPack() + 1));
  }

  private highlightCurrent() {
    if (SongManager.getInstance().getCurrentSoundPack() < this.soundPackElements.length) {
      this.soundPackElements[SongManager.getInstance().getCurrentSoundPack()].addClass('highlight_sound_pack');
    }
  }

  private unhighlightCurrent() {
    if (SongManager.getInstance().getCurrentSoundPack() < this.soundPackElements.length) {
      this.soundPackElements[SongManager.getInstance().getCurrentSoundPack()].removeClass('highlight_sound_pack');
    }
  }

  public setScale(scale = 1) {
    let css = {};
    css['font-size'] = `${20 * scale}px`;
    css['width'] = `${24 * scale}px`;
    css['height'] = `${24 * scale}px`;
    css['border-radius'] = `${2 * scale}px`;

    for (let i = 0; i < this.soundPackElements.length; i++) {
      this.soundPackElements[i].css(css);
    }

    this.soundPackInfo.css({'font-size': css['font-size']});
  }

  /**
   * put this switcher into edit mode
   */
  public editMode() {
    // TODO
  }

  /**
   * called when a key is pressed on this element
   */
  public keyPressed(keyCode: number) {
    this.unhighlightCurrent();
    if (this.type === SoundPackSwitcherType.ARROWS) {
      switch (keyCode) {
        case 39: // right
          SongManager.getInstance().setSoundPack(3);
          break;
        case 37: // left
          SongManager.getInstance().setSoundPack(0);
          break;
        case 38: // up
          SongManager.getInstance().setSoundPack(1);
          break;
        case 40: // down
          SongManager.getInstance().setSoundPack(2);
          break;
      }
    } else {
      switch (keyCode) {
        case 39: // right
          if (SongManager.getInstance().getCurrentSoundPack() < SongManager.getSong().getNumPacks() - 1)
            SongManager.getInstance().setSoundPack(SongManager.getInstance().getCurrentSoundPack() + 1);
          else
            SongManager.getInstance().setSoundPack(0);
          break;
        case 37: // left
          if (SongManager.getInstance().getCurrentSoundPack() > 0)
            SongManager.getInstance().setSoundPack(SongManager.getInstance().getCurrentSoundPack() - 1);
          else
            SongManager.getInstance().setSoundPack(SongManager.getSong().getNumPacks() - 1);
          break;
        case 38: // up
          SongManager.getInstance().setSoundPack(SongManager.getSong().getNumPacks() - 1);
          break;
        case 40: // down
          SongManager.getInstance().setSoundPack(0);
          break;
      }
    }

    this.setSoundPackInfo();
    this.highlightCurrent();

    if (keyCode >= 37 && keyCode <= 40)
      InputEventPropegator.switchedSoundPack();
  }
}

enum SoundPackSwitcherType {
  ARROWS, // Only allows 4
  LINEAR
}
