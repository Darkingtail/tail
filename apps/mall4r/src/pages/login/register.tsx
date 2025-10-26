import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function Register() {
	const navigate = useNavigate();
	return (
		<div>
			Register
			<Button
				onClick={() => {
					navigate("/login");
				}}
			>
				to login
			</Button>
		</div>
	);
}
