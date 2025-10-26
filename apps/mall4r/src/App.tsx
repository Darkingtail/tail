import Router from "@/router";
import AntdConfig from "@/theme/antd";
import { ErrorBoundary } from "react-error-boundary";

function App() {
	return (
		<>
			<AntdConfig>
				<ErrorBoundary fallback={<div>Something went wrong</div>}>
					<Router />
				</ErrorBoundary>
			</AntdConfig>
		</>
	);
}

export default App;
