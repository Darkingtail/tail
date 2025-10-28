import "@/theme/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const container = document.getElementById("root");
if (!container) {
	throw new Error("Root element not found");
}

// codex resume 019a1ebb-34a7-7951-b5d0-530d4e7ead9e
createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
