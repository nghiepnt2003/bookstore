import React, {useEffect, useState} from "react"
import {ProductCard} from './'
import {apiGetProducts} from '../apis'
import book1 from '../assets/book1.jpg'

const NewProducts = () => {

    const [newProduct, setNewProduct] = useState(null)
    const fetchProducts = async () => {
        const response = await apiGetProducts({sort: '-createdAt', limit: 4}) // thay lại bằng getAllProduct với sản phẩm mới  nhất
        if(response.success)
        {
            setNewProduct(response.products)
        }
    }

    useEffect(() =>{
        fetchProducts()
    },[])
    return (
        <div className="w-main flex justify-between mt-2">
            <img src={book1} alt="Image" className="w-[36%] h-[324px] mr-12"></img>
           <div className="flex flex-wrap justify-between">
                {
                    newProduct?.map(el => (
                        <ProductCard
                            key={el.id}
                            productData={el}
                        />
                    ))
                }
           </div>
        </div>
    )
}

export default NewProducts