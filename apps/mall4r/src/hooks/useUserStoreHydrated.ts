import useUserStore, { type UserStoreState } from "@/store/userStore";
import { useEffect, useState } from "react";

type Selector<T> = (state: UserStoreState) => T;

export default function useUserStoreHydrated<T>(selector: Selector<T>) {
	const selectedState = useUserStore(selector);
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
		value: selectedState,
	};
}

