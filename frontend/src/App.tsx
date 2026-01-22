import style from "./App.module.css";
import { Tile } from "./Tile";
import { windowSizeTracker } from "./utils";
import { ChatOverlay } from "./ChatOverlay";
import { Tiles } from "./Tiles";

function App() {
  return (
    <>
      <ChatOverlay />
      <Tiles />
    </>
  );
}

export default App;
