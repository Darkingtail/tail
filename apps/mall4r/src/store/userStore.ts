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

/*

useRouteStore 是 zustand 返回的“hook 形态” store，React 会把它当作一个 Hook 来
  处理。所以：

  - 任何 useXXX Hook（包括 zustand 的）都只能在 React 组件或者其他 Hook 里调用；
    你在 create() 的工厂函数里去 useRouteStore()，相当于在普通函数里调用 Hook，
    React 直接报错。
  - 即便不报错，useRouteStore() 返回的是当前订阅的切片，它会被锁在创建时的闭包
    里，后续状态更新拿不到（永远是旧值）。
  - store 之间这么互调，还很容易形成循环依赖：userStore 里 import
    useRouteStore，routerStore 又间接引 userStore，模块初始化就死锁了。

  Zustand 官方的跨 store 用法，是利用返回 hook 上挂着的静态方法，例如：

  const routeActions = useRouteStore.getState().actions;
  routeActions.setRoutes(...);

  getState()、setState()、subscribe() 这些都不触发 React Hook 的限制，也不会陷入
  闭包/循环依赖的问题。保持这种方式就 OK 了。

	create() 返回的 useRouteStore 本质上就是一个 React Hook：它内部要调用
  useSyncExternalStore 来把状态订阅到组件生命周期。所以你一旦在组件外执行
  useRouteStore()，React 在运行时就会抛出 “Invalid hook call”——不是因为名字叫
  use，而是因为真的调用了 Hook 却不在组件/自定义 Hook 里。eslint 的 rules-of-
  hooks 之所以也报警，是因为它只靠命名约定来静态检查，看到 useRouteStore() 的调
  用就默认你在用 Hook，两边配合确保我们不会在错的场景下调用。



*/

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
