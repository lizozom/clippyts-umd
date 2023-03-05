import Agent from './agent'
import { agents } from './agents';
import "./clippy.css";


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
            successCb, 
            failCb, 
            selector, 
        } = options || {};
        
        let path = `./assets/agents/${name}.png`;

        // wrapper to the success callback
        const agent = agents[name];
        if (!agent) {
            console.warn(`Agent name ${name} not fond`)
            if (failCb) failCb(`Agent name ${name} not fond`);
            return;
        } else {
            let a = new Agent({
                path, 
                agent,
                selector
            });
    
            if (successCb) successCb(a);
        }
    }
}

export function ready (name: string, data: any) {
}
