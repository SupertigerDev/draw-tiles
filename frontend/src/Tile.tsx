import type { JSX } from "solid-js/jsx-runtime";
import style from "./Tile.module.css";
import { createSignal, Show } from "solid-js";

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
  const tileStyle = () => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    ...props.style,
  });


  return (
    <div
      class={style.tile}
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
  return (
    <div class={style.tileInfo}>
      <div class={style.username}>{props.tile.username}</div>
      <div class={style.coords}>{props.tile.x}, {props.tile.y}</div>
    </div>
  );
};
