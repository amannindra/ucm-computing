import { useState } from "react";
import SigninRight from "./right";
import { Link } from "react-router-dom";
import SigninLeft from "./SignInleft";
import CreateAccountLeft from "./createAccountleft";

export default function Signin({
  setUser,
}: {
  setUser: (user: User | null) => void;
}) {
  const [createPassword, setCreatePassword] = useState(false);

  return (
    <div className="flex w-full h-full">
      <div className="h-screen w-full grid grid-cols-12">
        <div className="col-span-3 justify-center">
          {createPassword ? (
            <CreateAccountLeft
              createPassword={createPassword}
              setCreatePassword={setCreatePassword}
              setUser={setUser}
            />
          ) : (
            <SigninLeft
              createPassword={createPassword}
              setCreatePassword={setCreatePassword}
              setUser={setUser}
            />
          )}
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
