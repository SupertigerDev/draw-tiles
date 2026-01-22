import { Show } from "solid-js";
import { useHashRouter } from "./HashRouter";
import style from "./HeaderOverlay.module.css";
import { useStorage } from "./storage";
export const HeaderOverlay = () => {
  const { updateHash } = useHashRouter();
  const storage = useStorage();

  const loggedIn = () => !!storage.getItem("token", null);

  return (
    <div class={style.headerOverlay}>
      <Show when={!loggedIn()}>
        <div class={style.authButtons}>
          <button onClick={() => updateHash("#register")}>Register</button>
          <button onClick={() => updateHash("#login")}>Login</button>
        </div>
      </Show>
    </div>
  );
};
