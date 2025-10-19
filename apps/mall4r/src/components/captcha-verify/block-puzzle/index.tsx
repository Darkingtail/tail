import type { CaptchaResponseData } from "@/service/api/captcha-verify";
import { LoadingOutlined, RightOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useEffect, useRef, useState } from "react";

type BlockPuzzleProps = {
	data: CaptchaResponseData | null;
	imgSize: { width: number; height: number };
	loading: boolean;
	verifying: boolean;
	onVerify: (point: { x: number; y: number }) => Promise<void> | void;
};

const IMAGE_PREFIX = "data:image/png;base64,";
const BAR_HEIGHT = 40;
const BAR_TEXT = "向右滑动完成验证";
const ORIGINAL_IMAGE_WIDTH = 310;
const DEFAULT_SLIDER_WIDTH = 47;
const FALLBACK_Y = 5.0;

type DragState = {
	startX: number;
	initialOffset: number;
	maxOffset: number;
};

type CaptchaMeta = {
	originalImageWidth?: number;
	sliderImageWidth?: number;
};

export default function BlockPuzzle({
	data,
	imgSize,
	loading,
	verifying,
	onVerify,
}: BlockPuzzleProps) {
	const repData = data?.repData ?? null;
	const barRef = useRef<HTMLDivElement>(null);
	const dragStateRef = useRef<DragState | null>(null);
	const handleLeftRef = useRef(0);
	const pieceOffsetRef = useRef(0);
	const lastPieceOffsetRef = useRef(0);

	const [handleLeft, setHandleLeft] = useState(0);
	const [pieceOffset, setPieceOffset] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [cursor, setCursor] = useState<"pointer" | "grabbing">("pointer");

	const { originalImageWidth, sliderImageWidth } = (repData ??
		{}) as CaptchaMeta;

	const baseOriginalWidth =
		typeof originalImageWidth === "number" && originalImageWidth > 0
			? originalImageWidth
			: ORIGINAL_IMAGE_WIDTH;
	const baseSliderWidth =
		typeof sliderImageWidth === "number" && sliderImageWidth > 0
			? sliderImageWidth
			: DEFAULT_SLIDER_WIDTH;

	const handleWidth = BAR_HEIGHT;
	const handleHeight = BAR_HEIGHT;
	const scaleX = imgSize.width / baseOriginalWidth;
	const pieceWidth = Math.max(1, Math.round(baseSliderWidth * scaleX));

	useEffect(() => {
		if (!isDragging) {
			return;
		}

		const handlePointerMove = (event: PointerEvent) => {
			const state = dragStateRef.current;
			const barEl = barRef.current;
			if (!state || !barEl) {
				return;
			}

			const delta = event.clientX - state.startX;
			const rawOffset = state.initialOffset + delta;
			const clampedOffset = Math.max(0, Math.min(rawOffset, state.maxOffset));

			handleLeftRef.current = clampedOffset;
			setHandleLeft(clampedOffset);

			const maxPieceOffset = Math.max(imgSize.width - pieceWidth, 0);
			const ratio = state.maxOffset === 0 ? 0 : clampedOffset / state.maxOffset;
			const mappedPieceOffset = ratio * maxPieceOffset;

			pieceOffsetRef.current = mappedPieceOffset;
			lastPieceOffsetRef.current = mappedPieceOffset;
			setPieceOffset(mappedPieceOffset);
		};

		const handlePointerUp = async () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);

			setIsDragging(false);
			setCursor("pointer");
			dragStateRef.current = null;

			const maxPieceOffset = Math.max(imgSize.width - pieceWidth, 0);
			const maxOriginalOffset = Math.max(
				baseOriginalWidth - baseSliderWidth,
				0,
			);
			const clampedPieceOffset = Math.max(
				0,
				Math.min(lastPieceOffsetRef.current, maxPieceOffset),
			);
			const ratio =
				maxPieceOffset === 0 ? 0 : clampedPieceOffset / maxPieceOffset;
			const normalizedX =
				maxOriginalOffset === 0 ? 0 : ratio * maxOriginalOffset;
			const normalizedPoint = {
				x: Number(normalizedX.toFixed(2)),
				y: FALLBACK_Y,
			};

			try {
				await onVerify(normalizedPoint);
			} finally {
				setHandleLeft(0);
				setPieceOffset(0);
				handleLeftRef.current = 0;
				pieceOffsetRef.current = 0;
				lastPieceOffsetRef.current = 0;
			}
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
		};
	}, [
		isDragging,
		imgSize.width,
		pieceWidth,
		baseOriginalWidth,
		baseSliderWidth,
		onVerify,
	]);

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		if (loading || verifying) {
			return;
		}

		const barEl = barRef.current;
		if (!barEl) {
			return;
		}

		const maxOffset = Math.max(0, barEl.offsetWidth - handleWidth);

		dragStateRef.current = {
			startX: event.clientX,
			initialOffset: handleLeftRef.current,
			maxOffset,
		};

		lastPieceOffsetRef.current = pieceOffsetRef.current;

		setIsDragging(true);
		setCursor("grabbing");
		event.currentTarget.setPointerCapture?.(event.pointerId);
		event.preventDefault();
	};

	const busy = loading || verifying;

	return (
		<div className="select-none">
			{!repData ? (
				<Spin
					tip="Loading captcha..."
					size="large"
					indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
				>
					<div
						className="flex items-center justify-center"
						style={{ width: imgSize.width, height: imgSize.height }}
					/>
				</Spin>
			) : (
				<Spin spinning={busy} indicator={<LoadingOutlined spin />}>
					<div className="relative mb-4 overflow-hidden rounded border border-gray-200">
						<img
							className="block h-auto w-full select-none"
							src={`${IMAGE_PREFIX}${repData.originalImageBase64}`}
							alt="captcha background"
							style={{ width: imgSize.width, height: imgSize.height }}
							draggable={false}
						/>
						<img
							className="pointer-events-none absolute top-0 left-0 block select-none"
							src={`${IMAGE_PREFIX}${repData.jigsawImageBase64}`}
							alt="captcha block"
							style={{
								width: pieceWidth,
								height: imgSize.height,
								transform: `translate3d(${pieceOffset}px, 0, 0)`,
								transition: isDragging ? "none" : "transform 0.3s ease",
							}}
							draggable={false}
						/>
					</div>

					<div
						ref={barRef}
						className="relative box-border border border-solid border-[#ddd] bg-white text-center"
						style={{
							width: imgSize.width,
							height: handleHeight,
							lineHeight: `${handleHeight}px`,
						}}
					>
						<span>{BAR_TEXT}</span>
						<div
							role="presentation"
							className="absolute top-0 box-border flex h-full items-center justify-center border border-solid border-[#4096ff] bg-white text-[#4096ff]"
							style={{
								width: handleWidth,
								height: handleHeight,
								left: handleLeft,
								cursor,
								transition: isDragging ? "none" : "left 0.3s ease",
							}}
							onPointerDown={handlePointerDown}
						>
							<RightOutlined />
						</div>
					</div>
				</Spin>
			)}
		</div>
	);
}
