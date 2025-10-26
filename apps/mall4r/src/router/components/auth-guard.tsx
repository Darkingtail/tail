import useUserAccessToken from "@/hooks/useUserAccessToken";
import { lazy, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";

const PageError = lazy(() => import("@/pages/error/404"));

type Props = {
	children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
	const navigate = useNavigate();

	const { accessToken, isHydrated } = useUserAccessToken();

	useEffect(() => {
		if (!isHydrated) {
			return;
		}

		if (!accessToken) {
			// redirect to login page after store is ready
			navigate("/login", { replace: true });
		}
	}, [accessToken, isHydrated, navigate]);

	if (!isHydrated) {
		return null;
	}

	return (
		<ErrorBoundary FallbackComponent={PageError}>{children}</ErrorBoundary>
	);
}
