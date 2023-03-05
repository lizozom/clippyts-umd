import type Agent from './agent'
import type Animator from './animator'
import type Queue from './queue'
import type Balloon from './balloon'
import { load } from './load'

const clippy = {
    load,
    agents: {},
}

export type { Agent, Animator, Queue, Balloon };
export default clippy;
