import { Outlet } from "react-router-dom";

export default function Layout() {
	return (
		<div className="h-full w-full">
			Layout
			<Outlet />
		</div>
	);
}
