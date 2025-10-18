import type { CaptchaResponseData } from "@/service/api/captcha-verify";
import { LoadingOutlined, RightOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useLayoutEffect, useRef, useState } from "react";

type BlockPuzzleProps = {
	data: CaptchaResponseData | null;
	imgSize: { width: number; height: number };
	loading: boolean;
	onRefresh: () => Promise<void>;
	onSuccess: () => void;
};

const IMAGE_PREFIX = "data:image/png;base64,";

export default function BlockPuzzle({
	data,
	imgSize,
	loading,
	onRefresh,
	onSuccess,
}: BlockPuzzleProps) {
	const repData = data?.repData;

	const containerRef = useRef<HTMLDivElement>(null);

	const [barSize, setVerifyBarStyle] = useState({
		width: imgSize.width,
		height: "30px",
	});
	const [barText, setBarText] = useState("向右滑动完成验证");
	const [moveBlockBgColor, setMoveBlockBgColor] = useState("");
	const [moveBlockLeft, setMoveBlockLeft] = useState("");
	const [moveBlockCursor, setMoveBlockCursor] = useState("pointer");
	const [dimensions, setDimensions] = useState({
		imgWidth: imgSize.width,
		imgHeight: imgSize.height,
	});

	useLayoutEffect(() => {
		const el = containerRef.current?.parentElement;
		if (!el) return;
		setDimensions(resetSizeReact({ container: el, imgSize, barSize }));
	}, [imgSize, barSize]);

	const handleMove = (e) => {};

	if (!repData) {
		return (
			<Spin
				tip="正在加载验证码..."
				size="large"
				indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
			>
				<div
					className="flex items-center justify-center"
					style={{ ...imgSize }}
				></div>
			</Spin>
		);
	}

	return (
		<>
			<div className="mb-4 overflow-hidden rounded border border-gray-200">
				<img
					className="block h-auto w-full"
					src={`${IMAGE_PREFIX}${repData.originalImageBase64}`}
					alt="captcha background"
					style={{ ...imgSize }}
				/>
			</div>
			<div
				style={{ ...barSize }}
				className="relative box-content border border-solid border-[#ddd] bg-white text-center"
			>
				<span className="leading-[32px]">{barText}</span>
				<div
					className="absolute top-0 box-border text-center"
					style={{
						width: barSize.height,
						height: barSize.height,
						background: moveBlockBgColor,
						left: moveBlockLeft,
						border: "1px solid red",
						cursor: moveBlockCursor,
					}}
					onTouchStart={handleMove}
					onMouseDown={handleMove}
				>
					<RightOutlined />
				</div>
				<img
					className=""
					src={`${IMAGE_PREFIX}${repData.jigsawImageBase64}`}
					alt=""
				/>
			</div>
		</>
	);
}
