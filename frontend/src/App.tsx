import { createMemo, createSignal, For } from "solid-js";
import style from "./App.module.css";
import { Tile } from "./Tile";
import { windowSizeTracker } from "./utils";

const TILE_SIZE = 128;
const TILE_START = -35;
const TILE_END = 35;
const TILE_BORDER_WIDTH = 1;

function App() {
  const [windowWidth, windowHeight] = windowSizeTracker();
  const [cameraX, setCameraX] = createSignal(0);
  const [cameraY, setCameraY] = createSignal(0);
  const [zoom, setZoom] = createSignal(1);

  const step = () => (TILE_SIZE - TILE_BORDER_WIDTH) * zoom();
  const tileSize = () => TILE_SIZE * zoom();

  const onPointerDown = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    target.setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    target.releasePointerCapture(e.pointerId);
  };

  const gridToScreen = (gridX: number, gridY: number) => {
    return {
      x: Math.round(gridX * step() + cameraX() + windowWidth() / 2),
      y: Math.round(gridY * step() + cameraY() + windowHeight() / 2),
    };
  };

  const screenToGrid = (clientX: number, clientY: number) => {
    const worldX = clientX - windowWidth() / 2 - cameraX();
    const worldY = clientY - windowHeight() / 2 - cameraY();

    return {
      x: Math.round(worldX / step()),
      y: Math.round(worldY / step()),
    };
  };

  const getVisibleGridRange = () => {
    const topLeft = screenToGrid(0, 0);
    const bottomRight = screenToGrid(windowWidth(), windowHeight());

    return {
      minX: topLeft.x,
      maxX: bottomRight.x,
      minY: topLeft.y,
      maxY: bottomRight.y,
    };
  };

  const visibleTiles = createMemo(() => {
    document.querySelectorAll(".uwu").forEach((el) => el.remove());

    const range = getVisibleGridRange();

    const startX = Math.max(range.minX, TILE_START);
    const endX = Math.min(range.maxX, TILE_END);
    const startY = Math.max(range.minY, TILE_START);
    const endY = Math.min(range.maxY, TILE_END);

    let tilePos: string[] = [];
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        tilePos.push(`${x},${y}`);
      }
    }

    return tilePos;
  });

  const onPointerMove = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    if (!target.hasPointerCapture(e.pointerId)) return;
    setCameraX(cameraX() + e.movementX);
    setCameraY(cameraY() + e.movementY);
  };

  const onWheel = (e: WheelEvent) => {
    const zoomSpeed = 0.08;
    const direction = e.deltaY > 0 ? -1 : 1;

    const oldZoom = zoom();
    const newZoom = Math.min(Math.max(oldZoom + direction * zoomSpeed, 0.8), 3);

    if (oldZoom === newZoom) return;

    const mouseRelX = e.clientX - windowWidth() / 2 - cameraX();
    const mouseRelY = e.clientY - windowHeight() / 2 - cameraY();

    const zoomRatio = newZoom / oldZoom;

    setZoom(newZoom);
    setCameraX(e.clientX - windowWidth() / 2 - mouseRelX * zoomRatio);
    setCameraY(e.clientY - windowHeight() / 2 - mouseRelY * zoomRatio);
  };

  return (
    <div
      class={style.tiles}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      onWheel={onWheel}
    >
      <For each={visibleTiles()}>
        {(key) => {
          const [x, y] = key.split(",").map(Number);
          return (
            <Tile
              x={x}
              y={y}
              size={tileSize()}
              style={{
                left: `${gridToScreen(x, y).x}px`,
                top: `${gridToScreen(x, y).y}px`,
                transform: "translate(-50%, -50%)",
                border: `${TILE_BORDER_WIDTH * zoom()}px solid white`,
              }}
            />
          );
        }}
      </For>
    </div>
  );
}

export default App;
