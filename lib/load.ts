import $ from 'jquery'
import Agent from './agent'
import { ClippySound } from './types';
import { agents } from './agents';

export interface LoadOptions {
    name: string;
    base_path?: string;
    successCb?: (agent: Agent) => void;
    failCb?: (error: any) => void;
    selector?: string;
}

export class load {
    constructor (options: LoadOptions) {
        let { 
            name,
            base_path, 
            successCb, 
            failCb, 
            selector, 
        } = options || {};
        base_path = base_path || 'https://cdn.jsdelivr.net/gh/pi0/clippyjs/assets/agents/'

        let path = base_path + name;

        // wrapper to the success callback
        const agent = agents[name];
        if (!agent) {
            if (failCb) failCb('Agent not found');
            return;
        }
        let a = new Agent({
            path, 
            agent,
            selector
        });

        if (successCb) successCb(a);
    }
}

export function ready (name: string, data: any) {
}
