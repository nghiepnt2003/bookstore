import path from './path'
import icons from './icons'

export const navigation = [
    {
        id: 1,
        value: 'HOME',
        path: `/${path.HOME}`
    },
    {
        id: 2,
        value: 'PRODUCTS',
        path: `/${path.PRODUCTS}`
    },
    {
        id: 3,
        value: 'BLOG',
        path: `/${path.BLOG}`
    },
    {
        id: 4,
        value: 'CONTACT',
        path: `/${path.CONTACT}`
    },

]

const {FaShieldHalved , FaGift, FaTruckFast, FaTty,FaReplyAll} = icons
export const productExtraInfomation = [
    {
        id: 1,
        title: 'Guarantee',
        sub: 'Quantity Checked',
        icon: <FaShieldHalved />
    },
    {
        id: 2,
        title: 'Free Shipping',
        sub: 'Free On All Products',
        icon: <FaTruckFast />
    },
    {
        id: 3,
        title: 'Special Gift Cards',
        sub: 'Special Gift Cards',
        icon: <FaGift />
    },
    {
        id: 4,
        title: 'Free Return',
        sub: 'within 7 Days',
        icon: <FaReplyAll />
    },
    {
        id: 5,
        title: 'Consultancy',
        sub: 'Lifetime 24/7/356',
        icon: <FaTty />
    }
]


export const sorts = [
    {
        id: 1,
        value: '-soldCount',
        text: 'Best selling'
    },
    {
        id: 2,
        value: '-createdAt',
        text: 'New Product'
    },
    {
        id: 3,
        value: '-averageRating',
        text: 'Featured'
    },
]