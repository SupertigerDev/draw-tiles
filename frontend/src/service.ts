import { useStorage } from "./storage";

const API_URL = "http://localhost:8080/api";

export const ApiUrl = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
  },
  tiles: {
    get: (x: string, y: string) => `${API_URL}/tiles/${x},${y}`,
  },
} as const;

interface FetcherOptions {
  useToken?: boolean;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: Record<string, unknown> | FormData;
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
const fetcher = async <T>(url: string, options?: FetcherOptions) => {
  return new Promise<FetcherResponse<T>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = options?.useToken
      ? useStorage().getItem("token", null)
      : null;

    xhr.open(options?.method || "GET", url);

    if (token) {
      xhr.setRequestHeader("Authorization", token);
    }

    // Only set Content-Type for non-FormData requests
    if (!(options?.data instanceof FormData)) {
      xhr.setRequestHeader("Content-Type", "application/json");
    }

    xhr.addEventListener("load", () => {
      try {
        const response = JSON.parse(xhr.responseText) as FetcherResponse<T>;
        resolve(response);
      } catch {
        reject(new Error("Failed to parse response"));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error"));
    });

    const body = options?.data
      ? options.data instanceof FormData
        ? options.data
        : JSON.stringify(options.data)
      : null;

    xhr.send(body);
  });
};

interface AuthResponse {
  user: {
    id: string;
    username: string;
  };
  token: string;
}
export const userRegister = (data: {
  email: string;
  username: string;
  password: string;
}) => {
  return fetcher<AuthResponse>(ApiUrl.auth.register, { method: "POST", data });
};

export const userLogin = (data: { email: string; password: string }) => {
  return fetcher<AuthResponse>(ApiUrl.auth.login, { method: "POST", data });
};

export const updateTile = (data: {
  x: string;
  y: string;
  psd: Blob;
  png: Blob;
}) => {
  const formData = new FormData();
  formData.append("x", data.x);
  formData.append("y", data.y);
  formData.append("psd", data.psd);
  formData.append("png", data.png);
  return fetcher<{ psd: string; png: string }>(
    ApiUrl.tiles.get(data.x, data.y),
    {
      method: "POST",
      data: formData,
      useToken: true,
    },
  );
};
