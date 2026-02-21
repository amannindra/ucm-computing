export default function Panel({
  onTabChange,
}: {
  onTabChange: (tab: string) => void;
}) {
  const handleTrainModelClick = () => {
    onTabChange("trainModel");
  };
  const handleGenerateClick = () => {
    onTabChange("default");
  };
  const handleStorageClick = () => {
    onTabChange("storage");
  };
  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="text-2xl font-bold w-full h-fit pb-2 pt-2 border-b-2 flex justify-center items-center bg-yellow-800"
        onClick={handleTrainModelClick}
      >
        UCM Computing
      </div>
      <div
        className="text-2xl font-bold w-full h-fit pb-2 pt-2 border-b-2 flex justify-center items-center bg-yellow-800"
        onClick={handleGenerateClick}
      >
        Train Model
      </div>
      <div
        className="text-2xl font-bold w-full h-fit pb-2 pt-2 border-b-2 flex justify-center items-center bg-yellow-800"
        onClick={handleStorageClick}
      >
        Storage
      </div>
    </div>
  );
}
