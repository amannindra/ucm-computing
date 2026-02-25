import { Link, Navigate } from "react-router-dom";
import Panel from "./panel";
import TrainModel from "./trainModel";
import { useState } from "react";
import Default from "./default";
import Storage from "./storage";
import { useNavigate } from "react-router-dom";
type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};
export default function MainHome({ user }: { user: User | null }) {
  // console.log(`user MainHome: ${user}`);
  const [activeTab, setActiveTab] = useState("trainModel");
  const navigate = useNavigate();
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  console.log("mainHome");

  if (!user) {
    console.log("User is null, redirecting to login");
    navigate("/signin");
  }

  return (
    <div className="flex w-full h-full">
      <div className="h-screen w-full grid grid-cols-12 overflow-hidden">
        <div className="col-span-2 justify-center overflow-hidden h-screen">
          <Panel onTabChange={handleTabChange} />
        </div>
        <div className="col-span-10 h-screen overflow-y-auto">
          {activeTab === "trainModel" ? (
            <TrainModel />
          ) : activeTab === "storage" ? (
            <Storage />
          ) : (
            <Default />
          )}
        </div>
      </div>
    </div>
  );
}
