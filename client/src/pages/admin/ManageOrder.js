import React from 'react'
import { Tabs } from 'antd';
import { apiGetAllOrder } from '../../apis/user';
import AdminOrderItem from '../../components/AdminOrderItem';

const TabPane = Tabs.TabPane;

const ManageOrder = () => {

    const [allListOrder, setAllListOrder] = React.useState([])
    const [filterListOrder, setFilterListOrder] = React.useState([])
    const [reload, setReload] = React.useState(false)
    const [key, setKey] = React.useState("All")

    React.useEffect(() => {

        fetchOrder()
    }, [reload])

    React.useEffect(() => {

        if (key !== "All") {
            const newList = allListOrder?.filter(order => order.status == key)
            setFilterListOrder(newList)
        }
    }, [key])

    const fetchOrder = async () => {
        const response = await apiGetAllOrder()
        if (response.success) {
            setAllListOrder(response?.orders)
            const newList = response?.orders?.filter(order => order.status == key)
            setFilterListOrder(newList)
        }
    }

    const callback = (key) => {

        setKey(key)
    }

    return (
        <div className="pb-[20px] max-h-[100vh] overflow-y-scroll">
            <div class="sm:px-[10px] lg:px-[20px] xl:px-[20px]">
                <div class="px-4 pt-8">
                    <p class="text-xl pb-[10px] font-bold border-b border-solid border-[#555]">
                        Quản lý đơn hàng
                    </p>
                    <div class="mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6">

                        <Tabs className='text-[16px] text-[#333]' defaultActiveKey="1" onChange={callback}>
                            <TabPane tab="Tất cả" key="All">
                                <AdminOrderItem setKey={setKey} setReload={setReload} listOrder={allListOrder} />
                            </TabPane>
                            <TabPane tab="Chờ xác nhận" key="Pending">
                                <AdminOrderItem setKey={setKey} setReload={setReload} listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Chờ lấy hàng" key="Awaiting">
                                <AdminOrderItem setKey={setKey} setReload={setReload} listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Đang giao" key="Delivering">
                                <AdminOrderItem setKey={setKey} setReload={setReload} listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Đã giao đến" key="Transported">
                                <AdminOrderItem setKey={setKey} setReload={setReload} listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Hoàn thành" key="Successed">
                                <AdminOrderItem setKey={setKey} setReload={setReload} listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Đã hủy" key="Cancelled">
                                <AdminOrderItem setKey={setKey} setReload={setReload} listOrder={filterListOrder} />
                            </TabPane>
                        </Tabs>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManageOrder