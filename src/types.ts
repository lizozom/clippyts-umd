export interface AgentConfig {
    overlayCount: number;
    framesize: Array<number>;
    sounds: Array<string>;
    animations: Record<string, ClippyAnimation>;
}

export interface ClippyBranch {
    branches?: Array<string>;
    frameIndex: number;
    weight: number;
}

export interface ClippyFrame {
    images?: Array<Array<number>>;
    duration?: number;
    branching?: {
        branches: Array<ClippyBranch>
    },
    useExitBranching?: boolean;
    exitBranch?: number;
    sound?: any;
}

export interface ClippyAnimation {
    useExitBranching?: boolean;
    frames: Array<ClippyFrame>;
}

export interface ClippySound {
    name: string;
    index: string;
    data: string;
}

export interface AgentWrapper {
    name: string;
    image: string;
    config: AgentConfig;
    soundMp3: Record<string, string>;
    soundOgg: Record<string, string>;
}