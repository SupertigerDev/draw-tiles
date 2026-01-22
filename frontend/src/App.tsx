import { ChatOverlay } from "./ChatOverlay";
import { Tiles } from "./Tiles";
import { HeaderOverlay } from "./HeaderOverlay";
import { useHashRouter } from "./HashRouter";
import { AuthModal } from "./AuthModal";

function App() {
  const { Route } = useHashRouter();
  return (
    <>
      <HeaderOverlay />
      <ChatOverlay />
      <Tiles />
      <Route hash="#login" component={<AuthModal type="login" />} />
      <Route hash="#register" component={<AuthModal type="register" />} />
    </>
  );
}

export default App;
