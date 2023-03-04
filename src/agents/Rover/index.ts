import { AgentWrapper } from '../../types';
import { agent } from './agent';
import { soundMp3 } from './sounds-mp3';
import { soundOgg } from './sounds-ogg';

export const Rover: AgentWrapper = {
    name: 'Rover',
    config: agent,
    soundMp3,
    soundOgg,
}