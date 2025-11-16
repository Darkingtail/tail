import { type HttpClient, httpClient } from "@/service";

export interface UserInfo {
	id: number;
	username: string;
	userId: string;
	shopId: string;
	mobile: string;
}

export interface MenuItem {
	icon: string | null;
	list: MenuItem[] | null;
	menuId: number;
	name: string;
	orderNum: number;
	parentId: number;
	parentName: string | null;
	perms: string;
	type: number;
	url: string | null;
}

export interface FetchUserInfoRequestPayload {
	t: number;
}

export interface FetchNavInfoRequestPayload {
	t: number;
}

export interface FetchNavInfoResponse {
	authorities: string[];
	menuList: MenuItem[];
}

const FETCH_USER_INFO_PATH = "/sys/user/info";
const FETCH_MENU_LIST_PATH = "/sys/menu/nav";

export function createUserApi(client: HttpClient = httpClient) {
	return {
		fetchUserInfo<T = UserInfo>(
			params: FetchUserInfoRequestPayload,
		): Promise<T> {
			return client.get<T, T>(FETCH_USER_INFO_PATH, { params });
		},
		fetchNavInfo<T = FetchNavInfoResponse>(
			params: FetchNavInfoRequestPayload,
		): Promise<T> {
			return client.get<T, T>(FETCH_MENU_LIST_PATH, { params });
		},
	};
}

export const userApi = createUserApi();
