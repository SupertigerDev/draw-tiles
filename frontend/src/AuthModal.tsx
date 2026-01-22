import style from "./AuthModal.module.css";
import { Modal } from "./Modal";
import { useHashRouter } from "./HashRouter";
import { createSignal, Show } from "solid-js";
import { userLogin, userRegister } from "./service";
import { useStorage } from "./storage";

export const AuthModal = (props: { type: "login" | "register" }) => {
  const storage = useStorage();
  const { updateHash } = useHashRouter();
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);
  const [details, setDetails] = createSignal({
    email: "",
    username: "",
    password: "",
  });

  const handleSubmit = async () => {
    if (pending()) return;
    setError(null);
    setPending(true);
    const res = await (props.type === "login" ? userLogin : userRegister)(
      details(),
    ).finally(() => setPending(false));
    if (!res.success) {
      return setError(res.message);
    }
    // On success, close the modal
    updateHash("");
    storage.setItem("token", res.data.token);
  };

  return (
    <Modal onClose={() => updateHash("")}>
      <div class={style.authForm}>
        <input
          type="email"
          placeholder="Email"
          value={details().email}
          onInput={(e) =>
            setDetails({
              ...details(),
              email: (e.target as HTMLInputElement).value,
            })
          }
        />
        <Show when={props.type === "register"}>
          <input
            type="text"
            placeholder="Username"
            value={details().username}
            onInput={(e) =>
              setDetails({
                ...details(),
                username: (e.target as HTMLInputElement).value,
              })
            }
          />
        </Show>
        <input
          type="password"
          placeholder="Password"
          value={details().password}
          onInput={(e) =>
            setDetails({
              ...details(),
              password: (e.target as HTMLInputElement).value,
            })
          }
        />
        <Show when={error()}>
          <div class={style.error}>{error()}</div>
        </Show>
        <button onClick={handleSubmit}>
          {props.type === "login" ? "Login" : "Register"}
        </button>
      </div>
    </Modal>
  );
};
