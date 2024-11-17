import React from "react"
import { formatMoney } from '../ultils/helpers'
import label from '../assets/label.webp'
import { renderStarFromNumber } from "../ultils/helpers";
import { Link } from "react-router-dom";
import path from '../ultils/path'

const ProductCard = ({productData}) => {
    return (
        <Link className="w-[46%] h-[150px] flex justify-start border no-underline bg-[#fff]  mb-6 rounded-sm shadow transition-transform duration-100 ease-in will-change-transform
                hover:translate-y-[-1px] hover:shadow-[0_1px_20px_0_rgba(0,0,0,0.05)]"
                to={`/${path.DETAIL_PRODUCT}/${productData?._id}/${productData.name}`}
        >
            <div className="relative">
                <img 
                    src={productData?.image || 'https://niteair.co.uk/wp-content/uploads/2023/08/default-product-image.png'} 
                    alt={'Product Image'} 
                    className="w-[100px] h-[130px] mt-1 object-contain" 
                />
                {/* <img src={label} alt="" className="absolute top-0 left-[-28px] w-[100px] h-[36px] object-cover"/>
                <span className="font-bold top-0 left-[3px] absolute text-white">HOT</span> */}
            </div>            
            <div>
                <div class="text-[1rem] font-normal mt-1 mb-1 mx-2 line-clamp-1">
                    {productData?.name}
                </div>
                <span className="flex ml-2  mb-1 text-[0.8rem]">
                    {productData?.averageRating > 0 
                        ? renderStarFromNumber(productData.averageRating) 
                        : ''}
                </span>
                <span className="ml-2 text-red-600 text-base fw-400">{`${formatMoney(productData?.price)} VNĐ`}</span>
            </div>
        </Link>
    )
}

export default ProductCard