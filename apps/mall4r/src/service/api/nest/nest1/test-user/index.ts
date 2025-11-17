import { type HttpClient, httpClient } from "@/service";

const USER_TESTUSER_PREFIX = "/user/testUser";

const USER_TESTUSER_PAGE = `${USER_TESTUSER_PREFIX}/page`;

export interface TestUser {
	id?: number;
	userName?: string;
	password?: string;
	hobby?: string;
	createTime?: string;
	updateTime?: string;
}

export interface GetTestUserPagePayload extends TestUser {
	current: number;
	size: number;
}

export interface GetTestUserPageResponse {
	records: TestUser[];
	total: number;
	size: number;
	current: number;
	pages: number;
}

export function createTestUserApi(client: HttpClient = httpClient) {
	return {
		page<T = GetTestUserPageResponse>(
			params: GetTestUserPagePayload,
		): Promise<T> {
			const urlParams = Object.entries(params)
				.map(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						return "";
					}
					return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
				})
				.filter(Boolean)
				.join("&");

			return client.get<T, T>(
				urlParams ? `${USER_TESTUSER_PAGE}?${urlParams}` : USER_TESTUSER_PAGE,
			);
		},
	};
}

export const loginApi = createTestUserApi();
