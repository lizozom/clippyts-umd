import $ from 'jquery';
export default class Balloon {
    constructor(targetEl) {
        this._hiding = null;
        this._loop = null;
        this._active = true;
        this._hold = false;
        this._addWord = null;
        this._targetEl = targetEl;
        this._hidden = true;
        this._setup();
        this.WORD_SPEAK_TIME = 200;
        this.CLOSE_BALLOON_DELAY = 2000;
        this._BALLOON_MARGIN = 15;
    }
    _setup() {
        this._balloon = $('<div class="clippy-balloon"><div class="clippy-tip"></div><div class="clippy-content"></div></div> ').hide();
        this._content = this._balloon.find('.clippy-content');
        this._balloon.insertAfter('.clippy');
    }
    reposition() {
        let sides = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        for (let i = 0; i < sides.length; i++) {
            let s = sides[i];
            this._position(s);
            if (!this._isOut())
                break;
        }
    }
    /***
     *
     * @param side
     * @private
     */
    _position(side) {
        if (!this._balloon)
            return;
        let o = this._targetEl.offset();
        let h = this._targetEl.height();
        let w = this._targetEl.width();
        o.top -= $(window).scrollTop();
        o.left -= $(window).scrollLeft();
        let bH = this._balloon.outerHeight();
        let bW = this._balloon.outerWidth();
        this._balloon.removeClass('clippy-top-left');
        this._balloon.removeClass('clippy-top-right');
        this._balloon.removeClass('clippy-bottom-right');
        this._balloon.removeClass('clippy-bottom-left');
        let left, top;
        switch (side) {
            case 'top-left':
                // right side of the balloon next to the right side of the agent
                left = o.left + w - bW;
                top = o.top - bH - this._BALLOON_MARGIN;
                break;
            case 'top-right':
                // left side of the balloon next to the left side of the agent
                left = o.left;
                top = o.top - bH - this._BALLOON_MARGIN;
                break;
            case 'bottom-right':
                // right side of the balloon next to the right side of the agent
                left = o.left;
                top = o.top + h + this._BALLOON_MARGIN;
                break;
            case 'bottom-left':
                // left side of the balloon next to the left side of the agent
                left = o.left + w - bW;
                top = o.top + h + this._BALLOON_MARGIN;
                break;
        }
        this._balloon.css('top', top || '');
        this._balloon.css('left', left || '');
        this._balloon.addClass('clippy-' + side);
    }
    _isOut() {
        if (!this._balloon)
            return;
        let o = this._balloon.offset();
        let bH = this._balloon.outerHeight();
        let bW = this._balloon.outerWidth();
        let wW = $(window).width();
        let wH = $(window).height();
        let sT = $(document).scrollTop();
        let sL = $(document).scrollLeft();
        let top = o.top - sT;
        let left = o.left - sL;
        let m = 5;
        if (top - m < 0 || left - m < 0)
            return true;
        return (top + bH + m) > wH || (left + bW + m) > wW;
    }
    speak(complete, text, hold) {
        this._hidden = false;
        this.show();
        let c = this._content;
        if (!c)
            return;
        // set height to auto
        c.height('auto');
        c.width('auto');
        // add the text
        c.text(text);
        // set height
        c.height(c.height() || 0);
        c.width(c.width() || 0);
        c.text('');
        this.reposition();
        this._complete = complete;
        this._sayWords(text, hold, complete);
    }
    show() {
        if (!this._balloon)
            return;
        if (this._hidden)
            return;
        this._balloon.show();
    }
    hide(fast) {
        var _a;
        if (fast) {
            (_a = this._balloon) === null || _a === void 0 ? void 0 : _a.hide();
            return;
        }
        this._hiding = window.setTimeout(this._finishHideBalloon.bind(this), this.CLOSE_BALLOON_DELAY);
    }
    _finishHideBalloon() {
        var _a;
        if (this._active)
            return;
        (_a = this._balloon) === null || _a === void 0 ? void 0 : _a.hide();
        this._hidden = true;
        this._hiding = null;
    }
    _sayWords(text, hold, complete) {
        this._active = true;
        this._hold = hold;
        let words = text.split(/[^\S-]/);
        let time = this.WORD_SPEAK_TIME;
        let el = this._content;
        let idx = 1;
        this._addWord = () => {
            var _a;
            if (!this._active)
                return;
            if (idx > words.length) {
                this._addWord = null;
                this._active = false;
                if (!this._hold) {
                    complete();
                    this.hide(false);
                }
            }
            else {
                el === null || el === void 0 ? void 0 : el.text(words.slice(0, idx).join(' '));
                idx++;
                // @ts-ignore
                this._loop = window.setTimeout((_a = this._addWord) === null || _a === void 0 ? void 0 : _a.bind(this), time);
            }
        };
        this._addWord();
    }
    close() {
        if (this._active) {
            this._hold = false;
        }
        else if (this._hold && this._complete) {
            this._complete();
        }
    }
    pause() {
        if (this._loop) {
            window.clearTimeout(this._loop);
        }
        if (this._hiding) {
            window.clearTimeout(this._hiding);
            this._hiding = null;
        }
    }
    resume() {
        if (this._addWord) {
            this._addWord();
        }
        else if (!this._hold && !this._hidden) {
            this._hiding = window.setTimeout(this._finishHideBalloon.bind(this), this.CLOSE_BALLOON_DELAY);
        }
    }
}
