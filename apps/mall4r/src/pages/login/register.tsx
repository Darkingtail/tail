import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export function Register() {
  const navigate = useNavigate();
  return (
    <div>
      Register
      <Button
        onClick={() => {
          navigate("/");
        }}
      >
        to login
      </Button>
    </div>
  );
}
