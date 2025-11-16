import {
	type LoginRequestPayload,
	type LoginResponse,
	type LogoutRequestPayload,
	loginApi,
} from "@/service/api/login";
import { type UserInfo, userApi } from "@/service/api/user";
import Cookies from "js-cookie";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import useRouteStore from "./routerStore";

const INITIAL_USER_INFO: UserInfo = {
	id: 0,
	username: "",
	userId: "",
	shopId: "",
	mobile: "",
};

const INITIAL_USER_TOKEN: Partial<LoginResponse> = {};

type UserStore = {
	userInfo: Partial<UserInfo>;
	authorities: string[];
	userToken: Partial<LoginResponse>;
	Authorization: string;
	// 浣跨敤 actions 鍛藉悕绌洪棿鏉ュ瓨鏀炬墍鏈夌殑 action
	actions: {
		login: (form: LoginRequestPayload) => Promise<void>;
		logOut: (data: LogoutRequestPayload) => Promise<void>;
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: LoginResponse) => void;
		setAuthorities: (authorities: string[]) => void;
		setAuthorization: (Authorization: string) => void;
		clearUserToken: () => void;
		clearUserInfo: () => void;
	};
};

export type UserStoreState = UserStore;

const useUserStore = create<UserStore>()(
	devtools(
		persist(
			(set, get) => ({
				userInfo: { ...INITIAL_USER_INFO },
				userToken: { ...INITIAL_USER_TOKEN },
				authorities: [],
				Authorization: "",
				actions: {
					login: async (form: LoginRequestPayload) => {
						try {
							const response = await loginApi.login(form);
							const userInfo = await userApi.fetchUserInfo({ t: Date.now() });
							const navInfo = await userApi.fetchNavInfo({ t: Date.now() });
							get().actions.setUserToken(response);
							get().actions.setAuthorization(response.accessToken ?? "");
							get().actions.setUserInfo(userInfo);
							get().actions.setAuthorities(navInfo.authorities);
							/* 	1. 路由对象里有函数，无法持久化
											buildRoutesFromMenu 生成的 RouteObject 会包含 lazy、element 等函数。把这些放到 store 并持久化到 localStorage 会因为
											JSON 序列化而丢失函数，刷新后就变成“没有 component 的空路由”，导致 404。只存纯数据（menuList）更安全。
										2. 在组件层算路由，随用随建
											sidebar、App 等组件根据最新的 menuList 调 buildRoutesFromMenu，能确保每次渲染拿到干净的路由树，不受缓存影响。也就没
											有“刷新后菜单/路由丢失”的问题。
										3. store 保持简单、易于同步
											routerStore 只负责存取菜单列表和是否加载完成，避免担心函数在 hydrate 后不一致。同时也让其他组件想要路由时可以直接在
											本地用 buildRoutesFromMenu 生成，逻辑上更可控。
							*/
							const routeActions = useRouteStore.getState().actions;
							routeActions.setMenuList(navInfo.menuList);
							Cookies.set("Authorization", response.accessToken ?? "");
							return Promise.resolve();
						} catch (error) {
							return Promise.reject(error);
						}
					},
					logOut: async (data: LogoutRequestPayload) => {
						try {
							await loginApi.logOut(data);
						} catch {
							// 鍗充娇鐧诲嚭鎺ュ彛璇锋眰澶辫触涔熺户缁竻鐞嗘湰鍦扮姸鎬?
						} finally {
							get().actions.clearUserToken();
							get().actions.clearUserInfo();
							const routeActions = useRouteStore.getState().actions;
							routeActions.reset();
							Cookies.remove("Authorization");
						}
					},
					setAuthorities: (authorities) => {
						set({ authorities });
					},
					setUserInfo: (userInfo) => {
						set({ userInfo });
					},
					setUserToken: (userToken) => {
						set({ userToken });
					},
					setAuthorization: (Authorization) => {
						set({ Authorization });
					},
					clearUserToken() {
						set({ userToken: { ...INITIAL_USER_TOKEN }, Authorization: "" });
					},
					clearUserInfo() {
						set({ userInfo: { ...INITIAL_USER_INFO } });
					},
				},
			}),
			{
				name: "userStore", // name of the item in the storage (must be unique)
				storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
				partialize: (state) => ({
					userInfo: state.userInfo,
					userToken: state.userToken,
					Authorization: state.Authorization,
				}),
			},
		),
	),
);

export default useUserStore;
