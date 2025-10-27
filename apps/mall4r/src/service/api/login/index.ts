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

export interface UserInfo {
	id: number;
	name: string;
	userId: string;
	shopId: string;
	mobile: string;
}
export interface FetchUserInfoRequestPayload {
	t: number;
}

const LOGIN_PATH = "/adminLogin";
const LOGOUT_PATH = "/logOut";
const GET_USER_INFO_PATH = "/sys/user/info";

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
		fetchUserInfo<T = UserInfo>(
			params: FetchUserInfoRequestPayload,
		): Promise<T> {
			return client.get<T, T>(GET_USER_INFO_PATH, { params });
		},
	};
}

export const loginApi = createLoginApi();
