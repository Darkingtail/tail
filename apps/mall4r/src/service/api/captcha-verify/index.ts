import {
	type HttpClient,
	type MallAxiosRequestConfig,
	httpClient,
} from "@/service";

export interface CaptchaRequestPayload {
	[key: string]: unknown;
}

export interface CaptchaResponseData {
	repCode: string;
	repMsg: string;
	repData: {
		originalImageBase64: string;
		jigsawImageBase64: string;
		token: string;
		secretKey?: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export interface CaptchaCheckPayload {
	[key: string]: unknown;
}

export interface CaptchaCheckResponse {
	[key: string]: unknown;
}

const BASE_PATH = "/captcha";
const ENDPOINTS = {
	getCaptcha: `${BASE_PATH}/get`,
	checkCaptcha: `${BASE_PATH}/check`,
} as const;

export function createVerificationApi(client: HttpClient = httpClient) {
	return {
		getCaptcha<T = CaptchaResponseData>(
			data: CaptchaRequestPayload,
			config?: MallAxiosRequestConfig,
		): Promise<T> {
			return client.post<T, T>(ENDPOINTS.getCaptcha, data, config);
		},

		checkCaptcha<T = CaptchaCheckResponse>(
			data: CaptchaCheckPayload,
			config?: MallAxiosRequestConfig,
		): Promise<T> {
			return client.post<T, T>(ENDPOINTS.checkCaptcha, data, config);
		},
	};
}

export const verificationApi = createVerificationApi();
