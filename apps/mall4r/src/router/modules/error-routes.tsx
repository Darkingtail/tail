import { Suspense, lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";
import AuthGuard from "../components/auth-guard";

const Page404 = lazy(() => import("@/pages/error/404"));

/**
 * error routes
 * 403, 404, 500
 */
const ErrorRoutes: RouteObject = {
	element: (
		<AuthGuard>
			<Suspense fallback={<>Loading...</>}>
				<Outlet />
			</Suspense>
		</AuthGuard>
	),
	children: [{ path: "404", element: <Page404 /> }],
};

export default ErrorRoutes;
