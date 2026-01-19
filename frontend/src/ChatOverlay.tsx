import {
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import style from "./ChatOverlay.module.css";

interface Message {
  id: string;
  content: string;
  type: "SYSTEM" | "USER";
  username?: string;
}
export const ChatOverlay = () => {
  const [chatOpened, setChatOpened] = createSignal(false);

  const [messages, setMessages] = createSignal<Message[]>([
    {
      id: "1",
      content: "Hello!",
      type: "SYSTEM",
    },
  ]);

  const sendMessage = (content: string) => {
    setMessages((messages) => [
      ...messages,
      { content, id: Date.now().toString(), username: "me", type: "USER" },
    ]);
  };

  return (
    <div class={style.chatOverlay} data-opened={chatOpened()}>
      <MessageLog messages={messages()} chatOpened={chatOpened()} />
      <InputBar
        onEnter={sendMessage}
        chatOpened={chatOpened()}
        setChatOpened={setChatOpened}
      />
    </div>
  );
};

const MessageLog = (props: { messages: Message[]; chatOpened: boolean }) => {
  const [logEl, setLogEl] = createSignal<HTMLDivElement | null>(null);

  const messages = () => {
    if (props.chatOpened) return props.messages;

    return props.messages.slice(-12);
  };

  createEffect(
    on([() => props.messages.length, () => props.chatOpened], () => {
      logEl()!.scrollTop = logEl()!.scrollHeight;
    }),
  );

  return (
    <div class={style.messageLog} ref={setLogEl}>
      <For each={messages()}>
        {(message, i) => (
          <MessageItem
            index={i()}
            message={message}
            chatOpened={props.chatOpened}
          />
        )}
      </For>
    </div>
  );
};

const MessageItem = (props: {
  message: Message;
  chatOpened: boolean;
  index: number;
}) => {
  const [hide, setHide] = createSignal(false);
  let hideTimeout = 0;
  createEffect(
    on([() => props.chatOpened, () => props.index], () => {
      setHide(false);
      clearTimeout(hideTimeout);

      if (!props.chatOpened) {
        hideTimeout = window.setTimeout(
          () => {
            setHide(true);
          },
          7000 + props.index * 1000,
        );
      }
    }),
  );

  return (
    <Show when={!hide()}>
      <div
        class={style.messageItem}
        data-hide={hide()}
        data-type={props.message.type}
      >
        <Show when={props.message.username}>
          <div class={style.username}>{props.message.username}:</div>
        </Show>
        <div class={style.content}>{props.message.content}</div>
      </div>
    </Show>
  );
};

const InputBar = (props: {
  onEnter: (content: string) => void;
  chatOpened: boolean;
  setChatOpened: (b: boolean) => void;
}) => {
  const [inputEl, setInputEl] = createSignal<HTMLInputElement | null>(null);
  createEffect(() => {
    if (props.chatOpened) {
      inputEl()?.focus();
    }
  });

  onMount(() => {
    document.addEventListener("keydown", onDocKeyDown);
    onCleanup(() => {
      document.removeEventListener("keydown", onDocKeyDown);
    });
  });

  const onDocKeyDown = (e: KeyboardEvent) => {
    if (e.target === inputEl()) return;
    if (e.key === "Enter") {
      props.setChatOpened(true);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      const content = inputEl()?.value;
      inputEl()!.value = "";
      if (content?.trim()) {
        props.onEnter(content);
      }
    }
  };
  return (
    <div class={style.inputBar}>
      <Show
        when={props.chatOpened}
        fallback={
          <div
            class={`${style.input} ${style.placeholder}`}
            onClick={() => props.setChatOpened(true)}
          >
            Message
          </div>
        }
      >
        <input
          ref={setInputEl}
          onBlur={() => props.setChatOpened(false)}
          onKeyDown={onKeyDown}
          class={style.input}
          type="text"
          placeholder="Message"
        />
      </Show>
    </div>
  );
};
