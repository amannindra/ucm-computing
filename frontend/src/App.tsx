import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./Signin/SignIn";
import Main from "./Home/mainHome";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}
