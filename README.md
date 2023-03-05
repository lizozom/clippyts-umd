# Clippy
> Add Clippy or his friends to any website for instant nostalgia.

## Demos

Please be patient for first load. It may take some time as agents are loaded one by one.

- [Simple JSFiddle](https://jsfiddle.net/pi0/rtw8p05k)
- [Agents Zoo](https://pi0.github.io/clippyjs/demo/index.html) 

![image](https://user-images.githubusercontent.com/5158436/27002340-c221cc06-4df4-11e7-9438-050a3ad8ecde.png)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fpi0%2Fclippyjs.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fpi0%2Fclippyjs?ref=badge_shield)


## Usage


### NPM / Webpack

```
npm install clippyts
```

```ts
import clippy from 'clippyts'

clippy.load('Merlin', (agent: Agent) => {
    // do anything with the loaded agent
    agent.show();
});
```

## Actions
All the agent actions are queued and executed by order, so you could stack them.

```javascript
// play a given animation
agent.play('Searching');

// play a random animation
agent.animate();

// get a list of all the animations
agent.animations();
// => ["MoveLeft", "Congratulate", "Hide", "Pleased", "Acknowledge", ...]

// Show text balloon
agent.speak('When all else fails, bind some paper together. My name is Clippy.');

// move to the given point, use animation if available
agent.moveTo(100,100);

// gesture at a given point (if gesture animation is available)
agent.gestureAt(200,200);

// stop the current action in the queue
agent.stopCurrent();

// stop all actions in the queue and go back to idle mode
agent.stop();
```


# Licence
MIT

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fpi0%2Fclippyjs.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fpi0%2Fclippyjs?ref=badge_large)

## Special Thanks
- [pi0 for the original clippyJS implementation](https://github.com/pi0/clippyjs)
- The [Clippy.JS](http://smore.com/clippy-js) project by [Smore](http://smore.com)
- The awesome [Cinnamon Software](http://www.cinnamonsoftware.com/) for developing [Double Agent](http://doubleagent.sourceforge.net/)
the program we used to unpack Clippy and his friends!
- Microsoft, for creating clippy :)