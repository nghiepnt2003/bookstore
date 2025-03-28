import React, {useEffect, useState} from "react"
import { apiGetProducts } from "../apis/product"
import Product from './Product'
import Slider from "react-slick";

const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1
  };

const BestSeller = () => {
    const [bestSellers, setBestSellers] = useState(null)
    const fetchProducts = async () => {
        const response = await apiGetProducts({sort: '-soldCount'}) 
        if(response.success)
        {
            setBestSellers(response.products)
        }
    }

    useEffect(() =>{
        fetchProducts()
    },[])

    return (
       <div className="mt-5">
            <Slider {...settings}>
                {
                    bestSellers?.map(el => (
                        <Product 
                            key={el.id}
                            productData={el}
                        />
                    ))
                }
            </Slider>
       </div>
    )
}

export default BestSeller