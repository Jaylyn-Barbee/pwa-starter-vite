import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('media-controls')
export class MediaControls extends LitElement {
  static get styles() {
    return css`
      :host {
      }
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    // this.handleMediaControls();
  }

  async handleMediaControls() {
    console.log('Called');
    if ('mediaSession' in navigator) {
      const actionHandlers = [
        [
          'play',
          () => {
            this.doEvent('play');
            console.log('play');
          },
        ],
        [
          'pause',
          () => {
            this.doEvent('pause');
          },
        ],
        [
          'previoustrack',
          () => {
            this.doEvent('previous');
          },
        ],
        [
          'nexttrack',
          () => {
            this.doEvent('next');
          },
        ],
        [
          'stop',
          () => {
            this.doEvent('stop');
          },
        ],
      ];

      for (const [action, handler] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(
            action as MediaSessionAction,
            handler as MediaSessionActionHandler
          );
        } catch (error) {
          console.log(
            `The media session action "${action}" is not supported yet.`
          );
        }
      }
    }
  }

  doEvent(eventName: string) {
    // fire custom event
    const event = new CustomEvent(eventName, {
      detail: {
        data: eventName,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    return html``;
  }
}
