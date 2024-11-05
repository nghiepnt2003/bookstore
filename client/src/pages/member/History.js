import React, { useEffect } from 'react'
import { Tabs } from 'antd';
import { apiGetOrderUser } from '../../apis/user';
import HistoryOrderItem from '../../components/HistoryOrderItem';
const TabPane = Tabs.TabPane;

const History = () => {

    const [allListOrder, setAllListOrder] = React.useState([])
    const [filterListOrder, setFilterListOrder] = React.useState([])
    const [key, setKey] = React.useState("All")
    const [fetch, setFetch] = React.useState(false)

    useEffect(() => {

        fetchOrder()
    }, [fetch])

    useEffect(() => {

        const newList = allListOrder.filter(order => order.status == key)
        setFilterListOrder(newList)
    }, [allListOrder, key])

    const fetchOrder = async () => {
        const response = await apiGetOrderUser()
        if (response.success) {
            setAllListOrder(response.result)
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
                        Lịch sử đặt hàng
                    </p>
                    <div class="mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6">

                        <Tabs className='text-[16px] text-[#333]' defaultActiveKey="1" onChange={callback}>
                            <TabPane tab="Tất cả" key="All">
                                <HistoryOrderItem setFetch={setFetch} listOrder={allListOrder} />
                            </TabPane>
                            <TabPane tab="Chờ xác nhận" key="Pending">
                                <HistoryOrderItem setFetch={setFetch} listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Đang giao" key="Confirmed">
                                <HistoryOrderItem setFetch={setFetch} listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Hoàn thành" key="Shipped">
                                <HistoryOrderItem setFetch={setFetch} listOrder={filterListOrder} />
                            </TabPane>
                            <TabPane tab="Đã hủy" key="Cancelled">
                                <HistoryOrderItem setFetch={setFetch} listOrder={filterListOrder} />
                            </TabPane>
                        </Tabs>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default History