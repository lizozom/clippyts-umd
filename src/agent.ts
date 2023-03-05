import $ from 'jquery'
import Queue from './queue'
import Animator from './animator'
import Balloon from './balloon'
import { AgentWrapper } from './types';

interface AgentOptions {
    agent: AgentWrapper;
    selector?: string;
}

export default class Agent {
    private _queue: Queue;
    private _el: JQuery<HTMLElement>;
    private _animator: any;
    private _balloon: Balloon;
    private _hidden: boolean = false;
    private _idleDfd: any;
    private _offset: { top: number; left: number; } = { top: 0, left: 0 };
    private _dragUpdateLoop: number | undefined;
    private _targetX: number | undefined;
    private _targetY: number | undefined;
    private _moveHandle: ((e: MouseEvent) => void) | undefined; 
    private _upHandle: ((e: MouseEvent) => void) | undefined; 

    constructor (options: AgentOptions) {
        const {
            agent,
            selector
        } = options;

        this._queue = new Queue(this._onQueueEmpty.bind(this));

        this._el = $('<div class="clippy"></div>').hide();

        if (this._el.parent().length === 0) {
            let el = selector ? $(selector)[0] : undefined;
            $(el || document.body).append(this._el);
        }

        this._animator = new Animator(this._el, agent, []);
        this._balloon = new Balloon(this._el);
        this._setupEvents();
    }

    /***
     *
     * @param {Number} x
     * @param {Number} y
     */
    gestureAt (x: number, y: number) {
        let d = this._getDirection(x, y);
        let gAnim = 'Gesture' + d;
        let lookAnim = 'Look' + d;

        let animation = this.hasAnimation(gAnim) ? gAnim : lookAnim;
        return this.play(animation);
    }

    /***
     *
     * @param {Boolean=} fast
     *
     */
    hide (fast: boolean, callback: () => void) {
        this._hidden = true;
        let el = this._el;
        this.stop();
        if (fast) {
            this._el.hide();
            this.stop();
            this.pause();
            if (callback) callback();
            return;
        }

        return this._playInternal('Hide',  () => {
            el.hide();
            this.pause();
            if (callback) callback();
        })
    }


    moveTo (x: number, y: number, duration: number) {
        let dir = this._getDirection(x, y);
        let anim = 'Move' + dir;
        if (duration === undefined) duration = 1000;

        this._addToQueue( (complete: Function) => {
            // the simple case
            if (duration === 0) {
                this._el.css({ top: y, left: x });
                this.reposition();
                complete();
                return;
            }

            // no animations
            if (!this.hasAnimation(anim)) {
                this._el.animate({ top: y, left: x }, duration, 'linear', () => {
                    complete();
                });
                return;
            }

            let callback =  (name: string, state: number) => {
                // when exited, complete
                if (state === Animator.States.EXITED) {
                    complete();
                }
                // if waiting,
                if (state === Animator.States.WAITING) {
                    this._el.animate({ top: y, left: x }, duration, () => {
                        // after we're done with the movement, do the exit animation
                        this._animator.exitAnimation();
                    });
                }

            };

            this._playInternal(anim, callback);
        }, this);
    }

    _playInternal (animation: any, callback: Function) {

        // if we're inside an idle animation,
        if (this._isIdleAnimation() && this._idleDfd && this._idleDfd.state() === 'pending') {
            this._idleDfd.done(() => {
                this._playInternal(animation, callback);
            })
        }

        this._animator.showAnimation(animation, callback);
    }

    play (animation: any, timeout?: number, cb?: Function) {
        if (!this.hasAnimation(animation)) return false;

        if (timeout === undefined) timeout = 5000;


        this._addToQueue( (complete: Function) => {
            let completed = false;
            // handle callback
            let callback = function (name: string, state: number) {
                if (state === Animator.States.EXITED) {
                    completed = true;
                    if (cb) cb();
                    complete();
                }
            };

            // if has timeout, register a timeout function
            if (timeout) {
                window.setTimeout(() => {
                    if (completed) return;
                    // exit after timeout
                    this._animator.exitAnimation();
                }, timeout)
            }

            this._playInternal(animation, callback);
        }, this);

        return true;
    }

    /***
     *
     * @param {Boolean=} fast
     */
    show (fast: boolean) {

        this._hidden = false;
        if (fast) {
            this._el.show();
            this.resume();
            this._onQueueEmpty();
            return;
        }

        if (this._el.css('top') === 'auto' || !(this._el.css('left') === 'auto')){
            let left = $(window).width()! * 0.8;
            let top = ($(window).height()! + $(document).scrollTop()!) * 0.8;
            this._el.css({ top: top, left: left });
        }

        this.resume();
        return this.play('Show');
    }

    /***
     *
     * @param {String} text
     */
    speak (text: string, hold: boolean) {
        this._addToQueue( (complete: Function) => {
            this._balloon.speak(complete, text, hold);
        }, this);
    }


    /***
     * Close the current balloon
     */
    closeBalloon () {
        this._balloon.hide();
    }

    delay (time: number) {
        time = time || 250;

        this._addToQueue( (complete: Function) => {
            this._onQueueEmpty();
            window.setTimeout(complete, time);
        });
    }

    /***
     * Skips the current animation
     */
    stopCurrent () {
        this._animator.exitAnimation();
        this._balloon.close();
    }


    stop () {
        // clear the queue
        this._queue.clear();
        this._animator.exitAnimation();
        this._balloon.hide();
    }

    /***
     *
     * @param {String} name
     * @returns {Boolean}
     */
    hasAnimation (name: string) {
        return this._animator.hasAnimation(name);
    }

    /***
     * Gets a list of animation names
     *
     * @return {Array.<string>}
     */
    animations () {
        return this._animator.animations();
    }

    /***
     * Play a random animation
     * @return {jQuery.Deferred}
     */
    animate (): any {
        let animations = this.animations();
        let anim = animations[Math.floor(Math.random() * animations.length)];
        // skip idle animations
        if (anim.indexOf('Idle') === 0) {
            return this.animate();
        }
        return this.play(anim);
    }

    /**************************** Utils ************************************/

    /***
     *
     * @param {Number} x
     * @param {Number} y
     * @return {String}
     * @private
     */
    _getDirection (x: number, y: number) {
        let offset = this._el.offset()!;
        let h = this._el.height()!;
        let w = this._el.width()!;

        let centerX = (offset.left + w / 2);
        let centerY = (offset.top + h / 2);


        let a = centerY - y;
        let b = centerX - x;

        let r = Math.round((180 * Math.atan2(a, b)) / Math.PI);

        // Left and Right are for the character, not the screen :-/
        if (-45 <= r && r < 45) return 'Right';
        if (45 <= r && r < 135) return 'Up';
        if (135 <= r && r <= 180 || -180 <= r && r < -135) return 'Left';
        if (-135 <= r && r < -45) return 'Down';

        // sanity check
        return 'Top';
    }

    /**************************** Queue and Idle handling ************************************/

    /***
     * Handle empty queue.
     * We need to transition the animation to an idle state
     * @private
     */
    _onQueueEmpty () {
        if (this._hidden || this._isIdleAnimation()) return;
        let idleAnim = this._getIdleAnimation();
        this._idleDfd = $.Deferred();

        this._animator.showAnimation(idleAnim, this._onIdleComplete.bind(this));
    }

    _onIdleComplete (name: string, state: number) {
        if (state === Animator.States.EXITED) {
            this._idleDfd.resolve();
        }
    }

    /***
     * Is the current animation is Idle?
     * @return {Boolean}
     * @private
     */
    _isIdleAnimation () {
        let c = this._animator.currentAnimationName;
        return c && c.indexOf('Idle') === 0;
    }


    /**
     * Gets a random Idle animation
     * @return {String}
     * @private
     */
    _getIdleAnimation () {
        let animations = this.animations();
        let r = [];
        for (let i = 0; i < animations.length; i++) {
            let a = animations[i];
            if (a.indexOf('Idle') === 0) {
                r.push(a);
            }
        }

        // pick one
        let idx = Math.floor(Math.random() * r.length);
        return r[idx];
    }

    /**************************** Events ************************************/

    _setupEvents () {
        window.addEventListener('resize', this.reposition.bind(this));
        this._el.on('mousedown', this._onMouseDown.bind(this));
        this._el.on('dblclick', this._onDoubleClick.bind(this));
    }

    _onDoubleClick () {
        if (!this.play('ClickedOn')) {
            this.animate();
        }
    }

    reposition () {
        if (!this._el.is(':visible')) return;
        let o = this._el.offset()!;
        let bH = this._el.outerHeight()!;
        let bW = this._el.outerWidth()!;

        let wW = $(window).width()!;
        let wH = $(window).height()!;
        let sT = $(window).scrollTop()!;
        let sL = $(window).scrollLeft()!;

        let top = o.top - sT;
        let left = o.left - sL;
        let m = 5;
        if (top - m < 0) {
            top = m;
        } else if ((top + bH + m) > wH) {
            top = wH - bH - m;
        }

        if (left - m < 0) {
            left = m;
        } else if (left + bW + m > wW) {
            left = wW - bW - m;
        }

        this._el.css({ left: left, top: top });
        // reposition balloon
        this._balloon.reposition();
    }

    _onMouseDown (e: JQuery.MouseDownEvent) {
        e.preventDefault();
        this._startDrag(e);
    }


    /**************************** Drag ************************************/

    _startDrag (e: JQuery.MouseDownEvent) {
        // pause animations
        this.pause();
        this._balloon.hide(true);
        this._offset = this._calculateClickOffset(e);

        this._moveHandle = this._dragMove.bind(this);
        this._upHandle = this._finishDrag.bind(this);

        window.addEventListener("mousemove", this._moveHandle);
        window.addEventListener("mouseup", this._upHandle);

        this._dragUpdateLoop = window.setTimeout(this._updateLocation.bind(this), 10);
    }

    _calculateClickOffset (e: JQuery.MouseDownEvent) {
        let mouseX = e.pageX;
        let mouseY = e.pageY;
        let o = this._el.offset()!;
        return {
            top: mouseY - o.top,
            left: mouseX - o.left
        }

    }

    _updateLocation () {
        this._el.css('top', this._targetY || 0);
        this._el.css('left', this._targetX || 0);
        this._dragUpdateLoop = window.setTimeout(this._updateLocation.bind(this), 10);
    }

    _dragMove (e: MouseEvent) {
        e.preventDefault();
        let x = e.clientX - this._offset.left;
        let y = e.clientY - this._offset.top;
        this._targetX = x;
        this._targetY = y;
    }

    _finishDrag () {
        window.clearTimeout(this._dragUpdateLoop);
        // remove handles
        if (this._moveHandle) {
            window.removeEventListener("mousemove", this._moveHandle);
        }
        if (this._upHandle) {
            window.removeEventListener("mouseup", this._upHandle);
        }
        // resume animations
        this._balloon.show();
        this.reposition();
        this.resume();

    }

    _addToQueue (func: Function, scope?: any) {
        if (scope) func = func.bind(scope);
        this._queue.queue(func);
    }

    /**************************** Pause and Resume ************************************/

    pause () {
        this._animator.pause();
        this._balloon.pause();

    }

    resume () {
        this._animator.resume();
        this._balloon.resume();
    }

}