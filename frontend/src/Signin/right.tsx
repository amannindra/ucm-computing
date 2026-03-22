import UcmLogo from "../assets/ucmlogo.png";

export default function SigninRight() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(234,179,8,0.12),_transparent_26%)]" />

      <div className="relative flex max-w-xl flex-col items-center px-10 text-center">
        <div className="rounded-3xl border border-gray-700/70 bg-[#161616]/85 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <img
            alt="UCM Computing"
            className="h-40 w-40 object-contain"
            src={UcmLogo}
          />
        </div>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">
          UCM Computing
        </p>
        <h2 className="mt-4 text-4xl font-bold leading-tight text-white">
          Internal AI Workspace
        </h2>
        <p className="mt-4 max-w-md text-base text-gray-300">
          Sign in to access model training, storage management, and live job
          updates.
        </p>
      </div>
    </div>
  );
}
