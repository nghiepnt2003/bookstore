// import React, { useCallback, useEffect, useState} from "react"
// import { useParams } from "react-router-dom"
// import { Breadcrumb, Button, ProductExtraInfoItem, SelectQuantity, Product } from "../../components"
// import { apiGetCategory, apiGetProduct, apiGetProducts, apiGetPublisher} from "../../apis"
// import { formatMoney, formatPrice, renderStarFromNumber } from "../../ultils/helpers"
// import {productExtraInfomation} from '../../ultils/contants'
// import Slider from "react-slick";

// const settings = {
//     dots: false,
//     infinite: false,
//     speed: 500,
//     slidesToShow: 4,
//     slidesToScroll: 1
//   };

// const DetailProduct = () => {

//     const {id, name} = useParams()
//     const [productData, setProductData] = useState(null)
//     const [quantity, setQuantity] = useState(1)
//     const [relatedProducts, setRelatedProducts] = useState(null)
//     const fetchProductData = async () => {
//         const response = await apiGetProduct(id);
//         if(response.success) 
//         {
//             setProductData(response.product);
//         }  
//     } 
//     console.log(productData)
//     const fetchProducts = async () => {
//         const categoryIds = productData?.categories.map(category => category._id);

//         const productPromises = categoryIds.map(cateId => 
//             apiGetProducts({ categories: cateId })
//         );

//         // Chờ tất cả các promise hoàn thành
//         const responses = await Promise.all(productPromises);

//         // Tạo một mảng để lưu trữ tất cả các sản phẩm
//         const allProducts = [];

//         responses.forEach(response => {
//             if (response.success) {
//                 console.log(response.products);
                
//                 response.products.forEach(product => {
//                     // Kiểm tra xem sản phẩm đã tồn tại trong allProducts chưa
//                     const exists = allProducts.some(existingProduct => existingProduct._id === product._id);
//                     if (!exists) {
//                         allProducts.push(product); // Thêm sản phẩm nếu chưa tồn tại
//                     }
//                 });
//             }
//         });

//         setRelatedProducts(allProducts); // Gán tất cả sản phẩm vào state hoặc biến mong muốn
//     }
    
//     useEffect(() => {
//         if(id)
//         {
//             fetchProductData()
//         }
//     },[id])
//     useEffect(() => {
//         if(productData)
//             fetchProducts()
//     },[productData])
//     const handleQuantity = useCallback((number) => {
//         if(!Number(number) || Number(number)<1) {
//             return
//         }
//         else {
//             setQuantity(number)
//         }
//     },[quantity])

//     const handleChangeQuantity = useCallback((flag) => {
//         if(flag === 'minus' && quantity ===1) return;
//         if(flag === 'minus') setQuantity(prev => +prev - 1 )
//         if(flag === 'plus') setQuantity(prev => +prev + 1 )
//     }, [quantity])
//     return (
//         <div className="mt-4 mb-10">
//            <div className="h-[81px] flex items-center bg-[#FFF0F5]">
//                 <Breadcrumb name={name} />
//            </div>
//            <div className="mt-4 flex">
//                 <div className="flex-4">
//                     <div className="bg-white h-[530px] w-[450px] flex items-center justify-center">
//                         <img src={productData?.image} alt="Product" 
//                             className="object-cover"
//                         />
//                     </div>
//                 </div>
//                 <div className="flex-4">
//                     <h2 className="font-semibold text-[25px] mb-4">{name}</h2>
//                     <span>{`${formatMoney(formatPrice(productData?.price))} VNĐ`}</span>
//                     <div className="flex items-center gap-1">
//                         {renderStarFromNumber(productData?.averageRating)?.map((el, index) =>(
//                             <span key={index}>{el}</span>
//                         ))}
//                         <span className="text-sm italic text-main">{`Đã bán: ${productData?.soldCount}`}</span>
//                     </div>
//                     <div>{`Số trang: ${productData?.pageNumber}`}</div> 
//                     <div>
//                         <span>Thể loại:</span>
//                         {productData?.categories.map(el => (
//                             <span key={el.id}>{` ${el.name}, `}</span> 
//                         ))}
//                     </div>
//                     <div>{`Tác giả: ${productData?.author.name}`}</div>
//                     <div>{`NXB: ${productData?.publisher.name}`}</div>
//                     <div>{`Mô tả: ${productData?.description}`}</div>  
//                     <div className="flex flex-col gap-8">
//                         <div className="flex items-center gap-4">
//                             <span className="font-semibold">Quantity</span>
//                             <SelectQuantity 
//                                 quantity={quantity} 
//                                 handleQuantity={handleQuantity} 
//                                 handleChangeQuantity={handleChangeQuantity}
//                             />
//                         </div>
//                         <Button
//                             name='Add to Cart'
//                             fw
//                         />
//                     </div>                  
//                 </div>
//                 <div className="flex-2">
//                     {productExtraInfomation.map(el => (
//                         <ProductExtraInfoItem 
//                             key={el.id}
//                             title={el.title}
//                             icon={el.icon}
//                             sub={el.sub}
//                         />
//                     ))}
//                 </div>
//            </div>
//            <div className="m-auto mt-8">
//                 <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">OTHER CUSTOMER ALSO LIKED</h3>
//                 <div>
//                     <Slider {...settings}>
//                         {
//                             relatedProducts?.map(el => (
//                                 <Product 
//                                     key={el._id}
//                                     productData={el}
//                                 />
//                             ))
//                         }
//                     </Slider>
//                 </div>
//            </div>
//         </div>
//     )
// }

// export default DetailProduct

import React, { memo, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, Button, ProductExtraInfoItem, SelectQuantity, Product, Comment, VoteBar } from "../../components";
import { apiGetProduct, apiGetProducts } from "../../apis";
import { formatMoney, formatPrice, renderStarFromNumber } from "../../ultils/helpers";
import { productExtraInfomation } from '../../ultils/contants';
import Slider from "react-slick";
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import { showModal } from '../../store/app/appSlice'
import path from '../../ultils/path'

const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1
};

const DetailProduct = () => {
    const { id, name } = useParams();
    const [productData, setProductData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState(null);
    const { current } = useSelector(state => state.user)

    const fetchProductData = async () => {
        const response = await apiGetProduct(id);
        if (response.success) {
            setProductData(response.product);
        }
    };

    const fetchProducts = async () => {
        const categoryIds = productData?.categories.map(category => category._id);
        const productPromises = categoryIds.map(cateId => apiGetProducts({ categories: cateId }));
        const responses = await Promise.all(productPromises);
        const allProducts = [];

        responses.forEach(response => {
            if (response.success) {
                response.products.forEach(product => {
                    const exists = allProducts.some(existingProduct => existingProduct._id === product._id);
                    if (!exists) {
                        allProducts.push(product);
                    }
                });
            }
        });

        setRelatedProducts(allProducts);
    };

    useEffect(() => {
        if (id) {
            fetchProductData();
        }
    }, [id]);

    useEffect(() => {
        if (productData) {
            fetchProducts();
        }
    }, [productData]);

    const handleQuantity = useCallback((number) => {
        if (!Number(number) || Number(number) < 1) {
            return;
        }
        setQuantity(number);
    }, [quantity]);

    const handleChangeQuantity = useCallback((flag) => {
        if (flag === 'minus' && quantity === 1) return;
        if (flag === 'minus') setQuantity(prev => +prev - 1);
        if (flag === 'plus') setQuantity(prev => +prev + 1);
    }, [quantity]);

    // const handleVoteNow = () => {
    //     if (!current) return Swal.fire({
    //         title: 'Almost...',
    //         text: ' Please login first to vote',
    //         icon: 'info',
    //         cancelButtonText: 'Not now!',
    //         showCancelButton: true,
    //         confirmButtonText: 'Go login page!'
    //     }).then(async (rs) => {
    //         if (rs.isConfirmed) navigate({
    //             pathname: `/${path.LOGIN}`,
    //             search: createSearchParams({ redirect: location.pathname }).toString()
    //         })
    //     })
    //     else {
    //         dispatch(showModal({
    //             isShowModal: true,
    //             modalChildren: <VoteOption
    //                 productName={product?.productName}
    //                 handleSubmitVoteOption={handleSubmitVoteOption}
    //             />
    //         }))
    //     }
    // }

    return (
        <div className="mt-4 mb-10">
            <div className="h-[81px] flex items-center bg-[#FFF0F5]">
                <Breadcrumb name={name} />
            </div>
            <div className="mt-4 flex">
                <div className="flex-4">
                    <div className="bg-white h-[530px] w-[450px] flex items-center justify-center">
                        <img src={productData?.image} alt="Product" className="object-cover" />
                    </div>
                </div>
                <div className="flex-4">
                    <h2 className="font-semibold text-[25px] mb-4">{name}</h2>
                    <span>{`${formatMoney(formatPrice(productData?.price))} VNĐ`}</span>
                    <div className="flex items-center gap-1">
                        {renderStarFromNumber(productData?.averageRating)?.map((el, index) => (
                            <span key={index}>{el}</span>
                        ))}
                        <span className="text-sm italic text-main">{`Đã bán: ${productData?.soldCount}`}</span>
                    </div>
                    <div>{`Số trang: ${productData?.pageNumber}`}</div>
                    <div>
                        <span>Thể loại:</span>
                        {productData?.categories.map(el => (
                            <span key={el.id}>{` ${el.name}, `}</span>
                        ))}
                    </div>
                    <div>{`Tác giả: ${productData?.author.name}`}</div>
                    <div>{`NXB: ${productData?.publisher.name}`}</div>
                    <div>{`Mô tả: ${productData?.description}`}</div>
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">Số lượng</span>
                            <SelectQuantity 
                                quantity={quantity}
                                handleQuantity={handleQuantity}
                                handleChangeQuantity={handleChangeQuantity}
                            />
                        </div>
                        <Button name='Thêm vào giỏ hàng' fw />
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
            <div className='flex p-4 flex-col'>
                <div className='flex'>
                    <div className='flex-4 border flex-col flex items-center justify-center border-red-500'>
                        <span className='font-semibold text-3xl'>{`${productData?.averageRating}/5`}</span>
                        <span className='flex items-center gap-1'>{renderStarFromNumber(productData?.averageRating)?.map((el, index) => (
                            <span key={index}>{el}</span>
                        ))}</span>
                        <span className='text-sm'>{`${productData?.ratings?.length} Người đánh giá`}</span>
                    </div>
                    <div className='flex-6 border gap-5 flex flex-col p-4 items-center'>
                        {Array.from(Array(5).keys()).reverse().map(el => (
                            <VoteBar
                                key={el}
                                number={el + 1}
                                ratingTotal={productData?.totalRatings}
                                ratingCount={productData?.ratings?.filter(i => i.star === el + 1)?.length}
                            />
                        ))}
                    </div>
                </div>
                {/* <div className='p-4 flex flex-col gap-2 items-center justify-center text-sm'>
                    <span>Bạn có muốn đánh giá sản phẩm này không?</span>
                    <Button name='Đánh giá ngay!' handleOnClick={handleVoteNow}>Đánh giá ngay!</Button>
                </div> */}
                <div className='flex flex-col gap-4'>
                    {productData?.ratings?.map(el => (
                        <Comment
                            key={el._id}
                            star={el.star}
                            updatedAt={el.updatedAt}
                            comment={el.comment}
                            name={el.postedBy?.name}
                            image={el.postedBy?.avatar}
                        />
                    ))}
                </div>
            </div>
            <div className="m-auto mt-8">
                <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">Người dùng khác cũng mua:</h3>
                <div>
                    <Slider {...settings}>
                        {relatedProducts?.map(el => (
                            <Product 
                                key={el._id}
                                productData={el}
                            />
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default memo(DetailProduct);