import { Button } from 'antd'
import React from 'react'
import { toast } from 'react-toastify';
import { apiUpdateOrder } from '../apis';

function HistoryOrderItem({ setFetch, listOrder }) {

    const formatDate = (dataDate) => {

        const date = new Date(dataDate);

        const formattedDate = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const formattedTime = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return formattedTime + ' ' + formattedDate;
    }

    const handleCancel = async (oid) => {

        const response = await apiUpdateOrder({ status: 'Cancelled' }, oid)

        if (response.success) {

            setFetch(prev => !prev)
            toast.success("Hủy thành công")
        } else {

            toast.success(response.mess)
        }
    }

    return (
        <>
            {
                listOrder && listOrder?.length > 0 ?
                    listOrder?.map(order => (

                        <div key={order._id} className=" bg-white sm:flex-row pb-[40px] border-b">
                            <div className='grid gap-[20px] grid-cols-3 py-[10px] border-b'>
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
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Tổng tiền
                                    </p>
                                    <p className="text-[14px] uppercase text-[#999] font-[500]">
                                        {order.total ? order?.total?.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }) : "0"}
                                    </p>
                                </div>
                            </div>
                            {
                                order.products.map(product => (
                                    <div key={product.product._id} className="flex pt-[10px]">
                                        <img className="m-2 h-24 w-28 rounded-md border object-contain" src={product.product?.imageUrl[0]} alt="" />
                                        <div className="flex w-[350px] flex-col px-4 py-4">
                                            <span className="font-semibold text-[18px] text-[#333]">{product.product?.productName}</span>
                                            <p className="text-[16px] font-bold">
                                                {(product.product?.price).toLocaleString('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                })}
                                            </p>
                                            <span className="float-right text-gray-400">x {product.count}</span>
                                        </div>
                                    </div>
                                ))
                            }
                            <div className='mt-[20px] flex items-center gap-[40px]'>
                                <Button className='cursor-default '>
                                    {
                                        order.status === "Pending" ? "Đang chờ xác nhận"
                                            : order.status === "Confirmed" ? "Đang giao"
                                                : order.status === "Shipped" ? "Hoàn thành"
                                                    : order.status === "Cancelled" ? "Đã hủy"
                                                        : ""
                                    }
                                </Button>
                                {
                                    order.status === "Pending" ?
                                        <Button onClick={() => handleCancel(order._id)} danger type='primary'>
                                            Hủy đơn hàng
                                        </Button>
                                        : ""
                                }

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