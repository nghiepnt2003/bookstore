import React, { memo, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, Button, ProductExtraInfoItem, SelectQuantity, Product, Comment, VoteBar, VoteOption } from "../../components";
import { apiGetProduct, apiGetProducts, apiGetRating, apiPostComments, apiPostRating, apiUpdateCart, apiGetUserCart , apiGetComment} from "../../apis";
import { formatMoney, formatPrice, renderStarFromNumber } from "../../ultils/helpers";
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
    const [rating, setRating] = useState([]);
    const [comment, setComment] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { isLoggedIn } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmitVoteOption = async (value) => {
        if (!value.comment || !value.star) {
            alert('Vui lòng thêm nhận xét của bạn');
            return;
        }
        await apiPostRating({
            star: value.star,
            product: productData?._id
        });
        await apiPostComments({
            product: productData?._id,
            comment: value.comment
        });
        // fetchRatingCommentData()
        fetchProductData();
        // Đóng modal sau khi đánh giá thành công
        dispatch(showModal({ isShowModal: false, modalChildren: null }));
    };

    const fetchProductData = async () => {
        const response = await apiGetProduct(id);
        console.log("PRODUCT DATA " + JSON.stringify(response.product.author))
        if (response.success) {
            setProductData(response.product);
            fetchRatingCommentData()
        }
    };

    const fetchRatingCommentData = async () => {
        const rs = await apiGetRating(id);
        const rsp = await apiGetComment(id);
    
        if (rs.success && rsp.success) {
            const ratings = rs.ratings;
            const comments = rsp.comments;
    
            // Tạo một đối tượng để lưu trữ dữ liệu theo userId
            const combinedData = {};
    
            // Thêm dữ liệu từ ratings vào combinedData
            ratings.forEach(rating => {
                const userId = rating.user._id; // Giả sử có trường postedBy với _id
                combinedData[userId] = {
                    userId,
                    username: rating.user.username,
                    updatedAt: rating.updatedAt,
                    image: rating.user.image,
                    rating: rating.star, // Lấy trường star từ rating
                    comment: null // Khởi tạo comment là null
                };
            });
    
            // Thêm dữ liệu từ comments vào combinedData
            comments.forEach(comment => {
                const userId = comment.user; // Giả sử có trường postedBy với _id
                if (combinedData[userId]) {
                    combinedData[userId].comment = comment.comment; // Lấy trường comment từ comment
                } else {
                    // //Nếu userId không có trong ratings, bạn có thể quyết định cách xử lý
                    // combinedData[userId] = {
                    //     userId,
                    //     rating: null, // Không có rating cho user này
                    //     comment: comment.comment // Lấy trường comment từ comment
                    // };
                }
            });
    
            // Chuyển đổi combinedData thành mảng
            const resultArray = Object.values(combinedData);
            console.log("NE RATING ANHD COMMNET " + JSON.stringify(resultArray)); // Kết quả là mảng các đối tượng đã kết hợp
            setRating(resultArray)
        }
    };
    
    const fetchRelatedProducts = async () => {
        if (!productData) return;
        const categoryIds = productData.categories.map(category => category._id);
        const productPromises = categoryIds.map(cateId => apiGetProducts({ categories: cateId }));
        const responses = await Promise.all(productPromises);
        const allProducts = responses.reduce((acc, response) => {
            if (response.success) {
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
            return flag === 'minus' ? prev - 1 : prev + 1;
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

    const handleAddToCart =  async () => {
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
        const response = await apiUpdateCart({ productId: productData._id, quantity });
        if (response.success) {
            // const getCarts = await apiGetUserCart()
            dispatch(updateCart({ product: productData, quantity }));
            dispatch(fetchCart()); // Gọi action để fetch lại giỏ hàng
            toast.success("Đã thêm vào giỏ");
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
                    <div>
                        <span>Tác giả:</span>
                        {productData?.author.map(el => (
                            <span key={el.id}>{` ${el.name}, `}</span>
                        ))}
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
                                ratingTotal={productData?.averageRating}
                                ratingCount={rating.filter(i => i.star === el + 1).length}
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
                <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">Người dùng khác cũng mua:</h3>
                <div>
                    <Slider {...settings}>
                        {relatedProducts.map(el => (
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