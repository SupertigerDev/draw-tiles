import type { JSX } from "solid-js/jsx-runtime";
import style from "./Tile.module.css";

export type TileProps = {
  style?: JSX.CSSProperties;
  size?: number;
  x: number;
  y: number;
};

export const Tile = (props: TileProps) => {
  const tileStyle = () => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    ...props.style,
  });
  return (
    <div class={style.tile} style={tileStyle()}>
      {props.x},{props.y}
    </div>
  );
};
