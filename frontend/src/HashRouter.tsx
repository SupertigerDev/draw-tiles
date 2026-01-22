import { createSignal, Show, type JSXElement } from "solid-js";

const [hash, setHash] = createSignal(window.location.hash);

window.addEventListener("hashchange", () => {
  setHash(window.location.hash);
});

const updateHash = (newHash: string) => {
  window.location.hash = newHash;
};

const Route = (props: { hash: string; component: JSXElement }) => {
  return <Show when={hash() === props.hash}>{props.component}</Show>;
};

export const useHashRouter = () => {
  return {
    updateHash,
    hash,
    Route,
  };
};
