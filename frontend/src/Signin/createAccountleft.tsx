import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAccount, signIn } from "./backend";

type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};

export default function CreateAccountLeft({
  setCreatePassword,
  setUser,
}: {
  createPassword: boolean;
  setCreatePassword: (createPassword: boolean) => void;
  setUser: (user: User | null) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const response = await createAccount(name, email, password);
    if (!response?.success) {
      setError(response?.message || "Something went wrong.");
      return;
    }

    const signInResponse = await signIn(email, password);
    if (signInResponse?.success && signInResponse.user) {
      setUser(signInResponse.user);
      navigate("/home");
      return;
    }

    setCreatePassword(false);
    navigate("/signin");
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-700/80 bg-[#161616]/95 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">
            UCM Computing
          </p>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="mt-2 text-sm text-gray-300">
              Set up your workspace account to manage training jobs and storage
              buckets.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-100"
              htmlFor="name"
            >
              Full name
            </label>
            <input
              className="block w-full rounded-xl border border-gray-700 bg-[#0f0f0f] px-4 py-3 text-base text-white outline-none transition focus:border-yellow-500"
              id="name"
              name="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="John Doe"
              type="text"
              value={name}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-100"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              className="block w-full rounded-xl border border-gray-700 bg-[#0f0f0f] px-4 py-3 text-base text-white outline-none transition focus:border-yellow-500"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-100"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="block w-full rounded-xl border border-gray-700 bg-[#0f0f0f] px-4 py-3 text-base text-white outline-none transition focus:border-yellow-500"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              type="password"
              value={password}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-100"
              htmlFor="confirmPassword"
            >
              Confirm password
            </label>
            <input
              className="block w-full rounded-xl border border-gray-700 bg-[#0f0f0f] px-4 py-3 text-base text-white outline-none transition focus:border-yellow-500"
              id="confirmPassword"
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              type="password"
              value={confirmPassword}
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
            Create Account
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-gray-700 bg-[#111111] px-4 py-4">
          <div>
            <p className="text-sm text-gray-300">Already have an account?</p>
          </div>
          <button
            className="text-sm font-semibold text-yellow-500 transition hover:text-yellow-400"
            onClick={() => setCreatePassword(false)}
            type="button"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
