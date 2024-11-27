import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react'
import { toast } from 'react-toastify';
import { apiUpdateOrder } from '../apis/user';
import { apiCancelOrder } from '../apis';
import icons from '../ultils/icons';

const {FaTruckFast} = icons

function AdminOrderItem({ setKey, setReload, listOrder }) {

    const formatDate = (dataDate) => {

        const date = new Date(dataDate);

        const formattedDate = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const formattedTime = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return formattedTime + ' ' + formattedDate;
    }

    const handleUpdateOrder = async (status, oid) => {
        console.log("STATUS " + status)

        let updateStatus = status === "Pending" ? "Delivering"
            // : status === "Delivering" ? "Successed"
                : ""
                console.log("UP STATUS " + updateStatus)
                try {
                    const response = await apiUpdateOrder({ status: updateStatus }, oid);
                    if (response.success) {

                        setReload(prev => !prev)
                        setKey(status)
                        toast.success("Cập nhật thành công")
                    } else {
                        toast.success("Cập nhật thất bại")
                    }
                } catch (error) {
                    console.log(error);
                    toast.error('Có lỗi xảy ra khi cập nhật đơn hàng.');
                }
    }

    const handleCancel = async (oid) => {

        const response = await apiUpdateOrder({ status: 'Cancelled' }, oid);

        if (response.success) {

            setReload(prev => !prev)
            toast.success("Từ chối đơn hàng thành công")
        } else {
            toast.success(response.mess)
        }

        
    }

    return (
        <>
            {
                listOrder?.length > 0 ?
                    listOrder?.map(order => (
                        <div key={order._id} className=" bg-white sm:flex-row pb-[40px] border-b">
                            <div className='grid gap-[20px] grid-cols-5 py-[10px]'>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Người nhận
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order.recipientName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Địa chỉ
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order.shippingAddress}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Số điện thoại
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order.recipientPhone}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Ngày đặt hàng
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[16px] text-[#333] font-[600] mb-[10px]">
                                        Tổng tiền
                                    </p>
                                    <p className="text-[14px] text-[#999] font-[500]">
                                        {order?.totalPrice?.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                    </p>
                                </div>

                            </div>
                            <div className='mt-[20px]'>
                                <Button
                                    disabled={order.status === "Successed" || order.status === "Cancelled" || order.status === "Delivering"}
                                    className={`cursor-pointer`}
                                    type='primary'
                                    ghost
                                    icon={
                                        order.status === "Successed" ? <CheckCircleOutlined className="text-green-500" />
                                            : order.status === "Cancelled" ? <CloseCircleOutlined className="text-red-500" />
                                                : order.status === "Delivering" ? <FaTruckFast className="text-blue-400" />
                                                    : ""
                                    }
                                    onClick={() => handleUpdateOrder(order.status, order._id)}
                                >
                                    {
                                        order.status === "Pending" ? "Xác nhận đơn hàng"
                                            : order.status === "Delivering" ? "Đang giao"
                                                : order.status === "Successed" ? "Hoàn thành"
                                                    : order.status === "Cancelled" ? "Đã hủy"
                                                        : ""
                                    }
                                </Button>
                                {/* {
                                    order.status === "Pending" ?
                                        <Button className='ml-[30px]' onClick={() => handleCancel(order._id)} danger type='primary'>
                                            Từ chối đơn hàng
                                        </Button>
                                        : ""
                                } */}
                            </div>
                        </div>
                    ))
                    :
                    <div>
                        Danh sách đơn hàng trống
                    </div>
            }
        </>
    )
}

export default AdminOrderItem