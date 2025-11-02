import { buildRoutesFromMenu } from "@/router/utils/buildDynamicRoutes";
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
	// 使用 actions 命名空间来存放所有的 action
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
							// 3. 更新路由 store（千万别用 useRouteStore()，要用 getState）
							// - useRouteStore.getState() 是 zustand hook 上挂的静态方法，不受 “Hook 只能在组
							//   件里用” 的限制。
							// - 把 actions 取出来复用即可（避免每次都 getState()）。
							// - 确保 routerStore 没有回头 import userStore，防止循环依赖。
							// - 如果 setRoutes 需要的是转换后的 RouteObject[]，先在 userStore 里调用你写的
							//   buildRoutesFromMenu 再塞进去。
							const routeActions = useRouteStore.getState().actions;
							routeActions.setMenuList(navInfo.menuList);
							routeActions.setRoutes(buildRoutesFromMenu(navInfo.menuList));
							// routeActions.setRoutes(buildRoutes(navInfo.menuList));
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
							// 即使登出接口请求失败也继续清理本地状态
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
