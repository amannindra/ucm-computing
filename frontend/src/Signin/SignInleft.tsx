import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "./backend.js";

type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
}

export default function SigninLeft({
  setCreatePassword,
  setUser,

}: {
  createPassword: boolean;
  setCreatePassword: (createPassword: boolean) => void;
  setUser: (user: User | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    const res = await signIn(email, password);
    if (res.success) {
      setUser(res.user);
      console.log(`user: ${res.user}`);
      navigate("/home");

    } else {
      setError(res?.message || "Something went wrong.");
    }
  };
  const handleCreateAccount = () => {
    console.log("in handleCreateAccount");
    setCreatePassword(true);
  };
  return (
    <>
      <div className="h-screen flex items-center justify-center">
        {" "}
        <div className="flex w-[80%] flex-col p-10 mb-10">
          <div className="flex sm:mx-auto sm:w-full sm:max-w-sm ">
            <h2 className="text-center text-2xl/9 font-bold tracking-tight text-white">
              Welcome to UCM Computing
            </h2>
          </div>
          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleSubmit} method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-100"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm/6 font-medium text-gray-100"
                  >
                    Password
                  </label>
                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-semibold text-indigo-400 hover:text-indigo-300"
                      onClick={handleCreateAccount}
                    >
                      Create Account
                    </a>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </form>
            {/* 
            <p className="mt-10 text-center text-sm/6 text-gray-400">
              Not a member?{" "}
              <a
                href="#"
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Start a 14 day free trial
              </a>
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
}
