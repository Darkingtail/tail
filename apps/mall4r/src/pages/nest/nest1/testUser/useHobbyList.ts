import { createTestUserApi } from "@/service/api/nest/nest1/test-user";
import { useEffect, useRef, useState } from "react";

export default function useHobbyList() {
	const [hobbyList, setHobbyList] = useState<
		{ label: string; value: string }[]
	>([]);
	const [done, setDone] = useState(false);
	/*
  之前会“一直调用”是因为 createTestUserApi() 在每次渲染都生成新函数，useCallback 的依赖变动让 effect 反复触发。现在函
    数引用稳定了，effect 只跑一次。
  */
	const apiRef = useRef(createTestUserApi());

	useEffect(() => {
		let cancelled = false;
		const fetchHobbyList = async () => {
			if (done) {
				return;
			}
			const data = await apiRef.current.fetchHobbyList();
			if (cancelled) {
				return;
			}
			setHobbyList(data);
			setDone(true);
		};
		void fetchHobbyList();
		return () => {
			cancelled = true;
		};
	}, [done]);

	return {
		hobbyList,
		done,
	};
}
