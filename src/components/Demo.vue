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
