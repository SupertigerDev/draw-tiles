import type { JSX } from "solid-js/jsx-runtime";
import style from "./Tile.module.css";
import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { Editor } from "./Editor";

export interface Tile {
  x: number;
  y: number;
  username: string;
}

export type TileProps = {
  style?: JSX.CSSProperties;
  size?: number;
  tile: Tile;
  onClick?: (tile: Tile) => void;
  focused?: boolean;
};

export const Tile = (props: TileProps) => {
  const tileStyle = () =>
    ({
      width: `${props.size}px`,
      height: `${props.size}px`,
      ...props.style,
      "z-index": props.focused ? 1 : 0,
    }) as JSX.CSSProperties;

  return (
    <div
      class={`${style.tile} tile`}
      data-focused={props.focused}
      style={tileStyle()}
    >
      {props.tile.x}, {props.tile.y}
      <Show when={props.focused}>
        <TileInfo tile={props.tile} />
      </Show>
    </div>
  );
};

export const TileInfo = (props: { tile: Tile }) => {
  const [showEditor, setShowEditor] = createSignal(false);
  return (
    <div class={style.tileInfo}>
      <div class={style.username}>{props.tile.username}</div>
      <div class={style.coords}>
        {props.tile.x}, {props.tile.y}
      </div>
      <a href="#" onClick={() => setShowEditor(true)}>
        Edit
      </a>
      <Show when={showEditor()}>
        <Portal>
          <Editor close={() => setShowEditor(false)} />
        </Portal>
      </Show>
    </div>
  );
};
