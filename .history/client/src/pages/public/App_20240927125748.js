import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import {
  Login,
  Home,
  Public,
  FAQ,
  Blog,
  Products,
  DetailProudct,
  ResetPassword,
} from "./pages/public";
import path from "./ultils/path";
import { getCategories } from "./store/app/asyncActions";
import { useDispatch } from "react-redux";
import LoginComponent from "./pages/LoginComponent";
import CallbackComponent from "./pages/Callback";
import HomeComponent from "./pages/HomeComponent";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getCategories());
  }, []);

  return (
    <div className="min-h-screen font-main bg-[#f8f8f8]">
      <Routes>
        <Route path="/" element={<LoginComponent />} />
        <Route path="/callback" element={<CallbackComponent />} />
        <Route path="/home" element={<HomeComponent />} />
        {/* <Route path={path.PUBLIC} element={<Public />}>
          <Route path={path.HOME} element={<Home />}></Route>
          <Route path={path.FAQ} element={<FAQ />}></Route>
          <Route path={path.BLOG} element={<Blog />}></Route>
          <Route path={path.PRODUCTS} element={<Products />}></Route>
          <Route
            path={path.DETAIL_PRODUCT__PID__TITLE}
            element={<DetailProudct />}
          ></Route>
          <Route path={path.RESET_PASSWORD} element={<ResetPassword />}></Route>
        </Route>
        <Route path={path.LOGIN} element={<Login />}></Route> */}
      </Routes>
    </div>
  );
}

export default App;
