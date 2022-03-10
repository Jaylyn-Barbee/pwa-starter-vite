import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { classMap } from 'lit/directives/class-map.js';
import { removeFromLib } from '../services/music-library';

import { shareSong } from '../services/utils';

import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.71/dist/components/card/card.js';

@customElement('music-item')
export class MusicItem extends LitElement {
  @property() entry: any;
  @property() kind: string | undefined;
  @property() folderSongs: any;

  @state() expanded: any[] = [];

  @state() file: any;

  static get styles() {
    return css`
            :host {
                display: block;
                border-radius: 8px;
            }

            li {
                background: rgb(36 36 36 / 23%);
                padding: 8px;
                font-size: 14px
                cursor: pointer;

                animation-name: fadeIn;
                animation-duration: 300ms;
            }

            .music-title {
              overflow: hidden;
              white-space: nowrap;
              display: block;
              text-overflow: ellipsis;
              font-weight: bold;
            }

            sl-card {
                margin-bottom: 10px;
                width: 100%;
                --sl-panel-background-color: #30303061;
            }

            sl-card [slot="image"] {
              height: 10em;
            }

            sl-card [slot="footer"] {
              display: flex;
              justify-content: flex-end;
              align-items: center;
            }

            #share-button {
                margin-right: 8px;
            }

            .directoryFolder {
              padding: 16px 10px 10px;
              margin-bottom: 8px;
              background: rgb(28 27 34);
              margin-top: 8px;
              border-radius: 8px;
            }

            @media(prefers-color-scheme: light) {
                li {
                    background: #0000000f;
                }

                sl-card {
                    --sl-panel-background-color: white;
                }

                .directoryFolder {
                  background: #edededb5;
                  color: black;
                }
            }

            .title {
              font-size: 18px;
              font-weight: bold;

              margin-left: 10px;
            }

            .innerList {
                list-style: none;
                padding: 8px;
                margin: 0;

                margin-top: 8px;

                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }

            .innerList li, li.file {
                margin-top: 8px;
                border-left: solid 3px #6c63ff;
                padding: 10px;

                background: #ffffff1a;

                border-radius: 0px 8px 8px 0px;

                font-size: 14px;
                cursor: pointer;

                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            @media(prefers-color-scheme: light) {
              .innerList li {
                background: white;
              }

              li.file {
                background: #edededb5;
              }
            }

            li span {
              width: 60%;
            }

            #inner-controls {
              display: flex;
              align-items: center;
            }

            @media(max-width: 716px) {
                li {
                 padding: 0;
                }

                .innerList li, li.file {
                    height: 2em;
                    display: flex;
                    align-items: center;
                }
            }

            @media(horizontal-viewport-segments: 2) {
                .innerList li, li.file {
                    height: 2em;
                    display: flex;
                    align-items: center;
                }

                sl-card {
                    width: 100%;
                    margin-bottom: 14px;
                }
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;

                }

                to {
                    opacity: 1;
                }
            }
        `;
  }

  protected async firstUpdated() {
    // console.log("firstUpdated");
    console.log(this.entry.kind);
    console.log(' got a file', this.entry.name, this.entry.kind);
    if (this.entry && this.kind && this.kind === 'directory') {
      if (this.entry.name && this.entry.name.length > 0) {
        console.log('expanding on load', this.kind);
        await this.expandFolder(this.entry);
      }
    }
  }

  loadSong(song: any) {
    console.log(song);

    const event = new CustomEvent('load-song', {
      detail: {
        song,
      },
    });
    this.dispatchEvent(event);
  }

  async expandFolder(folder: any): Promise<any> {
    const expanded = [];

    console.log('folder', folder);

    for await (const entry of folder.values()) {
      console.log('entry', entry);
      if (entry.kind === 'file') {
        expanded.push(entry);
      }
    }

    this.expanded = expanded;

    console.log('this.expanded', this.expanded);
  }

  async share(event: any, entry: any) {
    event.preventDefault();
    await shareSong(await entry.getFile());
    event.preventDefault();
  }

  async removeItem(event: any, entry: any, rootDir: any) {
    event.preventDefault();
    console.log('entry', entry);
    console.log('rootDir', rootDir);

    if (rootDir) {
      await removeFromLib(entry, rootDir);

      await this.expandFolder(rootDir);

      if (this.expanded.length === 0) {
        await rootDir.remove();
      }
    } else {
      await removeFromLib(entry);
    }

    const eventToPush = new CustomEvent('reload', {
      detail: {},
    });
    this.dispatchEvent(eventToPush);

    event.preventDefault();
  }

  render() {
    return html`
      <!--<li
        class=${classMap({ file: this.entry.kind === 'file' })}
      >
        <span @click="${() => this.loadSong(this.entry)}" class=${classMap({
        title: this.entry.kind === 'directory',
      })}
          >${this.entry.name}</span
        >

        ${this.entry.kind === 'file'
        ? html`<div id="inner-controls">
            <sl-icon-button
              src="/assets/icons/share-outline.svg"
              style="font-size: 1.5rem;"
              @click="${($event: any) => this.share($event, this.entry)}"
            ></sl-icon-button>
            <sl-icon-button
              variant="danger"
              src="/assets/trash-outline.svg"
              style="font-size: 1.5rem;"
              @click="${($event: any) =>
                this.removeItem($event, this.entry, undefined)}"
            ></sl-icon-button>
          </div>`
        : null}

        ${this.expanded && this.expanded.length > 0
        ? html`<ul class="innerList">
            ${this.expanded.map(
              (entry) =>
                html`
                  <li aria-role="button">
                    <span @click="${() => this.loadSong(entry)}"
                      >${entry.name}</span
                    >

                    <div id="inner-controls">
                      <sl-icon-button
                        src="/assets/icons/share-outline.svg"
                        style="font-size: 1.5rem;"
                        @click="${($event: any) => this.share($event, entry)}"
                      ></sl-icon-button>
                      <sl-icon-button
                        variant="danger"
                        src="/assets/trash-outline.svg"
                        style="font-size: 1.5rem;"
                        @click="${($event: any) =>
                          this.removeItem($event, entry, this.entry)}"
                      ></sl-icon-button>
                    </div>
                  </li>
                `
            )}
          </ul>`
        : null}
      </li>-->

      ${this.kind &&
      this.entry.kind === 'directory' &&
      this.entry &&
      this.entry.name.length > 0
        ? html`
            <div class="directoryFolder">
              <span
                class=${classMap({ title: this.entry.kind === 'directory' })}
                >${this.entry.name}</span
              >
              <ul class="innerList">
                ${this.expanded.map(
                  (entry) =>
                    html`
                      <sl-card>
                        <span>${entry.name}</span>

                        <div slot="footer" id="inner-controls">
                          <sl-icon-button
                            src="/assets/play-outline.svg"
                            style="font-size: 1.5rem;"
                            @click="${() => this.loadSong(entry)}"
                          ></sl-icon-button>
                          <sl-icon-button
                            src="/assets/icons/share-outline.svg"
                            style="font-size: 1.5rem;"
                            @click="${($event: any) =>
                              this.share($event, entry)}"
                          ></sl-icon-button>
                          <sl-icon-button
                            variant="danger"
                            src="/assets/trash-outline.svg"
                            style="font-size: 1.5rem;"
                            @click="${($event: any) =>
                              this.removeItem($event, entry, this.entry)}"
                          ></sl-icon-button>
                        </div>
                      </sl-card>
                    `
                )}
              </ul>
            </div>
          `
        : html`
            <sl-card class="file">
              <img slot="image" src="/assets/musical-notes-outline.svg" />
              <span class="music-title">${this.entry.name}</span>

              <div slot="footer" id="inner-controls">
                <sl-icon-button
                  src="/assets/play-outline.svg"
                  style="font-size: 1.5rem;"
                  @click="${() => this.loadSong(this.entry)}"
                ></sl-icon-button>
                <sl-icon-button
                  src="/assets/icons/share-outline.svg"
                  style="font-size: 1.5rem;"
                  @click="${($event: any) => this.share($event, this.entry)}"
                ></sl-icon-button>
                <sl-icon-button
                  variant="danger"
                  src="/assets/trash-outline.svg"
                  style="font-size: 1.5rem;"
                  @click="${($event: any) =>
                    this.removeItem($event, this.entry, undefined)}"
                ></sl-icon-button>
              </div>
            </sl-card>
          `}
    `;
  }
}
