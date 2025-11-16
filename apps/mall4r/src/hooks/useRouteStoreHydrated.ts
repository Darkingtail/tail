import useRouteStore, { type UserStoreState } from "@/store/userStore";
import { useEffect, useState } from "react";

type Selector<T> = (state: UserStoreState) => T;

export default function useRouteStoreHydrated<T>(selector: Selector<T>) {
	const selectedState = useRouteStore(selector);
	const [isHydrated, setIsHydrated] = useState(
		() => useRouteStore.persist.hasHydrated?.() ?? false,
	);

	useEffect(() => {
		if (useRouteStore.persist.hasHydrated?.()) {
			setIsHydrated(true);
			return;
		}

		const unsubFinishHydration = useRouteStore.persist.onFinishHydration?.(
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
		value: selectedState,
	};
}
