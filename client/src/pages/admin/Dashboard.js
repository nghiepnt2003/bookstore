import numeral from 'numeral'
import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { DatePicker, Select } from 'antd'
import dayjs from 'dayjs'
import { apiGetAllOrderByTime } from '../../apis/user'

const { RangePicker } = DatePicker

const options = [
    {
        label: "7 ngày gần nhất",
        value: "dates"
    },
    {
        label: "6 tháng gần nhất",
        value: "months"
    },
    {
        label: "4 năm gần nhất",
        value: "years"
    }
]

const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
    return date.toLocaleDateString('en-GB', options)
}

const getRevenueLast7Days = (orders) => {
    const formattedOrders = [];

    const currentDate = new Date()
    const sevenDaysAgo = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 6)

    for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate() + i)
        const formattedDate = formatDate(date)
        let totalRevenue = 0

        for (const order of orders) {
            const updatedAt = new Date(order?.updatedAt)

            if (updatedAt.toDateString() === date.toDateString()) {
                totalRevenue += order?.total
            }
        }

        const formattedOrder = {
            time: formattedDate,
            income: totalRevenue
        };

        formattedOrders.push(formattedOrder)
    }

    return formattedOrders
}

const getRevenueLast6Months = (orders) => {
    const formattedOrders = [];

    const currentDate = new Date();
    const sevenMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, currentDate.getDate());

    for (let i = 0; i < 6; i++) {
        const date = new Date(sevenMonthsAgo.getFullYear(), sevenMonthsAgo.getMonth() + i, sevenMonthsAgo.getDate());
        const formattedDate = formatDate(date);
        let totalRevenue = 0;

        for (const order of orders) {
            const updatedAt = new Date(order?.updatedAt);

            if (updatedAt.getMonth() === date.getMonth() && updatedAt.getFullYear() === date.getFullYear()) {
                totalRevenue += order?.total;
            }
        }

        const formattedOrder = {
            time: `Tháng ${date.getMonth() + 1}`,
            income: totalRevenue
        };

        formattedOrders.push(formattedOrder);
    }

    return formattedOrders;
}

const getRevenueLast4Years = (orders) => {
    const formattedOrders = [];

    const currentDate = new Date();
    const sevenYearsAgo = new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), currentDate.getDate());

    for (let i = 0; i < 4; i++) {
        const date = new Date(sevenYearsAgo.getFullYear() + i, sevenYearsAgo.getMonth(), sevenYearsAgo.getDate());
        const formattedDate = formatDate(date);
        let totalRevenue = 0;

        for (const order of orders) {
            const updatedAt = new Date(order.updatedAt);

            if (updatedAt.getFullYear() === date.getFullYear()) {
                totalRevenue += order.total;
            }
        }

        const formattedOrder = {
            time: date.getFullYear(),
            income: totalRevenue
        };

        formattedOrders.push(formattedOrder);
    }

    return formattedOrders;
}

const formatPrice = (price) => {
    return price >= 1000000 ? `${(price / 1000000).toFixed(2)}M` : `${(price / 1000).toFixed(2)}K`
}

const Dashboard = () => {

    const [dateFilter, setDateFilter] = React.useState({
        label: "Hôm nay",
        today: dayjs(new Date(), "DD/MM/YYYY")
    })
    const [incomes, setIncomes] = React.useState(0)
    const [listOrders, setListOrders] = React.useState([])
    const [listAllOrders, setListAllOrders] = React.useState([])
    const [chartFilter, setChartFilter] = React.useState(options[0])
    const [data, setData] = React.useState([])

    const handleChangeDateFilter = (value, dayValues) => {

        const startDate = dayValues[0]
        const endDate = dayValues[1]

        if (startDate && endDate) {
            setDateFilter({
                label: `Từ ngày ${startDate} đến ${endDate}`,
                startDate: startDate,
                endDate: endDate,
                today: null
            })
        } else {

            setDateFilter({
                label: "Hôm nay",
                today: dayjs(new Date(), "DD/MM/YYYY")
            })
        }
    }

    const fetchListOrders = async (query) => {

        const response = await apiGetAllOrderByTime(query)

        if (response.success) {
            setListOrders(response.orders)
        }
    }

    const fetchAllListOrders = async () => {

        const response = await apiGetAllOrderByTime("")

        console.log(response)
        if (response.success) {
            setListAllOrders(response.orders)
        }
    }

    const convertDateFormat = (dateString) => {
        const parts = dateString.split('/');

        if (parts.length !== 3) {
            throw new Error('Invalid date format. Expected DD/MM/YYYY');
        }

        const day = parts[0];
        const month = parts[1];
        const year = parts[2];

        return `${year}-${month}-${day}`;
    };

    React.useEffect(() => {

        if (dateFilter.startDate && dateFilter.endDate) {

            fetchListOrders(`?startTime=${convertDateFormat(dateFilter.startDate)}&endTime=${convertDateFormat(dateFilter.endDate)}`)
        } else {
            fetchListOrders(`?toDay=${true}`)
        }

    }, [dateFilter])

    React.useEffect(() => {

        const newIncomes = listOrders.reduce((acc, curr) => acc + curr.total, 0)
        setIncomes(newIncomes)
    }, [listOrders])

    React.useEffect(() => {

        fetchAllListOrders()
    }, [])

    const handleChangeFilter = (value, option) => {

        setChartFilter(option)
    }

    React.useEffect(() => {

        let dataChart = []

        if (chartFilter.value === "dates") {
            dataChart = getRevenueLast7Days(listAllOrders)
        } else if (chartFilter.value === "months") {
            dataChart = getRevenueLast6Months(listAllOrders)
        } else {
            dataChart = getRevenueLast4Years(listAllOrders)
        }
        console.log(dataChart)
        setData(dataChart)

    }, [chartFilter, listAllOrders])

    return (
        <div className='w-full flex gap-[20px] p-[20px] h-full items-center justify-center'>
            <div className="flex-[2] p-[20px] bg-white shadow-sm rounded-[24px]">
                <div className='p-[20px]'>
                    <p className='text-[13px] mb-[10px] text-[#333] font-[500]'>Lọc theo: </p>
                    <Select onChange={handleChangeFilter} value={chartFilter} options={options} />
                </div>
                <div className='flex flex-col items-center'>
                    <h1 className='text-[1.4rem] mb-[10px] uppercase font-[500] text-[#333]'>Biểu đồ doanh thu</h1>
                    <LineChart width={600} height={300} data={data}>
                        <Line type="monotone" dataKey="income" stroke="#8884d8" />
                        <CartesianGrid stroke="#ccc" />
                        <XAxis dataKey="time" tick={{ fontSize: "13px" }} label={{ fontSize: "13px" }} />
                        <YAxis tickFormatter={formatPrice} tick={{ fontSize: "13px" }} label={{ fontSize: "13px" }} />
                        <Tooltip formatter={formatPrice} fontSize={13} />
                    </LineChart>
                </div>
            </div>
            <div className='flex-[1] h-max p-[20px] bg-white shadow-sm rounded-[24px]'>
                <h1 className='text-[1.4rem] uppercase font-[500] text-[#333]'>Doanh thu</h1>
                <div className='flex flex-col p-[10px]'>
                    <p className='text-[13px] mb-[10px] text-[#333] font-[500]'>Lọc theo: </p>
                    <RangePicker onChange={handleChangeDateFilter} format={"DD/MM/YYYY"} />
                </div>
                <div className='mt-[20px] flex flex-col items-center'>
                    <p className='text-[13px] mb-[10px] text-[#333] font-[500]'>{dateFilter.label}</p>
                    <p className='text-[1.4rem] uppercase font-[500] text-[#333]'>
                        {numeral(incomes).format("0,0")} VNĐ
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard