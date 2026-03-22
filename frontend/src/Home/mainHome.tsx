import Panel from "./panel";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};
export default function MainHome({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  console.log("mainHome");

  useEffect(() => {
    if (!user) {
      console.log("User is null, redirecting to login");
      navigate("/signin");
    }
  }, [user, navigate]);

  console.log("user: ", user);

  return (
    <div className="flex w-full h-full">
      <div className="h-screen w-full grid grid-cols-12 overflow-hidden">
        <div className="col-span-3 xl:col-span-2 justify-center overflow-hidden h-screen">
          <Panel onLogout={onLogout} />
        </div>
        <div className="col-span-9 xl:col-span-10 h-screen overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
