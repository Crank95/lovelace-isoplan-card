import { css } from "lit";

export const cardStyles = css`
  :host {
    --paper: #e5e1da;
    --plaque: #fbfaf7;
    --plaque-ink: #23262b;
    --plaque-muted: #5d6066;
    --line: rgb(35 38 43 / 14%);
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
    display: block;
  }
  ha-card {
    --accent: var(--plaque-ink);
    display: block;
    position: relative;
    overflow: hidden;
    background: var(--paper);
    color: var(--plaque-ink);
    transition: background 1.2s var(--ease);
    container-type: inline-size;
  }
  ha-card.night {
    --paper: #262a3b;
    --plaque: #1f2438;
    --plaque-ink: #f1efe9;
    --plaque-muted: #b4b7c4;
    --line: rgb(241 239 233 / 16%);
  }
  .viewport { position: relative; overflow: hidden; touch-action: manipulation; }
  .stage { position: absolute; inset: 0; transform-origin: 0 0; transition: transform 0.7s var(--ease); }
  .scene { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
  .scene .plan { transition: filter 0.7s var(--ease); }
  .scene.klima .plan { filter: saturate(0.2); }
  .dusk { mix-blend-mode: multiply; transition: opacity 1.2s var(--ease); }
  .night-plan, .reveal { transition: opacity 1.2s var(--ease); }
  .pool { mix-blend-mode: screen; transition: opacity 0.6s var(--ease); pointer-events: none; }
  mask .pool { mix-blend-mode: normal; }
  .tint { mix-blend-mode: multiply; transition: opacity 0.7s var(--ease); pointer-events: none; }
  .focus { fill: #10131f; transition: opacity 0.5s var(--ease); pointer-events: none; }
  .outline { fill: none; stroke: #fff; stroke-opacity: 0.8; stroke-width: calc(3px * var(--unzoom, 1)); stroke-linejoin: round; pointer-events: none; }
  .hit { fill: transparent; cursor: pointer; outline: none; }

  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .plaque {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    padding: 0 10px;
    border-radius: 9px;
    background: var(--plaque);
    color: var(--plaque-ink);
    font-size: 13px;
    line-height: 1;
    white-space: nowrap;
    box-shadow: 0 3px 10px rgb(20 22 30 / 26%);
    transform: translate(-50%, -50%) translate(var(--dx, 0), var(--dy, 0)) scale(var(--unzoom, 1));
    transition: transform 0.7s var(--ease), opacity 0.3s var(--ease), background 1.2s var(--ease), color 1.2s var(--ease);
  }
  .plaque::after { content: ""; position: absolute; inset: -8px; }
  .plaque b { font-weight: 600; font-variant-numeric: tabular-nums; }
  .plaque.big { font-size: 15px; min-height: 36px; }
  .plaque.hidden { opacity: 0; pointer-events: none; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line); flex: none; transition: background 0.6s var(--ease); }
  .on > .dot, .on .dot, .temp > .dot { background: var(--c); box-shadow: 0 0 0 1px rgb(20 22 30 / 18%); }

  .fixture {
    position: absolute;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%) scale(var(--unzoom, 1));
    transition: transform 0.7s var(--ease), opacity 0.5s var(--ease);
    pointer-events: none;
    opacity: 0.75;
  }
  .zoomed .fixture { pointer-events: auto; opacity: 1; }
  .viewport:not(.zoomed) .fixture.unreachable { opacity: 0; }
  .fixture svg, .fixture img {
    width: var(--glyph, 18px);
    height: var(--glyph, 18px);
    transform: rotate(var(--angle, 0deg));
    overflow: visible;
    transition: filter 0.6s var(--ease);
  }
  .zoomed .fixture { --glyph: 26px; }
  .fixture img { object-fit: contain; }
  .fixture svg { fill: none; stroke: #4b4e55; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .fixture .core { fill: rgb(255 255 255 / 80%); }
  .fixture.on { opacity: 1; }
  .fixture.on svg { stroke: var(--c); filter: drop-shadow(0 0 2px var(--c)); }
  .zoomed .fixture.on svg { filter: drop-shadow(0 0 6px var(--c)); }
  .fixture.on .core { fill: var(--c); }
  .fixture.unreachable svg { stroke-dasharray: 2 3; opacity: 0.6; }

  .device {
    position: absolute;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    transform: translate(-50%, -50%) scale(var(--unzoom, 1));
    transition: transform 0.7s var(--ease);
    pointer-events: none;
  }
  .zoomed .device { pointer-events: auto; }
  .device span {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--plaque);
    color: var(--plaque-muted);
    box-shadow: 0 2px 6px rgb(20 22 30 / 30%);
    transition: background 0.3s var(--ease), color 0.3s var(--ease), width 0.5s var(--ease), height 0.5s var(--ease);
    --mdc-icon-size: 14px;
  }
  .zoomed .device span { width: 34px; height: 34px; --mdc-icon-size: 20px; }
  .device.on span { background: var(--plaque-ink); color: var(--plaque); }
  .device.armed span { outline: 2px solid var(--plaque-ink); outline-offset: 2px; }
  .device:disabled span { opacity: 0.55; }

  .modes {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    padding: 3px;
    border-radius: 11px;
    background: var(--plaque);
    box-shadow: 0 3px 10px rgb(20 22 30 / 20%);
  }
  .modes button { min-width: 62px; min-height: 38px; padding: 0 12px; border-radius: 8px; font-size: 13px; color: var(--plaque-muted); }
  .modes button[aria-pressed="true"] { background: var(--plaque-ink); color: var(--plaque); font-weight: 600; }

  .dock { position: absolute; right: 12px; bottom: 12px; display: flex; gap: 8px; align-items: center; transition: opacity 0.3s var(--ease); }
  .dock button {
    display: inline-flex; align-items: center; gap: 7px;
    min-height: 44px; padding: 0 13px;
    border-radius: 11px;
    background: var(--plaque);
    font-size: 13px;
    box-shadow: 0 3px 10px rgb(20 22 30 / 20%);
  }
  .dock button:disabled { color: var(--plaque-muted); cursor: default; }
  .dock ha-icon { --mdc-icon-size: 20px; color: var(--plaque-muted); }
  .dock .on ha-icon { color: var(--accent); }

  .scale {
    position: absolute; left: 12px; bottom: 12px; display: flex; align-items: center; gap: 7px;
    padding: 6px 10px; border-radius: 9px; background: var(--plaque); font-size: 12px; font-variant-numeric: tabular-nums;
    box-shadow: 0 3px 10px rgb(20 22 30 / 20%);
  }
  .scale i { width: 84px; height: 7px; border-radius: 4px; background: linear-gradient(90deg, rgb(92 148 222), rgb(246 240 228), rgb(232 112 58)); }

  .panel {
    position: absolute; top: 12px; right: 12px; bottom: 12px; width: 300px;
    display: flex; flex-direction: column; gap: 14px;
    padding: 16px; overflow-y: auto; overscroll-behavior: contain;
    border-radius: 14px;
    background: var(--plaque);
    color: var(--plaque-ink);
    box-shadow: 0 10px 30px rgb(20 22 30 / 34%);
    animation: slide 0.5s var(--ease);
    scrollbar-width: thin;
    scrollbar-color: var(--line) transparent;
  }
  @keyframes slide { from { transform: translateX(24px); opacity: 0; } }
  .panel header { display: flex; align-items: center; justify-content: space-between; }
  .panel h2 { margin: 0; font-size: 19px; font-weight: 600; }
  .panel .icon { width: 44px; height: 44px; margin: -8px -10px -8px 0; display: grid; place-items: center; color: var(--plaque-muted); }
  .climate { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .climate strong { display: block; font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .climate small, .row small { color: var(--plaque-muted); font-size: 12px; }
  .stepper { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 10px; }
  .stepper button { width: 44px; height: 44px; display: grid; place-items: center; }
  .stepper output { min-width: 46px; text-align: center; font-variant-numeric: tabular-nums; font-size: 14px; }
  .rows { display: flex; flex-direction: column; gap: 2px; }
  .row { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 8px; }
  .row-name { display: flex; align-items: center; gap: 8px; min-height: 44px; min-width: 0; text-align: left; font-size: 14px; }
  .row-name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .row-name small { margin-left: auto; flex: none; font-variant-numeric: tabular-nums; }
  .row-name ha-icon { --mdc-icon-size: 20px; flex: none; color: var(--plaque-muted); }
  .device-row.on .row-name ha-icon { color: var(--plaque-ink); }
  .device-row.armed small { color: var(--plaque-ink); font-weight: 600; }
  .dim { grid-column: 1 / -1; width: 100%; height: 28px; margin: 0; accent-color: var(--accent); }
  .switch { position: relative; display: inline-flex; width: 44px; height: 44px; align-items: center; cursor: pointer; }
  .switch input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: inherit; }
  .switch span { width: 40px; height: 24px; border-radius: 12px; background: var(--line); position: relative; transition: background 0.25s var(--ease); }
  .switch span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--plaque); box-shadow: 0 1px 2px rgb(0 0 0 / 30%); transition: transform 0.25s var(--ease); }
  .switch input:checked + span { background: var(--accent); }
  .switch input:checked + span::after { transform: translateX(16px); }
  .switch input:disabled + span { opacity: 0.45; }
  .switch input:focus-visible + span { outline: 2px solid var(--accent); outline-offset: 2px; }
  summary { min-height: 44px; display: flex; align-items: center; cursor: pointer; font-size: 13px; color: var(--plaque-muted); }
  .note { margin: 0; font-size: 12px; line-height: 1.4; color: var(--plaque-muted); }
  .error {
    position: absolute; left: 50%; top: 12px; transform: translateX(-50%); max-width: 80%;
    padding: 9px 12px; border-radius: 9px; background: #8e2b1e; color: #fff; font-size: 13px;
    box-shadow: 0 3px 10px rgb(20 22 30 / 30%);
  }

  @container (max-width: 639px) {
    .panel { position: static; width: auto; border-radius: 0; box-shadow: none; animation: none; }
  }
  @container (max-width: 460px) {
    .plaque { padding: 0 8px; gap: 5px; font-size: 12px; min-height: 28px; }
    .plaque.valued .name { display: none; }
    .modes button { min-width: 52px; padding: 0 8px; }
    .dock button span { display: none; }
    .dock button { padding: 0 12px; }
    .scale { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .stage, .plaque, .fixture, .device, .device span, .pool, .tint, .focus, .dusk, .reveal, .night-plan, .plan, .panel, ha-card { transition: none; animation: none; }
  }
`;
