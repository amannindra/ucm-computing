import { useState } from "react";
import SigninRight from "./right";
import SigninLeft from "./SignInleft";
import CreateAccountLeft from "./createAccountleft";

type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};

export default function Signin({
  setUser,
}: {
  setUser: (user: User | null) => void;
}) {
  const [createPassword, setCreatePassword] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.12),_transparent_26%),linear-gradient(135deg,_#111111_0%,_#181818_48%,_#101010_100%)]">
      <div className="grid min-h-screen w-full lg:grid-cols-[minmax(380px,460px)_1fr]">
        <div className="flex items-center justify-center border-r border-gray-800/80 px-6 py-8 lg:px-10">
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
        </div>
        <div className="hidden lg:block">
          <SigninRight />
        </div>
      </div>
    </div>
  );
}
