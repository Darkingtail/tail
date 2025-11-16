import type { MenuItem } from "@/service/api/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RouteStore {
	menuList: MenuItem[];
	isLoaded: boolean;
	actions: {
		setMenuList: (menuList: MenuItem[]) => void;
		reset: () => void;
	};
}

const useRouteStore = create<RouteStore>()(
	persist(
		(set) => ({
			menuList: [],
			isLoaded: false,
			actions: {
				setMenuList: (menuList) => {
					const hydratedMenuList = ensureHomeMenu(menuList);
					set({
						menuList: hydratedMenuList,
						isLoaded: hydratedMenuList.length > 0,
					});
				},
				reset: () => set({ menuList: [], isLoaded: false }),
			},
		}),
		{
			name: "routeStore",
			partialize: (state) => ({
				menuList: state.menuList,
				isLoaded: state.isLoaded,
			}),
		},
	),
);
/*
  1. useRouteStore.persist?.onFinishHydration?.(...) 是 zustand persist 中的 “hydrate 完成” 钩子。也就是说，当持久化存储
    （localStorage）里的数据被异步取回并写回 store 后，会触发这个回调，我们可以在这里对恢复的状态做二次处理。
  2. 回调里面重新取出当前的 menuList 与 isLoaded，再调用 ensureHomeMenu 补一遍首页菜单项，确保即使本地存储的菜单列表里没
    有 /home，hydrate 完成后仍然会重新把首页插入，并将 isLoaded 标记为已加载。

  简而言之：这是用来在持久化恢复的时候，再次兜底补齐首页菜单，避免刷新后菜单丢失或顺序错乱。
*/
useRouteStore.persist?.onFinishHydration?.(() => {
	const { menuList, isLoaded } = useRouteStore.getState();
	if (menuList.length > 0) {
		const hydratedMenuList = ensureHomeMenu(menuList);
		useRouteStore.setState({
			menuList: hydratedMenuList,
			isLoaded: isLoaded ?? true,
		});
	}
});

export default useRouteStore;

const HOME_MENU_ITEM: MenuItem = {
	menuId: -1,
	name: "首页",
	parentId: 0,
	parentName: null,
	url: "home",
	icon: null,
	orderNum: -2,
	perms: "",
	type: 1,
	list: null,
};

const NESTED_MENU_ITEM: MenuItem = {
	menuId: 900,
	name: "嵌套路由",
	parentId: 0,
	parentName: null,
	url: "",
	icon: null,
	orderNum: 900,
	perms: "",
	type: 1,
	list: [
		{
			menuId: 901,
			name: "嵌套路由1",
			parentId: 900,
			parentName: "嵌套路由",
			url: "",
			icon: null,
			orderNum: 1,
			perms: "",
			type: 1,
			list: [
				{
					menuId: 902,
					name: "测试用户",
					parentId: 901,
					parentName: "嵌套路由2",
					url: "nest/nest1/testUser",
					icon: null,
					orderNum: 1,
					perms: "",
					type: 1,
					list: null,
				},
			],
		},
		{
			menuId: 903,
			name: "嵌套路由2",
			parentId: 900,
			parentName: "嵌套路由",
			url: "nest/nest2",
			icon: null,
			orderNum: 2,
			perms: "",
			type: 1,
			list: null,
		},
	],
};

function normalizeMenuUrl(url?: string | null) {
	return url ? url.replace(/^\//, "") : "";
}

function ensureHomeMenu(menuList: MenuItem[]): MenuItem[] {
	const hasHome = menuList.some(
		(item) => normalizeMenuUrl(item.url) === "home",
	);
	if (hasHome) {
		return menuList;
	}

	return [{ ...HOME_MENU_ITEM }, { ...NESTED_MENU_ITEM }, ...menuList];
}
