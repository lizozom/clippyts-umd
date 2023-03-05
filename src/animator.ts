import $ from 'jquery'
import { AgentConfig, AgentWrapper, ClippyAnimation, ClippyFrame } from './types';


export default class Animator {
    public static States = { WAITING: 1, EXITED: 0 };

    private _el: JQuery<HTMLElement>;
    private _data: AgentConfig;
    private _currentFrameIndex: number;
    private _path: string;
    private _exiting: boolean;
    private _currentFrame: ClippyFrame | undefined;
    private _started: boolean;
    private _sounds: Record<string, HTMLAudioElement>;
    private _overlays: JQuery<HTMLElement>[];
    private _endCallback: Function | undefined;
    private _currentAnimation: ClippyAnimation | undefined;
    private currentAnimationName: string | undefined;
    private _loop: number | undefined;

    constructor (el: JQuery<HTMLElement>, config: AgentWrapper, sounds: Array<string>) {
        this._el = el;
        this._data = config.config;
        this._path = config.image;
        this._currentFrameIndex = 0;
        this._currentFrame = undefined;
        this._exiting = false;
        this._currentAnimation = undefined;
        this._endCallback = undefined;
        this._started = false;
        this._sounds = {};
        this.currentAnimationName = undefined;
        this.preloadSounds(sounds);
        this._overlays = [this._el];
        let curr = this._el;

        this._setupElement(this._el);
        for (let i = 1; i < this._data.overlayCount; i++) {
            let inner = this._setupElement($('<div></div>'));
            curr.append(inner);
            this._overlays.push(inner);
            curr = inner;
        }
    }

    _setupElement (el: JQuery<HTMLElement>) {
        let frameSize = this._data.framesize;
        el.css('display', "none");
        el.css({ width: frameSize[0], height: frameSize[1] });
        el.css('background', "url('" + this._path + "') no-repeat");

        return el;
    }

    animations () {
        let r = [];
        let d = this._data.animations;
        for (let n in d) {
            r.push(n);
        }
        return r;
    }

    preloadSounds (sounds: Array<string>) {

        // for (let i = 0; i < this._data.sounds.length; i++) {
        //     let snd: string = this._data.sounds[i];
        //     let uri = sounds[snd];
        //     if (!uri) continue;
        //     this._sounds[snd] = new Audio(uri);

        // }
    }

    hasAnimation (name: string) {
        return !!this._data.animations[name];
    }

    exitAnimation () {
        this._exiting = true;
    }

    showAnimation (animationName: string, stateChangeCallback: Function) {
        this._exiting = false;

        if (!this.hasAnimation(animationName)) {
            return false;
        }

        this._currentAnimation = this._data.animations[animationName];
        this.currentAnimationName = animationName;


        if (!this._started) {
            this._step();
            this._started = true;
        }

        this._currentFrameIndex = 0;
        this._currentFrame = undefined;
        this._endCallback = stateChangeCallback;

        return true;
    }

    _draw () {
        let images: Array<Array<number>> = [];
        if (this._currentFrame) images = this._currentFrame.images || [];

        for (let i = 0; i < this._overlays.length; i++) {
            if (i < images.length) {
                let xy = images[i];
                let bg = -xy[0] + 'px ' + -xy[1] + 'px';
                this._overlays[i].css({ 'background-position': bg, 'display': 'block' });
            }
            else {
                this._overlays[i].css('display', 'none');
            }

        }
    }

    _getNextAnimationFrame (): number {
        if (!this._currentAnimation) return 0;
        // No current frame. start animation.
        if (!this._currentFrame) return 0;
        let currentFrame = this._currentFrame;
        let branching = this._currentFrame.branching;


        if (this._exiting && currentFrame.exitBranch !== undefined) {
            return currentFrame.exitBranch;
        }
        else if (branching) {
            let rnd = Math.random() * 100;
            for (let i = 0; i < branching.branches.length; i++) {
                let branch = branching.branches[i];
                if (rnd <= branch.weight) {
                    return branch.frameIndex;
                }

                rnd -= branch.weight;
            }
        }

        return this._currentFrameIndex + 1;
    }


    _playSound () {
        let s = this._currentFrame?.sound;
        if (!s) return;
        let audio = this._sounds[s];
        if (audio) audio.play();
    }

    _atLastFrame () {
        if (!this._currentAnimation) return false;
        return this._currentFrameIndex >= this._currentAnimation.frames.length - 1;
    }


    _step () {
        if (!this._currentAnimation) return;
        let newFrameIndex = Math.min(this._getNextAnimationFrame(), this._currentAnimation.frames.length - 1);
        let frameChanged = !this._currentFrame || this._currentFrameIndex !== newFrameIndex;
        this._currentFrameIndex = newFrameIndex;

        // always switch frame data, unless we're at the last frame of an animation with a useExitBranching flag.
        if (!(this._atLastFrame() && this._currentAnimation.useExitBranching)) {
            this._currentFrame = this._currentAnimation.frames[this._currentFrameIndex];
        }

        this._draw();
        this._playSound();

        this._loop = window.setTimeout(this._step.bind(this), this._currentFrame!.duration);


        // fire events if the frames changed and we reached an end
        if (this._endCallback && frameChanged && this._atLastFrame()) {
            if (this._currentAnimation.useExitBranching && !this._exiting) {
                this._endCallback(this.currentAnimationName, Animator.States.WAITING);
            }
            else {
                this._endCallback(this.currentAnimationName, Animator.States.EXITED);
            }
        }
    }

    /***
     * Pause animation execution
     */
    pause () {
        window.clearTimeout(this._loop);
    }

    /***
     * Resume animation
     */
    resume () {
        this._step();
    }
}


