import React, { useCallback, useEffect, useState} from "react"
import { useParams } from "react-router-dom"
import { Breadcrumb, Button, ProductExtraInfoItem, SelectQuantity, Product } from "../../components"
import { apiGetCategory, apiGetProduct, apiGetProducts, apiGetPublisher} from "../../apis"
import { formatMoney, formatPrice, renderStarFromNumber } from "../../ultils/helpers"
import {productExtraInfomation} from '../../ultils/contants'
import Slider from "react-slick";

const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1
  };

const DetailProduct = () => {

    const {id, name} = useParams()
    const [productData, setProductData] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [relatedProducts, setRelatedProducts] = useState(null)
    const [category, setCategory] = useState([])
    const [publisher, setPublisher] = useState(null)
    const fetchProductData = async () => {
        const response = await apiGetProduct(id);
        if(response.success) 
        {
            setProductData(response.product);
        }  
    } 
    const fetchData = async () => {
        const categoriesData = productData?.categories;
    
        if (Array.isArray(categoriesData)) {
            // Tạo mảng các Promise từ apiGetCategory
            const categoryPromises = categoriesData.map(cateId => apiGetCategory(cateId));
    
            // Chờ tất cả các Promise hoàn thành
            const responses = await Promise.all(categoryPromises);
    
            // Lọc ra các category thành công
            const successfulCategories = responses
                .filter(response => response.success)
                .map(response => response.category); // Hoặc thuộc tính bạn muốn
    
            // Cập nhật trạng thái một lần
            setCategory(successfulCategories);
        }

        const rs = await apiGetPublisher(productData?.publisher);
        if(rs.success) 
        {
            setPublisher(rs.publisher);
        }
    };
    console.log("CATE " + JSON.stringify(category));
    console.log("PUB" + JSON.stringify(publisher));
    // const fetchProducts = async() => {
    //     // Tạo mảng các Promise từ các yêu cầu API
    //     const productPromises = category?.map(async (category) => {
    //         const response = await apiGetProducts({ categories: category._id }); // Gọi API với ID danh mục
    //         return response; // Trả về phản hồi
    //     });

    //     // Chờ tất cả các Promise hoàn thành
    //     const responses = await Promise.all(productPromises);
    //     console.log(responses)

    //     // Lọc các sản phẩm thành công
    //     // const successfulProducts = responses
    //     //     .filter(response => response.success) // Lọc ra các phản hồi thành công
    //     //     .flatMap(response => response.product); // Kết hợp tất cả sản phẩm thành một mảng

    //     // Lọc và kết hợp các sản phẩm thành công
    //     const successfulProducts = responses.reduce((accumulator, response) => {
    //         console.log(response); 
    //         if (response.success && Array.isArray(response.product)) {
    //             return accumulator.concat(response.product); // Kết hợp các sản phẩm vào accumulator
    //         }
    //         return accumulator; // Trả về accumulator nếu không thành công
    //     }, []); // Bắt đầu với một mảng rỗng

    //     // Cập nhật trạng thái với các sản phẩm liên quan
    //     console.log("PRODUCTS: " + JSON.stringify(successfulProducts))
    //     setRelatedProducts(successfulProducts);
    // }
    const fetchProducts = () => {
        category.map(async cate => {
            const response = await apiGetProducts({categories: cate._id})
            console.log(response)
        })
    }
    console.log("PRODUCTS: " + JSON.stringify(relatedProducts))
    useEffect(() => {
        if(id)
            fetchProductData()
    },[id])
    // useEffect(() => {
    //     if(productData)
    //         fetchData()
    // },[productData])
    // useEffect(() => {
    //     if(category)
    //         fetchProducts()
    // },[category])
    const handleQuantity = useCallback((number) => {
        if(!Number(number) || Number(number)<1) {
            return
        }
        else {
            setQuantity(number)
        }
    },[quantity])

    const handleChangeQuantity = useCallback((flag) => {
        if(flag === 'minus' && quantity ===1) return;
        if(flag === 'minus') setQuantity(prev => +prev - 1 )
        if(flag === 'plus') setQuantity(prev => +prev + 1 )
    }, [quantity])
    return (
        <div className="mt-4 mb-10">
           <div className="h-[81px] flex items-center bg-[#FFF0F5]">
                <Breadcrumb name={name} />
           </div>
           <div className="mt-4 flex">
                <div className="flex-4">
                    <div className="bg-white h-[530px] w-[450px] flex items-center justify-center">
                        <img src={productData?.image} alt="Product" 
                            className="object-cover"
                        />
                    </div>
                </div>
                <div className="flex-4">
                    <h2 className="font-semibold text-[25px] mb-4">{name}</h2>
                    <span>{`${formatMoney(formatPrice(productData?.price))} VNĐ`}</span>
                    <div className="flex items-center gap-1">
                        {renderStarFromNumber(productData?.averageRating)?.map((el, index) =>(
                            <span key={index}>{el}</span>
                        ))}
                        <span className="text-sm italic text-main">{`Đã bán: ${productData?.soldCount}`}</span>
                    </div>
                    <div>{`Số trang: ${productData?.pageNumber}`}</div> 
                    <div>
                        <span>Thể loại:</span>
                        {category?.map(el => (
                            <span key={el.id}>{` ${el.name}, `}</span> 
                        ))}
                    </div>
                    <div>{`NXB: ${publisher?.name}`}</div>
                    <div>{`Mô tả: ${productData?.description}`}</div>  
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">Quantity</span>
                            <SelectQuantity 
                                quantity={quantity} 
                                handleQuantity={handleQuantity} 
                                handleChangeQuantity={handleChangeQuantity}
                            />
                        </div>
                        <Button
                            name='Add to Cart'
                            fw
                        />
                    </div>                  
                </div>
                <div className="flex-2">
                    {productExtraInfomation.map(el => (
                        <ProductExtraInfoItem 
                            key={el.id}
                            title={el.title}
                            icon={el.icon}
                            sub={el.sub}
                        />
                    ))}
                </div>
           </div>
           <div className="m-auto mt-8">
                <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">OTHER CUSTOMER ALSO LIKED</h3>
                {/* <div>
                    <Slider {...settings}>
                        {
                            relatedProducts?.map(el => (
                                <Product 
                                    key={el._id}
                                    productData={el}
                                />
                            ))
                        }
                    </Slider>
                </div> */}
           </div>
        </div>
    )
}

export default DetailProduct