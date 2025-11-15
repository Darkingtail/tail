import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function Error404() {
	const navigator = useNavigate();
	return (
		<Button
			type="primary"
			onClick={() => {
				navigator("/home", { replace: true });
			}}
		>
			404 back to home
		</Button>
	);
}
