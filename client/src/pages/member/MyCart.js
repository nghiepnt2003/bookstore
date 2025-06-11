import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox, Popconfirm, message } from 'antd';
import { apiUpdateCart, apiRemoveCart, apiCheckout } from '../../apis'; // Nhập apiCheckout
import { toast } from 'react-toastify';
import { CloseOutlined } from '@ant-design/icons';
import path from '../../ultils/path';
import withBaseComponent from '../../hocs/withBaseComponent';
import { Link, useNavigate } from 'react-router-dom';
import { updateCart, removeFromCart } from '../../store/cart/cartSlice';
import { formatMoney, renderStarFromNumber } from "../../ultils/helpers";

const MyCart = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [total, setTotal] = useState(0);
    const [listCheckout, setListCheckout] = useState([]);
    const { items: cartItems } = useSelector(state => state.cart);
    
    useEffect(() => {
        const result = listCheckout.reduce((acc, current) => {
            return acc + current.quantity * current.product.price;
        }, 0);
        setTotal(result);
    }, [listCheckout]);

    useEffect(() => {
        const newListCheckout = cartItems.filter(cartItem =>
            listCheckout.some(item => item.product._id === cartItem.product._id)
        );
        setListCheckout(newListCheckout);
    }, [cartItems]);

    const toggleCheck = (cartItem) => {
        setListCheckout(prev => {
            const exists = prev.some(item => item.product._id === cartItem.product._id);
            if (exists) {
                return prev.filter(item => item.product._id !== cartItem.product._id);
            } else {
                return [...prev, cartItem];
            }
        });
    };

    const handleMinusCart = async (cartItem) => {
        if (cartItem.quantity > 1) {
            const response = await apiUpdateCart({
                productId: cartItem.product._id,
                quantity: -1,
            });

            if (response.success) {
                dispatch(updateCart({ product: cartItem.product, quantity: -1 }));
                toast.success('Cập nhật số lượng thành công');
            } else {
                toast.error('Cập nhật số lượng thất bại');
            }
        } else {
            message.warning("Số lượng sản phẩm phải lớn hơn 0");
        }
    };

    const handlePlusCart = async (cartItem) => {
        if (cartItem.quantity < 100) {
            const response = await apiUpdateCart({
                productId: cartItem.product._id,
                quantity: 1,
            });

            if (response.success) {
                dispatch(updateCart({ product: cartItem.product, quantity: 1 }));
                toast.success('Cập nhật số lượng thành công');
            } else {
                toast.error('Cập nhật số lượng thất bại');
            }
        } else {
            message.warning("Số lượng sản phẩm phải nhỏ hơn 100");
        }
    };

    const handleRemoveToCart = async (id, product) => {
        const response = await apiRemoveCart(id);
        if (response.success) {
            dispatch(removeFromCart({ product }));
            toast.success("Đã xóa khỏi giỏ");
        } else {
            toast.error(response.mess);
        }
    };

    // const handleCheckout = async () => {
    //     if (listCheckout.length === 0) {
    //         toast.warn("Vui lòng chọn sản phẩm để thanh toán");
    //         return;
    //     }

    //     try {
    //         const response = await apiCheckout({
    //             items: listCheckout.map(item => ({
    //                 productId: item.product._id,
    //                 quantity: item.quantity,
    //             })),
    //             totalPrice: total,
    //         });

    //         if (response.success) {
    //             // Chuyển hướng đến trang xác nhận thanh toán hoặc trang khác
    //             navigate(`/${path.CHECKOUT}`, { state: { listCheckout } });
    //             toast.success("Thanh toán thành công!");
    //         } else {
    //             toast.error("Thanh toán không thành công: " + response.message);
    //         }
    //     } catch (error) {
    //         toast.error("Lỗi khi thanh toán: " + error.message);
    //     }
    // };

    const handleCheckout = async () => {
        if (listCheckout.length === 0) {
            toast.warn("Vui lòng chọn sản phẩm để thanh toán");
            return;
        }

        console.log("listCheckout " + JSON.stringify(listCheckout))
    
        try {
            // Duyệt qua từng sản phẩm trong listCheckout và gọi apiCheckout
            for (const item of listCheckout) {
                const response = await apiCheckout(item._id, {
                    selectedForCheckout: true, // Giả sử muốn đặt selectedForCheckout là true
                    // quantity: item.quantity,
                    // productId: item.product?._id,
                    // productName: item.product?.name,
                    // productImage: item.product?.image,
                    // productPrice: item.product?.price, // Lưu giá đã được giảm (nếu có)
                });
    
                if (!response.success) {
                    toast.error("Đặt hàng không thành công cho sản phẩm: " + item.product.name);
                    // selectedForCheckout: false
                    return; // Dừng quá trình thanh toán nếu có lỗi
                }
            }
            navigate(`/${path.CHECKOUT}`, { state: { listCheckout } });
        } catch (error) {
            toast.error("Lỗi khi thanh toán: " + error.message);
        }
    };

    return (
        <div className="max-h-screen bg-gray-100 pt-20 overflow-y-scroll">
            <h1 className="mb-10 text-center text-2xl font-bold">Giỏ hàng của tôi</h1>
            <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0">
                <div className="rounded-lg md:w-2/3">
                    {cartItems.length === 0 ? (
                        <div className="p-[20px] shadow-md rounded-lg bg-[#fff] flex flex-col items-center justify-center">
                            <img
                                style={{
                                    width: "200px",
                                    height: "200px",
                                    objectFit: "contain",
                                }}
                                src="https://cdn.dribbble.com/users/687236/screenshots/5838300/media/e057a25942aae5272354e78afbac8e8a.png"
                                alt="empty-cart"
                            />
                            <p className="text-[16px] text-[#333]">Giỏ hàng trống</p>
                        </div>
                    ) : (
                        cartItems?.map((cartItem) => (
                            <div key={cartItem._id} className="justify-between mb-6 rounded-lg bg-white py-6 px-[10px] shadow-md sm:flex sm:justify-start">
                                <Checkbox 
                                    checked={listCheckout.some(item => item.product._id === cartItem.product._id)} 
                                    onChange={() => toggleCheck(cartItem)} 
                                    className="mr-[20px]" 
                                />
                                <img
                                    style={{
                                        objectFit: "contain",
                                        width: "140px",
                                        height: "140px",
                                    }}
                                    src={cartItem.product.image}
                                    alt="product-image"
                                    className="rounded-lg sm:w-40"
                                />
                                <div className="sm:ml-4 sm:flex sm:w-full sm:justify-between">
                                    <div className="mt-5 sm:mt-0">
                                        <h2 className="text-lg font-bold text-gray-900">{cartItem.product.name}</h2>
                                    </div>
                                    <div className="mt-4 flex justify-between sm:space-y-6 sm:mt-0 sm:block sm:space-x-6">
                                        <div className="flex items-center border-gray-100 ml-[10px]">
                                            <span
                                                onClick={() => handleMinusCart(cartItem)}
                                                className="cursor-pointer rounded-l bg-gray-100 py-1 px-3.5 duration-100 hover:bg-blue-500 hover:text-blue-50"
                                            >
                                                -
                                            </span>
                                            <input className="h-8 w-8 border bg-white text-center text-xs outline-none" value={cartItem.quantity} min="1" readOnly />
                                            <span
                                                onClick={() => handlePlusCart(cartItem)}
                                                className="cursor-pointer rounded-r bg-gray-100 py-1 px-3 duration-100 hover:bg-blue-500 hover:text-blue-50"
                                            >
                                                +
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <p className="text-sm">
                                                {`${formatMoney(cartItem.product.price)}`.toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })} 
                                                {/* {cartItem.product.price.toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}  */}
                                            </p>
                                            <Popconfirm
                                                title="Xác nhận xóa"
                                                description="Sản phẩm sẽ xóa khỏi giỏ hàng?"
                                                onConfirm={() => handleRemoveToCart(cartItem?._id, cartItem?.product)}
                                                onCancel={() => { }}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <CloseOutlined className="text-[#333] hover:text-red-500" />
                                            </Popconfirm>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 h-full rounded-lg border bg-white p-6 shadow-md md:mt-0 md:w-1/3">
                    <hr className="my-4" />
                    <div className="flex justify-between">
                        <p className="text-lg font-bold">Tổng cộng</p>
                        <div className="">
                            <p className="mb-1 text-lg font-bold">
                                {`${formatMoney(total)}`?.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={total === 0}
                        className="mt-6 disabled:bg-slate-200 disabled:text-[#333] w-full rounded-md bg-blue-500 py-1.5 font-medium text-blue-50 hover:bg-blue-600"
                    >
                        Đặt hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default withBaseComponent(memo(MyCart));