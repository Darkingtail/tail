// https://tanstack.com/query/latest/docs/framework/react/reference/useMutation
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
// https://github.com/pmndrs/zustand
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import userService, { type SignInReq } from "@/api/services/userService";

import type { UserInfo, UserToken } from "#/entity";
import { StorageEnum } from "#/enum";

import { t } from "@/locales/i18n";

// https://sonner.emilkowal.ski/
import { toast } from "sonner";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: UserToken;
	// 使用 actions 命名空间来存放所有的 action
	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: UserToken) => void;
		clearUserInfoAndToken: () => void;
	};
};

const useUserStore = create<UserStore>()(
	devtools(
		persist(
			(set) => ({
				userInfo: {},
				userToken: {},
				actions: {
					setUserInfo: (userInfo) => {
						set({ userInfo });
					},
					setUserToken: (userToken) => {
						set({ userToken });
					},
					clearUserInfoAndToken() {
						set({ userInfo: {}, userToken: {} });
					},
				},
			}),
			{
				name: "userStore", // name of the item in the storage (must be unique)
				storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
				partialize: (state) => ({
					[StorageEnum.UserInfo]: state.userInfo,
					[StorageEnum.UserToken]: state.userToken,
				}),
			},
		),
	),
);

// get user info from zustand store by useUserInfo()
export const useUserInfo = () => useUserStore((state) => state.userInfo);
// get user token from zustand store by useUserToken()
export const useUserToken = () => useUserStore((state) => state.userToken);
// get user permission from zustand store by useUserPermission()
export const useUserPermission = () =>
	useUserStore((state) => state.userInfo.permissions);
// get user actions from zustand store by useUserActions()
export const useUserActions = () => useUserStore((state) => state.actions);

export const useSignIn = () => {
	const navigatge = useNavigate();
	const { setUserToken, setUserInfo } = useUserActions();
	// tanstack/react-query useMutation
	const signInMutation = useMutation({
		mutationFn: userService.signin, // api function
	});

	const signIn = async (data: SignInReq) => {
		try {
			const res = await signInMutation.mutateAsync(data);
			const { user, accessToken, refreshToken } = res;
			setUserToken({ accessToken, refreshToken }); // set token
			setUserInfo(user); // set user info
			navigatge(HOMEPAGE, { replace: true }); // navigate to homepage
			toast.success(t("sys.login.loginSuccessTitle"), { closeButton: true });
		} catch (err) {
			toast.error(err.message, {
				position: "top-center",
			});
		}
	};

	return signIn;
};

export default useUserStore;
