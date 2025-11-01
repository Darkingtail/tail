import type { MenuItem } from "@/service/api/user";
import type { RouteObject } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RouteStore {
	menuList: MenuItem[];
	routes: RouteObject[];
	isLoaded: boolean;
	actions: {
		setMenuList: (menuList: MenuItem[]) => void;
		setRoutes: (routes: RouteObject[]) => void;
		reset: () => void;
	};
}

const useRouteStore = create<RouteStore>()(
	persist(
		(set) => ({
			menuList: [],
			routes: [],
			isLoaded: false,
			actions: {
				setMenuList: (menuList) => set({ menuList }),
				setRoutes: (routes) => set({ routes, isLoaded: true }),
				reset: () => set({ menuList: [], routes: [], isLoaded: false }),
			},
		}),
		{
			name: "routeStore",
			partialize: (state) => ({
				menuList: state.menuList,
				routes: state.routes,
				isLoaded: state.isLoaded,
			}),
		},
	),
);

export default useRouteStore;
