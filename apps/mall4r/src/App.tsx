import Router from "@/router";
import { ConfigProvider } from "antd";
import { ErrorBoundary } from "react-error-boundary";

function App() {
	return (
		<>
			<ConfigProvider>
				<ErrorBoundary fallback={<div>Something went wrong</div>}>
					<Router />
				</ErrorBoundary>
			</ConfigProvider>
		</>
	);
}

export default App;
