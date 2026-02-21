import { Link } from "react-router-dom";
import Panel from "./panel";
import TrainModel from "./trainModel";
import { useState } from "react";
import Default from "./default";
import Storage from "./storage";

export default function MainHome() {
  const [activeTab, setActiveTab] = useState("trainModel");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  console.log("mainHome");
  return (
    <div className="flex w-full h-full">
      <div className="h-screen w-full grid grid-cols-12">
        <div className="col-span-2 justify-center">
          <Panel onTabChange={handleTabChange} />
        </div>
        <div className="col-span-10">
          {activeTab === "trainModel" ? <TrainModel /> : activeTab === "storage" ? <Storage /> : <Default />}
        </div>
      </div>
    </div>
  );
}
