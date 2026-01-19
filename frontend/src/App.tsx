import { createMemo, createSignal, For } from "solid-js";
import style from "./App.module.css";
import { Tile } from "./Tile";
import { windowSizeTracker } from "./utils";
import { ChatOverlay } from "./ChatOverlay";

const CLICK_THRESHOLD = 5;

const TILE_SIZE = 256;
const TILE_START = -35;
const TILE_END = 35;
const TILE_BORDER_WIDTH = 1;

const STEP = TILE_SIZE - TILE_BORDER_WIDTH;

function App() {
  const [windowWidth, windowHeight] = windowSizeTracker();
  const [cameraX, setCameraX] = createSignal(0);
  const [cameraY, setCameraY] = createSignal(0);
  const [zoom, setZoom] = createSignal(1);
  const [clickedTilePos, setClickedTilePos] = createSignal<string | null>(null);

  const gridToScreen = (gridX: number, gridY: number) => {
    return {
      x: gridX * STEP,
      y: gridY * STEP,
    };
  };

  const screenToGrid = (clientX: number, clientY: number) => {
    const offsetX = clientX - (windowWidth() / 2 + cameraX());
    const offsetY = clientY - (windowHeight() / 2 + cameraY());

    return {
      x: Math.round(offsetX / zoom() / STEP),
      y: Math.round(offsetY / zoom() / STEP),
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
  let pointerStartPos = { x: 0, y: 0 };

  let isValidInteraction = true;

  const onPointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLDivElement;
    const currentTarget = e.currentTarget as HTMLDivElement;
    if (!target.classList.contains("tile")) {
      isValidInteraction = false;
      return;
    }
    currentTarget.setPointerCapture(e.pointerId);

    pointerStartPos = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    target.releasePointerCapture(e.pointerId);

    const dx = e.clientX - pointerStartPos.x;
    const dy = e.clientY - pointerStartPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (isValidInteraction && distance < CLICK_THRESHOLD) {
      const gridPos = screenToGrid(e.clientX, e.clientY);
      const key = `${gridPos.x},${gridPos.y}`;
      setClickedTilePos(key);
    }

    isValidInteraction = true;
  };

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

    const pivotX = windowWidth() / 2 + cameraX();
    const pivotY = windowHeight() / 2 + cameraY();

    const mouseOffsetX = e.clientX - pivotX;
    const mouseOffsetY = e.clientY - pivotY;

    const ratio = newZoom / oldZoom;

    setZoom(newZoom);

    setCameraX(cameraX() + (mouseOffsetX - mouseOffsetX * ratio));
    setCameraY(cameraY() + (mouseOffsetY - mouseOffsetY * ratio));
  };

  return (
    <>
      <ChatOverlay />
      <div
        class={style.tiles}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onWheel={onWheel}
        style={{
          position: "absolute",
          left: `${windowWidth() / 2 + cameraX()}px`,
          top: `${windowHeight() / 2 + cameraY()}px`,
          transform: `scale(${zoom()})`,
          "transform-origin": "0 0",
        }}
      >
        <For each={visibleTiles()}>
          {(key) => {
            const [x, y] = key.split(",").map(Number);
            const pos = gridToScreen(x, y);
            return (
              <Tile
                tile={{ x, y, username: "Supertiger" }}
                size={TILE_SIZE}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: "translate(-50%, -50%)",
                  border: `${TILE_BORDER_WIDTH}px solid rgb(39, 39, 39)`,
                }}
                onClick={() => setClickedTilePos(key)}
                focused={clickedTilePos() === key}
              />
            );
          }}
        </For>
      </div>
    </>
  );
}

export default App;
