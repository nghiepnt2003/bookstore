import React from "react"
import { Outlet } from "react-router-dom"
import {Header, Navigation, TopHeader, Footer} from '../../components'
import ChatWithAdmin from "../../components/ChatWithAdmin"

const Public = () => {
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
            <ChatWithAdmin />
        </>
    )
}

export default Public