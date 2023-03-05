import Agent from './agent'
import { agents } from './agents';
import "./clippy.css";
import { AgentWrapper } from './types';


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
        
        // wrapper to the success callback
        agents[name]().then((agentConfig: AgentWrapper) => {
                let a = new Agent({
                    agent: agentConfig,
                    selector
                });
            if (successCb) successCb(a);
        }).catch((error: any) => {
            if (failCb) failCb(error);
        });
    }
}