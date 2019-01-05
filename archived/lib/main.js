/**
 * The abstract element class. It tells the client that the extending
 * class can be treated as a JQuery element
 */
class DomElement {
    constructor(element) {
        this.element = element;
    }
    /**
     * @return This objects's elelemt
     */
    asElement() {
        return this.element;
    }
}
/**
 * an extension to the element class that represents a single payload
 */
class SinglePayload extends DomElement {
    constructor(element) {
        super(element);
        this.asElement().mousedown((e) => {
            this.setPayload(this, e.pageX, e.pageY);
        });
    }
    canBePayload() {
        return true;
    }
    setPayload(payload, mx, my) {
        MousePayload.setPayload(payload, mx, my);
    }
    highlight() {
        this.asElement().css({ 'background-color': 'white' });
    }
    removeHighlight() {
        this.asElement().css({ 'background-color': '' });
    }
}
/**
 * a class that can recieve a payload
 */
class PayloadReceiver extends DomElement {
    constructor(element, hook) {
        super(element);
        this.payloadHook = hook;
        DomEvents.addListener(MousePayload.CHECK_EVENT, (event) => {
            if (this.canReceive(event.detail.payload)) {
                this.receiveHighlight();
                MousePayload.addReceiver(this);
            }
        }, this.asElement().getDomObj());
        DomEvents.addListener(MousePayload.RECEIVE_EVENT, (event) => {
            if (this.canReceive(event.detail.payload)) {
                this.receivePayload(event.detail.payload);
            }
        }, this.asElement().getDomObj());
    }
    receiveHighlight() {
        this.asElement().css({ 'background-color': 'rgb(150,230,230)' });
    }
    removeReceiveHighlight() {
        this.asElement().css({ 'background-color': '' });
    }
    /**
     * Returns true if this receiver can receive the given payload.
     * This check is performed through the payload hook using the CAN_RECEIVE request type.
     */
    canReceive(payload) {
        return this.payloadHook !== undefined && this.payloadHook(PayloadHookRequest.CAN_RECEIVE, payload, this.getObjectData());
    }
    /**
     * Handle the payload that was received.
     * It will be a payload that can be received as defined by canReceive.
     */
    receivePayload(payload) {
        if (this.payloadHook !== undefined) {
            this.payloadHook(PayloadHookRequest.RECEIVED, payload, this.getObjectData());
        }
    }
}
/**
 * an object that is a payload as well as a payload receiver.
 */
class HybridPayload extends PayloadReceiver {
    constructor(element, hook) {
        super(element, hook);
        this.asElement().mousedown((e) => {
            if (this.canBePayload())
                this.setPayload(this, e.pageX, e.pageY);
        });
    }
    setPayload(payload, mx, my) {
        MousePayload.setPayload(payload, mx, my);
    }
    highlight() {
        this.asElement().css({ 'background-color': 'white' });
    }
    removeHighlight() {
        this.asElement().css({ 'background-color': '' });
    }
    /** call the payload hook function to determine if this object can be a payload */
    canBePayload() {
        return this.payloadHook !== undefined && this.payloadHook(PayloadHookRequest.IS_PAYLOAD, undefined, this.getObjectData());
    }
}
/**
 * the enum for the three payload hook requests
 */
var PayloadHookRequest;
(function (PayloadHookRequest) {
    PayloadHookRequest[PayloadHookRequest["CAN_RECEIVE"] = 0] = "CAN_RECEIVE";
    PayloadHookRequest[PayloadHookRequest["RECEIVED"] = 1] = "RECEIVED";
    PayloadHookRequest[PayloadHookRequest["IS_PAYLOAD"] = 2] = "IS_PAYLOAD";
})(PayloadHookRequest || (PayloadHookRequest = {}));
;
;
/// <reference path="./payload.ts"/>
/// <reference path="./single-payload.ts"/>
/// <reference path="./payload-receiver.ts"/>
/// <reference path="./hybrid-payload.ts"/>
/// <reference path="./payload-utils.ts"/>
/**
 * Maintain the current payload of the mouse
 */
class MousePayload {
    /**
     * initialize the mouse payload object
     */
    static initialize(element) {
        MousePayload.listen_element = element;
        MousePayload.setMutliples = false;
        MousePayload.payloads = [];
        MousePayload.payloadElements = [];
        MousePayload.mouseOffsets = [];
        MousePayload.receivers = [];
        MousePayload.tempPayloads = [];
        MousePayload.listen_element.mousemove((e) => {
            MousePayload.assertChecks();
            // reset the receiver array
            for (let i = 0; i < MousePayload.receivers.length; i++) {
                MousePayload.receivers[i].removeReceiveHighlight();
            }
            MousePayload.receivers = [];
            for (let i = 0; i < MousePayload.payloads.length; i++) {
                // TODO maybe define some small sensitivity for the mouse movement to create the payload and execute the following code
                // set up the payload element if not already created
                if (MousePayload.payloadElements[i] === undefined) {
                    MousePayload.payloadElements[i] = MousePayload.payloads[i].asElement().clone();
                    MousePayload.listen_element.append(MousePayload.payloadElements[i]);
                    MousePayload.payloadElements[i].css({ 'position': 'absolute', 'pointer-events': 'none', 'opacity': '0.5' });
                    MousePayload.payloads[i].highlight();
                }
                let mouseOffset = MousePayload.mouseOffsets[i];
                // move the payload clone element to the mouse position
                MousePayload.payloadElements[i].css({ 'left': (e.pageX + MousePayload.xOffset + mouseOffset.x) + 'px', 'top': (e.pageY + MousePayload.yOffset + mouseOffset.y) + 'px' });
                // fire an event over the current object with the current payload
                DomEvents.fireEvent(MousePayload.CHECK_EVENT, { payload: MousePayload.payloads[i] }, document.elementFromPoint(e.pageX + mouseOffset.x, e.pageY + mouseOffset.y));
            }
            // prevent highlight/selecting on dragging
            e.preventDefault();
            return false;
        });
        MousePayload.listen_element.mouseup((e) => {
            MousePayload.popData(e.pageX, e.pageY);
            MousePayload.clearData();
        });
    }
    static assertChecks() {
        if (MousePayload.payloads.length !== MousePayload.mouseOffsets.length)
            collectErrorMessage('Payload length does not match mouse offsets');
        if (MousePayload.payloads.length < MousePayload.payloadElements.length)
            collectErrorMessage('payload elements is too long');
    }
    static popData(mx, my) {
        for (let j = 0; j < MousePayload.receivers.length; j++) {
            MousePayload.receivers[j].removeReceiveHighlight();
        }
        let len = MousePayload.payloads.length;
        for (let i = 0; i < len; i++) {
            let mouseOffset = MousePayload.mouseOffsets.pop();
            let payload = MousePayload.payloads.pop();
            payload.removeHighlight();
            let element = MousePayload.payloadElements.pop();
            if (element)
                element.remove();
            DomEvents.fireEvent(MousePayload.RECEIVE_EVENT, { payload: payload }, document.elementFromPoint(mx + mouseOffset.x, my + mouseOffset.y));
        }
        MousePayload.receivers = [];
        DomEvents.fireEvent(MousePayload.FINISHED_POPPING_EVENT);
    }
    static hasPayload() {
        return MousePayload.payloads.length > 0;
    }
    static hasTempPayload() {
        return MousePayload.tempPayloads.length > 0;
    }
    static clearData() {
        if (!MousePayload.setMutliples) {
            for (let i = 0; i < MousePayload.receivers.length; i++) {
                MousePayload.receivers[i].removeReceiveHighlight();
            }
            MousePayload.receivers = [];
            for (let i = 0; i < MousePayload.payloads.length; i++) {
                MousePayload.payloads[i].removeHighlight();
                if (i < MousePayload.payloadElements.length)
                    MousePayload.payloadElements[i].remove();
            }
            MousePayload.payloads = [];
            for (let i = 0; i < MousePayload.tempPayloads.length; i++) {
                MousePayload.tempPayloads[i].removeHighlight();
            }
            MousePayload.tempPayloads = [];
            for (let i = 0; i < MousePayload.payloadElements.length; i++) {
                MousePayload.payloadElements[i].remove();
            }
            MousePayload.payloadElements = [];
            MousePayload.mouseOffsets = [];
        }
        else {
            MousePayload.setMutliples = false;
        }
    }
    static calculateMouseOffsets(baseInd) {
        let baseDim = this.payloads[baseInd].asElement().getDomObj().getBoundingClientRect();
        for (let i = 0; i < this.payloads.length; i++) {
            let curDim = this.payloads[i].asElement().getDomObj().getBoundingClientRect();
            this.mouseOffsets.push({ x: (curDim.left - baseDim.left), y: (curDim.top - baseDim.top) });
        }
    }
    /**
     * set the payload of the mouse and define some offsets
     */
    static setPayload(payload, pageX, pageY) {
        let baseInd = -1;
        for (let i = 0; i < MousePayload.tempPayloads.length; i++) {
            if (payload === MousePayload.tempPayloads[i]) {
                baseInd = i;
                break;
            }
        }
        if (baseInd === -1) {
            MousePayload.clearData();
            MousePayload.payloads = [payload];
            MousePayload.mouseOffsets = [{ x: 0, y: 0 }];
            baseInd = 0;
        }
        else {
            MousePayload.payloads = [];
            for (let i = 0; i < MousePayload.tempPayloads.length; i++) {
                if (MousePayload.tempPayloads[i].canBePayload()) {
                    MousePayload.payloads.push(MousePayload.tempPayloads[i]);
                }
            }
            MousePayload.tempPayloads = [];
            MousePayload.calculateMouseOffsets(baseInd);
        }
        let offset = MousePayload.payloads[baseInd].asElement().offset();
        MousePayload.xOffset = offset.left - pageX;
        MousePayload.yOffset = offset.top - pageY;
    }
    static addMulitplePayloads(payloads) {
        for (let i = 0; i < payloads.length; i++) {
            MousePayload.tempPayloads.push(payloads[i]);
        }
        MousePayload.setMutliples = true;
    }
    static addReceiver(receiver) {
        MousePayload.receivers.push(receiver);
    }
}
MousePayload.CHECK_EVENT = 'mouse_payload_check';
MousePayload.RECEIVE_EVENT = 'mouse_payload_receive';
MousePayload.FINISHED_POPPING_EVENT = 'mouse_payload_finished_popping';
/**
 * A class to abstract a howl object
 */
class Sound extends SinglePayload {
    /**
     * If created from is a Sound, this will copy the information from the old Sound.
     * If a start_time, end_time, and loop are specified in the options, those will be used.
     * Note that start_time and end_time should be in milliseconds
     *
     * If created is a string, this will load a new howl object from that string,
     * set the name and location from options.name and options.location respectively
     * and call the options callback function
     *
     * @param createFrom the string or sound to create this sound from
     * @param options the options object
     */
    constructor(createFrom, options) {
        super(new JQW('<div class="file">' + (options.name !== undefined ? options.name : createFrom.name) + '</div>'));
        this.id = Sound.assignID();
        if (createFrom instanceof Sound) {
            // copy parameters from other
            let copyFrom = createFrom;
            this.howl_object = copyFrom.howl_object;
            this.name = copyFrom.name;
            this.location = copyFrom.location;
            // if defined, use options, else copy from createFrom
            if (options.start_time !== undefined && options.end_time !== undefined && options.looped !== undefined) {
                this.setSprite(options.start_time, options.end_time, options.looped);
            }
            else {
                let copySprite = copyFrom.getSprite();
                this.setSprite(copySprite[0], copySprite[0] + copySprite[1], copySprite[2]);
            }
        }
        else if (typeof createFrom === 'string') {
            // load howl object
            this.howl_object = new Howl({
                src: [createFrom],
                onload: () => {
                    delete this.howl_object._sprite['__default'];
                    // initlize to default sprite
                    this.setSprite(0, this.howl_object.duration() * 1000, false);
                    this.name = options.name;
                    this.location = options.location;
                    options.callback(this);
                },
                onloaderror: () => {
                    collectErrorMessage('Error loading file', { name: options.name });
                }
            });
        }
        else {
            collectErrorMessage('Incorrect sound create from type');
        }
    }
    static assignID() {
        return Sound.nextID++;
    }
    /** @return the absolute file location of this sound */
    getLoc() {
        return this.location;
    }
    /**
     * @return the array representation of this audio object in the format: [location, start time, end time]
     */
    toArr() {
        let arr = this.getSprite();
        if (arr[0] === 0 && arr[1] === this.howl_object.duration() * 1000) {
            return [this.location];
        }
        else {
            return [this.location, arr[0], arr[0] + arr[1]];
        }
    }
    /**
     * expose the howl object play method
     */
    play() {
        this.playID = this.howl_object.play(this.id.toString());
    }
    /**
     * expose the howl object pause method
     */
    pause() {
        this.howl_object.pause(this.playID);
    }
    /**
     * expose the howl object seek method
     */
    seek(seekTo) {
        if (seekTo === undefined) {
            // return the position of this sounds id
            return this.howl_object.seek(this.playID);
        }
        else {
            this.howl_object.seek(seekTo, this.playID);
        }
        return 0;
    }
    /**
     * expose the howl object stop method
     */
    stop() {
        this.howl_object.stop(this.playID);
    }
    /** @return the base-64 source string for this sound */
    getSrc() {
        return this.howl_object._src;
    }
    /** @return true if this sound is playing */
    playing() {
        return this.howl_object.playing(this.playID);
    }
    /** @return the duration in seconds of this sound */
    duration() {
        return this.howl_object.duration();
    }
    /**
     * ===================
     * Howl Sprite Wrapper
     * ===================
     */
    /** @return the howl sprite object in the format [start time, duration, loop], where the times are in milliseconds */
    getSprite() {
        return this.howl_object._sprite[this.id.toString()];
    }
    /**
     * edit the sound loop flag
     */
    setLoop(loop) {
        let curSprite = this.getSprite();
        this.howl_object._sprite[this.id.toString()] = [curSprite[0], curSprite[1], loop];
    }
    /**
     * edit the sound in and out points. IMPORTANT: st and et mush be in milliseconds
     */
    editSprite(st, et) {
        let curSprite = this.getSprite();
        this.howl_object._sprite[this.id.toString()] = [st, et - st, curSprite[2]];
    }
    /** set this sounds sprite to the given values */
    setSprite(st, et, loop) {
        this.howl_object._sprite[this.id.toString()] = [st, et - st, loop];
    }
}
Sound.nextID = 1;
/// <reference path="./sound.ts"/>
/**
 * a container class for a single key's sound. Can contain multiple sounds in the form of pitches.
 */
class SoundContainer {
    constructor(hold_to_play, quaternized, looped) {
        this.pitches = [];
        this.looped = looped === undefined ? false : looped;
        this.quaternized = quaternized === undefined ? 0 : quaternized;
        this.holdToPlay = hold_to_play === undefined ? false : hold_to_play;
        this.currentPitch = 0;
        this.previousPitch = 0;
    }
    /** @return a copy of this sound container */
    copy() {
        let ret = new SoundContainer(this.holdToPlay, this.quaternized, this.looped);
        for (let i = 0; i < this.pitches.length; i++) {
            ret.addPitch(this.pitches[i]);
        }
        return ret;
    }
    /** @return the value of hold to play for this container */
    getHoldToPlay() {
        return this.holdToPlay;
    }
    setHoldToPlay(value) {
        this.holdToPlay = value;
    }
    /** @return the value of loop for this container */
    getLoop() {
        return this.looped;
    }
    setLoop(value) {
        this.looped = value;
        for (let i = 0; i < this.pitches.length; i++) {
            this.pitches[i].setLoop(this.looped);
        }
    }
    /** @return the pitches in this container */
    getPitches() {
        return this.pitches;
    }
    /** @return the quaternize value for this container */
    getQuaternize() {
        return this.quaternized;
    }
    /**
     * @return an array of all of the pitches in the format of pitch data: [location, start time, end time]
     */
    getPitchLocations() {
        let ret = [];
        for (let i = 0; i < this.pitches.length; i++) {
            ret.push(this.pitches[i].toArr());
        }
        return ret;
    }
    /**
     * add the given sound as a pitch to this container
     * @param sound the sound to add
     * @param start_time the optional start time to initlize with
     * @param end_time the optional end time to initlize this sound with
     */
    addPitch(sound, start_time, end_time) {
        let options = {
            start_time: start_time,
            end_time: end_time,
            loop: this.looped
        };
        this.pitches.push(new Sound(sound, options));
    }
    /** remove the pitch at the given index from this container */
    removePitch(ind) {
        this.pitches.splice(ind, 1);
    }
    /** called when this container receives a press event */
    pressed() {
        if (this.pitches.length > 0) {
            // if looping, toggle play and pause on the first pitch
            if (this.looped) {
                this.currentPitch = 0;
                this.previousPitch = 0;
                if (this.pitches[this.currentPitch].playing()) {
                    this.pitches[this.currentPitch].stop();
                }
                else {
                    this.pitches[this.currentPitch].play();
                }
            }
            else {
                // else stop the previousPitch and play the next one
                this.pitches[this.previousPitch].stop();
                this.pitches[this.currentPitch].play();
                this.previousPitch = this.currentPitch;
                this.currentPitch++;
                this.currentPitch = this.currentPitch % this.pitches.length;
            }
        }
    }
    /** called when this container receives a release event. Only stops the previous pitch if holdToPlay is on */
    released() {
        if (this.pitches.length > 0 && this.holdToPlay) {
            this.pitches[this.previousPitch].stop();
        }
    }
    /** stops the previous pitch no matter what */
    stop() {
        if (this.pitches.length > 0) {
            this.pitches[this.previousPitch].stop();
        }
    }
}
/// <reference path="../song/sound-container.ts"/>
/**
 * A single key on a keyboard.
 */
class KeyboardKey extends HybridPayload {
    constructor(symbol, transition, k, r, c, hook) {
        super(new JQW(`<div class="keyboard_key ${(transition ? 'transition' : '')}">${symbol}</div>`), hook);
        this.keyboard = k;
        this.row = r;
        this.col = c;
        this.defaultColor = KeyboardKey.DEFAULT_COLOR;
        this.isHighlighted = false;
        this.resetColor();
    }
    /**
     * @return a css object that scales the key
     */
    static getScaleCSS(scale = 1) {
        // scale = 1 is a 60 x 60 px key
        let ret = {};
        ret['font-size'] = `${35 * scale}px`;
        ret['padding'] = `${9 * scale}px ${2 * scale}px`;
        ret['width'] = `${54 * scale}px`;
        ret['height'] = `${40 * scale}px`;
        ret['border-radius'] = `${6 * scale}px`;
        return ret;
    }
    /**
     * set the default background color for this key.
     * If no values are supplied, set the default background color to a keyboard key's default color
     */
    setDefaultColor(r, g, b) {
        if (r !== undefined && g !== undefined && b !== undefined) {
            this.defaultColor = `rgb(${r}, ${g}, ${b})`;
        }
        else {
            this.defaultColor = KeyboardKey.DEFAULT_COLOR;
        }
        this.resetColor();
    }
    /**
     * highlight this key
     */
    highlight() {
        this.isHighlighted = true;
        this.resetColor();
    }
    /**
     * unhighlight this key
     */
    removeHighlight() {
        this.isHighlighted = false;
        this.resetColor();
    }
    removeReceiveHighlight() {
        this.resetColor();
    }
    /**
     * reset background color to the default of highlighted color
     */
    resetColor() {
        this.asElement().css('background-color', this.isHighlighted ? KeyboardKey.HIGHLIGH_COLOR : this.defaultColor);
    }
    /**
     * set this key's css to the given values
     */
    setCSS(css) {
        this.asElement().css(css);
    }
    /**
     * set the color of this element with rgb value from 0 to 255
     */
    setColor(r, g, b) {
        this.asElement().css('background-color', `rgb(${r}, ${g}, ${b})`);
    }
    /**
     * required by the payload receiver class, return this so that the hook can know which key was receiving
     */
    getObjectData() {
        return this;
    }
    getRow() {
        return this.row;
    }
    getCol() {
        return this.col;
    }
    getKeyboard() {
        return this.keyboard;
    }
}
// the highlighed color for a keyboard key
KeyboardKey.HIGHLIGH_COLOR = 'rgb(255,255,100)';
// the default background color for a keyboard key
KeyboardKey.DEFAULT_COLOR = 'white';
// TODO add customization
/**
 * A color manager class for a keyboard. Able to abstract color routines for a keyboard press.
 */
class ColorManager {
    constructor(keys) {
        this.keys = keys;
        this.routine = ColorManager.standardColorRoutine(255, 160, 0);
    }
    /**
     * set this color manager's routine
     */
    setRoutine(routine) {
        this.routine = routine;
    }
    /**
     * called when the color manager is supposed to reflect that the given row and colum have been pressed
     */
    pressedKey(r, c) {
        this.runRoutine(r, c, true);
    }
    /**
     * called when the color manager is supposed to reflect that the given row and colum have been released
     */
    releasedKey(r, c) {
        this.runRoutine(r, c, false);
    }
    /**
     * run the routine for the key at the given row and column
     */
    runRoutine(r, c, p) {
        let results = this.routine(r, c, p);
        for (let i = 0; i < results.length; i++) {
            let result = results[i];
            // if the results are not within a valid range, reset the colors
            if (result.r < 0 || result.r > 255 || result.g < 0 || result.g > 255 || result.b < 0 || result.b > 255) {
                this.keys[result.row][result.col].resetColor();
            }
            else {
                this.keys[result.row][result.col].setColor(result.r, result.g, result.b);
            }
        }
    }
    /**
     * the standard same key press color routine for the given rgb color
     */
    static standardColorRoutine(red, green, blue) {
        return (r, c, p) => {
            return [{ row: r, col: c, r: p ? red : -1, g: p ? green : -1, b: p ? blue : -1 }];
        };
    }
}
/**
 * a handy set of keyboard utilities
 */
class KeyboardUtils {
    // TODO custom keypairs
    /**
     * @return the KeyBoardType associated with the given string. Defaults to STANDARD
     */
    static keyboardStringToType(type) {
        switch (type) {
            case 'SQUARE':
                return KeyBoardType.SQUARE;
            case 'DOUBLE':
                return KeyBoardType.DOUBLE;
            default:
                return KeyBoardType.STANDARD;
        }
    }
    /**
     * @return the KeyboardSize associated with the given type string
     */
    static keyboardStringToSize(type) {
        return KeyboardUtils.keyboardTypeToSize(KeyboardUtils.keyboardStringToType(type));
    }
    /**
     * @return the string associated with the given keyboard type. Defaults to 'STANDARD'
     */
    static keyboardTypeToString(type) {
        switch (type) {
            case KeyBoardType.SQUARE:
                return 'SQUARE';
            case KeyBoardType.DOUBLE:
                return 'DOUBLE';
            default:
                return 'STANDARD';
        }
    }
    /**
     * @return the keyboard size associated with the given Keybord Type. Defaults to 4x12
     */
    static keyboardTypeToSize(type) {
        switch (type) {
            case KeyBoardType.SQUARE:
                return { rows: 8, cols: 8 };
            case KeyBoardType.DOUBLE:
                return { rows: 8, cols: 11 };
            default: // standard
                return { rows: 4, cols: 12 };
        }
    }
    /**
     * convert the linear location to a 2D grid location
     * @return the grid location in [row, col] order
     */
    static linearToGrid(i, cols) {
        return [Math.floor(i / cols), i % cols];
    }
    /**
     * convert the grid location to a 1D linear location
     * @return the linear location
     */
    static gridToLinear(r, c, cols) {
        return r * cols + c;
    }
    // get a key's location on its keyboard
    static getKeyLocation(key) {
        return KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
    }
}
KeyboardUtils.keyboardSymbols = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', '\\n'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', '\\s', 'NA'],
];
// ascii key mappings to array index
KeyboardUtils.keyPairs = [
    [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187],
    [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221],
    [65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 13],
    [90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16, -1]
];
// alternate keys for firefox
KeyboardUtils.backupPairs = [
    [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 173, 61],
    [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221],
    [65, 83, 68, 70, 71, 72, 74, 75, 76, 59, 222, 13],
    [90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16, -1]
];
/**
 * the 3 different keyboard types
 */
var KeyBoardType;
(function (KeyBoardType) {
    KeyBoardType[KeyBoardType["STANDARD"] = 0] = "STANDARD";
    KeyBoardType[KeyBoardType["SQUARE"] = 1] = "SQUARE";
    KeyBoardType[KeyBoardType["DOUBLE"] = 2] = "DOUBLE";
})(KeyBoardType || (KeyBoardType = {}));
// TODO: add soundpack switcher to gui and wire up to keyboard
/**
 * the soundpack gui element. Makes calls to the song manager to
 */
class SoundPackSwitcher extends DomElement {
    constructor(type) {
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
        }
        else {
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
    setSoundPackInfo() {
        this.soundPackInfo.html('Sound Pack: ' + (SongManager.getInstance().getCurrentSoundPack() + 1));
    }
    highlightCurrent() {
        if (SongManager.getInstance().getCurrentSoundPack() < this.soundPackElements.length) {
            this.soundPackElements[SongManager.getInstance().getCurrentSoundPack()].addClass('highlight_sound_pack');
        }
    }
    unhighlightCurrent() {
        if (SongManager.getInstance().getCurrentSoundPack() < this.soundPackElements.length) {
            this.soundPackElements[SongManager.getInstance().getCurrentSoundPack()].removeClass('highlight_sound_pack');
        }
    }
    setScale(scale = 1) {
        let css = {};
        css['font-size'] = `${20 * scale}px`;
        css['width'] = `${24 * scale}px`;
        css['height'] = `${24 * scale}px`;
        css['border-radius'] = `${2 * scale}px`;
        for (let i = 0; i < this.soundPackElements.length; i++) {
            this.soundPackElements[i].css(css);
        }
        this.soundPackInfo.css({ 'font-size': css['font-size'] });
    }
    /**
     * put this switcher into edit mode
     */
    editMode() {
        // TODO
    }
    /**
     * called when a key is pressed on this element
     */
    keyPressed(keyCode) {
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
        }
        else {
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
var SoundPackSwitcherType;
(function (SoundPackSwitcherType) {
    SoundPackSwitcherType[SoundPackSwitcherType["ARROWS"] = 0] = "ARROWS";
    SoundPackSwitcherType[SoundPackSwitcherType["LINEAR"] = 1] = "LINEAR";
})(SoundPackSwitcherType || (SoundPackSwitcherType = {}));
/// <reference path="./keyboard-key.ts"/>
/// <reference path="./color-manager.ts"/>
/// <reference path="./keyboard-utils.ts"/>
/// <reference path="./soundpack-switcher.ts"/>
/**
 * The keyboard module to represent an html keyboard.
 */
class Keyboard extends DomElement {
    constructor(type, allowTransition, payloadHook) {
        super(new JQW('<div class="keyboard"></div>'));
        this.numRows = 4;
        this.numCols = 12;
        // return key activates other layers
        this.modifierKeyCode = 13;
        this.modifierActive = undefined;
        this.modifierHold = true;
        // option to show keys
        this.showKeys = true;
        // a mapping from a keycode to keyboard row and column
        this.keyMap = {};
        this.keyboardID = Keyboard.assignNextID();
        let size = KeyboardUtils.keyboardTypeToSize(type);
        this.numRows = size.rows;
        this.numCols = size.cols;
        if (type !== KeyBoardType.STANDARD) {
            this.modifierActive = false;
        }
        this.rows = [];
        // push row elements and new keyboard key elements to each row
        for (let r = 0; r < this.numRows; r++) {
            this.rows.push([]);
            let nextRow = new JQW(`<div class="row" id="row_${r}"></div>`);
            this.asElement().append(nextRow);
            for (let c = 0; c < this.numCols; c++) {
                let newKey = new KeyboardKey(KeyboardUtils.keyboardSymbols[r % 4][c], allowTransition, this, r, c, payloadHook);
                this.rows[r].push(newKey);
                nextRow.append(newKey.asElement());
                if (r < 4) {
                    newKey.asElement().addClass('bolder');
                }
            }
        }
        let maxRows = Math.min(4, this.numRows);
        // setup the key map
        for (let i = 0; i < maxRows; i++) {
            for (let j = 0; j < this.numCols; j++) {
                this.keyMap[KeyboardUtils.keyPairs[i][j]] = [i, j];
                // add the backup pairs
                if (KeyboardUtils.backupPairs[i][j] !== KeyboardUtils.keyPairs[i][j]) {
                    this.keyMap[KeyboardUtils.backupPairs[i][j]] = [i, j];
                }
            }
        }
        this.pressed = {};
        this.resize(1);
        this.setVisible();
        this.colorManager = new ColorManager(this.rows);
    }
    static assignNextID() {
        return Keyboard.nextID++;
    }
    setSoundPackSwitcher(type) {
        if (this.soundPackSwitcher !== undefined) {
            this.soundPackSwitcher.asElement().remove();
        }
        this.soundPackSwitcher = new SoundPackSwitcher(type);
        this.asElement().append(this.soundPackSwitcher.asElement());
    }
    getNumRows() {
        return this.numRows;
    }
    getNumCols() {
        return this.numCols;
    }
    /**
     * @return this keyboard's id
     */
    getID() {
        return this.keyboardID;
    }
    /**
     * @return the keyboard key at the given row and column
     */
    getKey(r, c) {
        return this.rows[r][c];
    }
    /**
     * set a click listener for all of the keys
     */
    setClickKeyListener(callback) {
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                let key = this.rows[r][c];
                key.asElement().click(() => {
                    callback(key);
                });
                key.asElement().css('cursor', 'pointer');
            }
        }
    }
    getColorManager() {
        return this.colorManager;
    }
    /**
     * set the visibility to the key text to the given value
     * @param value the visibility value
     */
    setShowKeys(value) {
        this.showKeys = value;
        this.setVisible();
    }
    /** reset all keys to their default colors */
    resetKeys() {
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                this.rows[r][c].setDefaultColor();
            }
        }
    }
    /** unhighlight all keys */
    removeHighlight() {
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                this.rows[r][c].removeHighlight();
            }
        }
    }
    /**
     * set the visibility of the key symbols based on the showKey flag
     */
    setVisible() {
        let cssObj = { 'color': this.showKeys ? '' : 'rgba(0,0,0,0)' };
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                this.rows[r][c].setCSS(cssObj);
            }
        }
    }
    /**
     * resize the keyboard keys based on the scale. 1 is a 60 x 60 key
     */
    resize(scale = 1) {
        let css = KeyboardKey.getScaleCSS(scale);
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                this.rows[r][c].setCSS(css);
            }
        }
        if (this.soundPackSwitcher !== undefined) {
            this.soundPackSwitcher.setScale(scale);
        }
    }
    /**
     * apply the vertical-align class to center this keyboard vertiacally
     */
    centerVertical() {
        this.asElement().addClass('vertical-align');
    }
    /**
     * called when a key is pressed. performs logic to determine which key in the song to press
     */
    keyDown(key) {
        if (!this.pressed[key]) {
            if (this.modifierActive !== undefined && key === this.modifierKeyCode) {
                // if user has to hold, modifier is down
                if (this.modifierHold)
                    this.modifierActive = true;
                // if user can press and release, modifier is toggled on key down
                else
                    this.modifierActive = !this.modifierActive;
                this.changeModiferKeys();
            }
            let keyIdx = this.keyMap[key];
            if (keyIdx) {
                this.pressedKey(keyIdx[0] + 4 * (this.modifierActive ? 1 : 0), keyIdx[1]);
                this.pressed[key] = true;
            }
            else if (this.soundPackSwitcher !== undefined) {
                this.soundPackSwitcher.keyPressed(key);
            }
        }
    }
    /**
     *
     */
    keyUp(key) {
        if (this.pressed[key]) {
            // only set to false if the modifier key is down and we have to hold to trigger
            if (this.modifierActive !== undefined && key === this.modifierKeyCode && this.modifierHold) {
                this.modifierActive = false;
                this.changeModiferKeys();
            }
            let keyIdx = this.keyMap[key];
            if (keyIdx) {
                this.releasedKey(keyIdx[0] + 4 * (this.modifierActive ? 1 : 0), keyIdx[1]);
            }
            delete this.pressed[key];
        }
    }
    /**
     * where a key officially gets pressed
     */
    pressedKey(r, c) {
        this.colorManager.pressedKey(r, c);
        SongManager.getInstance().pressedKey(KeyboardUtils.gridToLinear(r, c, this.numCols));
    }
    /**
     * where a key officially gets pressed
     */
    releasedKey(r, c) {
        this.colorManager.releasedKey(r, c);
        SongManager.getInstance().releasedKey(KeyboardUtils.gridToLinear(r, c, this.numCols));
    }
    /**
     * bold or unbold keys based on the modifier active flag
     */
    changeModiferKeys() {
        for (let r = 0; r < this.numRows; r++) {
            for (let c = 0; c < this.numCols; c++) {
                if (r < 4) {
                    if (this.modifierActive) {
                        // release all keys in lower half
                        this.releasedKey(r, c);
                        this.rows[r][c].asElement().removeClass('bolder');
                    }
                    else {
                        this.rows[r][c].asElement().addClass('bolder');
                    }
                }
                else {
                    if (this.modifierActive) {
                        this.rows[r][c].asElement().addClass('bolder');
                    }
                    else {
                        // release all keys in upper half
                        this.releasedKey(r, c);
                        this.rows[r][c].asElement().removeClass('bolder');
                    }
                }
            }
        }
    }
}
Keyboard.nextID = 1;
/// <reference path="../keyboard/keyboard.ts"/>
/**
 * the layout class for the keyboard mode
 */
class KeyboardLayout extends DomElement {
    /**
     * @return the singleton instance of this class
     */
    static getInstance() {
        if (KeyboardLayout.instance === undefined) {
            KeyboardLayout.instance = new KeyboardLayout();
        }
        return KeyboardLayout.instance;
    }
    constructor() {
        super(new JQW('<div id="keyboard"></div>'));
        this.keyboard = new Keyboard(KeyBoardType.STANDARD, true);
        this.keyboard.centerVertical();
        this.asElement().append(this.keyboard.asElement());
        this.init();
    }
    init() {
        SongManager.getInstance().loadSong('songs/eq.min.json', () => {
            this.keyboard.setSoundPackSwitcher(SoundPackSwitcherType.ARROWS);
        });
    }
    getKeyboard() {
        return this.keyboard;
    }
}
/**
 * A directory class with files and recursive subdirectories
 */
class Directory extends SinglePayload {
    constructor(name, parent) {
        super(new JQW('<div class="subdirectory-name">' + name + '</div>'));
        this.subDirElement = new JQW('<div class="subdirectory"></div>');
        parent.append(this.asElement());
        parent.append(this.subDirElement);
        this.asElement().click(() => {
            this.subDirElement.toggle(100);
        });
        this.files = {};
        this.subdirectories = {};
        this.fileSize = 0;
        this.dirSize = 0;
    }
    /**
     * @return the number of files in this directory. Does not recursively count other directories
     */
    numFiles() {
        return this.fileSize;
    }
    /**
     * @return the number of sub directories in this directory
     */
    numDirs() {
        return this.dirSize;
    }
    /**
     * @return the first directory in the sub directories map
     */
    getFirstDir() {
        let key = Object.keys(this.subdirectories)[0];
        return this.subdirectories[key];
    }
    /**
     * @return an array of the files in this directory only; no files returned from any subdirectories
     */
    getFiles() {
        return Object.keys(this.files);
    }
    /**
     * recursively add the file to this directory.
     * Create new subdirectories if needed.
     * @param location the location of the file relative to this directory
     * @param data the file data
     * @param fullname the full location of the file
     */
    addFile(location, data, fullname, callback) {
        // if this is still a subdirectory
        if (location.indexOf('/') !== -1) {
            // get the name of the subdirectory
            let dir = location.substring(0, location.indexOf('/'));
            // if this subdirectory does not exist, make a new one
            if (this.subdirectories[dir] === undefined) {
                this.subdirectories[dir] = new Directory(dir, this.subDirElement);
                this.dirSize++;
            }
            // continue recursion with new relative file location
            this.subdirectories[dir].addFile(location.substring(location.indexOf('/') + 1, location.length), data, fullname, callback);
        }
        else {
            if (this.files[location] === undefined) {
                let options = {
                    name: location,
                    location: fullname,
                    callback: (sound) => {
                        this.loadedFile(location, sound, fullname);
                        callback();
                    }
                };
                new Sound(data, options);
            }
            else {
                collectWarningMessage('Warning: File already exists. Will not overwrite: ' + fullname);
                callback();
            }
        }
    }
    // called when a file is loaded to add it to the file data structure and gui
    loadedFile(name, sound, fullname) {
        this.files[name] = sound;
        this.fileSize++;
        this.subDirElement.append(sound.asElement());
        sound.asElement().click(function () {
            Toolbar.getInstance().inspectSound(sound, sound, false);
        });
    }
    /**
     * recursively get the given file
     * @param location the relative file path to this directory
     */
    getFile(location) {
        if (location.indexOf('/') !== -1) {
            let dir = location.substring(0, location.indexOf('/'));
            if (this.subdirectories[dir] === undefined) {
                collectErrorMessage(`The directory ${dir} does not exist`);
                return undefined;
            }
            return this.subdirectories[dir].getFile(location.substring(location.indexOf('/') + 1, location.length));
        }
        else {
            let file = this.files[location];
            if (file === undefined) {
                collectErrorMessage(`The file ${location} does not exist`);
            }
            return file;
        }
    }
}
/// <reference path="./directory.ts"/>
// TODO add support for local upload, probably not in here
// TODO sort files and sub directories by name
/**
 * A file manager for managing all of the sounds.
 * @static
 */
class FileManager {
    constructor() {
        // the base directory for all zip files
        this.baseSongDir = 'sounds/';
        this.files = {};
        this.rootLocations = {};
    }
    /**
     * @return the singleton instance of this class
     */
    static getInstance() {
        if (FileManager.instance === undefined) {
            FileManager.instance = new FileManager();
        }
        return FileManager.instance;
    }
    /**
     * add a base directory and it's string location to the file manager
     * @param name the base directory name
     * @param location the backend file location
     */
    addBaseDir(name, location) {
        if (this.rootLocations[name] === undefined) {
            this.rootLocations[name] = location;
        }
        else {
            collectWarningMessage('Warning: Base directory already exists. Will not overwrite: ' + name + ',' + location);
        }
        // if the base directory doesn't exists yet, create it
        if (this.files[name] === undefined) {
            this.files[name] = new Directory(name, FileGUI.getInstance().asElement());
        }
    }
    /**
     * @param the base file name
     * @return the backend location associated with the given base file name
     */
    getRootLocation(base) {
        return this.rootLocations[base];
    }
    /**
     * add the given file with the data to the file manager
     * @method addFile
     * @param baseLocation the base file location
     * @param name the file name
     * @param data the file data
     */
    addFile(baseLocation, name, data, callback) {
        if (this.validFile(name)) {
            let fileName = this.trimName(name);
            if (this.files[baseLocation] === undefined) {
                collectErrorMessage('Error: Never initliaized Base Directory');
            }
            else {
                // add the file to the base directory
                this.files[baseLocation].addFile(fileName, data, baseLocation + '/' + fileName, callback);
            }
        }
        else {
            collectErrorMessage('Add file error, invalid name', name);
        }
    }
    /** make sure that the given given file name is from a valid zip file */
    validFile(name) {
        return name.startsWith(this.baseSongDir);
    }
    /** trim the base file name off of the file name */
    trimName(name) {
        return name.substring(this.baseSongDir.length, name.length);
    }
    /**
     * find the file with at the given location.
     * Returns undefined if the file does not exist
     * @method getSound
     * @return the file
     */
    getSound(basedir, location) {
        return this.files[basedir].getFile(location);
    }
    /**
     * clear all file data
     * @method clearFiles
     */
    clearFiles() {
        this.files = {};
        this.rootLocations = {};
        FileGUI.getInstance().notifyClear();
    }
}
/**
 * a class to display the data from the file mananger
 * @static
 */
class FileGUI extends DomElement {
    /**
     * @return the singleton instance of this class
     */
    static getInstance() {
        if (FileGUI.instance === undefined) {
            FileGUI.instance = new FileGUI();
        }
        return FileGUI.instance;
    }
    constructor() {
        super(new JQW('<div id="file-manager"></div>'));
        // add the main directory to the file structure
        this.asElement().append(new JQW('<div id="main-directory"></div>'));
    }
    /**
     * called when the clear method is called on the
     */
    notifyClear() {
        this.asElement().remove();
    }
}
class ContainerTools extends DomElement {
    constructor() {
        super(new JQW('<div id="container-tools" class="horizontal-column"></div>'));
        this.pitches = [];
        // add the pitches container
        let pitches = new JQW('<div id="pitches" class="horizontal-column"><h3>Pitches</h3></div>');
        this.asElement().append(pitches);
        this.pitchContainer = new JQW('<div id="pitch-container"></div>');
        pitches.append(this.pitchContainer);
        let controls = new JQW('<div id="controls" class="horizontal-column"></div>');
        this.asElement().append(controls);
        // add the loop switch
        this.loop = new JQW('<div id="loop" class="container-button">Loop</div>');
        controls.append(this.loop);
        this.loop.click(() => {
            if (this.currentContaier !== undefined) {
                this.currentContaier.setLoop(!this.currentContaier.getLoop());
                if (this.currentContaier.getLoop())
                    this.loop.addClass('true');
                else
                    this.loop.removeClass('true');
            }
        });
        // add the hold to play switch
        this.holdToPlay = new JQW('<div id="hold-to-play" class="container-button">Hold To Play</div>');
        controls.append(this.holdToPlay);
        this.holdToPlay.click(() => {
            if (this.currentContaier !== undefined) {
                this.currentContaier.setHoldToPlay(!this.currentContaier.getHoldToPlay());
                if (this.currentContaier.getHoldToPlay())
                    this.holdToPlay.addClass('true');
                else
                    this.holdToPlay.removeClass('true');
            }
        });
        // add the quaternize label
        this.quaternize = new JQW('<div id="quaternize">Quaternize:</div>');
        controls.append(this.quaternize);
        // add the linked areas container
        let areasContainer = new JQW('<div id="areas_container">Linked Areas:</div>');
        controls.append(areasContainer);
        this.linkedAreas = new JQW('<div id="linked_areas"></div>');
        areasContainer.append(this.linkedAreas);
        this.linkedAreas.hide();
        let areasButton = new JQW('<button>New Area</button>');
        areasContainer.append(areasButton);
        areasButton.click(() => {
            if (this.currentContaier !== undefined) {
                let newInd = SongManager.getCurrentPack().addLinkedArea();
                this.addLinkedArea(newInd);
                this.linkedAreas.show();
            }
        });
    }
    /** clear add the data and hide this element */
    clearData() {
        this.currentContaier = undefined;
        this.currentSound = undefined;
        this.containerLocation = undefined;
        this.pitchContainer.empty();
        this.loop.removeClass('true');
        this.holdToPlay.removeClass('true');
        this.quaternize.html('Quaternize:');
        this.linkedAreas.empty();
        this.pitches = [];
        this.asElement().hide();
    }
    /** called when the delete key is pressed. If possible, delete the selected pitch in the selected container */
    deleteKey() {
        if (this.currentSound !== undefined) {
            this.pitches[this.currentSound].asElement().remove();
            this.pitches.splice(this.currentSound, 1);
            this.currentContaier.removePitch(this.currentSound);
            if (this.currentContaier.getPitches().length === 0) {
                SongManager.getCurrentPack().removeContainer(this.containerLocation);
                Creator.getInstance().removedKey(this.containerLocation);
                this.clearData();
                return true;
            }
        }
        return false;
    }
    /** inspect the given container and show this element */
    inspectContainer(loc) {
        this.asElement().show();
        this.containerLocation = loc;
        this.currentContaier = SongManager.getCurrentPack().getContainer(this.containerLocation);
        this.pitchContainer.empty();
        this.pitches = [];
        for (let i = 0; i < this.currentContaier.getPitches().length; i++) {
            let pitchElement = new PitchElement(i, this.currentContaier.getPitches()[i].getLoc());
            this.pitches.push(pitchElement);
            pitchElement.asElement().click(() => {
                this.currentSound = pitchElement.getInd();
                Toolbar.getInstance().inspectSound(this.currentContaier.getPitches()[pitchElement.getInd()], pitchElement, true, true);
            });
            if (i === 0) {
                pitchElement.asElement().click();
            }
            this.pitchContainer.append(pitchElement.asElement());
        }
        let lnkdAreas = SongManager.getCurrentPack().getLinkedAreas();
        this.linkedAreas.empty();
        this.linkedAreas.hide();
        if (lnkdAreas.length > 0) {
            this.linkedAreas.show();
        }
        for (let i = 0; i < lnkdAreas.length; i++) {
            let area = this.addLinkedArea(i);
            for (let j = 0; j < lnkdAreas[i].length; j++) {
                if (lnkdAreas[i][j] === this.containerLocation) {
                    area.addClass('in_area');
                }
            }
        }
        if (this.currentContaier.getLoop())
            this.loop.addClass('true');
        else
            this.loop.removeClass('true');
        if (this.currentContaier.getHoldToPlay())
            this.holdToPlay.addClass('true');
        else
            this.holdToPlay.removeClass('true');
        this.quaternize.html('Quaternize: ' + this.currentContaier.getQuaternize());
    }
    addLinkedArea(ind) {
        let area = new JQW('<span>' + ind + '</span>');
        this.linkedAreas.append(area);
        area.mouseenter(() => {
            for (let i = 0; i < SongManager.getCurrentPack().getLinkedAreas()[ind].length; i++) {
                Creator.getInstance().getKey(SongManager.getCurrentPack().getLinkedAreas()[ind][i]).setCSS({ 'color': ContainerTools.LINKED_AREA_KEY_HIGHLIGHT });
            }
        });
        area.mouseleave(() => {
            for (let i = 0; i < SongManager.getCurrentPack().getLinkedAreas()[ind].length; i++) {
                Creator.getInstance().getKey(SongManager.getCurrentPack().getLinkedAreas()[ind][i]).setCSS({ 'color': '' });
            }
        });
        area.click(() => {
            if (area.hasClass('in_area')) {
                area.removeClass('in_area');
                SongManager.getCurrentPack().removeFromLinkedArea(ind, this.containerLocation);
                Creator.getInstance().getKey(this.containerLocation).setCSS({ 'color': '' });
            }
            else {
                area.addClass('in_area');
                SongManager.getCurrentPack().addToLinkedArea(ind, this.containerLocation);
                Creator.getInstance().getKey(this.containerLocation).setCSS({ 'color': ContainerTools.LINKED_AREA_KEY_HIGHLIGHT });
            }
        });
        return area;
    }
}
ContainerTools.LINKED_AREA_KEY_HIGHLIGHT = 'rgb(100,220,220)';
/**
 * a simple element that is an alias for the pitches in the pitch container
 */
class PitchElement extends DomElement {
    constructor(ind, loc) {
        super(new JQW('<div class="pitch">' + loc + '</div>'));
        this.ind = ind;
    }
    getInd() {
        return this.ind;
    }
}
class SongTools extends DomElement {
    constructor() {
        super(new JQW('<div id="song-tools" class="horizontal-column"></div>'));
        let loadButton = new JQW('<button>Load Song</button>');
        this.asElement().append(loadButton);
        loadButton.click(() => {
            SongManager.getInstance().loadSong('songs/eq.min.json', () => {
                Creator.getInstance().loadedSong();
                Toolbar.getInstance().updateSong();
            });
        });
        let saveButton = new JQW('<button>Save Song</button>');
        this.asElement().append(saveButton);
        saveButton.click(() => {
            let song = SongManager.getInstance().constructJSON();
            console.log(JSON.stringify(song));
        });
        let loadZipButton = new JQW('<button>Load Zip</button>');
        this.asElement().append(loadZipButton);
        loadZipButton.click(() => {
            // load eq.zip into the file manager
            // TODO expand to file chooser
            ZipHandler.requestZipLoad('eq.zip', () => {
                console.log('loaded eq.zip');
            });
        });
        let ddForm = new JQW('<div><label>Keyboard Type:</label></div>');
        this.asElement().append(ddForm);
        this.songTypeSelect = new JQW(`<select>
                                    <option value="STANDARD">Standard</option>
                                    <option value="SQUARE">Square</option>
                                    <option value="DOUBLE">Double</option>
                                   </select>`);
        ddForm.append(this.songTypeSelect);
        let nameForm = new JQW('<div><label>Name:</label></div>');
        this.asElement().append(nameForm);
        this.songName = new JQW('<input>');
        nameForm.append(this.songName);
        this.songName.focus(() => {
            InputEventPropegator.pullFocus();
        });
        this.songName.blur(() => {
            InputEventPropegator.blur();
            if (this.songName.getDomObj().value !== '')
                SongManager.getSong().setName(this.songName.getDomObj().value);
        });
        let bpmForm = new JQW('<div><label>BPM:</label></div>');
        this.asElement().append(bpmForm);
        this.songBPMS = new JQW('<input type="number" min="1" max="300">');
        bpmForm.append(this.songBPMS);
        this.songBPMS.focus(() => {
            InputEventPropegator.pullFocus();
        });
        this.songBPMS.blur(() => {
            InputEventPropegator.blur();
            if (this.songBPMS.getDomObj().value !== '')
                SongManager.getSong().setBPM(parseInt(this.songBPMS.getDomObj().value));
        });
        // TODO choose keyboard type
    }
    enterPress() {
        this.songName.blur();
        this.songBPMS.blur();
    }
    updateSong() {
        this.songName.getDomObj().value = SongManager.getSong().getName();
        this.songBPMS.getDomObj().value = SongManager.getSong().getBPM();
    }
}
/**
 * a class to draw a sound's waveform and provide
 * a simple editor to adjust the sounds in and out points
 */
class DrawSound extends DomElement {
    // create a new waveform container with in and out buttons
    constructor() {
        super(new JQW('<div class="waveform"></div>'));
        this.inTime = 0;
        this.outTime = 0;
        // pixels per sample
        this.scale = 0.08;
        this.offset = 0;
        this.padding = 20;
        // the position of the cursor in seconds
        this.cursorAt = 0;
        // the next start position of the sound
        this.nextPos = 0;
        this.mousedown = false;
        let canvasElement = new JQW(`<canvas class="waveform-canvas" width="10" height="10">
                                   Your Browser Does Not Support The Canvas Element
                                 </canvas>`);
        this.asElement().append(canvasElement);
        this.canvas = canvasElement.getDomObj();
        // TODO investigate
        // this.asElement().css({
        //   'overflow-x': 'hidden',
        //   'overflow-y': 'hidden'
        // });
        // create the set points buttons and listeners
        let setPoints = new JQW('<div style="display: inline-block;"></div>');
        this.asElement().append(setPoints);
        // set up the setIn and setOut buttons
        this.setIn = new JQW('<button>Set in point</button>');
        this.setOut = new JQW('<button>Set out point</button>');
        setPoints.append(this.setIn);
        setPoints.append(this.setOut);
        // stop mouse down event propegating to parent element
        this.setIn.mousedown(() => {
            return false;
        });
        // stop mouse down event propegating to parent element
        this.setOut.mousedown(() => {
            return false;
        });
        this.setIn.click(() => {
            if (this.currentSound && this.cursorAt < this.outTime) {
                this.inTime = this.cursorAt;
                this.setSprite();
            }
        });
        this.setOut.click(() => {
            if (this.currentSound && this.cursorAt > this.inTime) {
                this.outTime = this.cursorAt;
                this.setSprite();
            }
        });
        // set scrubbing listeners
        this.asElement().mousedown((e) => {
            this.setNextPos(e.pageX);
            this.mousedown = true;
        });
        this.asElement().mousemove((e) => {
            if (this.mousedown)
                this.setNextPos(e.pageX);
        });
        this.asElement().mouseup((e) => {
            this.mousedown = false;
        });
        this.asElement().mouseleave((e) => {
            this.mousedown = false;
        });
        // set scale and scroll listeners
        this.canvas.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                this.offset -= e.deltaX;
            }
            else {
                let prevScale = this.scale;
                this.scale -= e.deltaY / (500 / this.scale);
                this.offset = e.offsetX - ((this.scale / prevScale) * (e.offsetX - this.offset));
            }
            // clamp scale and offset, offset depends on scale
            this.scale = Math.min(Math.max(this.scale, (this.canvas.width - this.padding * 2) / this.ch1.length), 0.33);
            this.offset = Math.min(Math.max(this.offset, -this.ch1.length * this.scale + this.canvas.width - this.padding), this.padding);
            e.preventDefault();
            return false;
        });
        this.offset = this.padding;
    }
    /**
     * set the sound to be inspected.
     * @param sound the sound to inspect
     * @param enableInOut optinally enable/disable the in out controls
     * @param buffer optionally provide the audio buffer to remove duplication of work
     */
    setSound(sound, enableInOut, buffer) {
        if (enableInOut) {
            this.setIn.getJQ().prop('disabled', false);
            this.setOut.getJQ().prop('disabled', false);
        }
        else {
            this.setIn.getJQ().prop('disabled', true);
            this.setOut.getJQ().prop('disabled', true);
        }
        if (this.currentSound !== undefined)
            this.currentSound.stop();
        // initialize the canvas and context
        if (this.ctx === undefined) {
            this.canvas.width = Math.floor(this.asElement().width());
            this.canvas.height = this.asElement().height();
            this.ctx = this.canvas.getContext('2d');
        }
        this.currentSound = sound;
        if (buffer !== undefined) {
            this.setBufferedSoundElements(buffer);
        }
        else {
            let raw = this.currentSound.getSrc();
            raw = raw.substring(SoundUtils.mp3Meta64.length, raw.length);
            // convert the base64 data to a byte array
            let data = SoundUtils.base64ToArrayBuffer(raw);
            // decode the byte array and draw the stero waveform onto the canvas
            AudioTools.audioContext.decodeAudioData(data, (buffer) => {
                this.setBufferedSoundElements(buffer);
            });
        }
    }
    /**
     * clear the data in this object and hide this element
     */
    clearData() {
        if (this.refreshInterval)
            clearInterval(this.refreshInterval);
        if (this.ctx !== undefined)
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ch1 = undefined;
        this.ch2 = undefined;
        if (this.currentSound !== undefined)
            this.currentSound.stop();
        this.currentSound = undefined;
    }
    /**
     * set the in time of the sound to the given time
     * @param time the time in seconds to set in time to
     */
    setInTime(time) {
        this.inTime = time;
        this.setSprite();
    }
    /**
     * set the out time of the sound to the given time
     * @param time the time in seconds to set out time to
     */
    setOutTime(time) {
        this.outTime = time;
        this.setSprite();
    }
    /**
     * initialize variables from the current buffer
     * @param buffer the current buffer being inspected
     */
    setBufferedSoundElements(buffer) {
        // setup the channels
        this.ch1 = buffer.getChannelData(0);
        this.ch2 = buffer.getChannelData(1);
        this.sampleRate = buffer.sampleRate;
        this.nextPos = 0;
        // try to get the endpoints from the sound array
        let arr = this.currentSound.toArr();
        if (arr.length > 1) {
            this.inTime = arr[1] / 1000;
            this.outTime = arr[2] / 1000;
        }
        else {
            this.inTime = 0;
            this.outTime = buffer.duration;
        }
        // initialize the scale
        this.scale = (this.canvas.width - this.padding * 2) / this.ch1.length;
        this.refreshInterval = setInterval(() => {
            this.refreshCanvas();
        }, 25);
    }
    /**
     * called when the space bar is pressed
     * and the inspector is in the current mode
     */
    pressSpace() {
        // make sure that there is a sound
        if (this.currentSound) {
            // if the sound is playing
            if (this.currentSound.playing()) {
                this.currentSound.pause();
                this.nextPos = this.currentSound.seek() - this.inTime;
            }
            else {
                this.currentSound.play();
                this.currentSound.seek(this.nextPos + this.inTime);
                this.nextPos = 0;
            }
        }
    }
    /**
     * set the sample sprite for the sound to the current in and out points
     */
    setSprite() {
        this.currentSound.editSprite(this.inTime * 1000, this.outTime * 1000);
        this.nextPos = 0;
    }
    /**
     * set the next playback position based on the mouse position
     */
    setNextPos(mouseX) {
        if (this.currentSound) {
            this.currentSound.pause();
            this.nextPos = (mouseX - this.offset - this.asElement().offset().left) / this.scale / this.sampleRate;
            if (this.nextPos < 0)
                this.nextPos = 0;
            if (this.nextPos > this.currentSound.duration())
                this.nextPos = this.currentSound.duration();
            this.nextPos -= this.inTime;
        }
    }
    /**
     * refresh the canvas with the two channels
     */
    refreshCanvas() {
        this.ctx.fillStyle = 'black';
        // compute the scales
        let yScale = this.canvas.height / 4;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let start = Math.floor(-this.offset / (this.scale));
        let end = Math.ceil((this.canvas.width - this.offset) / this.scale);
        let constance = 5;
        let interval = Math.ceil((end - start) / (1000 * constance)) * constance;
        start = Math.floor(start / interval) * interval;
        if (this.ch1) {
            // draw first channel
            this.ctx.beginPath();
            this.ctx.moveTo(0, yScale);
            if (this.offset > 0)
                this.ctx.lineTo(this.offset, yScale);
            for (let i = start; i < end; i += interval) {
                this.ctx.lineTo(this.offset + i * this.scale, (this.ch1[i] + 1) * yScale);
            }
            if (this.offset + this.ch1.length * this.scale - this.canvas.width < 0)
                this.ctx.lineTo(this.offset + this.ch1.length * this.scale, yScale);
            this.ctx.lineTo(this.canvas.width, yScale);
            this.ctx.stroke();
            // draw second channel
            this.ctx.beginPath();
            this.ctx.moveTo(0, yScale * 3);
            if (this.offset > 0)
                this.ctx.lineTo(this.offset, yScale * 3);
            for (let i = start; i < end; i += interval) {
                this.ctx.lineTo(this.offset + i * this.scale, (this.ch2[i] + 3) * yScale);
            }
            if (this.offset + this.ch1.length * this.scale - this.canvas.width < 0)
                this.ctx.lineTo(this.offset + this.ch1.length * this.scale, yScale * 3);
            this.ctx.lineTo(this.canvas.width, yScale * 3);
            this.ctx.stroke();
            this.cursorAt = (this.currentSound.playing() ? this.currentSound.seek() : this.nextPos + this.inTime);
            this.drawCursorAtTime(this.cursorAt, 0);
            this.ctx.fillStyle = 'blue';
            this.drawCursorAtTime(this.inTime, 6);
            this.drawCursorAtTime(this.outTime, 6);
        }
    }
    /**
     * draw a cursor at the given time. Will scale x to pixels
     */
    drawCursorAtTime(x, padding) {
        // seconds * samples per second * pixels per sample
        this.ctx.fillRect((x * this.sampleRate * this.scale) + this.offset - 1, padding, 2, this.canvas.height - padding * 2);
    }
}
/// <reference path="./draw-sound.ts"/>
class SoundTools extends DomElement {
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
    inspectSound(sound, inOutControls) {
        this.asElement().show();
        this.waveform.setSound(sound, inOutControls);
        this.nameElement.html(sound.getLoc());
    }
    /**
     * clear the data in this object and hide this element
     */
    clearData() {
        this.waveform.clearData();
        this.asElement().hide();
    }
    /**
     * called when the space bar is pressed
     * and the inspector is in the current mode
     */
    pressSpace() {
        this.waveform.pressSpace();
    }
}
/// <reference path="./container-tools.ts"/>
/// <reference path="./song-tools.ts"/>
/// <reference path="./sound-tools.ts"/>
/**
 * A gui class for inspecting a sound file
 */
class Toolbar extends DomElement {
    /**
     * @return the singleton instance of this class
     */
    static getInstance() {
        if (Toolbar.instance === undefined) {
            Toolbar.instance = new Toolbar();
        }
        return Toolbar.instance;
    }
    constructor() {
        super(new JQW('<div id="toolbar"></div>'));
        this.songTools = new SongTools();
        this.asElement().append(this.songTools.asElement());
        this.containerTools = new ContainerTools();
        this.asElement().append(this.containerTools.asElement());
        this.soundTools = new SoundTools();
        this.asElement().append(this.soundTools.asElement());
        this.soundTools.asElement().hide();
        this.containerTools.asElement().hide();
        this.prevHighlight = [];
    }
    updateSong() {
        this.songTools.updateSong();
    }
    switchedSoundPack() {
        this.containerTools.clearData();
        if (this.prevHighlight.length > 1)
            this.soundTools.clearData();
        this.controlHighlight(undefined, false);
    }
    /** determine the key press action based on the keycode */
    keyPress(keyCode) {
        if (keyCode === 32) {
            this.soundTools.pressSpace();
        }
        else if (keyCode === 8) {
            if (this.containerTools.deleteKey()) {
                this.soundTools.clearData();
                this.controlHighlight(undefined, false);
            }
        }
    }
    focusedKeyPress(keyCode) {
        if (keyCode === 13) {
            this.songTools.enterPress();
        }
    }
    /**
     * inspect the given sound and highlight the given element
     * @param sound the sound to inspect
     * @param element the DomElement to highlight indicating that it is being inspected
     * @param inOutControls if true, disable the set in and set out controls
     * @param fromContainerTools an internal flag that should only be set to true
     *        if this inspect request is coming from the container tools class
     */
    inspectSound(sound, element, inOutControls, fromContainerTools) {
        if (fromContainerTools === undefined || !fromContainerTools) {
            this.containerTools.clearData();
            this.controlHighlight(element, false);
        }
        else {
            this.controlHighlight(element, true);
        }
        this.soundTools.inspectSound(sound, inOutControls);
    }
    /** inspect the given container */
    inspectContainer(key) {
        let loc = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
        this.controlHighlight(key, false);
        this.soundTools.clearData();
        this.containerTools.inspectContainer(loc);
    }
    /**
     * control the highlighting effect.
     * @param newHighlight the new element to highlight; if undefined, clear highlighting
     * @param keepOld if true, don't clear the old highlighted element
     */
    controlHighlight(newHighlight, keepOld) {
        // unhighlight old element if allowed
        if (this.prevHighlight.length > 0 && !keepOld) {
            for (let elem of this.prevHighlight) {
                if (elem instanceof KeyboardKey) {
                    elem.removeHighlight();
                }
                else {
                    elem.asElement().removeClass('highlight');
                }
            }
            this.prevHighlight = [];
        }
        else if (this.prevHighlight.length === 2) {
            this.prevHighlight.pop().asElement().removeClass('highlight');
        }
        // add the new highlight element to the queue
        if (newHighlight !== undefined) {
            if (newHighlight instanceof KeyboardKey) {
                newHighlight.highlight();
            }
            else {
                newHighlight.asElement().addClass('highlight');
            }
            this.prevHighlight.push(newHighlight);
        }
    }
}
/**
 * a selective key and mouse event propegator
 */
class InputEventPropegator {
    /**
     * initialize the propegtor
     */
    static init() {
        InputEventPropegator.initKeyMaps();
        InputEventPropegator.pulledFocus = false;
    }
    static pullFocus() {
        InputEventPropegator.pulledFocus = true;
    }
    static blur() {
        InputEventPropegator.pulledFocus = false;
    }
    static allowInput(event) {
        return !event.metaKey && !event.ctrlKey && !InputEventPropegator.pulledFocus;
    }
    // TODO
    static switchedSoundPack() {
        switch (ModeHandler.getMode()) {
            case 0 /* KEYBOARD */:
                break;
            case 2 /* CREATOR */:
                Creator.getInstance().updateMapToGUI(false);
                Toolbar.getInstance().switchedSoundPack();
                break;
        }
    }
    /**
     * initialize the key event listeners and mode callback events
     */
    static initKeyMaps() {
        (new JQW('body')).keydown((event) => {
            if (InputEventPropegator.allowInput(event)) {
                switch (ModeHandler.getMode()) {
                    case 0 /* KEYBOARD */:
                        KeyboardLayout.getInstance().getKeyboard().keyDown(event.keyCode);
                        return false;
                    case 2 /* CREATOR */:
                        Creator.getInstance().keyDown(event.keyCode);
                        return false;
                    case 3 /* SPLITTER */:
                        Splitter.getInstance().keyDown(event.keyCode);
                        return false;
                    case 1 /* EDITOR */:
                        Editor.getInstance().keyDown(event.keyCode);
                        return false;
                }
            }
            else if (InputEventPropegator.pulledFocus) {
                Toolbar.getInstance().focusedKeyPress(event.keyCode);
            }
        });
        (new JQW('body')).keyup((event) => {
            if (InputEventPropegator.allowInput(event)) {
                switch (ModeHandler.getMode()) {
                    case 0 /* KEYBOARD */:
                        KeyboardLayout.getInstance().getKeyboard().keyUp(event.keyCode);
                        return false;
                    case 2 /* CREATOR */:
                        Creator.getInstance().keyUp(event.keyCode);
                        return false;
                    case 1 /* EDITOR */:
                        Editor.getInstance().keyUp(event.keyCode);
                        return false;
                }
            }
        });
    }
}
/// <reference path="./sound-container.ts"/>
/**
 * the soundpack class that contains the sound containers for this sound pack
 */
class SoundPack {
    constructor() {
        this.sounds = {};
        this.linkedAreas = [];
    }
    /**
     * @return the array representation of the sound containers in this sound pack
     */
    getContainersStruct() {
        let containers = [];
        for (let loc in this.sounds) {
            containers.push([
                parseInt(loc),
                this.sounds[loc].getPitchLocations(),
                this.sounds[loc].getHoldToPlay(),
                this.sounds[loc].getQuaternize(),
                this.sounds[loc].getLoop()
            ]);
        }
        return containers;
    }
    /** @return the location-container map for this sound pack */
    getContainers() {
        return this.sounds;
    }
    /** @return the linked areas for this soundpack */
    getLinkedAreas() {
        return this.linkedAreas;
    }
    /** called when this soundpack receives a press event at the given location */
    // TODO added linked area logic
    pressed(loc) {
        let container = this.sounds[loc];
        if (container) {
            container.pressed();
        }
        // loop through all of the linked areas
        for (let i = 0; i < this.linkedAreas.length; i++) {
            for (let j = 0; j < this.linkedAreas[i].length; j++) {
                // if the i'th linked area contains the pressed location
                if (this.linkedAreas[i][j] === loc) {
                    // loop over the i'th linked area and stop all other tracks
                    for (j = 0; j < this.linkedAreas[i].length; j++) {
                        if (this.linkedAreas[i][j] !== loc) {
                            let stopContainer = this.sounds[this.linkedAreas[i][j]];
                            if (stopContainer) {
                                stopContainer.stop();
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
    /** called when this soundpack receives a release event at the given location */
    released(loc) {
        let container = this.sounds[loc];
        if (container) {
            container.released();
        }
    }
    /**
     * add a linked area and return the linked area index
     */
    addLinkedArea() {
        this.linkedAreas.push([]);
        return this.linkedAreas.length - 1;
    }
    /**
     * add the given location to the given linked area
     */
    addToLinkedArea(area, location) {
        this.linkedAreas[area].push(location);
    }
    /**
     * remove the given location from the given linked area
     */
    removeFromLinkedArea(area, location) {
        for (let i = 0; i < this.linkedAreas[area].length; i++) {
            if (this.linkedAreas[area][i] === location) {
                this.linkedAreas[area].splice(i, 1);
                break;
            }
        }
    }
    /**
     * set the map from the given location to the given sound container
     */
    setContainer(container, loc) {
        this.sounds[loc] = container;
    }
    /**
     * @return the sound container at the given location
     */
    getContainer(loc) {
        return this.sounds[loc];
    }
    getLocationLinkedAreas(loc) {
        let ret = [];
        for (let i = 0; i < this.linkedAreas.length; i++) {
            for (let j = 0; j < this.linkedAreas[i].length; j++) {
                if (this.linkedAreas[i][j] === loc) {
                    ret.push(i);
                }
            }
        }
        return ret;
    }
    /** removes the container at the given location */
    removeContainer(loc) {
        delete this.sounds[loc];
        // remove the linked areas
        let areas = this.getLocationLinkedAreas(loc);
        for (let i = 0; i < areas.length; i++) {
            SongManager.getCurrentPack().removeFromLinkedArea(areas[i], loc);
        }
        return areas;
    }
}
/// <reference path="./soundpack.ts"/>
/**
 * a class that represents a song
 */
class Song {
    constructor(type) {
        this.keyboardType = type;
        this.soundPacks = [];
        // default bpm
        this.bpms = [[140, 0]];
        this.name = 'Untitled';
        this.files = [];
    }
    /**
     * @return the json representaion of this song
     */
    constructJSON() {
        return {
            name: this.name,
            bpms: this.bpms,
            files: this.files,
            keyboard_type: KeyboardUtils.keyboardTypeToString(this.keyboardType),
            container_settings: this.getContainerSettings(),
            linked_areas: this.getLinkedAreas(),
            colors: null
        };
    }
    // get the container settings for the song json
    getContainerSettings() {
        let ret = [];
        for (let i = 0; i < this.soundPacks.length; i++) {
            ret.push(this.soundPacks[i].getContainersStruct());
        }
        return ret;
    }
    /** @return the keyboard type of this song */
    getBoardType() {
        return this.keyboardType;
    }
    // get the lined areas for the song json
    getLinkedAreas() {
        let ret = [];
        for (let i = 0; i < this.soundPacks.length; i++) {
            ret.push(this.soundPacks[i].getLinkedAreas());
        }
        return ret;
    }
    getName() {
        return this.name;
    }
    setName(value) {
        this.name = value;
    }
    getBPM() {
        return this.bpms[0][0];
    }
    setBPM(value) {
        this.bpms[0][0] = value;
    }
    /**
     * add a sound pack to this song at the end of the sound pack array
     */
    addPack() {
        this.soundPacks.push(new SoundPack());
    }
    /** @return the number of sound packs in the song */
    getNumPacks() {
        return this.soundPacks.length;
    }
    /**
     * @return the soundpack at the given location. May return undefined.
     */
    getPack(pack) {
        return this.soundPacks[pack];
    }
    /** set the sound container in the given pack at the given location */
    setContainer(pack, location, container) {
        if (pack >= 0 && pack < this.soundPacks.length) {
            this.soundPacks[pack].setContainer(container, location);
        }
    }
    /**
     * add the given sound to the given pack at the given location.
     * Will create a container if none exists at the given location in the given pack
     */
    addSound(pack, location, file) {
        // verify pack correctness
        if (pack >= 0 && pack < this.soundPacks.length) {
            // if the container does not yet exist, create it
            let container = this.soundPacks[pack].getContainer(location);
            if (container === undefined) {
                container = new SoundContainer();
                this.soundPacks[pack].setContainer(container, location);
            }
            container.addPitch(file);
            // get root file
            let rootFile = FileManager.getInstance().getRootLocation(file.getLoc().substring(0, file.getLoc().indexOf('/')));
            // add the root file to the song files array if it is not already in it
            if (this.files.length === 0) {
                this.files.push(rootFile);
            }
            else {
                for (let i = 0; i < this.files.length; i++) {
                    if (this.files[i] === rootFile) {
                        break;
                    }
                    if (i === this.files.length - 1) {
                        this.files.push(rootFile);
                    }
                }
            }
        }
        else {
            collectErrorMessage('Pack does not exists, ' + pack);
        }
    }
    /**
     * load a song from a file source using ajax. Call the callback function when done
     */
    loadFromSource(location, callback) {
        $.getJSON(location, (data) => {
            this.loadSounds(data.files, () => {
                this.loadData(data);
                callback();
            });
        });
    }
    /**
     * load all of the sounds from the given list of urls. Call the callback when done loading the sounds
     */
    loadSounds(urls, callback) {
        let i = 0;
        let nextUrl = () => {
            i++;
            if (i >= urls.length) {
                console.log('Finished loading sounds');
                callback();
                return;
            }
            ZipHandler.requestZipLoad(urls[i], nextUrl);
        };
        ZipHandler.requestZipLoad(urls[i], nextUrl);
    }
    /**
     * load the song data from the given json data
     */
    loadData(songData) {
        // load song variables
        this.bpms = songData['bpms'];
        this.name = songData['name'];
        this.files = songData['files'];
        this.keyboardType = KeyboardUtils.keyboardStringToType(songData['keyboard_type'].toUpperCase());
        // load the soundpacks
        for (let i = 0; i < songData['container_settings'].length; i++) {
            this.soundPacks.push(new SoundPack());
            // load the containers in the given soundpack
            for (let j = 0; j < songData['container_settings'][i].length; j++) {
                let data = songData['container_settings'][i][j];
                // format: location, pitches, hold to play, quaternize, loop
                let container = new SoundContainer(data[2], data[3], data[4]);
                // pitches format: [location, start time, end time]
                let pitches = data[1];
                for (let i = 0; i < pitches.length; i++) {
                    // TODO verify correctness
                    let loc = pitches[i][0];
                    let baseDir = loc.substring(0, loc.indexOf('/'));
                    let fileLocation = loc.substring(loc.indexOf('/') + 1, loc.length);
                    container.addPitch(FileManager.getInstance().getSound(baseDir, fileLocation), pitches[i][1], pitches[i][2]);
                }
                this.soundPacks[i].setContainer(container, data[0]);
            }
            // add the linked areas for this sound pack
            let linkedArea = songData['linked_areas'][i];
            for (let j = 0; j < linkedArea.length; j++) {
                let linkedNum = this.soundPacks[i].addLinkedArea();
                for (let k = 0; k < linkedArea[j].length; k++) {
                    this.soundPacks[i].addToLinkedArea(linkedNum, linkedArea[j][k]);
                }
            }
        }
    }
}
/// <reference path="./song.ts"/>
/// <reference path="./song-struct.ts"/>
/**
 * a song manager class that provides a singleton interface to the current song
 */
class SongManager {
    /**
     *  @return the singleton instance of this class
     */
    static getInstance() {
        if (SongManager.instance === undefined) {
            SongManager.instance = new SongManager();
        }
        return SongManager.instance;
    }
    constructor() {
        this.currentSoundPack = 0;
    }
    /**
     * @return the json structure of the current song
     */
    constructJSON() {
        return this.song.constructJSON();
    }
    /**
     * create a new song
     */
    newSong(type) {
        // TODO check for save
        this.song = new Song(type);
        this.currentSoundPack = 0;
    }
    /**
     * load a song and set it to the current song.
     * @param location the location of the song
     * @param callback the callback function for when the song is finished loading
     */
    loadSong(location, callback) {
        this.song = new Song(KeyBoardType.STANDARD);
        this.currentSoundPack = 0;
        this.song.loadFromSource(location, callback);
    }
    /** @return the current song */
    static getSong() {
        return SongManager.getInstance().song;
    }
    /** @return the current soundpack */
    static getCurrentPack() {
        return SongManager.getInstance().song.getPack(SongManager.getInstance().currentSoundPack);
    }
    /**
     * set the current soundpack
     * @param pack the pack index to set as the current sound pack
     */
    setSoundPack(pack) {
        this.currentSoundPack = pack;
    }
    /** @return the current sound pack index */
    getCurrentSoundPack() {
        return this.currentSoundPack;
    }
    /**
     * called from a keyboard when a key is pressed at the given location
     */
    pressedKey(location) {
        if (this.song) {
            let pack = this.song.getPack(this.currentSoundPack);
            if (pack) {
                pack.pressed(location);
            }
        }
    }
    /**
     * called from a keyboard when a key is released at the given location
     */
    releasedKey(location) {
        if (this.song) {
            let pack = this.song.getPack(this.currentSoundPack);
            if (pack) {
                pack.released(location);
            }
        }
    }
}
/**
 * a class to handle the different modes of the editor
 */
class ModeHandler {
    /**
     * Initialize the mode handler
     */
    static init() {
        Creator.getInstance().asElement().hide();
        KeyboardLayout.getInstance().asElement().hide();
        Splitter.getInstance().asElement().hide();
        Editor.getInstance().asElement().hide();
    }
    /**
     * @return the current mode
     */
    static getMode() {
        return ModeHandler.mode;
    }
    /**
     * set the mode and display the correct modules
     * @param mode the mode to set the app to
     */
    static setMode(mode) {
        if (mode !== ModeHandler.mode) {
            if (ModeHandler.mode !== undefined) {
                switch (ModeHandler.mode) {
                    case 0 /* KEYBOARD */:
                        KeyboardLayout.getInstance().asElement().hide();
                        break;
                    case 2 /* CREATOR */:
                        Creator.getInstance().asElement().hide();
                        break;
                    case 3 /* SPLITTER */:
                        Splitter.getInstance().asElement().hide();
                        break;
                    case 1 /* EDITOR */:
                        Editor.getInstance().asElement().hide();
                        break;
                }
            }
            switch (mode) {
                case 0 /* KEYBOARD */:
                    KeyboardLayout.getInstance().asElement().show();
                    break;
                case 2 /* CREATOR */:
                    Creator.getInstance().asElement().show();
                    break;
                case 3 /* SPLITTER */:
                    Splitter.getInstance().asElement().show();
                    break;
                case 1 /* EDITOR */:
                    Editor.getInstance().asElement().show();
                    break;
            }
            ModeHandler.mode = mode;
        }
    }
}
/**
 * a wrapper for the keyboard class that is a payload receiver
 */
class PayloadKeyboard extends PayloadReceiver {
    constructor(type, hook, keyHook) {
        super(new JQW('<div style="display: inline-block;"></div>'), hook);
        // allow transition = false because the payload needs 0 transition time for background color
        this.keyboard = new Keyboard(type, false, keyHook);
        this.asElement().append(this.keyboard.asElement());
    }
    /**
     * vertical center this keyboard
     */
    centerVertical() {
        this.asElement().addClass('vertical-align');
    }
    getKeyboard() {
        return this.keyboard;
    }
    /**
     * use the keyboard id to identify this object receiver
     * just because the payload receiver sometimes needs a way to identify the receiving object
     * @return the keyboard id
     */
    getObjectData() {
        return this.keyboard.getID();
    }
}
/**
 * handles the logic and hooks for the square reference keyboard
 */
class SquareKeyboard {
    constructor() {
        // TODO do correct processing of payload files
        // the hook for the keyboard, process the directory payload and update multiple files
        let squarePayloadFunc = (type, payload, objData) => {
            if (type === PayloadHookRequest.RECEIVED) {
                this.processPayload(payload);
            }
            else if (type === PayloadHookRequest.CAN_RECEIVE) {
                return payload instanceof Directory;
            }
            else if (type === PayloadHookRequest.IS_PAYLOAD) {
                return true;
            }
            return false;
        };
        // the hook for the keyboard keys, receives a sound file
        let keyHook = (type, payload, objData) => {
            if (type === PayloadHookRequest.RECEIVED) {
                if (payload instanceof Sound) {
                    PayloadAlias.getInstance().addSquareKey(objData, payload);
                    this.activateKey(objData);
                    objData.asElement().click();
                }
                else if (payload instanceof KeyboardKey) {
                    let sound = PayloadAlias.getInstance().getSquareKey(payload);
                    PayloadAlias.getInstance().addSquareKey(objData, sound);
                    this.activateKey(objData);
                    objData.asElement().click();
                }
                else
                    collectErrorMessage('Payload type does not match soundfile type in keyboard', payload);
            }
            else if (type === PayloadHookRequest.CAN_RECEIVE) {
                // can only recieve from this
                return payload instanceof Sound || (payload instanceof KeyboardKey &&
                    payload !== objData &&
                    payload.getKeyboard().getID() === this.getKeyboard().getID());
            }
            else if (type === PayloadHookRequest.IS_PAYLOAD) {
                return PayloadAlias.getInstance().getSquareKey(objData) !== undefined;
            }
            return false;
        };
        this.square = new PayloadKeyboard(KeyBoardType.SQUARE, squarePayloadFunc, keyHook);
        this.getKeyboard().resize(0.6);
        this.square.centerVertical();
        this.getKeyboard().setShowKeys(false);
        // add some spacing to the square
        this.square.asElement().css({ 'margin-right': '30px' });
        this.getKeyboard().setClickKeyListener((key) => {
            let sound = PayloadAlias.getInstance().getSquareKey(key);
            if (sound) {
                Toolbar.getInstance().inspectSound(sound, key, true);
            }
        });
        PayloadAlias.getInstance().registerSquareKeyboard(this.getKeyboard().getID());
        this.element = new JQW('<div class="horizontal-column"></div>');
        this.element.append(this.square.asElement());
    }
    /**
     * called when a directory payload is recieved
     */
    processPayload(payload) {
        PayloadAlias.getInstance().clear();
        this.resetGUI();
        if (payload instanceof Directory) {
            // find the lowest directory with a file, stop if no subdirectory
            let lowestDir = payload;
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
                    // get the sound file based on the name
                    let soundFile = lowestDir.getFile(sound);
                    let key = this.getKeyboard().getKey(r, c);
                    // add the key to the payload alias
                    PayloadAlias.getInstance().addSquareKey(key, soundFile);
                    // activate the key so that the gui reflects the Payload Alias
                    this.activateKey(key);
                }
            }
        }
        else {
            collectErrorMessage('Payload is not directory in keyboard');
        }
    }
    getKeyboard() {
        return this.square.getKeyboard();
    }
    getElement() {
        return this.element;
    }
    /** reset this keyboard gui */
    resetGUI() {
        this.getKeyboard().resetKeys();
    }
    /** set the key's background color to indicate it has a sound assigned to it */
    activateKey(key) {
        key.setDefaultColor(100, 255, 100);
    }
}
/**
 * a ripple function for a JQW.
 * TODO add functions to jquery wrapper
 */
function rippleElement(element) {
    let parent = element.getJQ();
    if (parent.find('.ink').length === 0) {
        parent.prepend('<span class="ink"></span>');
    }
    let ink = parent.find('.ink');
    // incase of quick double clicks stop the previous animation
    ink.removeClass('animate');
    // set size of .ink
    if (!ink.height() && !ink.width()) {
        // use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
        let d = Math.max(parent.outerWidth(), parent.outerHeight());
        ink.css({ height: d, width: d });
    }
    // set the position and add class .animate
    ink.css({ top: '-1px', left: '-1px' }).addClass('animate');
}
/// <reference path="./ripple.ts"/>
/**
 * handles the logic and hooks for the map to keyboard
 */
class MapToKeyboard {
    constructor(type) {
        // the hook for treating the keyboard as a payload receiver.
        // always returns false, so map to keyboard cannot receive payloads
        let maptoPayloadFunc = (type, payload, objData) => {
            return false;
        };
        // the hook for the map to keyboard keys, process the input payload
        let keyHook = (type, payload, objData) => {
            if (type === PayloadHookRequest.RECEIVED) {
                // process the payload and add the sound file represented by the payload to the current song
                if (payload instanceof Sound) {
                    PayloadAlias.getInstance().addSongKey(objData, payload);
                    this.showSoundActive(objData);
                    objData.asElement().click();
                }
                else if (payload instanceof KeyboardKey) {
                    this.setObjectFromKey(objData, payload);
                }
                else
                    collectErrorMessage('Payload type does not match soundfile or keyboard key in map to', payload);
            }
            else if (type === PayloadHookRequest.CAN_RECEIVE) {
                return payload instanceof Sound || payload instanceof KeyboardKey;
            }
            else if (type === PayloadHookRequest.IS_PAYLOAD) {
                // key can only be used as a payload if it has a sound applied to it
                return PayloadAlias.getInstance().getSongKey(objData) !== undefined;
            }
            return false;
        };
        this.mapTo = new PayloadKeyboard(type, maptoPayloadFunc, keyHook);
        this.mapTo.getKeyboard().setSoundPackSwitcher(SoundPackSwitcherType.ARROWS);
        this.mapTo.centerVertical();
        this.mapTo.getKeyboard().resize(0.6);
        PayloadAlias.getInstance().registerSongId(this.mapTo.getKeyboard().getID());
        // turn square green when there is a sound assigned to it on key up and mimic the usual keypress
        this.mapTo.getKeyboard().getColorManager().setRoutine((r, c, p) => {
            if (!p)
                rippleElement(this.mapTo.getKeyboard().getKey(r, c).asElement());
            return [{ row: r, col: c, r: p ? 255 : -1, g: p ? 160 : -1, b: p ? 0 : -1 }];
        });
        this.mapTo.getKeyboard().setClickKeyListener((key) => {
            let container = PayloadAlias.getInstance().getSongKey(key);
            if (container)
                Toolbar.getInstance().inspectContainer(key);
        });
        this.element = new JQW('<div class="horizontal-column"></div>');
        this.element.append(this.mapTo.asElement());
    }
    setObjectFromKey(objData, payload) {
        let sound = PayloadAlias.getInstance().getSquareKey(payload);
        if (sound) {
            PayloadAlias.getInstance().addSongKey(objData, sound);
            this.showSoundActive(objData);
            objData.asElement().click();
        }
        else {
            PayloadAlias.getInstance().addToMoveMap(payload, objData);
            payload.setDefaultColor();
        }
    }
    /**
     * set the color of the key at the given row and column to the active color
     * @param r the key row
     * @param c the key col
     */
    showSoundActive(key) {
        key.setDefaultColor(100, 255, 100);
    }
    /**
     * @return the map to keyboard element
     */
    getElement() {
        return this.element;
    }
    getKeyboard() {
        return this.mapTo.getKeyboard();
    }
    /** reset this keyboard gui */
    resetGUI() {
        this.getKeyboard().resetKeys();
    }
    /**
     * called when a container in the song is removed. Updates the GUI to reflect the change
     */
    removeKey(loc) {
        let gridLoc = KeyboardUtils.linearToGrid(loc, this.mapTo.getKeyboard().getNumCols());
        this.mapTo.getKeyboard().getKey(gridLoc[0], gridLoc[1]).setDefaultColor();
    }
}
/**
 * acts as a alias for the sounds and sound containers linked to the keyboard keys.
 * provides storage for the temporary square keyboard sounds
 * and provides an interface into the song's containers for the map to keyboard
 */
class PayloadAlias {
    static getInstance() {
        if (PayloadAlias.instance === undefined) {
            PayloadAlias.instance = new PayloadAlias();
        }
        return PayloadAlias.instance;
    }
    constructor() {
        this.keys = {};
        this.moveMap = [];
        DomEvents.addListener(MousePayload.FINISHED_POPPING_EVENT, () => {
            this.flushMap();
        });
    }
    clear() {
        this.keys = {};
        this.moveMap = [];
    }
    /**
     * register the square keyboard id. Must be done before any other actions
     */
    registerSquareKeyboard(id) {
        this.squareId = id;
    }
    /**
     * register the map to keyboard id. Must be done before any other actions
     */
    registerSongId(id) {
        this.songId = id;
    }
    /**
     * add a map from the key to the given sound.
     * Will only work if the key is in the square keyboard
     */
    addSquareKey(key, sound) {
        if (key.getKeyboard().getID() === this.squareId) {
            let location = KeyboardUtils.gridToLinear(key.getRow(), key.getCol(), key.getKeyboard().getNumCols());
            this.keys[location] = new Sound(sound, {});
        }
        else {
            collectErrorMessage('Error: key is not in square keyboard');
        }
    }
    /**
     * get the sound mapped to the given key if the key is on the square keyboard.
     * Else, return undefined
     */
    getSquareKey(key) {
        if (key.getKeyboard().getID() === this.squareId) {
            return this.keys[KeyboardUtils.getKeyLocation(key)];
        }
        else {
            return undefined;
        }
    }
    /**
     * add a map from the key to the given sound by adding the sound to the song.
     * Will only work if the key is in the map to keyboard
     */
    addSongKey(key, sound) {
        if (key.getKeyboard().getID() === this.songId) {
            SongManager.getSong().addSound(SongManager.getInstance().getCurrentSoundPack(), KeyboardUtils.getKeyLocation(key), sound);
        }
        else {
            collectErrorMessage('Error: key is not in map to keyboard');
        }
    }
    /**
     * add a map from the key to the given container by adding the container to the song.
     * Will only work if the key is in the map to keyboard
     */
    setSongContainer(key, container) {
        if (key.getKeyboard().getID() === this.songId) {
            SongManager.getSong().setContainer(SongManager.getInstance().getCurrentSoundPack(), KeyboardUtils.getKeyLocation(key), container);
        }
        else {
            collectErrorMessage('Error: key is not in map to keyboard');
        }
    }
    addToMoveMap(from, to) {
        if (from.getKeyboard().getID() === this.songId && to.getKeyboard().getID() === this.songId)
            this.moveMap.push({ to: to, from: from });
        else
            collectErrorMessage('Error: map from and to are not both from the map to keyboard');
    }
    flushMap() {
        let tempMap;
        tempMap = [];
        for (let i = 0; i < this.moveMap.length; i++) {
            let location = KeyboardUtils.getKeyLocation(this.moveMap[i].from);
            let container = SongManager.getCurrentPack().getContainer(location);
            let areas = SongManager.getCurrentPack().removeContainer(location);
            tempMap.push({ to: this.moveMap[i].to, container: container, areas: areas });
        }
        for (let i = 0; i < tempMap.length; i++) {
            let loc = KeyboardUtils.getKeyLocation(tempMap[i].to);
            SongManager.getCurrentPack().setContainer(tempMap[i].container, loc);
            for (let j = 0; j < tempMap[i].areas.length; j++) {
                SongManager.getCurrentPack().addToLinkedArea(tempMap[i].areas[j], loc);
            }
            tempMap[i].to.setDefaultColor(100, 255, 100);
            tempMap[i].to.asElement().click();
        }
        this.moveMap = [];
    }
    /**
     * get the container mapped to the given key if the key is on the map to keyboard.
     * Else, return undefined.
     */
    getSongKey(key) {
        if (key.getKeyboard().getID() === this.songId) {
            return SongManager.getCurrentPack().getContainer(KeyboardUtils.getKeyLocation(key));
        }
        else {
            return undefined;
        }
    }
}
// / <reference path="./drag-multi-payload.ts"/>
/** a drag selecting element to select keys on the square keyboard */
class DragSelector extends DomElement {
    constructor() {
        super(new JQW('<div id="drag_selector" style="z-index: 100;"></div>'));
        this.inX = 0;
        this.inY = 0;
        this.outX = 0;
        this.outY = 0;
        this.keys = [];
    }
    // private multiPayload: DragMultiPayload;
    static getInstance() {
        if (DragSelector.instance === undefined) {
            DragSelector.instance = new DragSelector();
        }
        return DragSelector.instance;
    }
    setParentOffsets(t, l) {
        this.offsetTop = t;
        this.offsetLeft = l;
    }
    setStartPoint(x, y) {
        this.inX = x;
        this.inY = y;
        this.outX = x;
        this.outY = y;
        this.setDims();
        this.clearPayload();
    }
    updateEndPoint(x, y) {
        this.outX = x;
        this.outY = y;
        this.setDims();
        this.setSelection();
    }
    setSelection() {
        // if the selection on the square keyboard got nothing, try the map to keyboard
        if (!this.testSelection(true)) {
            this.testSelection(false);
        }
    }
    testSelection(square) {
        let keyboard;
        if (square)
            keyboard = Creator.getInstance().getSquareKeyboard();
        else
            keyboard = Creator.getInstance().getMapToKeyboard();
        let boardDim = keyboard.asElement().getDomObj().getBoundingClientRect();
        let singleKey = keyboard.getKey(0, 0).asElement();
        let keyMargin = parseInt(singleKey.css('margin'));
        let keyDim = singleKey.getDomObj().getBoundingClientRect();
        let keyWidth = keyDim.width + keyMargin * 2;
        let keyHeight = keyDim.height + keyMargin * 2;
        let colStart = Math.floor((this.x + this.offsetLeft - boardDim.left + keyMargin) / keyWidth);
        if (colStart < 0)
            colStart = 0;
        let rowStart = Math.floor((this.y + this.offsetTop - boardDim.top + keyMargin) / keyHeight);
        if (rowStart < 0)
            rowStart = 0;
        let colEnd = Math.floor((this.x + this.width + this.offsetLeft - boardDim.left - keyMargin) / keyWidth);
        if (colEnd >= keyboard.getNumCols())
            colEnd = keyboard.getNumCols() - 1;
        let rowEnd = Math.floor((this.y + this.height + this.offsetTop - boardDim.top - keyMargin) / keyHeight);
        if (rowEnd >= keyboard.getNumRows())
            rowEnd = keyboard.getNumRows() - 1;
        if (colStart <= colEnd && rowStart <= rowEnd) {
            let maxRows = square ? DragSelector.MAX_ROWS : keyboard.getNumRows();
            let maxCols = square ? DragSelector.MAX_COLS : keyboard.getNumCols();
            if (colEnd - colStart >= maxCols)
                colEnd = colStart + maxCols - 1;
            if (rowEnd - rowStart >= maxRows)
                rowEnd = rowStart + maxRows - 1;
            this.clearPayload();
            for (let r = rowStart; r <= rowEnd; r++) {
                for (let c = colStart; c <= colEnd; c++) {
                    let key = keyboard.getKey(r, c);
                    if (key.canBePayload()) {
                        this.keys.push(key);
                        key.highlight();
                    }
                }
            }
            return true;
        }
        else {
            this.clearPayload();
        }
        return false;
    }
    clearPayload() {
        for (let i = 0; i < this.keys.length; i++)
            this.keys[i].removeHighlight();
        this.keys = [];
    }
    setDims() {
        this.x = this.inX;
        this.y = this.inY;
        this.width = this.outX - this.inX;
        this.height = this.outY - this.inY;
        if (this.width < 0) {
            this.x = this.outX;
            this.width *= -1;
        }
        if (this.height < 0) {
            this.y = this.outY;
            this.height *= -1;
        }
        this.asElement().css({
            'top': this.y + 'px',
            'left': this.x + 'px',
            'height': this.height + 'px',
            'width': this.width + 'px'
        });
    }
    pressedKey(key) {
        console.log('TODO: delete');
        if (key === 8 && this.keys.length > 0) {
            MousePayload.clearData();
            // TODO remove keys
            this.keys = [];
        }
    }
    setEndPoints() {
        this.inX = 0;
        this.inY = 0;
        this.outX = 0;
        this.outY = 0;
        this.setDims();
        if (this.keys.length > 0) {
            MousePayload.addMulitplePayloads(this.keys);
        }
    }
}
DragSelector.MAX_ROWS = 4;
DragSelector.MAX_COLS = 4;
/// <reference path="../creator/payload-keyboard.ts"/>
/// <reference path="../creator/square-keyboard.ts"/>
/// <reference path="../creator/mapto-keyboard.ts"/>
/// <reference path="../creator/payload-alias.ts"/>
/// <reference path="../creator/drag-selector.ts"/>
/**
 * the class to parent the creator gui for creating songs
 * @static
 */
class Creator extends DomElement {
    constructor() {
        super(new JQW('<div id="creator"></div>'));
        // initial size metrics
        // TODO add ability to update
        this.fileWidth = 160;
        this.inspectorHeight = 120;
        this.padding = 6;
        // initialize the song manager for the song creation
        SongManager.getInstance().newSong(KeyBoardType.STANDARD);
        SongManager.getSong().addPack();
        SongManager.getInstance().setSoundPack(0);
        // initialize the keyboards
        this.square = new SquareKeyboard();
        this.mapTo = new MapToKeyboard(KeyBoardType.STANDARD);
        // add the file gui
        this.asElement().append(FileGUI.getInstance().asElement());
        // add the sound inspector
        this.asElement().append(Toolbar.getInstance().asElement());
        // set the main content container
        this.main_content = new JQW('<div style="position: absolute; display: inline-block; overflow: hidden;"></div>');
        this.asElement().append(this.main_content);
        this.main_content.append(this.square.getElement());
        this.main_content.append(this.mapTo.getElement());
        // layout the elements
        this.layoutElements();
        // mouse listeners
        this.mouseDown = false;
        this.main_content.mousedown((event) => {
            this.mouseDown = true;
            DragSelector.getInstance().setStartPoint(event.pageX - this.main_content.offset().left, event.pageY - this.main_content.offset().top);
        });
        this.main_content.mousemove((event) => {
            if (this.mouseDown) {
                if (MousePayload.hasPayload()) {
                    this.mouseDown = false;
                    DragSelector.getInstance().setEndPoints();
                }
                else {
                    DragSelector.getInstance().updateEndPoint(event.pageX - this.main_content.offset().left, event.pageY - this.main_content.offset().top);
                }
            }
        });
        this.main_content.mouseup(() => {
            this.mouseDown = false;
            DragSelector.getInstance().setEndPoints();
        });
        this.main_content.mouseleave(() => {
            this.mouseDown = false;
            DragSelector.getInstance().setEndPoints();
        });
        DragSelector.getInstance().setParentOffsets(0, this.fileWidth + this.padding);
        this.main_content.append(DragSelector.getInstance().asElement());
    }
    /**
     * @return the singleton instance of this class
     */
    static getInstance() {
        if (Creator.instance === undefined) {
            Creator.instance = new Creator();
        }
        return Creator.instance;
    }
    /** should be called when a song is loaded */
    loadedSong() {
        this.mapTo.getElement().remove();
        this.mapTo = new MapToKeyboard(SongManager.getSong().getBoardType());
        this.main_content.append(this.mapTo.getElement());
        this.updateMapToGUI(true);
    }
    /**
     * this should be called when a song/pack is loaded to update the creator gui
     */
    updateMapToGUI(flash) {
        this.mapTo.resetGUI();
        let pack = SongManager.getCurrentPack();
        if (pack) {
            let containers = pack.getContainers();
            for (let location in containers) {
                let gridLoc = KeyboardUtils.linearToGrid(parseInt(location), this.mapTo.getKeyboard().getNumCols());
                this.mapTo.showSoundActive(this.mapTo.getKeyboard().getKey(gridLoc[0], gridLoc[1]));
                if (flash)
                    this.mapTo.getKeyboard().getColorManager().releasedKey(gridLoc[0], gridLoc[1]);
            }
        }
    }
    /**
     * set the element layout
     */
    layoutElements() {
        FileGUI.getInstance().asElement().css({ 'left': '0', 'top': '0', 'width': this.fileWidth + 'px', 'height': '100vh' });
        Toolbar.getInstance().asElement().css({ 'left': (this.fileWidth + this.padding) + 'px', 'bottom': '0', 'right': '0', 'height': this.inspectorHeight + 'px' });
        this.main_content.css({ 'left': (this.fileWidth + this.padding) + 'px', 'top': '0', 'right': '0', 'bottom': (this.inspectorHeight + this.padding) + 'px' });
    }
    keyDown(key) {
        this.mapTo.getKeyboard().keyDown(key);
        if (MousePayload.hasTempPayload()) {
            DragSelector.getInstance().pressedKey(key);
        }
        else
            Toolbar.getInstance().keyPress(key);
    }
    keyUp(key) {
        this.mapTo.getKeyboard().keyUp(key);
    }
    /**
     * should be called when a key is removed from the sound container.
     * Should probably be improved to an event driven model by the song manager
     */
    removedKey(loc) {
        this.mapTo.removeKey(loc);
    }
    /** @return the map to keyboard key at the given location */
    getKey(loc) {
        let gridLoc = KeyboardUtils.linearToGrid(loc, this.mapTo.getKeyboard().getNumCols());
        return this.mapTo.getKeyboard().getKey(gridLoc[0], gridLoc[1]);
    }
    getSquareKeyboard() {
        return this.square.getKeyboard();
    }
    getMapToKeyboard() {
        return this.mapTo.getKeyboard();
    }
}
/**
 * The way to load a zip file.
 */
class ZipHandler {
    /**
     * request to load the contents of the zip file at the given location into the file manager.
     * Only loads .mp3 files and the location has to be a valid zip file
     * @param name the file name/location
     * @param callback optional callback that is called when done loading
     */
    static requestZipLoad(name, callback) {
        ZipHandler.queue.push({ name, callback });
        if (ZipHandler.queue.length === 1) {
            ZipHandler.popQueue();
        }
    }
    static popQueue() {
        let top = ZipHandler.queue.pop();
        ZipHandler.loadZip(top.name, top.callback);
    }
    /**
     * start loading the file
     */
    static loadZip(name, callback) {
        let zip = new JSZip();
        let baseName = name.substring(name.indexOf('/') + 1, name.indexOf('.'));
        FileManager.getInstance().addBaseDir(baseName, name);
        // get request for zip file
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${ZipHandler.zipBase}/${name}`);
        xhr.responseType = 'blob';
        xhr.onload = function () {
            let f = xhr.response;
            // load the zip file from the response
            zip.loadAsync(f).then(function (zip) {
                // calculate the number of objects to load
                ZipHandler.numToLoad = Object.keys(zip.files).length;
                ZipHandler.numLoaded = 0;
                zip.forEach(function (relativePath, zipEntry) {
                    if (zipEntry.name.endsWith('.mp3')) {
                        zipEntry.async('base64').then(function (data) {
                            data = 'data:audio/mp3;base64,' + data;
                            FileManager.getInstance().addFile(baseName, zipEntry.name, data, () => {
                                ZipHandler.checkCallback(callback);
                            });
                        });
                    }
                    else {
                        ZipHandler.checkCallback(callback);
                    }
                });
            }, function (e) {
                console.log(e);
            });
        };
        xhr.send();
        console.log(`Fetching sound file \"${name}\" from the server...`);
    }
    // increment the num loaded and check if we ca callback
    static checkCallback(callback) {
        ZipHandler.numLoaded += 1;
        if (ZipHandler.numLoaded >= ZipHandler.numToLoad) {
            if (callback) {
                callback();
            }
            if (ZipHandler.queue.length > 0) {
                ZipHandler.popQueue();
            }
        }
    }
}
ZipHandler.zipBase = 'songs';
ZipHandler.numToLoad = 0;
ZipHandler.numLoaded = 0;
// use a queue because the callback operation only allows for 1 file to be processed at a time
ZipHandler.queue = [];
/**
 * Handles application errors
 * @param message jQuery element to load the modules onto
 * @param errorObj optional object connected to the error message
 */
function collectErrorMessage(message, errorObj) {
    console.log(message);
    if (errorObj) {
        console.log(errorObj);
    }
    let err = new Error();
    console.log(err.stack);
}
function collectWarningMessage(message) {
    // console.log(message);
}
/**
 * provide a jQuery wrapper.
 * TODO replace jquery functions with dom manipulation
 */
class JQW {
    constructor(obj) {
        this.jqObject = $(obj);
        this.domObject = this.jqObject[0];
    }
    getJQ() {
        return this.jqObject;
    }
    getDomObj() {
        return this.domObject;
    }
    append(other) {
        if (other instanceof JQW) {
            this.jqObject.append(other.jqObject);
        }
        else {
            this.jqObject.append(other);
        }
    }
    css(prop, value) {
        if (value === undefined) {
            return this.jqObject.css(prop);
        }
        else {
            return this.jqObject.css(prop, value);
        }
    }
    clone() {
        let ret = new JQW('');
        ret.jqObject = this.jqObject.clone();
        return ret;
    }
    focus(callback) {
        this.jqObject.focus(callback);
    }
    blur(callback) {
        if (callback === undefined)
            this.jqObject.blur();
        else
            this.jqObject.blur(callback);
    }
    html(text) {
        this.jqObject.html(text);
    }
    height() {
        return this.jqObject.height();
    }
    width() {
        return this.jqObject.width();
    }
    offset() {
        return this.jqObject.offset();
    }
    remove(selector) {
        return this.jqObject.remove(selector);
    }
    empty() {
        this.jqObject.empty();
    }
    toggle(time) {
        this.jqObject.toggle(time);
    }
    addClass(name) {
        this.jqObject.addClass(name);
    }
    removeClass(name) {
        this.jqObject.removeClass(name);
    }
    hasClass(name) {
        return this.jqObject.hasClass(name);
    }
    hide(time) {
        this.jqObject.hide(time);
    }
    show(time) {
        this.jqObject.show(time);
    }
    click(callback) {
        if (callback === undefined) {
            this.jqObject.click();
        }
        else {
            this.jqObject.click(callback);
        }
    }
    scroll(callback) {
        this.jqObject.scroll(callback);
    }
    mouseover(callback) {
        this.jqObject.mouseover(callback);
    }
    mousemove(callback) {
        this.jqObject.mousemove(callback);
    }
    mouseenter(callback) {
        this.jqObject.mouseenter(callback);
    }
    mouseleave(callback) {
        this.jqObject.mouseleave(callback);
    }
    mousedown(callback) {
        this.jqObject.mousedown(callback);
    }
    mouseup(callback) {
        this.jqObject.mouseup(callback);
    }
    keydown(callback) {
        this.jqObject.keydown(callback);
    }
    keyup(callback) {
        this.jqObject.keyup(callback);
    }
}
class FileUpload extends DomElement {
    constructor(callback) {
        super(new JQW('<div id="file_upload"></div>'));
        let upload = new JQW('<input type="file" />');
        let submit = new JQW('<input type="submit" value="Submit Sound"/>');
        submit.click(() => {
            for (let i = 0; i < upload.getDomObj().files.length; i++) {
                callback(upload.getDomObj().files[i]);
            }
            upload.getDomObj().value = '';
        });
        this.asElement().append(upload);
        this.asElement().append(submit);
        let dropZone = new JQW('<div id="drop_zone">Or Drop a file here</div>');
        this.asElement().append(dropZone);
        // ========== setup file drag and drop events ===============
        DomEvents.addListener('dragover', (event) => {
            dropZone.css({ 'background-color': 'rgba(100,255,255, 0.5)' });
            event.preventDefault();
        }, dropZone.getDomObj());
        DomEvents.addListener('dragenter', (event) => {
            event.preventDefault();
        }, dropZone.getDomObj());
        DomEvents.addListener('dragleave', (event) => {
            dropZone.css({ 'background-color': '' });
            event.preventDefault();
        }, dropZone.getDomObj());
        DomEvents.addListener('drop', (event) => {
            dropZone.css({ 'background-color': '' });
            event.preventDefault();
            // If dropped items aren't files, reject them
            let dt = event.dataTransfer;
            if (dt.items) {
                // Use DataTransferItemList interface to access the file(s)
                for (let i = 0; i < dt.items.length; i++) {
                    if (dt.items[i].kind === 'file') {
                        callback(dt.items[i].getAsFile());
                    }
                }
            }
            else {
                // Use DataTransfer interface to access the file(s)
                for (let i = 0; i < dt.files.length; i++) {
                    callback(dt.files[i]);
                }
            }
        }, dropZone.getDomObj());
        // ========== end file drag and drop event setup ===============
    }
    /** prevent the default file drop/open on the given element */
    static preventElementFileDrop(elem) {
        DomEvents.addListener('dragenter', (event) => {
            event.preventDefault();
        }, elem);
        DomEvents.addListener('dragover', (event) => {
            event.preventDefault();
        }, elem);
        DomEvents.addListener('drop', (event) => {
            event.preventDefault();
        }, elem);
    }
}
class AudioAnalyzer {
    /** @return a 2D array of start and end points for each sound */
    static analyze(buffer) {
        let ch1 = buffer.getChannelData(0);
        let ch2 = buffer.getChannelData(1);
        let ret = [];
        // scan for silence and find audio start and end points and use those points to split audio
        for (let i = 0; i < ch1.length; i++) {
            // scan until no silence for one byte in both channels
            if (Math.abs(ch1[i]) > AudioAnalyzer.emptyTol && Math.abs(ch2[i]) > AudioAnalyzer.emptyTol) {
                let startPos = i;
                // make sure that audio is not silent for at least emptyLen number of bytes
                let isValid = true;
                for (; i < startPos + AudioAnalyzer.emptyLen; i++) {
                    if (Math.abs(ch1[i]) <= AudioAnalyzer.emptyTol && Math.abs(ch2[i]) <= AudioAnalyzer.emptyTol) {
                        isValid = false;
                        break;
                    }
                }
                // valid audio sample determined
                if (isValid) {
                    while (i < ch1.length) {
                        i++;
                        // scan until one byte of silence detected
                        if (Math.abs(ch1[i]) <= AudioAnalyzer.emptyTol && Math.abs(ch2[i]) <= AudioAnalyzer.emptyTol) {
                            let endPos = i;
                            // make sure that audio is silent for at least emptyTol number of bytes
                            let isOver = true;
                            for (; i < endPos + AudioAnalyzer.emptyLen; i++) {
                                if (Math.abs(ch1[i]) > AudioAnalyzer.emptyTol && Math.abs(ch2[i]) > AudioAnalyzer.emptyTol) {
                                    isOver = false;
                                    break;
                                }
                            }
                            // if audio section boundary found, make a new file with the data within the boundaries
                            if (isOver) {
                                startPos += AudioAnalyzer.moveBufferHead;
                                startPos = Math.floor((startPos) / AudioAnalyzer.roundBuffer) * AudioAnalyzer.roundBuffer;
                                endPos += AudioAnalyzer.moveBufferTail;
                                endPos = Math.floor((endPos) / AudioAnalyzer.roundBuffer) * AudioAnalyzer.roundBuffer;
                                ret.push([startPos, endPos]);
                                break;
                            }
                        }
                    }
                }
            }
        }
        return ret;
    }
}
AudioAnalyzer.emptyTol = 0.0021; // under this is considered silence
AudioAnalyzer.emptyLen = 100; // have to have tolerated silence for 20 bytes to be considered in the silent section
AudioAnalyzer.moveBufferHead = -600; // move buffer head back to compensate for immediate start to sound and possible cutoffs
AudioAnalyzer.moveBufferTail = -1000; // move buffer length back due to the amount of empty space afterwards
AudioAnalyzer.roundBuffer = 128; // round output buffer to have nice chunks and get ride of static overlay
/// <reference path="../splitter/file-upload.ts"/>
/// <reference path="../splitter/analyze-audio.ts"/>
class Splitter extends DomElement {
    static getInstance() {
        if (Splitter.instance === undefined) {
            Splitter.instance = new Splitter();
        }
        return Splitter.instance;
    }
    constructor() {
        super(new JQW('<div id="splitter"></div>'));
        this.asElement().append('<h1>Splitter</h1>');
        this.asElement().append('<p>Choose an audio file to split:</p>');
        let uploader = new FileUpload((file) => {
            this.decodeAudioFile(file);
        });
        this.asElement().append(uploader.asElement());
        FileUpload.preventElementFileDrop(this.asElement().getDomObj());
        let saveButton = new JQW('<button id="save_button">Save Sound</button>');
        this.asElement().append(saveButton);
        saveButton.click(() => {
            let name = prompt('Sound Name:');
            let len = this.currentArea[1] - this.currentArea[0];
            let newBuffer = new ArrayBuffer(len);
            console.log(this.currentBuffer);
            for (let i = 0; i < len; i++) {
                newBuffer[i] = this.currentBuffer[i + this.currentArea[0]];
            }
            let soundStr = SoundUtils.mp3Meta64 + SoundUtils.arrayBufferToBase64(newBuffer);
            // let audioLoadedFunc = (sound: Sound) => {
            //   sound.play();
            //   console.log(sound);
            // };
            // new Sound(soundStr, {name: name, location: name, callback: audioLoadedFunc});
        });
        this.waveform = new DrawSound();
        let waveformContainer = new JQW('<div id="waveformContainer"></div>');
        this.asElement().append(waveformContainer);
        waveformContainer.append(this.waveform.asElement());
        this.waveform.asElement().hide();
    }
    decodeAudioFile(file) {
        if (file.type.substring(0, file.type.indexOf('/')) === 'audio') {
            let fileReader = new FileReader();
            fileReader.onload = (event) => {
                let data = event.target.result;
                // create a sound object from the data
                let soundStr = SoundUtils.mp3Meta64 + SoundUtils.arrayBufferToBase64(data);
                let audioLoadedFunc = (sound) => {
                    // sound.play();
                    // sound.pause();
                    // console.log(sound.howl_object._sounds[0]._node);
                    // console.log(sound.howl_object._sounds[0]._node.bufferSource);
                    AudioTools.audioContext.decodeAudioData(data, (buffer) => {
                        this.currentBuffer = buffer;
                        // console.log(buffer);
                        // let source = AudioTools.audioContext.createBufferSource();
                        // source.buffer = buffer;
                        // source.connect(AudioTools.audioContext.destination);
                        // source.start(0);
                        // console.log('started');
                        this.waveform.asElement().show();
                        this.waveform.setSound(sound, true, buffer);
                        let areas = AudioAnalyzer.analyze(buffer);
                        this.currentArea = areas[0];
                        this.waveform.setInTime(areas[0][0] / buffer.sampleRate);
                        this.waveform.setOutTime(areas[0][1] / buffer.sampleRate);
                    }, () => {
                        console.log('error');
                    });
                };
                new Sound(soundStr, { name: 'temp', location: 'temp', callback: audioLoadedFunc });
            };
            fileReader.readAsArrayBuffer(file);
        }
        else {
            console.log('not valid audio file');
            console.log(file);
        }
    }
    keyDown(key) {
        if (key === 32) {
            this.waveform.pressSpace();
        }
    }
    keyUp(key) {
        // do nothing
    }
}
class DomEvents {
    /** add a listener on the element for the given event */
    static addListener(name, callback, elem) {
        if (elem === undefined) {
            if (DomEvents.eventMap[name] === undefined)
                DomEvents.eventMap[name] = [];
            DomEvents.eventMap[name].push(callback);
        }
        else
            elem.addEventListener(name, callback);
    }
    /** fire the event on the given element */
    static fireEvent(name, args, elem) {
        let event;
        if (args === undefined)
            event = new Event(name, { 'bubbles': true });
        else
            event = new CustomEvent(name, { 'detail': args, 'bubbles': true });
        if (elem === undefined)
            for (let i = 0; i < DomEvents.eventMap[name].length; i++)
                DomEvents.eventMap[name][i](event);
        else
            elem.dispatchEvent(event);
    }
}
DomEvents.eventMap = {};
class AudioTools {
}
AudioTools.audioContext = new (window.AudioContext || window.webkitAudioContext)();
class SoundUtils {
    /**
     * convert a base64 array to a byte array
     */
    static base64ToArrayBuffer(base64) {
        let binaryString = window.atob(base64);
        let len = binaryString.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    /**
     * convert a byte array to a base64 array
     */
    static arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
// the base64 metadata
SoundUtils.mp3Meta64 = 'data:audio/mp3;base64,';
/**
 * the container class for the note editor
 */
class NoteEditor extends DomElement {
    constructor() {
        super(new JQW('<div class="note-editor"></div>'));
        this.controlPanel = new JQW('<div class="control-panel"></div>');
        this.asElement().append(this.controlPanel);
        this.scrollArea = new JQW('<div class="scroll-area"></div>');
        this.asElement().append(this.scrollArea);
        this.sidePanel = new JQW('<div class="side-panel"></div>');
        this.scrollArea.append(this.sidePanel);
        this.scrubBar = new JQW('<div class="scrub-bar"></div>');
        this.scrollArea.append(this.scrubBar);
        this.noteRows = [];
        for (let row of KeyboardUtils.keyboardSymbols) {
            for (let key of row) {
                this.sidePanel.append('<div class="key-cell">' + key + '</div>');
                let noteRow = new JQW('<div class="note-row"></div>');
                this.noteRows.push(noteRow);
                this.scrollArea.append(noteRow);
            }
        }
        Resizer.resize(() => {
            this.resize();
        });
        this.asElement().scroll(() => {
            this.sidePanel.css('left', '0px');
        });
    }
    resize() {
        console.log(this.asElement().height());
        console.log(this.controlPanel.height());
        this.scrollArea.css('height', (this.asElement().height() - this.controlPanel.height()) + 'px');
    }
}
/// <reference path="./note-editor.ts"/>
/**
 * the parent class for the editor
 * @static
 */
class Editor extends DomElement {
    /**
     * @return the singleton instance of this class
     */
    static getInstance() {
        if (Editor.instance === undefined) {
            Editor.instance = new Editor();
        }
        return Editor.instance;
    }
    constructor() {
        super(new JQW('<div id="editor"></div>'));
        this.keyboard = new Keyboard(KeyBoardType.STANDARD, true);
        this.asElement().append(this.keyboard.asElement());
        // this.keyboard.centerVertical();
        this.keyboard.resize(0.5);
        this.noteEditor = new NoteEditor();
        this.asElement().append(this.noteEditor.asElement());
    }
    keyDown(key) {
        this.keyboard.keyDown(key);
    }
    keyUp(key) {
        this.keyboard.keyUp(key);
    }
}
// Resize event handler. Register a resize event and call resize
class Resizer {
    static resize(callback) {
        if (Resizer.callbacks === undefined) {
            Resizer.callbacks = [];
            window.addEventListener('resize', Resizer.onResize);
        }
        Resizer.callbacks.push(callback);
    }
    static onResize(e) {
        for (let c of Resizer.callbacks)
            c(e);
    }
}
/// <reference path="./modules/element.ts"/>
/// <reference path="./modules/payload/mouse-payload.ts"/>
/// <reference path="./modules/modes/keyboard-layout.ts"/>
/// <reference path="./modules/files/file-manager.ts"/>
/// <reference path="./modules/files/file-gui.ts"/>
/// <reference path="./modules/toolbar/toolbar.ts"/>
/// <reference path="./modules/input-propegator.ts"/>
/// <reference path="./modules/song/song-manager.ts"/>
/// <reference path="./modules/modes/mode-handler.ts"/>
/// <reference path="./modules/modes/creator.ts"/>
/// <reference path="./modules/zip.ts"/>
/// <reference path="./modules/error-collector.ts"/>
/// <reference path="./modules/jquery_wrapper/jquery-wrapper.ts"/>
/// <reference path="./modules/modes/splitter.ts"/>
/// <reference path="./modules/events/dom-events.ts"/>
/// <reference path="./modules/payload/highlightable.ts"/>
/// <reference path="./modules/audio/audio-tools.ts"/>
/// <reference path="./modules/song/sound-utils.ts"/>
/// <reference path="./modules/editor/editor.ts"/>
/// <reference path="./modules/resizer.ts"/>
/**
 * Loads certain modules onto the main element
 * @param main_element the jQuery element to load the modules onto
 */
function ModuleLoader(main_element) {
    // add the keyboard
    main_element.append(KeyboardLayout.getInstance().asElement());
    // add the creator
    main_element.append(Creator.getInstance().asElement());
    // add the creator
    main_element.append(Splitter.getInstance().asElement());
    // add the editor
    main_element.append(Editor.getInstance().asElement());
    // initialize the mode handler
    ModeHandler.init();
    ModeHandler.setMode(0 /* KEYBOARD */);
    // initialize the mouse payload listener on the main element
    MousePayload.initialize(main_element);
    // initilize the event propegator
    InputEventPropegator.init();
    // intialize the file manager data object
    let manager = FileManager.getInstance();
    // call resize after all elements have been added
    window.dispatchEvent(new Event('resize'));
}
;
/**
 * run the given tests and call the callback if successfull
 */
function runTests(callback) {
    console.log('Running tests');
    // TODO test zip
    // TODO test various typescript and modern functions
    // TODO test css properties?
    // TODO test webaudio api
    function arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', 'songs/test_audio/beat1.wav');
    // xhr.responseType = 'arraybuffer';
    // xhr.onload = function(){
    //   let f = xhr.response;
    //
    //   var t0 = performance.now();
    //   let src = arrayBufferToBase64(f);
    //   console.log(src.substring(0,100));
    //   let begin = 'data:audio/mp3;base64,';
    //
    //   let t1 = performance.now();
    //   console.log("Call to buffer took " + (t1 - t0) + " milliseconds.")
    //
    //   new Howl({
    //     src: [begin + src],
    //     sprite: {
    //       test: [0, 500, true]
    //     },
    //     onload: function() {
    //       console.log(this._sprite['test']);
    //       t1 = performance.now();
    //       console.log("Call to loadsound took " + (t1 - t0) + " milliseconds.")
    //     }
    //   })
    // };
    // xhr.send();
    console.log('Tests successful');
    callback();
}
/**
 * @return true if we are on a mobile site
 */
function testMobile() {
    return false;
}
// library imports
/// <reference path="../libraries/howler.d.ts"/>
/// <reference path="../libraries/jquery.d.ts"/>
/// <reference path="../libraries/jszip.d.ts"/>
/// <reference path="../libraries/misc.d.ts"/>
/// <reference path="./module-loader.ts"/>
/// <reference path="./tests.ts"/>
/// <reference path="./test-mobile.ts"/>
/**
 * The main function that starts the module loader and creates the main container
 */
$(document).ready(function () {
    console.log('Starting Application');
    // add the main container element to the dom
    let main_element = new JQW('<div id="main_container" style="width: 100vw; height: 100vh; overflow: hidden"></div>');
    (new JQW('body')).append(main_element);
    if (testMobile()) {
        main_element.append('<div>This application is currently not supported for mobile</div>');
    }
    else {
        runTests(() => {
            // call the module loader
            ModuleLoader(main_element);
        });
    }
});
//# sourceMappingURL=main.js.map