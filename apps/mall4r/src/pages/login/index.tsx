import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();
  return (
    <div>
      Login
      <Button
        onClick={() => {
          navigate("/register");
        }}
      >
        to register
      </Button>
    </div>
  );
}
