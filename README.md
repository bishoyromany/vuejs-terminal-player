# Dynamic Forms

[![Version](https://img.shields.io/npm/v/vuejs-terminal-player.svg)](https://www.npmjs.com/package/vuejs-terminal-player)
[![Downloads](https://img.shields.io/npm/dm/vuejs-terminal-player.svg)](https://www.npmjs.com/package/vuejs-terminal-player)

A Terminal Player Vue component. Compatible with Vue 2.x

- [Terminal Player](#terminal-player)
  - [Demo](#demo)
  - [Install](#install)
  - [Usage](#usage)
  - [Demo Source](#demo-source)
  - [Available props](#available-props)
  - [Events](#events)

## Demo

To view a demo online:
https://bishoyromany.github.io/vuejs-terminal-player/demo

<!-- To view demo locally clone the repo and run `npm install && npm run serve` -->

## Install

```bash
npm i vuejs-terminal-player --save
```

```javascript
import TerminalPlayer from "vuejs-terminal-player";

export default {
  // ...
  components: {
    TerminalPlayer,
  },
  // ...
};
```

## Usage

```html
<TerminalPlayer></TerminalPlayer>
```

## Demo Source

```html
<template>
  <div id="Demo">
    <h1 class="title">
      VueJS Terminal Player
      <p>Open your console, to see the terminal events.</p>
    </h1>

    <div class="terminal-player">
      <TerminalPlayer
        :scriptFile="scriptFile"
        :timingFile="timingFile"
        :height="height"
        :allowDebugButton="allowDebugButton"
        @paused="
          () =>
            table({
              action: 'paused',
              usage: 'When terminal player is paused for any reason.',
            })
        "
        @resume="
          () =>
            table({
              action: 'resume',
              usage: 'When the user resume the terminal after pausing it.',
            })
        "
        @play="
          () =>
            table({
              action: 'play',
              usage: 'When terminal start playing the script.',
            })
        "
        @clean="
          () =>
            table({
              action: 'clean',
              usage: 'when the terminal content is cleaned.',
            })
        "
        @finished="
          () =>
            table({
              action: 'finished',
              usage: 'when the terminal is done and played all the content.',
            })
        "
        @load-data="
          (data) =>
            table({
              action: 'load-data',
              usage: 'when terminal complete preparing data for play step.',
              script: data.script,
              timings: data.timings,
            })
        "
        @terminal-setup="
          (data) =>
            table({
              action: 'terminal-setup',
              usage: 'when terminal instance is ready to play.',
              fit: data.fit,
              search: data.search,
              terminal: data.terminal,
            })
        "
        @slider-movement="
          (data) =>
            table({
              action: 'slider-movement',
              usage:
                'when the user use the slider and select a specific second.',
              second: data[0],
            })
        "
        @speed-change="
          (data) =>
            table({
              action: 'speed-change',
              usage: 'when the user changes the terminal play speed.',
              speed: data[0],
            })
        "
      />
    </div>

    <h3 class="title">
      <a
        href="https://github.com/bishoyromany/vuejs-terminal-player/blob/master/src/components/Demo.vue"
        target="_blank"
        >See The Code</a
      >
    </h3>
  </div>
</template>

<script>
  import TerminalPlayer from "./../plugins/terminalPlayer/TerminalPlayer";
  import timing from "raw-loader!./assets/timing.timing";
  import script from "raw-loader!./assets/script.log";

  const state = {
    date1: new Date(),
  };

  export default {
    name: "demo",
    components: {
      TerminalPlayer,
    },
    data() {
      return {
        timingFile: timing,
        scriptFile: script,
        height: 500,
        allowDebugButton: true,
      };
    },
    methods: {
      log(...params) {
        console.log(params);
      },
      table(...params) {
        console.table(params);
      },
    },
  };
</script>

<style lang="scss" scoped>
  #Demo {
    max-width: 700px;
    margin: 50px auto;
    .title {
      text-align: center;
      margin-top: 20px;
      p {
        font-size: 15px;
      }
    }
  }
</style>
```

**timingFile** prop should be string of timings file
**scriptFile** prop should be string of script file

```html
<script>
  var state = {
    scriptFile: "script file string",
    timingFile: "timing file string",
  };
</script>
<TerminalPlayer :scriptFile="scriptFile" :timingFile="timingFile" />
```

Emits events

```html
<TerminalPlayer
  @paused="
          () =>
            table({
              action: 'paused',
              usage: 'When terminal player is paused for any reason.',
            })
        "
  @resume="
          () =>
            table({
              action: 'resume',
              usage: 'When the user resume the terminal after pausing it.',
            })
        "
  @play="
          () =>
            table({
              action: 'play',
              usage: 'When terminal start playing the script.',
            })
        "
  @clean="
          () =>
            table({
              action: 'clean',
              usage: 'when the terminal content is cleaned.',
            })
        "
  @finished="
          () =>
            table({
              action: 'finished',
              usage: 'when the terminal is done and played all the content.',
            })
        "
  @load-data="
          (data) =>
            table({
              action: 'load-data',
              usage: 'when terminal complete preparing data for play step.',
              script: data.script,
              timings: data.timings,
            })
        "
  @terminal-setup="
          (data) =>
            table({
              action: 'terminal-setup',
              usage: 'when terminal instance is ready to play.',
              fit: data.fit,
              search: data.search,
              terminal: data.terminal,
            })
        "
  @slider-movement="
          (data) =>
            table({
              action: 'slider-movement',
              usage:
                'when the user use the slider and select a specific second.',
              second: data[0],
            })
        "
  @speed-change="
          (data) =>
            table({
              action: 'speed-change',
              usage: 'when the user changes the terminal play speed.',
              speed: data[0],
            })
        "
/>
```

## Available props

| Prop             | Type    | Default | Description                    |
| ---------------- | ------- | ------- | ------------------------------ |
| timingFile       | String  | None    | The Timing File Content        |
| scriptFile       | String  | None    | The String File Content        |
| height           | Number  | 500     | Default Terminal Player Height |
| allowDebugButton | Boolean | True    | Show Debug Button Or No        |

## Events

These events are emitted on actions in the datepicker

| Event           | Output                  | Description                                             |
| --------------- | ----------------------- | ------------------------------------------------------- |
| paused          | none                    | Terminal Paused                                         |
| resume          | none                    | Terminal Resume                                         |
| play            | none                    | Terminal Started                                        |
| clean           | none                    | Terminal Content Erased                                 |
| finished        | none                    | Terminal Players Completed The Script                   |
| load-data       | {script, timings}       | Terminal script and timings data after parsing them     |
| terminal-setup  | {fit, search, terminal} | Terminal object and addons                              |
| slider-movement | [second]                | When The User Use The Slider To Move To Specific Second |
| speed-change    | [speed]                 | When The User Change Terminal Play Speed                |
