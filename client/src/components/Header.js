import React from "react"
import logo from '../assets/logo.png'
import icons from "../ultils/icons"
import {Link} from 'react-router-dom'
import path from "../ultils/path"

const Header = () => {
    const {FaPhone, FaTruckFast,IoMdCart,FaUserAlt} = icons
    return (
        <div className="w-full bg-white flex justify-center">
            <div className="w-main flex justify-between h-[140px] py-[16px] bg-white">
                <Link to={`/${path.HOME}`}>
                    <img  src={logo} alt="logo" className="w-[300px] h-[120px]"/>
                </Link>
                <div className="flex text-[13px]">
                    <div className="flex px-6 border-r items-center">
                        <span className="px-2">
                            <FaTruckFast color="#f73995" fontSize="30px"/>
                        </span>
                        <span className="flex flex-col items-center">                        
                            <span>Free standard shipping</span>
                            <span className="font-semibold text-[15px]">on all orders</span>
                        </span>                    
                    </div>

                    <div className="flex px-6 border-r items-center">
                        <span className="px-2">
                            <FaPhone color="#f73995" fontSize="25px"/>
                        </span>
                        <span className="flex flex-col items-center">                        
                            <span>support@example.com</span>
                            <span className="font-semibold text-[15px]">035 - 793 - 3895</span>
                        </span>                    
                    </div>

                    <div className="flex px-6 border-r items-center">
                        <span className="px-2">
                            <FaUserAlt color="#f73995" fontSize="25px"/>
                        </span>
                        <span className="flex flex-col items-center">                        
                            Profile
                        </span>                    
                    </div>

                    <div className="flex px-6 items-center">
                        <span className="px-2">
                            <IoMdCart color="#f73995" fontSize="30px"/>
                        </span>
                        <span className="flex flex-col items-center">                        
                            <span>Cart: 0 items</span>
                            <span className="font-semibold text-[15px]">$0</span>
                        </span>                    
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Header