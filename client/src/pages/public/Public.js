import React from "react"
import { Outlet } from "react-router-dom"
import {Header, Navigation, TopHeader, Footer} from '../../components'
import ChatWithAdmin from "../../components/ChatWithAdmin"
import { useSelector } from "react-redux";

const Public = () => {
    const { isLoggedIn, current } = useSelector(state => state.user);
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
            {isLoggedIn? <ChatWithAdmin />: null}
        </>
    )
}

export default Public