import { getStorageItem } from "./storage";

const API_URL = "http://localhost:8080/api";

export const ApiUrl = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
  },
} as const;

type ExtractStringValues<T> = T extends string
  ? T
  : T extends object
    ? { [K in keyof T]: ExtractStringValues<T[K]> }[keyof T]
    : never;

type ApiUrl = ExtractStringValues<typeof ApiUrl>;

interface FetcherOptions {
  useToken?: boolean;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: Record<string, unknown>;
}
type FetcherResponse<T> =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: T;
    };
const fetcher = async <T>(url: ApiUrl, options?: FetcherOptions) => {
  const token = options?.useToken ? getStorageItem("token", null) : null;
  const res = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: options?.data ? JSON.stringify(options.data) : undefined,
  });
  return (await res.json()) as FetcherResponse<T>;
};

interface AuthResponse {
  user: {
    id: string;
    username: string;
  };
  token: string;
}
export const register = (data: {
  email: string;
  username: string;
  password: string;
}) => {
  return fetcher<AuthResponse>(ApiUrl.auth.register, { method: "POST", data });
};

export const login = (data: { email: string; password: string }) => {
  return fetcher<AuthResponse>(ApiUrl.auth.login, { method: "POST", data });
};
