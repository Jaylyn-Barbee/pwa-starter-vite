import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('app-about')
export class AppAbout extends LitElement {
  static get styles() {
    return css`
      fluent-card {
        padding: 0px 18px 18px;
      }

      @media (prefers-color-scheme: light) {
        fluent-card {
          --fill-color: #edebe9;
        }
      }

      @media (prefers-color-scheme: dark) {
        fluent-card {
          --fill-color: #4e4e4e;
          color: white;
          border: none;
        }
      }

      @media (min-width: 1024px) {
        fluent-card {
          width: 54%;
        }
      }
    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <app-header enableBack="${true}"></app-header>

      <div></div>
    `;
  }
}
