// import React, { useEffect, useState } from "react"
// import logo from '../assets/logo.png'
// import icons from "../ultils/icons"
// import {Link} from 'react-router-dom'
// import path from "../ultils/path"
// import { useNavigate } from "react-router-dom"; 
// import { useSelector, useDispatch } from 'react-redux'
// import { current } from "@reduxjs/toolkit"
// import { apiGetUserCart } from "../apis"

// const Header = () => {
//     const {FaPhone, FaTruckFast,IoMdCart,FaUserAlt} = icons
//     const navigate = useNavigate(); // Khởi tạo useNavigate
//     const [cartItems, setCartItems] = useState([]);
//     const [totalPrice, setTotalPrice] = useState(0);
//     // Hàm điều hướng đến trang Profile
//     const handleNavigateProfile = () => {
//         navigate(`/${path.MEMBER}/${path.PERSONAL}`); // Chuyển đến đường dẫn profile
//     };
//      // Hàm điều hướng đến trang Cart
//      const handleNavigateCart = () => {
//         navigate(`/${path.MEMBER}/${path.PERSONAL}`); // Chuyển đến đường dẫn profile
//     };

//     // Gọi API để lấy giỏ hàng
//     const fetchCartData = async () => {
//         const response = await apiGetUserCart();
//         console.log(response)
//         if (response.success) {
//             setCartItems(response.cart.items);
//             const total = response.cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
//             setTotalPrice(total);            
//         }
//     };

//     console.log(cartItems)
//     console.log("========")
//     console.log(totalPrice)

//     useEffect(() => {
//         fetchCartData();
//     }, []);

//     return (
//         <div className="w-full bg-white flex justify-center">
//             <div className="w-main flex justify-between h-[140px] py-[16px] bg-white">
//                 <Link to={`/${path.HOME}`}>
//                     <img  src={logo} alt="logo" className="w-[300px] h-[120px]"/>
//                 </Link>
//                 <div className="flex text-[13px]">
//                     <div className="flex px-6 border-r items-center">
//                         <span className="px-2">
//                             <FaTruckFast color="#f73995" fontSize="30px"/>
//                         </span>
//                         <span className="flex flex-col items-center">                        
//                             <span>Free standard shipping</span>
//                             <span className="font-semibold text-[15px]">on all orders</span>
//                         </span>                    
//                     </div>

//                     <div className="flex px-6 border-r items-center">
//                         <span className="px-2">
//                             <FaPhone color="#f73995" fontSize="25px"/>
//                         </span>
//                         <span className="flex flex-col items-center">                        
//                             <span>support@example.com</span>
//                             <span className="font-semibold text-[15px]">035 - 793 - 3895</span>
//                         </span>                    
//                     </div>

//                     <div onClick={handleNavigateProfile} className="flex px-6 border-r items-center cursor-pointer">
//                         <span className="px-2">
//                             <FaUserAlt color="#f73995" fontSize="25px"/>
//                         </span>
//                         <span className="flex flex-col items-center">                        
//                             Profile
//                         </span>                    
//                     </div>

//                     <div className="flex px-6 items-center cursor-pointer">
//                         <span className="px-2">
//                             <IoMdCart color="#f73995" fontSize="30px"/>
//                         </span>
//                         <span className="flex flex-col items-center">                        
//                             <Link to="/member/my-cart">{`${cartItems?.length || 0} item(s)`}</Link>
//                             <span className="font-semibold text-[15px]">{`${totalPrice} VNĐ`}</span>
//                         </span>                    
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Header


import React, { useEffect } from "react";
import logo from '../assets/logo.png';
import icons from "../ultils/icons";
import { Link } from 'react-router-dom';
import path from "../ultils/path";
import { useNavigate } from "react-router-dom"; 
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/cart/asyncActions'; 
import {formatMoney} from '../ultils/helpers'

const Header = () => {
    const { FaPhone, FaTruckFast, IoMdCart, FaUserAlt } = icons;
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const dispatch = useDispatch();
    const { current } = useSelector(state => state.user)

    // Lấy thông tin giỏ hàng từ Redux store
    const { items: cartItems, totalPrice, loading, error } = useSelector(state => state.cart);

    // Hàm điều hướng đến trang Profile
    const handleNavigateProfile = () => {
        navigate(`/${path.MEMBER}/${path.PERSONAL}`); // Chuyển đến đường dẫn profile
    };

    // Hàm điều hướng đến trang Cart
    const handleNavigateCart = () => {
        navigate(`/${path.MEMBER}/my-cart`); // Chuyển đến đường dẫn cart
    };

    // Gọi action để lấy giỏ hàng khi component được mount
    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    return (
        <div className="w-full bg-white flex justify-center">
            <div className="w-main flex justify-between h-[140px] py-[16px] bg-white">
                <Link to={`/${path.HOME}`}>
                    <img src={logo} alt="logo" className="w-[300px] h-[120px]" />
                </Link>
                <div className="flex text-[13px]">
                    <div className="flex px-6 border-r items-center">
                        <span className="px-2">
                            <FaTruckFast color="#f73995" fontSize="30px" />
                        </span>
                        <span className="flex flex-col items-center">
                            <span>Free standard shipping</span>
                            <span className="font-semibold text-[15px]">on all orders</span>
                        </span>                    
                    </div>

                    <div className="flex px-6 border-r items-center">
                        <span className="px-2">
                            <FaPhone color="#f73995" fontSize="25px" />
                        </span>
                        <span className="flex flex-col items-center">
                            <span>support@example.com</span>
                            <span className="font-semibold text-[15px]">035 - 793 - 3895</span>
                        </span>                    
                    </div>

                   {current && 
                    <div className="flex justify-center items-center">
                        <div onClick={handleNavigateProfile} className="flex px-6 border-r h-[108px] items-center cursor-pointer">
                            <span className="px-2">
                                <FaUserAlt color="#f73995" fontSize="25px" />
                            </span>
                            <span className="flex flex-col items-center">                        
                                Profile
                            </span>                    
                        </div>

                    <div onClick={handleNavigateCart} className="flex px-6 items-center cursor-pointer h-[108px]">
                        <span className="px-2">
                            <IoMdCart color="#f73995" fontSize="30px" />
                        </span>
                        <span className="flex flex-col items-center">                        
                            <Link to="/member/my-cart">{`${cartItems?.length || 0} item(s)`}</Link>
                            <span className="font-semibold text-[15px]">{`${formatMoney(totalPrice)} VNĐ`}</span>
                        </span>                    
                    </div>
                    </div>
                   }
                </div>
            </div>
        </div>
    );
};

export default Header;