import Router from "@/router";
import { buildRoutesFromMenu } from "@/router/utils/buildDynamicRoutes";
import AntdConfig from "@/theme/antd";
import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import useRouteStore from "./store/routerStore";

function App() {
	const menuList = useRouteStore((state) => state.menuList);
	const routes = useMemo(
		() => buildRoutesFromMenu(menuList),
		[menuList],
	);
	return (
		<>
			<AntdConfig>
				<ErrorBoundary fallback={<div>Something went wrong</div>}>
					<Suspense fallback={<div>Loading...</div>}>
						<Router dynamicRoutes={routes} />
					</Suspense>
				</ErrorBoundary>
			</AntdConfig>
		</>
	);
}

export default App;
