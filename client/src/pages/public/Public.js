import React from "react";
import { Outlet } from "react-router-dom";
import { Header, Navigation, TopHeader, Footer } from "../../components";
import ChatWithAdmin from "../../components/ChatWithAdmin";
import ChatWithAI from "../../components/ChatWithAI";
import { useSelector } from "react-redux";

const Public = () => {
  const { isLoggedIn, current } = useSelector((state) => state.user);
  return (
    <>
      <div className="w-full flex flex-col items-center">
        <TopHeader />
        <Header />
        <Navigation />
        <div className="w-main">
          <Outlet />
        </div>
        <Footer />
      </div>
      {isLoggedIn ? <ChatWithAdmin /> : null}
      {isLoggedIn ? <ChatWithAI /> : null}
    </>
  );
};

export default Public;
