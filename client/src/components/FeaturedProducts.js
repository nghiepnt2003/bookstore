import React, {useEffect, useState} from "react"
import {ProductCard} from './'
import {apiGetProducts} from '../apis'
import book2 from '../assets/book2.jpg'

const FeaturedProducts = () => {

    const [featured, setFeatured] = useState(null)
    const fetchProducts = async () => {
        const response = await apiGetProducts({sort: '-averageRating', limit: 4}) // thay lại bằng getAllProduct với số lượng sao lớn nhất
        if(response.success)
        {
            setFeatured(response.products)
        }
    }

    useEffect(() =>{
        fetchProducts()
    },[])
    return (
        <div className="w-main flex justify-between mt-2">
           <div className="flex flex-wrap justify-between">
                {
                    featured?.map(el => (
                        <ProductCard
                            key={el.id}
                            productData={el}
                        />
                    ))
                }
           </div>
            <img src={book2} alt="Image" className="w-[36%] h-[324px] ml-12"></img>
        </div>
    )
}

export default FeaturedProducts