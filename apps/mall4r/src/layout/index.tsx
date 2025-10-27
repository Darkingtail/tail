import { Layout as AntdLayout } from "antd";
import { Outlet } from "react-router-dom";
import NavBar from "./navbar";
import SideBar from "./sidebar";

const { Sider, Content } = AntdLayout;

export default function Layout() {
	return (
		<AntdLayout className="h-screen w-screen">
			<NavBar />
			<AntdLayout>
				<Sider>
					<SideBar />
				</Sider>
				<Content>
					<Outlet />
				</Content>
			</AntdLayout>
		</AntdLayout>
	);
}
