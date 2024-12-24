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
    // ADMINPERSONAL: 'adminpersonal',

    // member
    MEMBER: 'member',
    PERSONAL: 'personal',
    MY_CART: 'my-cart',
    HISTORY: 'buy-history',


    LOGIN_GG: 'callback',

}

export default path