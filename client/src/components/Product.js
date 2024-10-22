import React from "react";
import { formatMoney } from '../ultils/helpers'
import label from '../assets/label.webp'
import { renderStarFromNumber } from "../ultils/helpers";
import { Link } from 'react-router-dom'
import path from '../ultils/path'

const Product = ({ productData }) => {
    return (
        <Link className="border no-underline block bg-[#fff] mt-2 ml-4 mr-4 mb-5 rounded-sm shadow transition-transform duration-100 ease-in will-change-transform
                        hover:translate-y-[-1px] hover:shadow-[0_1px_20px_0_rgba(0,0,0,0.05)]"
            to={`/${path.DETAIL_PRODUCT}/${productData?._id}/${productData.name}`}
        >
            <div className="relative h-[300px]">
                <img 
                    src={productData?.image || 'https://niteair.co.uk/wp-content/uploads/2023/08/default-product-image.png'} 
                    alt={'Product Image'} 
                    className="w-full h-[290px] object-contain mt-2" 
                />
                {/* <img src={label} alt="" className="absolute top-0 left-[-28px] w-[100px] h-[36px] object-cover"/> */}
                {/* <span className="font-bold top-0 left-[3px] absolute text-white">HOT</span> */}
            </div>            
            <div class="text-[1rem] font-normal leading-[1.8rem] mt-1 mx-2 line-clamp-1">
                {productData?.name}
            </div>
            <span className="flex ml-2 text-[0.8rem]">{renderStarFromNumber(productData?.averageRating)}</span>
            <span className="ml-2 text-red-600 text-base fw-400">{`${formatMoney(productData?.price)} VNĐ`}</span>
        </Link>
    );
}

export default Product;

