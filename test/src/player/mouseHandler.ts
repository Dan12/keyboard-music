/// <reference path="player.ts"/>
/// <reference path="noteManager.ts"/>
/// <reference path="selector.ts"/>
/// <reference path="note.ts"/>

class MouseHandler {
  public constructor(player: Player) {
    let rect = player.barContainer.getBoundingClientRect();
    let NM = NoteManager.NoteManager();
    let sel = new Selector<Note>();

    player.noteContainer.appendChild(sel.mutliElt);

    let moved = false;
    let prevX = 0;
    let prevY = 0;
    let down = false;
    let deselect = false;

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
      prevX = xPos;
      prevY = yPos;
      down = true;

      // do note manipulation
      let note = NM.getNoteByPos(xPos, yPos);
      if (note) {
        if (sel.getSelected().indexOf(note) === -1) {
          sel.singleSelect(note);
        }
        let nxy = note.getNotePos();
        selectOffsetX = xPos - nxy.x;
        selectOffsetY = yPos - nxy.y;
      } else {
        deselect = sel.getSelected().length > 0;
        // console.log(deselect);
        // console.log(sel.getSelected());
        sel.deselectAll();
        sel.startMulti(xPos, yPos);
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

        // update multi
        if (sel.startedMulti()) {
          sel.updateMultiEnd(xPos, yPos);
          for (let n of NM.getNotes()) {
            if (sel.isContained(n.left, n.top, n.length, 16)) {
              sel.select(n);
            } else {
              sel.deselect(n);
            }
          }
        } else {
          // update positions
          for (let n of sel.getSelected()) {
            n.moveNotePos(deltaX, deltaY);
            n.updateRealNotePos();
          }
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

      if (!moved && !deselect) {
        // do note manipulation
        let note = NM.getNoteByPos(xPos, yPos);
        if (note === null) {
          let newNote = Note.positionToNote(xPos, yPos);
          player.noteContainer.appendChild(newNote.noteElem);
          NM.addNote(newNote);
          sel.deselectAll();
        }
      } else {
        for (let n of sel.getSelected()) {
          // snap to mouse position
          n.moveNotePos(selectOffsetX, selectOffsetY);
          // update note props
          n.setNoteProps();
          // set position
          n.updateRealNotePos();
        }
      }

      deselect = false;

      sel.endMulti();

      e.preventDefault();
    });
  }
}