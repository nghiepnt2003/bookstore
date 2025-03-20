import React, { useEffect, useState } from "react";
import { apiGetProducts , apiGetProductsWithDiscount} from "../apis";
import Product from './Product';
import Slider from "react-slick";

const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
};

const FlashsaleProduct = () => {
    const [flashsaleProducts, setFlashSaleProducts] = useState([]);

    const fetchFlashsaleProducts = async () => {
        const response = await apiGetProductsWithDiscount(); // Lấy sản phẩm với số lượng đã bán giảm dần
        if (response.success) {
            setFlashSaleProducts(response.products);
        }
    };

    useEffect(() => {
        fetchFlashsaleProducts();
    }, []);

    return (
        <div className="mt-5">
            {/* <h2 className="text-lg font-bold">Hàng Flash Sale</h2> */}
            {flashsaleProducts.length > 0 ? (
                <Slider {...settings}>
                    {flashsaleProducts.map(el => (
                        <Product 
                            key={el.id}
                            productData={el}
                        />
                    ))}
                </Slider>
            ) : (
                <div className='flex w-full justify-center items-center min-h-[200px]'>
                    Hiện tại không có sản phẩm nào
                </div>
            )}
        </div>
    );
};

export default FlashsaleProduct;