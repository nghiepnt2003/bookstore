import React, {useEffect} from 'react'
import {Sidebar, Banner, BestSeller, FeaturedProducts, NewProducts} from '../../components'
import chuProductBestsellers from "../../assets/chuProductBestsellers.png"
import tipRead from '../../assets/tipRead.png'
import chuFeaturedProducts from '../../assets/chuFeaturedProducts.png'
import chuNewProducts from '../../assets/chuNewProducts.png'
import DanhNgon from '../../assets/DanhNgon.png'
import { useSelector } from "react-redux"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Home = () => {
    const {categories } = useSelector(state => state.app)
    const {isLoggedIn, current } = useSelector(state => state.user)
    return (
        <div className="pt-3">
            <div className="w-main flex">
                <div className="flex-col gap-5 w-[25%] flex-auto">
                    <Sidebar />
                    {/* <span>Deal daily</span> */}
                </div>
                <div className="flex-col gap-5 pl-5 w-[75%] flex-auto">
                    <Banner />
                    {/* <span>Best seller</span> */}
                </div>
            </div>
            <div className="w-main mt-4">
                <img src={chuProductBestsellers} alt="Bestseller" className="h-11"></img>
                <BestSeller />
            </div>
            <img src={tipRead} alt="Tip Read" className="w-main"></img>
            <div className="w-main mt-4">
                <img src={chuNewProducts} alt="New Products" className="h-11"></img>
                <NewProducts />
            </div>
            <img src={DanhNgon} alt="Danh Ngon" className="w-main mt-8"></img>
            <div className="w-main mt-4">
                <img src={chuFeaturedProducts} alt="Featured Products" className="h-11"></img>
                <FeaturedProducts />
            </div>
            {/* <ToastContainer /> */}
        </div>
    )
}

export default Home