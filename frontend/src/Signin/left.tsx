import { useState } from "react";
import SigninRight from "./right";
export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex w-full h-full">
      <div className="h-screen w-1/2 bg-gray-200 flex items-center justify-center">
        <div className="bg-gray-200 rounded-2xl shadow-lg p-30">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              UCM Computing
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-600"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-600"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-gray-500" />
                Remember me
              </label>
              <a href="#" className="hover:text-gray-700 transition">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
      <SigninRight />
    </div>
  );
}
