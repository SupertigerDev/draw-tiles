import type { JSXElement } from "solid-js";
import { Portal } from "solid-js/web";
import style from "./Modal.module.css";

export const Modal = (props: {
  children: JSXElement;
  onClose?: () => void;
}) => {
  const backdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      props.onClose?.();
    }
  };

  return (
    <Portal>
      <div class={style.modalBackdrop} onClick={backdropClick}>
        <div class={style.modalContent}>{props.children}</div>
      </div>
    </Portal>
  );
};
