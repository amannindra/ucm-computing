import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signin from "./Signin/base";
import MainHome from "./Home/mainHome";
import TrainModel from "./Home/trainModel";
import StoragePage from "./Storage/storagePage";
import { useState } from "react";

type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  });

  const handleSetUser = (nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      return;
    }
    localStorage.removeItem("user");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin setUser={handleSetUser} />} />
        <Route path="/signin" element={<Signin setUser={handleSetUser} />} />
        <Route
          path="/home"
          element={
            user ? <MainHome user={user} /> : <Navigate to="/signin" replace />
          }
        >
          <Route index element={<Navigate to="/home/train-model" replace />} />
          <Route path="train-model" element={<TrainModel user={user} />} />
          <Route path="storage" element={<StoragePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
