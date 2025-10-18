export const CaptchaType = {
	ClickWord: "clickWord",
	BlockPuzzle: "blockPuzzle",
} as const;

export type CaptchaType = (typeof CaptchaType)[keyof typeof CaptchaType];
