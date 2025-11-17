import { lazy } from "react"; // 延迟加载
import {
  Navigate,
  type RouteObject,
  RouterProvider,
  createHashRouter,
} from "react-router-dom";

import DashboardLayout from "@/layouts/dashboard";
import AuthGuard from "@/router/components/auth-guard";
import { usePermissionRoutes } from "@/router/hooks";
import { ErrorRoutes } from "@/router/routes/error-routes";

import type { AppRouteObject } from "#/router";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

// login route
const LoginRoute: AppRouteObject = {
  path: "/login",
  Component: lazy(() => import("@/pages/sys/login/Login")),
};

// 404 page
const PAGE_NOT_FOUND_ROUTE: AppRouteObject = {
  path: "*",
  element: <Navigate to="/404" replace />,
};

// no multi-role routes
export default function Router() {
  const permissionRoutes = usePermissionRoutes();
  console.log("permissionRoutes:", permissionRoutes);
  // async routes, after login
  const asyncRoutes: AppRouteObject = {
    path: "/",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to={HOMEPAGE} replace /> },
      ...permissionRoutes,
    ],
  };

  const routes = [LoginRoute, asyncRoutes, ErrorRoutes, PAGE_NOT_FOUND_ROUTE];
  console.log("routes:", routes);

  const router = createHashRouter(routes as unknown as RouteObject[], {
    // ought to update react-router-dom to v7
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  });

  return (
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  );
}
