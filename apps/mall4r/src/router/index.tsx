// import { Register } from "@/pages/login/register";
import Layout from "@/layout";
import Home from "@/pages/home";
import Login from "@/pages/login";
import { useMemo } from "react";
import type { RouteObject } from "react-router-dom";
import {
	Navigate,
	RouterProvider,
	createBrowserRouter,
} from "react-router-dom";
import AuthGuard from "./components/auth-guard";
import ErrorRoutes from "./modules/error-routes";

const baseRoutes: RouteObject[] = [{ path: "/login", element: <Login /> }];

const notFoundRoute: RouteObject = {
	path: "*",
	element: <Navigate to="/404" replace />,
};

export default function Router({
	dynamicRoutes = [],
}: {
	dynamicRoutes?: RouteObject[];
}) {
	const routes = useMemo(() => {
		const guarded: RouteObject = {
			path: "/",
			element: (
				<AuthGuard>
					<Layout />
				</AuthGuard>
			),
			children: [
				{ index: true, element: <Navigate to="/home" replace /> },
				{ path: "/home", element: <Home /> },
				...dynamicRoutes,
				ErrorRoutes,
				notFoundRoute,
			],
		};

		return [...baseRoutes, guarded];
	}, [dynamicRoutes]);

	const router = useMemo(() => createBrowserRouter(routes), [routes]);

	return <RouterProvider router={router} />;
}
