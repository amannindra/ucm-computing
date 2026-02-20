import { useState } from "react";
import SigninRight from "./right";
import { Link } from "react-router-dom";
import SigninLeft from "./left";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setSplit = 30;

  return (
    <div className="flex w-full h-full">
      <div className="h-screen w-full grid grid-cols-12">
        <div className="col-span-3 justify-center">
          <SigninLeft />
        </div>{" "}
        {/* ~33% */}
        <div className="col-span-9">
          <SigninRight />
        </div>{" "}
        {/* ~67% */}
      </div>
    </div>
  );
}
