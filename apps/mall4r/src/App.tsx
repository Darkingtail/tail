import Router from "@/router";
import { ConfigProvider, Space } from "antd";
import { ErrorBoundary } from "react-error-boundary";

function App() {
  return (
    <>
      <ConfigProvider>
        <Space>
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Router />
          </ErrorBoundary>
        </Space>
      </ConfigProvider>
    </>
  );
}

export default App;
