import { LitElement, css, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

// For more info on the @pwabuilder/pwainstall component click here https://github.com/pwa-builder/pwa-install
import '@pwabuilder/pwainstall';
import { addNewMusic, loadMusic } from '../services/music-library';

import '../components/music-item';
import '../components/media-controls';

import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.69/dist/components/button/button.js';
// import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.70/dist/components/icon-button/icon-button.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.69/dist/components/card/card.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.69/dist/components/animation/animation.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.69/dist/components/button-group/button-group.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.69/dist/components/drawer/drawer.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.69/dist/components/menu/menu.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.69/dist/components/menu-item/menu-item.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.69/dist/components/dropdown/dropdown.js';

import { setMedia, shareSong } from '../services/utils';

// @ts-ignore
import Worker from '../workers/visualize.js?worker'

@customElement('app-home')
export class AppHome extends LitElement {
  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  // vars for music lib
  @state() music: any[] | undefined = undefined;

  @state() currentEntry: any = undefined;

  @state() playing: boolean = false;

  analyser: any;
  source: any;
  audioContext: any;
  canvas: any;
  ani: number | undefined;
  handle: any;

  anWorker: Worker;

  audioEl: HTMLAudioElement | null | undefined;

  static get styles() {
    return css`
      #sideMenu {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-left: 10px;
        padding-top: 10px;
        padding-right: 10px;
        border-radius: 8px;
      }

      .visual-panel {
        --size: 100%;
      }

      canvas {
        border-radius: 8px;
      }

      .visual-panel::part(body) {
        overflow-y: hidden;
      }

      .visual-panel::part(overlay) {
        background-color: transparent;
        // backdrop-filter: blur(18px);
      }

      .visual-panel::part(panel) {
        background-color: rgb(16 15 26 / 90%);
      }

      @media(prefers-color-scheme: light) {
        .visual-panel::part(panel) {
          background-color: rgb(240 240 240 / 90%);
        }
      }

      #mainGrid {
        position: relative;
      }

      #sideMenu sl-button {
        margin-bottom: 8px;
        width: 100%;
      }

      #musicControls {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1em;
        display: flex;

        /* height: 2em; */
        justify-content: space-around;
        flex-direction: column;
        align-items: center;
        backdrop-filter: blur(14px);

        background: rgb(10 9 24);
      }

      @media (prefers-color-scheme: light) {
        #musicControls {
          background: #0000000f;
        }

        #sideMenu {
          background: #f0f0f0;
        }
      }

      #mobile-open {
        display: none;
      }

      #musicList {
        margin-left: 10px;
      }

      #musicList h2 {
        margin-left: 16px;
        font-size: 2.4em;
        margin-top: 10px;
        margin-bottom: 10px;
      }

      #musicList ul {
        border-radius: 8px;
      }

      @media (prefers-color-scheme: dark) {
        #center #musicList ul {
          background: rgb(15 13 35);
        }
      }

      @media(max-width: 1181px) {
        #center #musicList ul {
          height: 78vh;
        }
      }

      #musicGrid {
      }

      #controlBar {
        display: flex;
        position: fixed;
        top: 12px;
        right: 0;
        padding-right: 12px;
      }

      #center {
        display: grid;
        grid-template-columns: 22vw 78vw;
      }

      #center.playing {

      }

      #center ul {
        list-style: none;
        padding: 8px;
        padding-left: 16px;
        margin: 0;

        height: 82vh;
        overflow-y: scroll;
        overflow-x: hidden;

        grid-template-columns: repeat(auto-fill, minmax(224px, 1fr));
        grid-auto-rows: max-content;
        display: grid;
        gap: 10px;
        row-gap: 0px;
      }

      #center ul::-webkit-scrollbar {
        width: 8px; /* width of the entire scrollbar */
      }

      #center ul sl-card {
        margin-bottom: 10px;
        cursor: pointer;
        width: 100%;
      }

      #preview {
        display: flex;
        align-items: center;

        flex-direction: column;
        height: 38em;
        justify-content: space-evenly;
      }

      #preview img {
        width: 50%;
      }

      canvas {
        height: 99.4%;
        width: 100%;
      }

      #musicControls span {
        font-weight: bold;

        display: block;
        margin-bottom: 9px;
      }

      #visuals img {
        height: 52%;
        width: 100%;
      }

      #musicControls sl-button sl-icon {
        margin-top: 7px;
        height: 1em;
        font-size: 2em;
      }

      #buttons {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }

      #take-up-space {
        width: 62px;
      }

      @media (prefers-color-scheme: light) {
        #musicControls span {
          color: black;
        }

        #visuals {
          background: rgb(128 128 128 / 14%);
        }
      }

      @media (horizontal-viewport-segments: 2) {
        #center {
          grid-template-columns: 50vw 50vw;
        }

        #center #musicList ul {
          height: 81vh;
        }

        #buttons {
          width: 46vw;
        }

        #musicList {
          padding-right: 1.2em;
        }

        #preview {
          width: 48vw;
          position: fixed;
        }

        #musicControls {
          justify-content: space-between;
          flex-direction: row;
        }

        #musicControls span {
          max-width: 30em;
        }
      }

      @media (max-width: 770px) {
        #center {
          height: 82vh;
          grid-template-columns: auto;
        }

        #sideMenu {
          display: none;
        }

        sl-drawer {
          --size: 44rem;
        }

        sl-drawer::part(body) {
          padding: 0;
          margin: 0;
        }

        #mobile-list {
          list-style: none;
          margin: 0;
          padding: 0;
          padding-left: 10px;
          margin-right: 14px;
          margin-left: 4px;
        }

        #mobile-open {
          display: none;
          position: fixed;
          bottom: 6.5em;
          left: 8px;
          right: 8px;
        }

        #center ul {
          height: 60vh;

          padding: 4px;
        }

        #visuals img {
          height: 120%;
        }

        #preview {
          position: fixed;
          top: 6em;
          left: 0em;
        }

        #musicControls {
          z-index: 2;
        }

        #musicControls span {
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          display: block;
          width: 70vw;
          /* text-align: center; */
        }

        #textDiv {
          /* text-align: center; */
          display: flex;
          text-align: center;
          justify-content: center;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');

    // await this.load();

    if ('OffscreenCanvas' in window) {
      // @ts-ignore
      this.canvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    } else {
      this.canvas = document.createElement('canvas');
    }

    await this.load();
  }

  async share() {
    await shareSong(this.currentEntry);
  }

  async load() {
    const music = await loadMusic();
    console.log('loaded music', music);

    let entryArray: any[] = [];

    let potentialMusicArray: any[] = [];

    // this.music = undefined;

    for await (const entry of (music as any).values()) {
      console.log('loadEntry', entry);

      entryArray = [...entryArray, entry];
      // entryArray.push(entry);
    }

    console.log('entryArray', entryArray);

    // const root = await navigator.storage.getDirectory();

    if (entryArray && entryArray.length > 0) {
      // this.music = [...entryArray];
      entryArray.map(async (entry: any) => {
        if (entry.kind === "file") {
          console.log(entry);

          const file = await entry.getFile();

          const entryObject = {
            file,
            entry
          }

          potentialMusicArray = [...potentialMusicArray, entryObject];
        }
        else {
          const values = await entry.values();

          let folderSongs = []

          // go through directory and push songs to folderSongs
          for await (const value of values) {
            folderSongs.push(value);
            /*console.log(value);
            const file = await value.getFile();
            console.log(entry, file);

            const entryObject = {
              file,
              entry
            }

            potentialMusicArray = [...potentialMusicArray, entryObject];*/
          }

          const entryObject = {
            folderSongs,
            entry
          }
          potentialMusicArray = [...potentialMusicArray, entryObject];

          // this.music = potentialMusicArray;

        }

        console.log('potentialMusicArray', potentialMusicArray);
        this.music = [...potentialMusicArray];
      });

      console.log('potentialMusicArray', potentialMusicArray);
    } else {
      await this.add("directory");
    }

    this.setupListeners();
  }

  async add(type: "file" | "directory") {
    console.log(type);
    await addNewMusic(type);

    await this.load();
  }

  async loadSong(entry: any) {
    console.log(entry);
    if (entry.kind === 'file') {
      const fileData = await entry.getFile();
      this.currentEntry = fileData;

      console.log('fileData', fileData);

      if (!this.audioEl) {
        this.audioEl = this.shadowRoot?.querySelector('audio');
      }

      if (this.audioEl) {
        this.audioEl.src = URL.createObjectURL(fileData);
        await this.play();
      }
    }
  }

  setupListeners() {
    // play next track when current track ends

    if (!this.audioEl) {
      this.audioEl = this.shadowRoot?.querySelector('audio');
    }

    if (this.audioEl) {
      this.audioEl.onended = () => {
        if (this.ani) {
          console.log(this.ani);
          window.cancelAnimationFrame(this.ani);
        }

        if (this.handle) {
          clearInterval(this.handle);
        }

        this.playNext();
      };

      this.audioEl.onpause = () => {
        if (this.ani) {
          window.cancelAnimationFrame(this.ani);
        }

        if (this.handle) {
          clearInterval(this.handle);
        }
      };

      this.audioEl.onplaying = () => {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        if (!this.source && !this.analyser) {
          this.source = this.audioContext.createMediaElementSource(this.audioEl);
          this.analyser = this.audioContext.createAnalyser();

          this.source.connect(this.analyser);
          this.analyser.connect(this.audioContext.destination);
        }

        this.analyser.fftSize = 2048;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        this.runVisual(dataArray);
      };
    }
  }

  playPrevious() {
    this.pause();

    let index = 0;

    if (this.music && this.music.length > 0) {
      console.log('this.currentEntry', this.currentEntry);
      console.log('this.music', this.music);

      this.music.forEach((entry) => {
        console.log('entry', entry.entry.kind);
        console.log('entry.folderSongs', entry.folderSongs);

        if (entry.folderSongs) {
          let potentialIndex = entry.folderSongs.findIndex(
            (file: any) => file.name === this.currentEntry.name
          );

          console.log(potentialIndex)

          if (potentialIndex > -1) {
            index = potentialIndex

            const nextIndex = index - 1;

            console.log('nextIndex', nextIndex);


            if (this.music && nextIndex < entry.folderSongs.length) {
              console.log('entry.folderSongs[nextIndex]', entry.folderSongs[nextIndex]);

              setTimeout(() => {
                if (this.music) {
                  this.loadSong(entry.folderSongs[nextIndex]);
                }
              }, 1000);

              return;
            }
          }
        }
        else {
          console.log('this.music 2', this.music);
          console.log('file', this.currentEntry.name);
          let potentialIndex = this.music?.findIndex(
            (file: any) => file.file?.name === this.currentEntry.name
          );

          console.log('potentialIndex', potentialIndex);

          if (potentialIndex !== undefined && potentialIndex > -1) {
            index = potentialIndex

            const nextIndex = index - 1;

            console.log('music inside file', this.music);

            if (this.music && nextIndex < this.music.length) {
              console.log('this.music[nextIndex]', this.music[nextIndex].entry);

              setTimeout(() => {
                if (this.music) {
                  this.loadSong(this.music[nextIndex].entry);
                }
              }, 1000);

              return;
            }
          }
        }
      })

    }
  }

  async playNext() {
    this.pause();

    let index = 0;

    if (this.music && this.music.length > 0) {
      console.log('this.currentEntry', this.currentEntry);
      console.log('this.music', this.music);

      this.music.forEach((entry) => {
        console.log('entry', entry.entry.kind);
        console.log('entry.folderSongs', entry.folderSongs);

        if (entry.folderSongs) {
          let potentialIndex = entry.folderSongs.findIndex(
            (file: any) => file.name === this.currentEntry.name
          );

          console.log(potentialIndex)

          if (potentialIndex > -1) {
            index = potentialIndex

            const nextIndex = index + 1;

            console.log('nextIndex', nextIndex);


            if (this.music && nextIndex < entry.folderSongs.length) {
              console.log('entry.folderSongs[nextIndex]', entry.folderSongs[nextIndex]);

              setTimeout(() => {
                if (this.music) {
                  this.loadSong(entry.folderSongs[nextIndex]);
                }
              }, 1000);

              return;
            }
          }
        }
        else {
          console.log('this.music 2', this.music);
          console.log('file', this.currentEntry.name);
          let potentialIndex = this.music?.findIndex(
            (file: any) => file.file?.name === this.currentEntry.name
          );

          console.log('potentialIndex', potentialIndex);

          if (potentialIndex !== undefined && potentialIndex > -1) {
            index = potentialIndex

            const nextIndex = index + 1;

            console.log('music inside file', this.music);

            if (this.music && nextIndex < this.music.length) {
              console.log('this.music[nextIndex]', this.music[nextIndex].entry);

              setTimeout(() => {
                if (this.music) {
                  this.loadSong(this.music[nextIndex].entry);
                }
              }, 1000);

              return;
            }
          }
        }
      })

    }
  }

  async stop() {
    this.playing = false;

    await this.updateComplete;

    if (!this.audioEl) {
      this.audioEl = this.shadowRoot?.querySelector('audio');
    }

    if (this.audioEl) {
      await this.pause();

      this.audioEl.currentTime = 0;
    }
  }

  async play() {
    this.playing = true;

    await this.updateComplete;

    if (!this.audioEl) {
      this.audioEl = this.shadowRoot?.querySelector('audio');
    }

    if (this.audioEl) {
      await this.audioEl.pause();
      await this.audioEl.play();

      setMedia(this.currentEntry);

      if (navigator.mediaSession) {
        navigator.mediaSession.setActionHandler('play', async () => {
          console.log('play');
          await this.play();
        });

        navigator.mediaSession.setActionHandler('pause', async () => {
          console.log('pause');
          await this.pause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', async () => {
          await this.playPrevious();
        });

        navigator.mediaSession.setActionHandler('nexttrack', async () => {
          await this.playNext();
        });

        navigator.mediaSession.setActionHandler('stop', async () => {
          await this.stop();
        })
      }

      console.log(this.currentEntry);

      const drawer: any = this.shadowRoot?.querySelector(
        '.drawer-placement-bottom'
      );

      if (drawer) {
        drawer.hide();
      }

      await this.openVisuals();
    }
  }

  runVisual(data: Uint8Array) {
    let onscreenCanvas = null;

    /*if ('OffscreenCanvas' in window) {
      onscreenCanvas = this.shadowRoot
        ?.querySelector('canvas')
        ?.getContext('bitmaprenderer');
    } else {
      onscreenCanvas = this.shadowRoot?.querySelector('canvas');
    }*/

    onscreenCanvas = this.shadowRoot?.querySelector('canvas');

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const context = this.canvas.getContext('2d');

    context?.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // this.draw(data, context, this.canvas, onscreenCanvas);
   if (onscreenCanvas) {
      /*onscreenCanvas.width = window.innerWidth;
      onscreenCanvas.height = window.innerHeight;*/

      //@ts-ignore
      const offscreen = onscreenCanvas.transferControlToOffscreen();
      if (!this.anWorker) {
        this.anWorker = new Worker();
      }

      this.anWorker.postMessage({canvas: offscreen, width: window.innerWidth, height: window.innerHeight}, [offscreen]);

      requestAnimationFrame(() => {
        this.postData(data);
      })
    }
  }

  postData(data: Uint8Array) {
    this.analyser?.getByteFrequencyData(data);

    this.anWorker.postMessage({data: data, width: window.innerWidth, height: window.innerHeight});

    this.ani = requestAnimationFrame(this.postData.bind(this, data));
  }

  async pause() {

    this.playing = false;

    await this.updateComplete;

    if (!this.audioEl) {
      this.audioEl = this.shadowRoot?.querySelector('audio');
    }

    if (this.audioEl) {
      this.audioEl.pause();

      /*navigator.mediaSession.metadata = new MediaMetadata({
        title: this.currentEntry.name
      });*/
    }
  }

  async openVisuals() {
    const drawer: any = this.shadowRoot?.querySelector(
      '.visual-panel'
    );
    // const openButton = this.shadowRoot?.querySelector('#mobile-open');

    console.log("drawer", drawer);

    if (drawer) {
      await drawer.show();
    }
    // closeButton.addEventListener('click', () => drawer.hide());
  }

  openMobileMusic() {
    const drawer: any = this.shadowRoot?.querySelector(
      '.drawer-placement-bottom'
    );
    const openButton = this.shadowRoot?.querySelector('#mobile-open');

    console.log("drawer", drawer);

    if (drawer) {
      openButton?.addEventListener('click', () => drawer.show());
    }
    // closeButton.addEventListener('click', () => drawer.hide());
  }

  render() {
    return html`
      <app-header></app-header>

      <audio autoplay></audio>

      <div id="mainGrid">
        <div id="controlBar">
          ${this.music && this.music.length > 0
            ? html`
              <sl-button-group>
                <sl-button variant="primary">Add Music</sl-button>
                <sl-dropdown placement="bottom-end">
                  <sl-button slot="trigger" variant="primary" caret></sl-button>
                  <sl-menu>
                    <sl-menu-item @click="${() => this.add("directory")}">Add Folder</sl-menu-item>
                    <sl-menu-item @click="${() => this.add("file")}">Add File</sl-menu-item>
                  </sl-menu>
                </sl-dropdown>
              </sl-button-group>
              `
            : null}
        </div>

        <div class=${classMap({ playing: !this.playing })} id="center">
          <section id="sideMenu">
            <sl-button href="/">My Music</sl-button>
            <sl-button href="/">Settings</sl-button>
          </section>

          <section id="musicList">
            <h2>Music</h2>

            ${this.music && this.music.length > 0
              ? html`
                  <sl-animation
                    name="fadeIn"
                    easing="ease-in-out"
                    duration="400"
                    iterations="1"
                    play
                  >
                    <ul>
                      ${this.music.map(
                        (song) => html`
                          <music-item
                            .entry=${song.entry}
                            .kind=${song.entry.kind}
                            .folderSongs=${song.folderSongs}
                            @load-song="${($event: any) =>
                              this.loadSong($event.detail.song)}"

                            @reload="${() => this.load()}"
                          ></music-item>
                        `
                      )}
                    </ul>
                  </sl-animation>
                `
              : html`<div id="preview">
                  ${this.playing === false
                  ? html`<sl-animation
                      name="fadeIn"
                      easing="ease-in-out"
                      duration="800"
                      iterations="1"
                      play
                      ><img src="/assets/playing-graphic.svg"
                    /></sl-animation>`
                  : null}

                  <sl-button
                    size="small"
                    variant="primary"
                    @click="${() => this.load()}"
                    >Load Music</sl-button
                  >
                </div>`}
          </section>

          <!--<section id="visuals">
            ${this.playing === false
              ? html`<sl-animation
                  name="fadeIn"
                  easing="ease-in-out"
                  duration="800"
                  iterations="1"
                  play
                  ><img src="/assets/playing-graphic.svg"
                /></sl-animation>`
              : null}
            ${this.playing === true ? html`<canvas></canvas>` : null}
          </section>-->
        </div>

        <sl-animation
          name="slideInUp"
          easing="ease-in-out"
          duration="400"
          iterations="1"
          play
        >
          <div id="musicControls">
            <div id="textDiv">
              <span>${this.currentEntry?.name || 'No Music Playing...'}</span>
            </div>

            ${this.music && this.music.length > 0
              ? html`
                  <div id="buttons">
                    <div id="take-up-space">
                      <media-controls
                        @play="${() => this.play()}"
                        @pause="${() => this.pause()}"
                      ></media-controls>
                    </div>

                    <sl-button-group>
                      <sl-button @click="${() => this.playPrevious()}">
                        <sl-icon
                          src="/assets/play-skip-back-outline.svg"
                        ></sl-icon>
                      </sl-button>
                      <div>
                        ${this.playing === false
                          ? html`
                              <sl-button
                                variant="primary"
                                @click="${() => this.play()}"
                              >
                                <sl-icon
                                  src="/assets/play-outline.svg"
                                ></sl-icon>
                              </sl-button>
                            `
                          : html`<sl-button
                              variant="danger"
                              @click="${() => this.pause()}"
                            >
                              <sl-icon
                                src="/assets/pause-outline.svg"
                              ></sl-icon>
                            </sl-button>`}
                      </div>

                      <sl-button @click="${() => this.playNext()}">
                        <sl-icon
                          src="/assets/play-skip-forward-outline.svg"
                        ></sl-icon>
                      </sl-button>
                    </sl-button-group>

                    <sl-button ?disabled="${!this.playing}" @click="${() => this.share()}">
                      <sl-icon src="/assets/icons/share-outline.svg"></sl-icon>
                    </sl-button>
                  </div>
                `
              : null}
          </div>
        </sl-animation>

        <sl-button
          id="mobile-open"
          variant="primary"
          @click="${() => this.openMobileMusic()}"
          >Open Music</sl-button
        >

        <sl-drawer
          placement="bottom" class="visual-panel">
          ${this.playing === true ? html`<canvas></canvas>` : null}
        </sl-drawer>

        <sl-drawer
          label="My Music"
          placement="bottom"
          class="drawer-placement-bottom"
        >
          <ul id="mobile-list">
            ${this.music && this.music.length > 0
              ? this.music.map(
                  (entry) => html`
                    <music-item
                      .entry=${entry.entry}
                      .kind=${entry.entry.kind}
                      .folderSongs=${entry.folderSongs}
                      @load-song="${($event: any) =>
                        this.loadSong($event.detail.song)}"
                    ></music-item>
                  `
                )
              : null}
          </ul>
        </sl-drawer>
      </div>
    `;
  }
}
