import "@/theme/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const container = document.getElementById("root");
if (!container) {
	throw new Error("Root element not found");
}

// codex resume 019a863a-22bc-7831-a58a-2a07f81cbc7d
createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
