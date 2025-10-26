import { message } from "antd";
import axios, {
	AxiosHeaders,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";
import axiosRetry, { type IAxiosRetryConfig } from "axios-retry";
import Cookies from "js-cookie";
import JSONBig from "json-bigint";
import qs from "qs";

const jsonBig = JSONBig({ storeAsString: true, strict: true });

const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_RETRY_TIMES = 2;

const SUCCESS_CODES = new Set(["00000", "A00002"]);

type BackendResult = {
	code?: string;
	msg?: string;
	data?: unknown;
	[key: string]: unknown;
};

const BACKEND_HANDLERS: Record<
	string,
	(payload: BackendResult, response: AxiosResponse) => unknown
> = {
	A00001: (payload) => {
		message.error(
			payload.msg ??
				(typeof payload.data === "string" ? payload.data : "Request failed"),
			1.5,
		);
		return Promise.reject(payload);
	},
	A00004: (payload) => {
		clearAuthState();
		redirectToLogin();
		return Promise.reject(payload);
	},
	A00005: (payload, response) => {
		console.error(
			"============== Request Error ==============",
			"\n",
			`URL: ${response.config.url}`,
			"\n",
			`Payload: ${JSON.stringify(payload)}`,
			"\n",
			"============== Request Error End ==========",
		);
		message.error("Server error, please try again later", 1.5);
		return Promise.reject(payload);
	},
};

function clearAuthState() {
	Cookies.remove("Authorization");
	sessionStorage.removeItem("Authorities");
}

type PendingKey = string;

export type RequestMeta = {
	cancelDuplicate?: boolean;
	returnRawResponse?: boolean;
	skipBackendCheck?: boolean;
};

export type MallAxiosRequestConfig<D = unknown> = AxiosRequestConfig<D> & {
	meta?: RequestMeta;
};

type MallInternalRequestConfig = InternalAxiosRequestConfig & {
	meta?: RequestMeta;
	__pendingKey?: PendingKey;
};

type CreateHttpClientOptions = {
	cancelDuplicate?: boolean;
	retry?: Partial<IAxiosRetryConfig>;
	withAuthToken?: boolean;
};

const pendingRequests = new Map<PendingKey, AbortController>();

function buildPendingKey(config: AxiosRequestConfig): PendingKey {
	const { method = "get", url = "", params, data } = config;

	const paramsString =
		params && typeof params === "object"
			? JSON.stringify(params, Object.keys(params).sort())
			: String(params ?? "");

	let dataString = "";
	if (typeof data === "string") {
		dataString = data;
	} else if (data && typeof data === "object") {
		dataString = JSON.stringify(data);
	}

	return [method.toUpperCase(), url, paramsString, dataString].join("&");
}

function removePending(config: AxiosRequestConfig) {
	const key = (config as MallInternalRequestConfig).__pendingKey;
	if (key) {
		pendingRequests.delete(key);
	}
}

function attachAbortController(
	config: MallInternalRequestConfig,
	shouldCancelDuplicate: boolean,
) {
	if (!shouldCancelDuplicate || config.signal) {
		return;
	}

	const pendingKey = buildPendingKey(config);
	const existingController = pendingRequests.get(pendingKey);

	if (existingController) {
		existingController.abort();
		pendingRequests.delete(pendingKey);
	}

	const abortController = new AbortController();
	config.signal = abortController.signal;
	pendingRequests.set(pendingKey, abortController);
	config.__pendingKey = pendingKey;
}

function parseJSONSafely(data: unknown, headers?: Record<string, unknown>) {
	if (typeof data !== "string" || data === "") {
		return data;
	}

	const contentType =
		headers?.["content-type"] ?? headers?.["Content-Type"] ?? "";
	if (
		typeof contentType === "string" &&
		!contentType.includes("application/json")
	) {
		return data;
	}

	try {
		return jsonBig.parse(data);
	} catch {
		return data;
	}
}

function createAxiosConfig(
	config?: MallAxiosRequestConfig,
): MallAxiosRequestConfig {
	const baseConfig: MallAxiosRequestConfig = {
		baseURL: import.meta.env.VITE_APP_API_BASE_URL,
		timeout: DEFAULT_TIMEOUT,
		withCredentials: true,
		paramsSerializer: (params) =>
			qs.stringify(params, {
				arrayFormat: "brackets",
				skipNulls: true,
			}),
		transformResponse: [
			(data, headers) =>
				parseJSONSafely(data, headers as Record<string, unknown>),
		],
	};

	return { ...baseConfig, ...config };
}

function applyRetry(
	instance: AxiosInstance,
	retry?: Partial<IAxiosRetryConfig>,
) {
	const retryConfig: IAxiosRetryConfig = {
		retries: DEFAULT_RETRY_TIMES,
		retryDelay: axiosRetry.exponentialDelay,
		shouldResetTimeout: true,
		...retry,
	};

	if (!retryConfig.retries) {
		return;
	}

	axiosRetry(instance, retryConfig);
}

function redirectToLogin() {
	const loginPath = "/login";
	if (window.location.pathname !== loginPath) {
		window.location.href = loginPath;
	}
}

function handleBackendResponse(
	response: AxiosResponse,
	internalConfig: MallInternalRequestConfig,
) {
	const { meta } = internalConfig;
	if (meta?.returnRawResponse) {
		return response;
	}

	if (meta?.skipBackendCheck) {
		return response.data;
	}

	if (internalConfig.responseType === "blob") {
		return response;
	}

	const result = response.data;
	if (!result || typeof result !== "object") {
		return result;
	}

	const backend = result as BackendResult;
	const { code } = backend;

	if (!code || SUCCESS_CODES.has(code)) {
		return backend.data;
	}

	const handler = BACKEND_HANDLERS[code];
	if (handler) {
		return handler(backend, response);
	}

	return backend;
}

export interface HttpClient extends AxiosInstance {
	cancelAllPending: () => void;
}

export function createHttpClient(
	config?: MallAxiosRequestConfig,
	options?: CreateHttpClientOptions,
): HttpClient {
	const { cancelDuplicate = true, retry, withAuthToken = true } = options ?? {};

	const axiosConfig = createAxiosConfig(config);
	const instance = axios.create(axiosConfig) as HttpClient;

	applyRetry(instance, retry);

	instance.interceptors.request.use((requestConfig) => {
		const internalConfig = requestConfig as MallInternalRequestConfig;

		if (withAuthToken) {
			const token = Cookies.get("Authorization");
			if (token) {
				if (
					typeof internalConfig.headers?.set === "function" &&
					typeof internalConfig.headers?.get === "function"
				) {
					internalConfig.headers.set("Authorization", token);
				} else {
					const headers =
						internalConfig.headers instanceof AxiosHeaders
							? internalConfig.headers
							: new AxiosHeaders(internalConfig.headers ?? {});
					headers.set("Authorization", token);
					internalConfig.headers = headers;
				}
			}
		}

		const shouldCancel =
			internalConfig.meta?.cancelDuplicate ?? cancelDuplicate;
		attachAbortController(internalConfig, shouldCancel);
		return internalConfig;
	});

	instance.interceptors.response.use(
		(response: AxiosResponse) => {
			removePending(response.config);
			const internalConfig = response.config as MallInternalRequestConfig;
			return handleBackendResponse(response, internalConfig);
		},
		(error) => {
			if (error?.config) {
				removePending(error.config);
			}

			const status: number | undefined = error?.response?.status;
			const payload = error?.response?.data;

			switch (status) {
				case 400:
					message.error(
						typeof payload === "string" ? payload : "Bad request",
						1.5,
					);
					break;
				case 401:
					clearAuthState();
					redirectToLogin();
					break;
				case 405:
					message.error("HTTP method is not allowed", 1.5);
					break;
				case 500:
					message.error("Server error, please try again later", 1.5);
					break;
				case 501:
					message.error("Server does not support this request", 1.5);
					break;
				default:
					break;
			}

			return Promise.reject(error);
		},
	);

	instance.cancelAllPending = () => {
		for (const controller of pendingRequests.values()) {
			controller.abort();
		}
		pendingRequests.clear();
	};

	return instance;
}

export const httpClient = createHttpClient();

export function adornUrl(action: string): string {
	return `${import.meta.env.VITE_APP_API_BASE_URL ?? ""}${action}`;
}

export function adornImUrl(action: string): string {
	return `${import.meta.env.VITE_APP_IM_API ?? ""}${action}`;
}

export function adornWsImUrl(action: string): string {
	return `${import.meta.env.VITE_APP_WS_IM_API ?? ""}${action}`;
}

export function adornParams(
	params: Record<string, unknown> = {},
	openDefaultParams = true,
) {
	const defaults = { t: Date.now() };
	return openDefaultParams ? { ...defaults, ...params } : params;
}

export function adornData(
	data: Record<string, unknown> = {},
	openDefaultData = true,
	contentType: "json" | "form" = "json",
) {
	const defaults = { t: Date.now() };
	const merged = openDefaultData ? { ...defaults, ...data } : data;

	if (contentType === "json") {
		return JSON.stringify(merged);
	}

	return qs.stringify(merged);
}
