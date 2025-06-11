import React, { useState } from 'react';
import { Sidebar, Banner, BestSeller, FeaturedProducts, NewProducts, FlashsaleProduct } from '../../components';
import chuProductBestsellers from "../../assets/chuProductBestsellers.png";
import tipRead from '../../assets/tipRead.png';
import chuFeaturedProducts from '../../assets/chuFeaturedProducts.png';
import chuNewProducts from '../../assets/chuNewProducts.png';
import DanhNgon from '../../assets/DanhNgon.png';
import { useSelector } from "react-redux";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
    const { categories } = useSelector(state => state.app);
    const { isLoggedIn, current } = useSelector(state => state.user);
    const [activeTab, setActiveTab] = useState('bestsellers'); // Trạng thái cho tab hoạt động

    return (
        <div className="pt-3">
            <div className="w-main flex">
                <div className="flex-col gap-5 w-[25%] flex-auto">
                    <Sidebar />
                </div>
                <div className="flex-col gap-5 pl-5 w-[75%] flex-auto">
                    <Banner />
                </div>
            </div>
            <div className="w-main mt-6">
                <div className="flex space-x-4 relative">
                    <button 
                        className={`tab-button ${activeTab === 'bestsellers' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('bestsellers')}
                    >
                        <span className={`text-xl text-center my-5 ml-4 border-r-2 border-gray-400 pr-5 ${activeTab === 'bestsellers' ? 'text-main font-bold' : 'text-gray-800'}`}>
                            Product BestSellers
                        </span>
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'flashsale' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('flashsale')}
                    >
                        <span className={`text-xl text-center my-5 ${activeTab === 'flashsale' ? 'text-main font-bold' : 'text-gray-800'}`}>
                            Flashsale
                        </span>
                    </button>
                    <span className='absolute h-[3px] w-main bg-main top-10 left-0'></span>
                </div>
                {/* <img src={chuProductBestsellers} alt="Bán chạy" className="h-11" /> */}
                {activeTab === 'bestsellers' && <BestSeller />}
                {activeTab === 'flashsale' && <FlashsaleProduct />}
            </div>
            <img src={tipRead} alt="Mẹo đọc" className="w-main" />
            <div className="w-main mt-4">
                <img src={chuNewProducts} alt="Sản phẩm mới" className="h-11" />
                <NewProducts />
            </div>
            <img src={DanhNgon} alt="Danh Ngôn" className="w-main mt-8" />
            <div className="w-main mt-4">
                <img src={chuFeaturedProducts} alt="Sản phẩm nổi bật" className="h-11" />
                <FeaturedProducts />
            </div>
            {/* <ToastContainer /> */}
        </div>
    );
};

export default Home;


// import React, { useState } from 'react';
// import { Sidebar, Banner, BestSeller, FeaturedProducts, NewProducts, FlashsaleProduct } from '../../components';
// import chuProductBestsellers from "../../assets/chuProductBestsellers.png";
// import chuFlashsale from "../../assets/chuFlashsale.png"; // Thêm hình ảnh cho giảm giá chớp nhoáng
// import tipRead from '../../assets/tipRead.png';
// import chuFeaturedProducts from '../../assets/chuFeaturedProducts.png';
// import chuNewProducts from '../../assets/chuNewProducts.png';
// import DanhNgon from '../../assets/DanhNgon.png';
// import { useSelector } from "react-redux";
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const Home = () => {
//     const { categories } = useSelector(state => state.app);
//     const { isLoggedIn, current } = useSelector(state => state.user);
//     const [activeTab, setActiveTab] = useState('bestsellers'); // Trạng thái cho tab hoạt động

//     return (
//         <div className="pt-3">
//             <div className="w-main flex">
//                 <div className="flex-col gap-5 w-[25%] flex-auto">
//                     <Sidebar />
//                 </div>
//                 <div className="flex-col gap-5 pl-5 w-[75%] flex-auto">
//                     <Banner />
//                 </div>
//             </div>
//             <div className="w-main mt-4">
//                 <div className="flex space-x-4 border-b-4 border-[#fc469e] pb-1">
//                     <button 
//                         className={`tab-button ${activeTab === 'bestsellers' ? 'active' : ''}`} 
//                         onClick={() => setActiveTab('bestsellers')}
//                     >
//                         <img src={chuProductBestsellers} alt="Bán chạy" className="h-11 border-r-4 border-[#fc469e]" />
//                     </button>
//                     <button 
//                         className={`tab-button ${activeTab === 'flashsale' ? 'active' : ''}`} 
//                         onClick={() => setActiveTab('flashsale')}
//                     >
//                         <img src={chuFlashsale} alt="Giảm giá chớp nhoáng" className="h-11" />
//                     </button>
//                 </div>
//                 {activeTab === 'bestsellers' && <BestSeller />}
//                 {activeTab === 'flashsale' && <FlashsaleProduct />}
//             </div>
//             <img src={tipRead} alt="Mẹo đọc" className="w-main" />
//             <div className="w-main mt-4">
//                 <img src={chuNewProducts} alt="Sản phẩm mới" className="h-11" />
//                 <NewProducts />
//             </div>
//             <img src={DanhNgon} alt="Danh Ngôn" className="w-main mt-8" />
//             <div className="w-main mt-4">
//                 <img src={chuFeaturedProducts} alt="Sản phẩm nổi bật" className="h-11" />
//                 <FeaturedProducts />
//             </div>
//             <ToastContainer />
//         </div>
//     );
// };

// export default Home;