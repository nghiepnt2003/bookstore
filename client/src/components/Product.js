// import React, { memo, useState } from 'react';
// import { formatMoney } from '../ultils/helpers';
// import label from '../assets/label.webp';
// import { renderStarFromNumber } from '../ultils/helpers';
// import { Link } from 'react-router-dom';
// import path from '../ultils/path';
// import { Statistic } from 'antd';

// const { Countdown } = Statistic;

// const Product = ({ productData }) => {
//     return (
//         <Link
//             className="h-[415px] border no-underline block bg-[#fff] mt-2 ml-4 mr-4 mb-5 rounded-sm shadow transition-transform duration-100 ease-in will-change-transform hover:translate-y-[-1px] hover:shadow-[0_1px_20px_0_rgba(0,0,0,0.05)]"
//             to={`/${path.DETAIL_PRODUCT}/${productData?._id}/${productData.name}`}
//         >
//             <div className="relative h-[300px]">
//                 <img
//                     src={productData?.image || 'https://niteair.co.uk/wp-content/uploads/2023/08/default-product-image.png'}
//                     alt={'Product Image'}
//                     className="w-full h-[290px] object-contain mt-2"
//                 />
//                 {productData?.discount && (
//                     <div className="absolute top-0 left-0 bg-red-600 text-white p-1 text-sm">
//                         Flash Sale
//                     </div>
//                 )}
//             </div>
//             <div className="text-[1rem] font-normal leading-[1.8rem] mt-1 mx-2 line-clamp-1">
//                 {productData?.name}
//             </div>
//             <span className="flex ml-2 text-[0.8rem]">
//                 {productData?.averageRating > 0
//                     ? renderStarFromNumber(productData.averageRating)
//                     : ''}
//             </span>
//             <div className="flex ml-2">
//                 {productData?.discount ? (
//                     <>
//                         <span className="text-sm text-gray-700 line-through">{`${formatMoney(productData?.price)} VNĐ`}</span>
//                         <span className="text-red-600 text-base font-semibold">{`${formatMoney(productData?.finalPrice)} VNĐ`}</span>
//                     </>
//                 ) : (
//                     <span className="text-red-600 text-base font-normal">{`${formatMoney(productData?.price)} VNĐ`}</span>
//                  )}
//             </div>
//             {productData?.discount && (
//                 <div className="flex items-center text-white bg-red-600 mt-1 p-1">
//                     <span className="font-semibold">Flash Sale Ends In: </span>
//                     <Countdown valueStyle={{ color: 'white', fontSize: 16 }} value={Date.now() + productData?.timeRemaining} />
//                 </div>
//             )}
//         </Link>
//     );
// };

// export default memo(Product);

import React, { memo } from "react";
import { formatMoney } from "../ultils/helpers";
import { renderStarFromNumber } from "../ultils/helpers";
import { Link } from "react-router-dom";
import path from "../ultils/path";
import { Statistic } from "antd";
import { BsFillSuitHeartFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { apiUpdateWishlist, apiRemoveProductInWishList } from "../apis"; // Import API xóa
import { getCurrent } from "../store/user/asyncActions";

const { Countdown } = Statistic;

const Product = ({ productData, onWishlistChange }) => {
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.user);
  const isInWishList = current?.wishList?.some(
    (item) => item === productData?._id
  );

  const handleClickOptions = async (e) => {
    e.stopPropagation(); // Ngăn không cho chuyển hướng liên kết
    let response;

    if (isInWishList) {
      // Nếu sản phẩm đã có trong danh sách yêu thích, gọi API để xóa
      response = await apiRemoveProductInWishList(productData._id);
    } else {
      // Nếu không, gọi API để thêm sản phẩm vào danh sách yêu thích
      response = await apiUpdateWishlist(productData._id);
    }
    if (response.success) {
      dispatch(getCurrent());
      toast.success(response.message);
      onWishlistChange();
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="h-[415px] border no-underline block bg-[#fff] mt-2 ml-4 mr-4 mb-5 rounded-sm shadow transition-transform duration-100 ease-in will-change-transform hover:translate-y-[-1px] hover:shadow-[0_1px_20px_0_rgba(0,0,0,0.05)]">
      <Link
        to={`/${path.DETAIL_PRODUCT}/${productData?._id}/${productData.name}`}
      >
        <div className="relative h-[300px]">
          <img
            src={
              productData?.image ||
              "https://niteair.co.uk/wp-content/uploads/2023/08/default-product-image.png"
            }
            alt={"Product Image"}
            className="w-full h-[290px] object-contain mt-2"
          />
          {productData?.discount && (
            <div className="absolute top-0 left-0 bg-red-600 text-white p-1 text-sm">
              Flash Sale
            </div>
          )}
        </div>
      </Link>
      <div className="relative">
        <div
          onClick={handleClickOptions}
          className="absolute top-4 right-2 cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md"
          title="Thêm hoặc xóa khỏi danh sách yêu thích"
        >
          <BsFillSuitHeartFill color={isInWishList ? "red" : "gray"} />
        </div>
        <div className="text-[1rem] font-normal leading-[1.8rem] mt-1 mx-2 line-clamp-1">
          {productData?.name}
        </div>
        <span className="flex ml-2 text-[0.8rem]">
          {renderStarFromNumber(productData?.averageRating)}
          {/* {productData?.averageRating > 0 
                        ? renderStarFromNumber(productData.averageRating) 
                        : <span>Chưa có đánh giá</span>} */}
        </span>
        <div className="flex ml-2">
          {productData?.discount ? (
            <>
              <span className="text-sm text-gray-700 line-through">{`${formatMoney(
                productData?.price
              )} VNĐ`}</span>
              <span className="text-red-600 text-base font-semibold">{`${formatMoney(
                productData?.finalPrice
              )} VNĐ`}</span>
            </>
          ) : (
            <span className="text-red-600 text-base font-normal">{`${formatMoney(
              productData?.price
            )} VNĐ`}</span>
          )}
        </div>
        {productData?.discount && (
          <div className="flex items-center text-white bg-red-600 mt-1 p-1">
            <span className="font-semibold">Flash Sale Kết Thúc Trong: </span>
            <Countdown
              valueStyle={{ color: "white", fontSize: 16 }}
              value={Date.now() + productData?.timeRemaining}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Product);
