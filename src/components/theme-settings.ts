import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.71/dist/components/color-picker/color-picker.js';
import { changeThemeColor } from '../services/utils';

@customElement('theme-settings')
export class ThemeSettings extends LitElement {
  static get styles() {
    return css`
      label {
        align-items: center;
        justify-content: space-between;
        display: flex;
        font-weight: bold;
      }
    `;
  }

  constructor() {
    super();
  }

  handlePrimaryColorChange(color: string) {
    console.log(color);

    if (color) {
      changeThemeColor(color);
    }
  }

  render() {
    return html`
      <form>
        <label>
          <span>Primary Color</span>
          <sl-color-picker @sl-change="${(event: any) => this.handlePrimaryColorChange(event.target.value)}"></sl-color-picker>
        </label>
      </form>
    `;
  }
}
