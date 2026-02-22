import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./Signin/base";
import MainHome from "./Home/mainHome";
import { useState } from "react";
type User = {
  uuid: string;
  name: string;
  email: string;
  password: string;
};
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin setUser={setUser} />} />
        <Route path="/signin" element={<Signin setUser={setUser} />} />
        <Route path="/home" element={<MainHome user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}
