import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import PaymentButton from '../../components/PaymentButton';
import { apiGetOrderById, apiCreateMomoUrl } from '../../apis';
import Swal from "sweetalert2";
import { Spin } from 'antd';

const Payment = () => {
    const { oid } = useParams(); // Lấy orderId từ URL
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true); // State để lưu trữ thông tin đơn hàng

    const handleMomoPayment = async (oid) => {
        try {
            console.log("AAAA")
            const paymentResponse = await apiCreateMomoUrl(oid);
            console.log("HEHE " + JSON.stringify(paymentResponse))
            if (paymentResponse.success) {
                window.location.href = paymentResponse.paymentUrl;
            } else {
                throw new Error('Failed to generate Momo payment URL.');
            }
        } catch (error) {
            Swal.fire("Error", error.message || "Error processing MoMo payment.", "error");
        }
    };

    // Dùng useEffect để gọi API và lấy dữ liệu đơn hàng
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await apiGetOrderById(oid);
                console.log("OD " + JSON.stringify(orderData))
                setOrder(orderData?.order);
                setLoading(false);  // Đặt loading thành false sau khi lấy dữ liệu thành công
            } catch (error) {
                console.error('Failed to fetch order:', error);
                setLoading(false);  // Đặt loading thành false nếu có lỗi
            }
        };

        fetchOrder();
    }, [oid]); // Phụ thuộc vào orderId để tái gọi khi orderId thay đổi

    if (loading) {
        return <Spin size="large" />;
    }
    // Chỉ render PaymentButton khi có dữ liệu đơn hàng
    return (
        
        order ? (
            <div className='p-[20px]'>
                <div class="mt-8 space-y-3 ">

{
    order?.details?.map(product => (
    <div key={product?._id} class="flex flex-col rounded-lg bg-white sm:flex-row mb-[20px] border px-2 py-4 sm:px-6">
        {product?.productImage && <img class="m-2 h-24 w-28 rounded-md border object-contain" src={product?.productImage} alt="" />}
         <div class="flex w-[350px] flex-col px-4 py-4">
            <span class="font-semibold">{product?.productName}</span>
            <p class="text-lg font-bold">
                {product?.productPrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                })}
            </p>
            <span class="float-right text-gray-400">x {product?.quantity}</span>
        </div>
    </div>
        
    ))
}              <div className='flex items-center gap-2'>
                    <span className='font-medium'>Tên khách hàng:</span>
                    <span className='text-main'>{order?.recipientName}</span>
                </div>
               <div className='flex items-center gap-2'>
                    <span className='font-medium'>Địa chỉ khách hàng:</span>
                    <span className='text-main'>{order?.shippingAddress}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='font-medium'>Số điện thoại:</span>
                    <span className='text-main'>{order?.recipientPhone}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='font-medium'>Phương thức thanh toán:</span>
                    <span className='text-main'>{order?.payment}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='font-medium'>Tổng số tiền:</span>
                    <span className='text-main'>{order?.totalPrice}</span>
                    <span className='font-medium'>VNĐ</span>
                </div>
      </div>
                <div className='justify-center flex mt-10'>
                {(order?.status === "Not Yet Paid" && order.payment === 'MOMO') && (
                    <button onClick={() => handleMomoPayment(order?._id)} class="bg-blue-200 py-2 px-4 rounded-md text-center w-full h-14 text-xl flex items-center justify-center" type='primary'>
                        <img className="w-auto h-8" src="https://developers.momo.vn/v3/vi/assets/images/square-8c08a00f550e40a2efafea4a005b1232.png" alt="MoMo" />
                    </button>
                )}
                </div>
            </div>
        ) : (
            <div>Loading order details...</div>
        )
    );
}

export default Payment;