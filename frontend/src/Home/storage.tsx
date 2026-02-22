const eachBucket = (bucketName: string, dateCreated: string) => {
  return (
    <div className="grid grid-cols-2 p-4 border-b-2">
      <div className="flex gap-2 items-center">
        <button className=" h-5 w-5 items-center justify-center rounded-full broder-gray-600 border-2 text-white  hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"></button>
        <a className="text-sm font-bold underline" href="google.com">
          {bucketName}
        </a>
      </div>
      <div className="flex mt-4 gap-2 items-center">{dateCreated}</div>
    </div>
  );
};

export default function Storage() {
  return (
    <div className="flex h-full w-full ">
      <div className="flex flex-col h-full w-full border-l-2 border-r-2overflow-y-auto">
        <div className="flex flex-col">
          <div className="flex justify-center">
            <div className="flex flex-col p-10 w-[80%] ">
              <h1 className="text-3xl font-bold">Storage Configuration</h1>{" "}
              <div className="flex flex-row gap-2">
                <button
                  className="mt-4 w-1/5
               border-2 border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black"
                >
                  Create Bucket
                </button>
                <button
                  className="mt-4 w-1/5
               border-2 border-white text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black"
                >
                  Remove Bucket
                </button>
              </div>
              <div className="grid grid-flow-row mt-4 border-b-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="">
                    <p className="text-sm font-bold">Bucket Name</p>
                  </div>
                  <div className="">
                    <p className="text-sm font-bold">Date Created</p>
                  </div>
                </div>
              </div>
              {eachBucket("bucket1", "February 22, 2026")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
