import { Layout as AntdLayout } from "antd";
import { Outlet } from "react-router-dom";
import NavBar from "./navbar";
import SideBar from "./sidebar";

const { Header, Sider, Content } = AntdLayout;

export default function Layout() {
	return (
		<AntdLayout className="h-screen w-screen">
			<Header>
				<NavBar />
			</Header>
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
