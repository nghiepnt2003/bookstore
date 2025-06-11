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
    // {
    //     id: 4,
    //     value: 'CONTACT',
    //     path: `/${path.CONTACT}`
    // },

]

const {FaShieldHalved , FaGift, FaTruckFast, FaTty,FaReplyAll, IoFlashSharp, FaFacebookMessenger} = icons
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

export const voteOptions = [
    {
        id: 1,
        text: 'Terrible'
    },
    {
        id: 2,
        text: 'Bad'
    },
    {
        id: 3,
        text: 'Neutral'
    },
    {
        id: 4,
        text: 'Good'
    },
    {
        id: 5,
        text: 'Perfect'
    },

]

const { AiOutlineDashboard, MdGroups, TbBrandProducthunt, RiBillLine, MdOutlineCategory, ImProfile, BiCategoryAlt, GrContactInfo, FaStoreAlt } = icons
export const adminSidebar = [
    {
        id: 1,
        text: 'Dashboard',
        path: `/${path.ADMIN}/${path.DASHBOARD}`,
        icon: <AiOutlineDashboard />
    },
    {
        id: 2,
        text: 'Quản lý tài khoản',
        path: `/${path.ADMIN}/${path.MANAGE_USER}`,
        icon: <MdGroups />
    },
    {
        id: 3,
        text: 'Quản lý danh mục',
        path: `/${path.ADMIN}/${path.MANAGE_CATEGORY}`,
        icon: <BiCategoryAlt />
    },
    {
        id: 4,
        text: 'Thông tin tác giả',
        path: `/${path.ADMIN}/${path.MANAGE_INFO_AUTHOR}`,
        icon: <GrContactInfo  />
    },
    {
        id: 5,
        text: 'Thông tin nhà xuất bản',
        path: `/${path.ADMIN}/${path.MANAGE_INFO_PUBLISHER}`,
        icon: <ImProfile />
    },
    {
        id: 6,
        text: 'Quản lý sản phẩm',
        path: `/${path.ADMIN}/${path.MANAGE_PRODUCT}`,
        icon: <TbBrandProducthunt />,
    },
    {
        id: 7,
        text: 'Quản lý kho hàng',
        path: `/${path.ADMIN}/${path.MANAGE_STORE}`,
        icon: <FaStoreAlt />,
    },
    {
        id: 8,
        text: 'Quản lý đơn hàng',
        path: `/${path.ADMIN}/${path.MANAGE_ORDER}`,
        icon: <RiBillLine />
    },
    {
        id: 9,
        text: 'Thắc mắc của khách hàng',
        path: `/${path.ADMIN}/${path.MESSENGER}`,
        icon: <FaFacebookMessenger />
    },
    {
        id: 10,
        text: 'Flashsale',
        path: `/${path.ADMIN}/${path.FLASHSALE}`,
        icon: <IoFlashSharp />
    }
]

export const memberSidebar = [
    {
        id: 1,
        type: 'single',
        text: 'Thông tin cá nhân',
        path: `/${path.MEMBER}/${path.PERSONAL}`,
        icon: <AiOutlineDashboard />
    },
    {
        id: 2,
        type: 'single',
        text: 'Giỏ hàng của tôi',
        path: `/${path.MEMBER}/${path.MY_CART}`,
        icon: <MdGroups />
    },
    {
        id: 3,
        type: 'single',
        text: 'Lịch sử mua hàng',
        path: `/${path.MEMBER}/${path.HISTORY}`,
        icon: <RiBillLine />
    },
    {
        id: 4,
        type: 'single',
        text: 'Danh sách yêu thích',
        path: `/${path.MEMBER}/${path.WISHLIST}`,
        icon: <RiBillLine />
    }
]

export const cash = "OFFLINE"
export const paypal = "Paypal"