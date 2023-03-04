import Agent from './agent';
import { agents } from './agents';
export class load {
    constructor(options) {
        let { name, base_path, successCb, failCb, selector, } = options || {};
        base_path = base_path || 'https://cdn.jsdelivr.net/gh/pi0/clippyjs/assets/agents/';
        let path = base_path + name;
        // wrapper to the success callback
        const agent = agents[name];
        if (!agent) {
            if (failCb)
                failCb('Agent not found');
            return;
        }
        let a = new Agent({
            path,
            agent,
            selector
        });
        if (successCb)
            successCb(a);
    }
}
export function ready(name, data) {
}
