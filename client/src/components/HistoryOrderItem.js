import { Button } from 'antd'
import React from 'react'
import { toast } from 'react-toastify';
import { apiCancelOrder, apiConfirmOrder } from '../apis';
import Swal from 'sweetalert2';
import CountdownTimer from './CountdownTimer';

function HistoryOrderItem({ setFetch, listOrder }) {
    console.log("listOrder " + JSON.stringify(listOrder) )

    const formatDate = (dataDate) => {

        const date = new Date(dataDate);

        const formattedDate = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const formattedTime = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return formattedTime + ' ' + formattedDate;
    }

    const handleCancel = async (oid) => {

        const response = await apiCancelOrder(oid)

        if (response.success) {

            setFetch(prev => !prev)
            toast.success("Hủy thành công")
        } else {
            toast.success(response.mess)
        }
    }

    const handleReceived = async (oid) => {
        const result = await Swal.fire({
            title: 'Xác nhận nhận hàng',
            text: 'Nếu bạn xác nhận, bạn sẽ không được hoàn trả đơn hàng này.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });
    
        if (result.isConfirmed) {
            // Gọi API để cập nhật trạng thái đơn hàng
            const response = await apiConfirmOrder(oid);
            
            if (response.success) {
                setFetch(prev => !prev); // Cập nhật lại danh sách đơn hàng
                toast.success("Xác nhận thành công");
            } else {
                toast.error(response.message || "Đã xảy ra lỗi");
            }
        }
    }

    const openPaymentWindow = (orderId) => {
        const width = 600;
        const height = 600;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        // Cấu hình cho cửa sổ mới
        const windowFeatures = `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`;

        // Mở cửa sổ mới với URL tới trang thanh toán
        window.open(`payment/${orderId}`, '_blank', windowFeatures);
    }

    return (
        <>
            {
                listOrder && listOrder?.length > 0 ?
                    listOrder?.map(order => (

                        <div key={order._id} className=" bg-white sm:flex-row pb-[40px] border-b">
                            <div className='grid gap-[20px] grid-cols-4 py-[10px] border-b'>
                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Mã đơn hàng
                                    </p>
                                    <p className="text-[14px] uppercase text-[#999] font-[500]">
                                        {order._id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Ngày đặt hàng
                                    </p>
                                    <p className="text-[14px] uppercase text-[#999] font-[500]">
                                        {formatDate(order.createdAt)}
                                    </p>
                                    {order.status === "Not Yet Paid" && <CountdownTimer createdAt={order.createdAt} />}
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Tổng tiền
                                    </p>
                                    <p className="text-[14px] uppercase text-[#999] font-[500]">
                                        {order.totalPrice ? order?.totalPrice?.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }) : "0"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Phương thức thanh toán
                                    </p>
                                    <p className="text-[14px] uppercase text-[#999] font-[500]">
                                        {(order?.payment && order.payment==="OFFLINE" )? "Tiền mặt": order.payment}
                                    </p>
                                </div>
                            </div>
                            {
                                order?.details?.map(product => (
                                    <div key={product._id} className="flex pt-[10px]">
                                        <img className="m-2 h-24 w-28 rounded-md border object-contain" src={product?.productImage} alt="" />
                                        <div className="flex w-[350px] flex-col px-4 py-4">
                                            <span className="font-semibold text-[18px] text-[#333]">{product?.productName}</span>
                                            <p className="text-[16px] font-bold">
                                                {(product?.productPrice).toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </p>
                                            <span className="float-right text-gray-400">x {product.quantity}</span>
                                        </div>
                                    </div>
                                ))
                            }
                            <div className='mt-[20px] flex items-center gap-[40px]'>
                                <div className='text-[16px] text-blue-500 font-[600] mb-[10px]'>
                                            {
                                                order.status === "Pending" ? "Chờ xác nhận"
                                                    : order.status === "Successed" ? "Hoàn thành"
                                                        : order.status === "Awaiting" ? "Chờ lấy hàng"
                                                            : order.status === "Delivering" ? "Đang giao"
                                                                : order.status === "Transported" ? "Đã giao đến"
                                                                    : order.status === "Cancelled" ? "Đã hủy"
                                                                        : order.status === "Not Yet Paid" ? "Đang chờ thanh toán"
                                                                            : ""
                                            }
                                </div>
                                {
                                    (order.status === "Pending" || order.status==="Not Yet Paid") ?
                                        <Button onClick={() => handleCancel(order._id)} danger type='primary'>
                                            Hủy đơn hàng
                                        </Button>
                                        : ""
                                }
                                {
                                    order.status === "Transported" ?
                                        <Button onClick={() => handleReceived(order._id)} type='primary'>
                                            Đã nhận được hàng
                                        </Button>
                                        : ""
                                }
                                {(order.status === "Not Yet Paid") && (
                                    <Button onClick={() => openPaymentWindow(order._id)}>
                                        Thanh toán
                                    </Button>
                                )}

                            </div>
                        </div>
                    ))
                    : <div>
                        Danh sách đơn hàng trống
                    </div>
            }
        </>
    )
}

export default HistoryOrderItem