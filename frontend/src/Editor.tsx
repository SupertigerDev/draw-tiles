import { onCleanup, onMount } from "solid-js";
import style from "./Editor.module.css";
import { updateTile } from "./service";

export interface EditorProps {
  close: () => void;
  x: number;
  y: number;
}
export const Editor = (props: EditorProps) => {
  const onMessage = (event: MessageEvent) => {
    const data = event.data;
    if (data.type === "SUBMIT") {
      const { png, psd } = data.payload;
      console.log(png, psd);

      updateTile({
        x: props.x.toString(),
        y: props.y.toString(),
        png: data.payload.png,
        psd: data.payload.psd,
      });
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
      <div class={`link ${style.backButton}`} onClick={props.close}>
        Back
      </div>
      <embed src="/klecks-embed.html" class={style.klecksEmbed} />
    </div>
  );
};
