import type { TestUserFormFieldsString } from "@/pages/nest/nest1/testUser/DetailModal";
import { type HttpClient, httpClient } from "@/service";

const USER_TESTUSER_PREFIX = "/user/testUser";

const USER_TESTUSER_HOBBY_LIST = `${USER_TESTUSER_PREFIX}/hobbyList`;
const USER_TESTUSER_PAGE = `${USER_TESTUSER_PREFIX}/page`;
const USER_TESTUSER_ADD = `${USER_TESTUSER_PREFIX}`;
const USER_TESTUSER_UPDATE = `${USER_TESTUSER_PREFIX}`;
const USER_TESTUSER_INFO = `${USER_TESTUSER_PREFIX}/info`;
const USER_TESTUSER_DELETE = `${USER_TESTUSER_PREFIX}`;

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
		fetchHobbyList(): Promise<{ label: string; value: string }[]> {
			return client.get(`${USER_TESTUSER_HOBBY_LIST}`);
		},
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
		info(id: number): Promise<TestUser> {
			return client.get(`${USER_TESTUSER_INFO}/${id}`);
		},
		add(testUser: TestUserFormFieldsString): Promise<void> {
			return client.post(`${USER_TESTUSER_ADD}`, testUser);
		},
		update(testUser: TestUserFormFieldsString): Promise<void> {
			return client.put(`${USER_TESTUSER_UPDATE}`, testUser);
		},
		delete(id: number): Promise<void> {
			return client.delete(`${USER_TESTUSER_DELETE}/${id}`);
		},
	};
}

export const testUserApi = createTestUserApi();
