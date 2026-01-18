import { createSignal, onCleanup, onMount } from "solid-js";

export const useDocumentListener = <K extends keyof DocumentEventMap>(
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) => {
  onMount(() => {
    document.addEventListener(type, listener, options);
  });
  onCleanup(() => {
    document.removeEventListener(type, listener);
  });
};

export const windowSizeTracker = () => {
  const [width, setWidth] = createSignal(window.innerWidth);
  const [height, setHeight] = createSignal(window.innerHeight);
  const handleResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };
  onMount(() => {
    window.addEventListener("resize", handleResize, { passive: true });
  });
  onCleanup(() => {
    window.removeEventListener("resize", handleResize);
  });
  return [width, height] as const;
};
