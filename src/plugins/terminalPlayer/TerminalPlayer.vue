<template>
  <div id="TerminalPlayer" ref="terminalPlayer">
    <div id="Terminal" ref="terminal"></div>
    <div class="controls">
      <!-- fake timer that move smooth -->
      <div class="slider-container fake">
        <input
          type="range"
          :min="0"
          :max="Math.floor(totalTime)"
          class="slider"
          ref="slider"
          v-model="fakeCurrentTime"
          @change.prevent="(e) => sliderMovement(e.target.value)"
        />
      </div>

      <!-- actual timer -->
      <div class="slider-container" v-if="debug">
        <input
          type="range"
          :min="0"
          :max="totalTime"
          class="slider"
          ref="slider"
          v-model="currentTime"
          @change.prevent="(e) => sliderMovement(e.target.value)"
        />
      </div>

      <!-- player tools -->
      <div class="tools">
        <div class="simple-options">
          <span
            class="terminal-play-pause"
            v-tooltip="paused ? 'Play The Termianl' : 'Pause The Terminal'"
            @click="togglePuasePlay()"
          >
            <Play v-if="paused" />
            <Pause v-else />
          </span>

          <!-- timer -->
          <span class="time">
            <span class="terminal-current-time">{{
              formatTime(fakeCurrentTime)
            }}</span>

            <span class="time-divider" v-if="debug">/</span>
            <span class="terminal-current-time" v-if="debug">{{
              formatTime(currentTime)
            }}</span>

            <span class="time-divider">/</span>
            <span class="terminal-total-time">{{ formatTime(totalTime) }}</span>
          </span>
        </div>

        <div class="search-bar" v-tooltip="'Search Terminal'">
          <div>
            <input
              type="text"
              v-model="search"
              :placeholder="'Search Terminal'"
            />
            <button @click="searchTerminal()">Search</button>
          </div>
          <span @click="latestSearchResult = ''">{{ latestSearchResult }}</span>
        </div>

        <div class="advanced-options">
          <span
            v-tooltip="'Toggle Debug Mode'"
            class="debug"
            @click="debug = !debug"
            v-if="allowDebugButton"
          >
            <Debug />
          </span>

          <span
            v-tooltip="'Terminal Reply Speed'"
            class="speed"
            @mouseover="showSpeeds = true"
            @mouseleave="delayChange()"
          >
            <span class="current-speed" v-if="!showSpeeds"
              >{{ newDelay }}x</span
            >
            <span class="speeds" v-else>
              <input type="number" v-model="newDelay" />
              <ul>
                <li
                  v-for="speed in speeds"
                  v-bind:key="speed"
                  @click="
                    () => {
                      newDelay = speed;
                      delayChange();
                    }
                  "
                >
                  {{ speed }}x
                </li>
              </ul>
            </span>
          </span>

          <span
            class="full-screen"
            v-tooltip="'Toggle Full Screen Mode'"
            @click="() => toggleFullscreen($refs['terminalPlayer'])"
          >
            <FullScreen />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Pause from "./images/pause.vue";
import Play from "./images/play.vue";
import FullScreen from "./images/fullscreen.vue";
import Debug from "./images/debug.vue";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { SearchAddon } from "xterm-addon-search";
import { WebLinksAddon } from "xterm-addon-web-links";
import { VTooltip } from "v-tooltip";

// webgl addon
// import { WebglAddon } from "xterm-addon-webgl";

export default {
  name: "TerminalPlayer",
  directives: {
    tooltip: VTooltip,
  },
  props: {
    scriptFile: {
      required: true,
    },
    timingFile: {
      required: true,
    },
    height: {
      default: 500,
      type: Number,
    },
    allowDebugButton: {
      default: true,
      type: Boolean,
    },
  },
  components: {
    Pause,
    Play,
    FullScreen,
    Debug,
  },
  mounted() {
    // set terminal default height
    this.$refs["terminal"].style.height = this.height + "px";
    // add event listener for fullscreen exit
    if (document.addEventListener) {
      document.addEventListener("fullscreenchange", this.fullscreenExit, false);
      document.addEventListener(
        "mozfullscreenchange",
        this.fullscreenExit,
        false
      );
      document.addEventListener(
        "MSFullscreenChange",
        this.fullscreenExit,
        false
      );
      document.addEventListener(
        "webkitfullscreenchange",
        this.fullscreenExit,
        false
      );
    }

    // prepare the terminal
    this.loadFrom({
      scriptFile: this.scriptFile,
      timingFile: this.timingFile,
    });
    // play the termianl
    this.play();
  },
  data() {
    return {
      // debug mode
      debug: false,
      // search phrase
      search: "",
      // speed of the terminal render
      delay: 1000,
      newDelay: 1,
      speeds: [0.5, 1, 2, 3],
      showSpeeds: false,
      // terminal size fit addon
      fitAddon: "",
      // terminal search option addon
      searchAddon: "",
      latestSearchResult: "",
      // current real running time, and fake smooth running time
      currentTime: 0,
      fakeCurrentTime: 0,
      // total time of the script
      totalTime: 0,
      // total time list one by one
      timings: [],
      // total allowed render script
      script: "",
      // start position
      start: 0,
      // current position
      position: 0,
      // script done boolean
      stopped: false,
      // pause boolean
      paused: false,
      // terminal instance object
      terminal: {},
      // is terminal render timeout running or no
      timeoutRunning: false,
      // is fake timer timeout is running or no
      fakeTimerInterval: false,
    };
  },
  methods: {
    /**
     * Format A Given Time
     */
    formatTime(SECONDS) {
      if (SECONDS > 60 * 60) {
        return new Date(SECONDS * 1000).toISOString().substr(11, 8);
      } else {
        return new Date(SECONDS * 1000).toISOString().substr(14, 5);
      }
    },

    /**
     * Load Options
     */
    loadFrom(options) {
      this.timings = (options.timingFile || "")
        .trim()
        .split("\n")
        .map(function (line) {
          return line.split(" ").map(Number);
        });

      this.timings.map((time) => {
        this.totalTime += time[0];
      });

      let lines = (options.scriptFile || "").trim().split("\n");
      this.script = lines.slice(1).join("\n");

      this.start = 0;
      this.position = options.position || this.getPosition();
      this.stopped = options.stopped || false;
      this.paused = options.paused || false;

      this.$emit("load-data", {
        timings: this.timings,
        script: this.script,
      });
    },

    /**
     * Reset The Terminal
     */
    reset() {
      if (this.terminal) {
        this.$refs["terminal"].innerHTML = "";
      }
      clearTimeout(this.fakeTimerInterval);
      this.fakeTimerInterval = false;
      this.currentTime = 0;
      this.fakeCurrentTime = 0;
      this.terminal = new Terminal();
      this.fitAddon = new FitAddon();
      this.searchAddon = new SearchAddon();
      this.terminal.loadAddon(this.fitAddon);
      this.terminal.loadAddon(this.searchAddon);
      this.terminal.loadAddon(new WebLinksAddon());
      this.terminal.refresh(0, 1);
      this.terminal.open(this.$refs["terminal"]);
      this.fitAddon.fit();
      Terminal.focus = null;
      Terminal.cursorBlink = false;
      this.stopped = false;
      this.position = this.start = 0;
      // this.terminal.loadAddon(new WebglAddon());
      this.$emit("terminal-setup", {
        terminal: this.terminal,
        fit: this.fitAddon,
        search: this.searchAddon,
      });
    },

    /**
     * Add To Terminal
     */
    addToTerminal(string) {
      this.terminal.write(string);
    },

    /**
     * Get Current position
     */
    getPosition() {
      let timers = 0;
      let x;
      for (x = 0; x < this.timings.length; x++) {
        if (timers < this.currentTime) {
          timers += this.timings[x][0];
        } else {
          break;
        }
      }

      this.position = x;

      return this.position;
    },

    /**
     * Get The closest Time To the Slider
     * @param {integer} val
     */
    getCurrentSliderTime(val) {
      let timers = 0;
      let x;
      for (x = 0; x < this.timings.length; x++) {
        if (timers < val) {
          timers += this.timings[x][0];
        } else {
          break;
        }
      }
      return timers;
    },

    /**
     * Add Current Text To The Terminal, After Fetching Current Text From Current Time
     */
    setCurrentText(text = false) {
      if (!text) {
        this.addToTerminal(
          this.script.substr(this.start, this.timings[this.position][1])
        );
        this.start += this.timings[this.position][1];
        this.currentTime += this.timings[this.position][0];
        this.getPosition();
      } else {
        this.addToTerminal(text);
        this.terminal.scrollToBottom();
      }
      clearTimeout(this.timeoutRunning);
      this.timeoutRunning = false;
      // $(".showterm-controls .showterm-slider").slider(
      //   "value",
      //   this.currentTime
      // );
    },

    /**
     * Slider Movement
     */
    sliderMovement(value) {
      this.$emit("slider-movement", value);
      value = parseFloat(value);
      this.currentTime = this.getCurrentSliderTime(value);
      this.tick(true);
    },

    // handle clicks
    tick(slider = false) {
      if (this.paused && !slider) {
        this.getPosition();
        return true;
      } else if (slider) {
        // clean terminal
        this.clean();

        let delta = 0;
        this.getPosition();

        this.timings.slice(0, this.position).forEach(function (timing) {
          delta += timing[1];
        });
        this.start = delta;

        let text = this.script.substr(this.start, delta);

        this.setCurrentText(text);

        this.stopped = false;

        // pause if not paused
        if (!this.paused) {
          this.paused = true;
        }

        this.terminal.scrollToBottom();

        return true;
      }
      if (this.paused) {
        return true;
      }

      if (slider) {
        this.setCurrentText();
      } else {
        this.setCurrentText();
      }

      if (this.position + 1 >= this.timings.length) {
        this.$emit("finished");
        this.stopped = true;
        this.paused = true;
        return true;
      } else {
        if (!this.timeoutRunning) {
          this.timeoutRunning = window.setTimeout(
            this.tick,
            this.timings[this.position + 1][0] * this.delay
          );

          return true;
        }
      }

      return false;
    },

    // clean up the terminal
    clean() {
      this.terminal.clear();
      this.$emit("clean");
    },

    // start the terminal
    play() {
      this.$emit("play");
      this.reset();
      this.tick();
      if (!this.fakeTimerInterval) {
        this.fakeTimer();
      }
    },

    // toggle between pause and play terminal
    togglePuasePlay() {
      if (this.stopped) {
        this.play();
        this.paused = false;
      } else {
        this.paused = !this.paused;
      }
    },

    // toggle between full screen
    toggleFullscreen(elem) {
      elem = elem || document.documentElement;

      if (
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement
      ) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }

        this.$refs["terminal"].style.height = "100%";
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        this.$refs["terminal"].style.height = this.height + "px";
      }

      setTimeout(() => {
        this.fitAddon.fit();
        this.$refs["terminal"].style.height = "auto";
      }, 100);
    },

    // exit full screen in none allowed method
    fullscreenExit() {
      if (
        !document.fullscreenElement &&
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        this.$refs["terminal"].style.height = this.height + "px";
        setTimeout(() => {
          this.fitAddon.fit();
          this.$refs["terminal"].style.height = "auto";
        }, 100);
      }
    },

    // termianl speed change
    delayChange() {
      this.showSpeeds = false;
      this.delay = 1000 / this.newDelay;
    },

    /**
     * Fake Time For UI
     */
    fakeTimer() {
      this.fakeTimerInterval = setTimeout(() => {
        if (parseFloat(this.currentTime) > this.fakeCurrentTime) {
          this.fakeCurrentTime = parseFloat(this.currentTime);
        } else if (!this.paused && !this.stopped) {
          this.fakeCurrentTime += 1;
        }
        this.fakeTimer();
      }, this.delay);
    },

    /**
     * search the terminal result
     */
    searchTerminal() {
      this.latestSearchResult = this.searchAddon.findNext(this.search)
        ? "Found"
        : "Not Found";
    },
  },
  watch: {
    paused() {
      if (!this.paused) {
        this.$emit("resume");
        this.tick();
      } else {
        this.$emit("paused");
      }
    },
    delay() {
      this.$emit("speed-change", this.delay);
      clearTimeout(this.timeoutRunning);
      this.timeoutRunning = false;
      this.tick();
    },
  },
};
</script>
<style lang="scss">
@import "./styles/style.scss";
</style>
