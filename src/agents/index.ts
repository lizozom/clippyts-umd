import { AgentType } from '../types';

function loadAgent (name: AgentType) {
    return new Promise<any>((resolve, reject) => {
        if (window.clippy.agents[name] !== undefined) {
            resolve(window.clippy.agents[name]);
        } else {
            const scr = document.createElement('script');
            scr.src = `./dist/agents/${name}.js`;
            scr.onload= () => {
                console.log(`Loaded ${name} agent`);
                resolve(window.clippy.agents[name]);
            };
            scr.onerror = () => {
                console.error(`Failed to load ${name} agent`);
                reject();
            };
        
            document.body.appendChild(scr);
        }
    });
}

export const agents: Record<string, any> = {
    Bonzi: () => loadAgent('Bonzi'),
    Clippy: () => loadAgent('Clippy'),
    F1: () => loadAgent('F1'),
    Genie: () => loadAgent('Genie'),
    Genius: () => loadAgent('Genius'),
    Links: () => loadAgent('Links'),
    Merlin: () => loadAgent('Merlin'),
    Peedy: () => loadAgent('Peedy'),
    Rocky: () => loadAgent('Rocky'),
    Rover: () => loadAgent('Rover'),
};