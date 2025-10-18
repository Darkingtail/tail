import "@/theme/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const container = document.getElementById("root");
if (!container) {
	throw new Error("Root element not found");
}

createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);

// codex resume 0199f562-ca2a-7550-9302-90c9af7f3fb8
// codex resume 0199f562-ca2a-7550-9302-90c9af7f3fb8
