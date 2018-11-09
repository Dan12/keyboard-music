/// <reference path="player.ts"/>
/// <reference path="noteManager.ts"/>
/// <reference path="selector.ts"/>
/// <reference path="note.ts"/>

class MouseHandler {
  public constructor(player: Player) {
    let rect = player.barContainer.getBoundingClientRect();
    let NM = NoteManager.NoteManager();
    let sel = new Selector<Note>();

    let moved = false;
    let prevX = 0;
    let prevY = 0;
    let down = false;

    let selectOffsetX = 0;
    let selectOffsetY = 0;

    player.barContainer.addEventListener("mousedown", e => {
      let xPos = e.pageX - rect.left;
      let yPos = e.pageY - rect.top;
      // adjust for scrolling
      xPos -= player.scrollX;
      yPos -= player.scrollY;

      // set state props
      moved = false;
      down = true;
      prevX = xPos;
      prevY = yPos;

      // do note manipulation
      let note = NM.getNoteByPos(xPos, yPos);
      if (note) {
        sel.singleSelect(note);
        let nxy = note.getNotePos();
        selectOffsetX = xPos - nxy.x;
        selectOffsetY = yPos - nxy.y;
      }

      e.preventDefault();
    });

    player.barContainer.addEventListener("mousemove", e => {
      let xPos = e.pageX - rect.left;
      let yPos = e.pageY - rect.top;
      // adjust for scrolling
      xPos -= player.scrollX;
      yPos -= player.scrollY;

      // set state params
      moved = true;

      if (down) {
        let deltaX = xPos - prevX;
        let deltaY = yPos - prevY;
        prevX = xPos;
        prevY = yPos;
  
        for (let n of sel.getSelected()) {
          n.moveNotePos(deltaX, deltaY);
          n.updateRealNotePos();
        }
      }

      e.preventDefault();
    });

    player.barContainer.addEventListener("dblclick", e => {
      let xPos = e.pageX - rect.left;
      let yPos = e.pageY - rect.top;
      // adjust for scrolling
      xPos -= player.scrollX;
      yPos -= player.scrollY;

      // do note manipulation
      let note = NM.getNoteByPos(xPos, yPos);
      if (note) {
        note.noteElem.remove();
      }

      e.preventDefault();
    });

    player.barContainer.addEventListener("mouseup", e => {
      let xPos = e.pageX - rect.left;
      let yPos = e.pageY - rect.top;
      // adjust for scrolling
      xPos -= player.scrollX;
      yPos -= player.scrollY;

      // set state props
      down = false;

      if (!moved) {
        // do note manipulation
        let note = NM.getNoteByPos(xPos, yPos);
        if (note === null) {
          let newNote = Note.positionToNote(xPos, yPos);
          player.noteContainer.appendChild(newNote.noteElem);
          NM.addNote(newNote);
          sel.deselect();
        }
      } else {
        for (let n of sel.getSelected()) {
          n.moveNotePos(selectOffsetX, selectOffsetY);
          n.setNoteProps();
          n.updateRealNotePos();
        }
      }

      e.preventDefault();
    });
  }
}