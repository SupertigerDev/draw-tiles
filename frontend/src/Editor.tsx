import { onCleanup, onMount } from "solid-js";
import style from "./Editor.module.css";

export interface EditorProps {
  close: () => void;
}
export const Editor = (props: EditorProps) => {
  const onMessage = (event: MessageEvent) => {
    const data = event.data;
    if (data.type === "SUBMIT") {
      const { png, psd } = data.payload;
      console.log(png, psd);
    }
  };

  onMount(() => {
    window.addEventListener("message", onMessage);
    onCleanup(() => {
      window.removeEventListener("message", onMessage);
    });
  });

  return (
    <div class={style.editor}>
      <a href="#" class={style.backButton} onClick={props.close}>
        Back
      </a>
      <embed src="/klecks-embed.html" class={style.klecksEmbed} />
    </div>
  );
};
