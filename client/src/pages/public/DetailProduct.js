import React, { memo, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, Button, ProductExtraInfoItem, SelectQuantity, Product, Comment, VoteBar, VoteOption } from "../../components";
import { apiGetProduct, apiGetProducts, apiGetRating, apiPostComments, apiPostRating, apiUpdateCart, apiGetUserCart , apiGetComment, apiGetRecommendedProducts} from "../../apis";
import { formatMoney, renderStarFromNumber } from "../../ultils/helpers";
import { productExtraInfomation } from '../../ultils/contants';
import Slider from "react-slick";
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { showModal } from '../../store/app/appSlice';
import path from '../../ultils/path';
import { toast } from 'react-toastify';
import { updateCart } from '../../store/cart/cartSlice'; // Import action từ cartSlice
import { useNavigate } from "react-router-dom";
import { fetchCart } from '../../store/cart/asyncActions';
import { Statistic } from 'antd'; 

const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1
};

const { Countdown } = Statistic;

const DetailProduct = () => {
    const { id, name } = useParams();
    const [productData, setProductData] = useState(null);
    const [rating, setRating] = useState([]);
    const [comment, setComment] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { isLoggedIn, current } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    console.log("CURR " + JSON.stringify(current))

    const fetchProductData = async () => {
        const response = await apiGetProduct(id);
        if (response.success) {
            setProductData(response.product);
            fetchRatingCommentData();
        }
    };

    const fetchRecommendedProducts = async () => {
        const rs = await apiGetRecommendedProducts(current?._id);
        if(rs.success)
            setRecommendedProducts(rs.products);
    }


    const fetchRatingCommentData = async () => {
        const rs = await apiGetRating(id);
        const rsp = await apiGetComment(id);
    
        if (rs.success && rsp.success) {
            const ratings = rs.ratings;
            const comments = rsp.comments;
            const combinedData = {};
    
            ratings.forEach(rating => {
                const userId = rating.user._id;
                combinedData[userId] = {
                    userId,
                    username: rating.user.username,
                    updatedAt: rating.updatedAt,
                    image: rating.user.image,
                    rating: rating.star,
                    comment: null
                };
            });
    
            comments.forEach(comment => {
                const userId = comment.user;
                if (combinedData[userId]) {
                    combinedData[userId].comment = comment.comment;
                }
            });
    
            const resultArray = Object.values(combinedData);
            setRating(resultArray);
        }
    };

    const handleSubmitVoteOption = async (value) => {
                if (!value.comment || !value.star) {
                    alert('Vui lòng thêm nhận xét của bạn');
                    return;
                }
                const rs = await apiPostRating({
                    star: value.star,
                    product: productData?._id
                });
                if(rs.success)
                {
                    await apiPostComments({
                        product: productData?._id,
                        comment: value.comment
                    });
                }
                else
                {
                    toast.error(rs.message)
                }
                // fetchRatingCommentData()
                fetchProductData();
                // Đóng modal sau khi đánh giá thành công
                dispatch(showModal({ isShowModal: false, modalChildren: null }));
            };

    const fetchRelatedProducts = async () => {
        if (!productData) return;
        const categoryIds = productData.categories.map(category => category._id);
        const productPromises = categoryIds.map(cateId => apiGetProducts({ categories: cateId }));
        const responses = await Promise.all(productPromises);
        const allProducts = responses.reduce((acc, response) => {
            if (response?.success) {
                return acc.concat(response.products.filter(product => !acc.some(existingProduct => existingProduct._id === product._id)));
            }
            return acc;
        }, []);
        setRelatedProducts(allProducts);
    };

    useEffect(() => {
        fetchProductData();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        fetchRecommendedProducts();
    }, [id])

    useEffect(() => {
        fetchRelatedProducts();
    }, [productData]);

    const handleQuantityChange = useCallback((number) => {
        if (!Number(number) || Number(number) < 1) {
            return;
        }
        setQuantity(number);
    }, []);

    const handleChangeQuantity = useCallback((flag) => {
        setQuantity(prev => {
            if (flag === 'minus' && prev === 1) return prev;
            return flag === 'minus' ? +prev - 1 : +prev + 1;
        });
    }, []);

    const handleVoteNow = () => {
        if (!isLoggedIn) {
            Swal.fire({
                text: 'Vui lòng đăng nhập để đánh giá',
                cancelButtonText: "Hủy",
                confirmButtonText: 'Đi tới trang đăng nhập',
                title: 'Oops!',
                showCancelButton: true
            }).then((rs) => {
                if (rs.isConfirmed) {
                    navigate(`/${path.LOGIN}`);
                }
            });
        } else {
            dispatch(
                showModal({
                    isShowModal: true,
                    modalChildren: <VoteOption 
                                    productName={productData?.name} 
                                    handleSubmitVoteOption={handleSubmitVoteOption}
                                    />
                })
            );
        }
    };

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            return Swal.fire({
                title: 'Gần đúng...',
                text: 'Vui lòng đăng nhập trước',
                icon: 'info',
                cancelButtonText: 'Không bây giờ!',
                showCancelButton: true,
                confirmButtonText: 'Đi tới trang đăng nhập!'
            }).then(async (rs) => {
                if (rs.isConfirmed) navigate(`/${path.LOGIN}`);
            });
        }

        if (productData.stockQuantity === 0) {
            return Swal.fire({
                title: 'Sản phẩm đã hết hàng',
                text: 'Xin lỗi, sản phẩm này hiện tại không còn trong kho.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }

        if (quantity > productData.stockQuantity) {
            return Swal.fire({
                title: 'Số lượng không đủ',
                text: `Chỉ còn ${productData.stockQuantity} sản phẩm trong kho.`,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }

        const response = await apiUpdateCart({ productId: productData._id, quantity });
        if (response.success) {
            dispatch(updateCart({ product: productData, quantity }));
            toast.success("Đã thêm vào giỏ");
            dispatch(fetchCart()); // Gọi action để fetch lại giỏ hàng
        } else {
            toast.error("Đã xảy ra lỗi");
        }
    };

    return (
        <div className="mt-4 mb-10">
            <div className="h-[81px] flex items-center bg-[#FFF0F5]">
                <Breadcrumb name={name} />
            </div>
            <div className="mt-4 flex">
                <div className="flex-4">
                    <div className="bg-white h-[530px] w-[450px] flex items-center justify-center">
                        <img src={productData?.image} alt="Product" className="object-cover h-[530px] w-[450px]" />
                    </div>
                </div>
                <div className="flex-4">
                    <div className="flex justify-between">
                        <h2 className="font-semibold text-[25px] mb-4">{name}</h2>
                        <span className="text-sm italic text-main mr-4">{`Kho: ${productData?.stockQuantity}`}</span>
                    </div>
                    {/* <span>{`${formatMoney(formatPrice(productData?.price))} VNĐ`}</span> */}
                    <span className={`text-[30px] ${productData?.discount && 'text-gray-700 line-through !text-[20px]'} font-semibold`}>
                        {`${formatMoney(productData?.price)} VNĐ`}
                            </span>
                            {
                                productData?.discount && <span className='text-[30px] font-semibold text-main'>
                                    {`${formatMoney(productData?.finalPrice)} VNĐ`}
                                </span>
                            }
                    
                    {/* Thêm phần flash sale */}
                    {productData?.discount && (
                        <div className="flex items-center justify-between bg-red-600 text-white p-2 mt-2">
                            <span className="font-semibold">Flash Sale</span>
                            <div className="flex items-center">
                                <span>Kết thúc trong: </span>
                                <Countdown valueStyle={{ color: 'white', fontSize: 20 }} value={Date.now() + productData?.timeRemaining} />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        {renderStarFromNumber(productData?.averageRating)?.map((el, index) => (
                            <span key={index}>{el}</span>
                        ))}
                        <span className="text-sm italic text-main">{`Đã bán: ${productData?.soldCount}`}</span>
                    </div>
                    <div>{`Số trang: ${productData?.pageNumber}`}</div>
                    <div>
                        <span>Thể loại:</span>
                        {productData?.categories && productData.categories.length > 0 ? (
                            productData.categories.map(el => (
                                <span key={el.id}>{` ${el.name}, `}</span>
                            ))
                        ) : (
                            <span> Đang cập nhật</span>
                        )}
                    </div>
                    <div>
                        <span>Tác giả:</span>
                        {productData?.author && productData?.author.length > 0 ? (
                            productData.author.map(el => (
                                <span key={el.id}>{` ${el.name}, `}</span>
                            ))
                        ) : (
                            <span> Đang cập nhật</span>
                        )}
                    </div>
                    <div>{`NXB: ${productData?.publisher.name}`}</div>
                    <div>{`Mô tả: ${productData?.description}`}</div>
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">Số lượng</span>
                            <SelectQuantity 
                                quantity={quantity}
                                handleQuantity={handleQuantityChange}
                                handleChangeQuantity={handleChangeQuantity}
                            />
                        </div>
                        <Button handleOnClick={handleAddToCart} name='Thêm vào giỏ hàng' fw />
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
                        <span className='font-semibold text-3xl'>{`${productData?.averageRating || 0}/5`}</span>
                        <span className='flex items-center gap-1'>{renderStarFromNumber(productData?.averageRating)?.map((el, index) => (
                            <span key={index}>{el}</span>
                        ))}</span>
                        <span className='text-sm'>{`${rating.length} Người đánh giá`}</span>
                    </div>
                    <div className='flex-6 border gap-5 flex flex-col p-4 items-center'>
                        {Array.from(Array(5).keys()).reverse().map(el => (
                            <VoteBar
                                key={el}
                                number={el + 1}
                                ratingTotal={rating.length}
                                ratingCount={rating.filter(i => i.rating === el + 1).length}
                            />
                        ))}
                    </div>
                </div>
                <div className='p-4 flex flex-col gap-2 items-center justify-center text-sm'>
                    <span>Bạn có muốn đánh giá sản phẩm này không?</span>
                    <Button 
                        name='Đánh giá ngay!' 
                        handleOnClick={handleVoteNow}
                    >
                        Đánh giá ngay!
                    </Button>
                </div>
                <div className='flex flex-col gap-4'>
                    {rating.map(el => (
                        <Comment
                            key={el._id}
                            star={el.rating}
                            updatedAt={el.updatedAt}
                            comment={el.comment}
                            name={el.username}
                            image={el.image}
                        />
                    ))}
                </div>
            </div>
            <div className="m-auto mt-8">
                <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">Người khác cũng mua:</h3>
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
            {recommendedProducts?.length > 0 && <>
                <div className='w-main m-auto mt-8'>
                    <h3 className='text-[20px] font-semibold py-[15px] border-b-2 border-main'>Có thể bạn sẽ thích:</h3>
                    <Slider {...settings}>
                        {recommendedProducts?.map(el => (
                            <Product 
                                key={el._id}
                                productData={el}
                            />
                        ))}
                    </Slider>
                </div>
                <div className='h-[100px] w-full'></div>
            </>}
        </div>
    );
};

export default memo(DetailProduct);