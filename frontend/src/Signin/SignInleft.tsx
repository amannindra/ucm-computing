import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "./backend";

type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const response = await signIn(email, password);
    if (response.success && response.user) {
      setUser(response.user);
      navigate("/home");
      return;
    }

    setError(response?.message || "Something went wrong.");
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-700/80 bg-[#161616]/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">
            UCM Computing
          </p>
          <div>
            <h1 className="text-3xl font-bold text-white">Sign In</h1>
            <p className="mt-2 text-sm text-gray-300">
              Access your training workspace, storage buckets, and live job
              console.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-100"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              autoComplete="email"
              className="block w-full rounded-xl border border-gray-700 bg-[#0f0f0f] px-4 py-3 text-base text-white outline-none transition focus:border-yellow-500"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                className="block text-sm font-medium text-gray-100"
                htmlFor="password"
              >
                Password
              </label>
              <button
                className="text-sm font-semibold text-yellow-500 transition hover:text-yellow-400"
                onClick={() => setCreatePassword(true)}
                type="button"
              >
                Create Account
              </button>
            </div>
            <input
              autoComplete="current-password"
              className="block w-full rounded-xl border border-gray-700 bg-[#0f0f0f] px-4 py-3 text-base text-white outline-none transition focus:border-yellow-500"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            className="w-full rounded-xl bg-yellow-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
            type="submit"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 rounded-xl border border-gray-700 bg-[#111111] px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            Workspace Access
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Sign in with the same account used for your backend bucket and job
            records.
          </p>
        </div>
      </div>
    </div>
  );
}
