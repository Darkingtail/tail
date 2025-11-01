import {
	type HttpClient,
	type MallAxiosRequestConfig,
	httpClient,
} from "@/service";

export interface LoginFormFields {
	userName: string;
	passWord: string;
}

export interface LoginRequestPayload extends LoginFormFields {
	captchaVerification: string;
}

export interface LogoutRequestPayload {
	t: number;
}

export interface LoginResponse {
	accessToken: string;
	expiresIn: number;
	refreshToken: string;
	[key: string]: unknown;
}

const LOGIN_PATH = "/adminLogin";
const LOGOUT_PATH = "/logOut";

export function createLoginApi(client: HttpClient = httpClient) {
	return {
		login<T = LoginResponse>(
			data: LoginRequestPayload,
			config?: MallAxiosRequestConfig,
		): Promise<T> {
			return client.post<T, T>(LOGIN_PATH, data, config);
		},
		logOut<T = void>(
			data: LogoutRequestPayload,
			config?: MallAxiosRequestConfig,
		): Promise<T> {
			return client.post<T, T>(LOGOUT_PATH, data, config);
		},
	};
}

export const loginApi = createLoginApi();
