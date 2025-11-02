import { Empty } from "antd";
import { useMatches } from "react-router-dom";

type IframeRouteHandle = {
	iframeUrl?: string;
};

export default function IframePage() {
	const matches = useMatches();
	const currentMatch = matches[matches.length - 1];
	const iframeUrl = (currentMatch?.handle as IframeRouteHandle | undefined)
		?.iframeUrl;

	if (!iframeUrl) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Empty description="暂无可展示的链接" />
			</div>
		);
	}

	return (
		<div className="h-full w-full overflow-hidden">
			<iframe
				title={iframeUrl}
				src={iframeUrl}
				className="h-full w-full border-0"
				allow="fullscreen"
			/>
		</div>
	);
}
