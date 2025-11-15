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
	url: "/home",
	icon: null,
	orderNum: -1,
	perms: "",
	type: 1,
	list: null,
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

	return [{ ...HOME_MENU_ITEM }, ...menuList];
}
