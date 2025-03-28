const path = {
    PUBLIC: '/',
    HOME: '',
    ALL: '*',
    LOGIN: 'login',
    PRODUCTS: 'product/:category',
    BLOG: 'blog',
    CONTACT: 'contact',
    DETAIL_PRODUCT__PID__TITLE: 'san-pham/:id/:name',
    DETAIL_PRODUCT: 'san-pham',
    FAQ: 'faqs',
    RESET_PASSWORD: 'reset-password/:token',
    SENDOTP: 'send-otp',
    CHECKOUT: 'checkout',


    //Admin
    ADMIN: 'admin',
    DASHBOARD: 'dashboard',
    MANAGE_USER: 'manage-user',
    MANAGE_PRODUCT: 'manage-product',
    MANAGE_ORDER: 'manage-order',
    MANAGE_CATEGORY: 'manage-category',
    MANAGE_INFO_AUTHOR: 'manage-info-author',
    MANAGE_INFO_PUBLISHER: 'manage-info-publisher',
    MANAGE_STORE:'manage-store',
    MESSENGER: 'messenger',
    FLASHSALE: 'flashsale',

    // member
    MEMBER: 'member',
    PERSONAL: 'personal',
    MY_CART: 'my-cart',
    HISTORY: 'buy-history',
    PAYMENT: '/member/payment/:oid',
    WISHLIST: 'wishlist',


    LOGIN_GG: 'callback',
    MOMO: 'momo'
}

export default path