import useUserStore from "@/store/userStore";
import { useEffect, useState } from "react";

export default function useUserAccessToken() {
	const [isHydrated, setIsHydrated] = useState(
		() => useUserStore.persist.hasHydrated?.() ?? false,
	);

	useEffect(() => {
		if (useUserStore.persist.hasHydrated?.()) {
			setIsHydrated(true);
			return;
		}

		const unsubFinishHydration = useUserStore.persist.onFinishHydration?.(
			() => {
				setIsHydrated(true);
			},
		);

		return () => {
			unsubFinishHydration?.();
		};
	}, []);

	return {
		isHydrated,
		accessToken: useUserStore((state) => state.userToken.accessToken),
	};
}
