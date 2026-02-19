import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./Signin/left";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </BrowserRouter>
  );
}
