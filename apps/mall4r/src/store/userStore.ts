import {
	type LoginRequestPayload,
	type LoginResponse,
	type LogoutRequestPayload,
	type UserInfo,
	loginApi,
} from "@/service/api/login";
import Cookies from "js-cookie";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: Partial<LoginResponse>;
	Authorization: string;
	// 使用 actions 命名空间来存放所有的 action
	actions: {
		login: (form: LoginRequestPayload) => Promise<void>;
		logOut: (data: LogoutRequestPayload) => Promise<void>;
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: LoginResponse) => void;
		setAuthorization: (Authorization: string) => void;
		clearUserToken: () => void;
		clearUserInfo: () => void;
	};
};

const useUserStore = create<UserStore>()(
	devtools(
		persist(
			(set, get) => ({
				userInfo: {},
				userToken: {},
				Authorization: "",
				actions: {
					login: async (form: LoginRequestPayload) => {
						try {
							const response = await loginApi.login(form);
							const userInfo = await loginApi.fetchUserInfo({ t: Date.now() });
							get().actions.setUserToken(response);
							get().actions.setAuthorization(response.accessToken ?? "");
							get().actions.setUserInfo(userInfo);
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
							Cookies.remove("Authorization");
						}
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
						set({ userToken: {}, Authorization: "" });
					},
					clearUserInfo() {
						set({ userInfo: {} });
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
