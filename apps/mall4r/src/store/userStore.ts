import type { LoginResponse } from "@/service/api/login";
import Cookies from "js-cookie";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type UserStore = {
	userToken: Partial<LoginResponse>;
	Authorization: string;
	// 使用 actions 命名空间来存放所有的 action
	actions: {
		setUserToken: (token: LoginResponse) => void;
		setAuthorization: (Authorization: string) => void;
		clearUserToken: () => void;
	};
};

const useUserStore = create<UserStore>()(
	devtools(
		persist(
			(set) => ({
				userToken: {},
				Authorization: "",
				actions: {
					setUserToken: (userToken) => {
						set({ userToken });
					},
					setAuthorization: (Authorization) => {
						Cookies.set("Authorization", Authorization);
						set({ Authorization });
					},
					clearUserToken() {
						Cookies.remove("Authorization");
						set({ userToken: {}, Authorization: "" });
					},
				},
			}),
			{
				name: "userStore", // name of the item in the storage (must be unique)
				storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
				partialize: (state) => {
					return {
						userToken: state.userToken,
						Authorization: state.Authorization,
					};
				},
			},
		),
	),
);

export default useUserStore;
