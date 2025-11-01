import type { MenuItem } from "@/service/api/user";
import type { RouteObject } from "react-router-dom";

const modules = import.meta.glob("@/pages/**/index.tsx");

export function buildRoutesFromMenu(menuList: MenuItem[]): RouteObject[] {
	console.log("modules:", modules);
	console.log("menuList:", menuList);
	const dynamicRoutes: RouteObject[] = [];

	function walk(list: MenuItem[]) {}

	return dynamicRoutes;
}
