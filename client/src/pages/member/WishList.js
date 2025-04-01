// import React, { memo } from 'react'
// import { useSelector } from 'react-redux'
// import { Product } from '../../components'

// const Wishlist = () => {
//     const { current } = useSelector(state => state.user)
//     console.log("CR PD " + JSON.stringify(current))
//     return (
//         <div className='w-full relative px-4'>
//             <header className='text-3xl font-semibold py-4 border-b border-main'>
//                 My Wishlist
//             </header>
//             <div className='py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
//                 {current?.wishList?.map((ele) => (
//                     <div key={ele._id}>
//                         <Product
//                             pid={ele._id}
//                             productData={ele}
//                             normal={true}
//                         />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default memo(Wishlist)


import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Product } from '../../components';
import { apiGetWishList } from '../../apis'; // Import API
import { getCurrent } from '../../store/user/asyncActions';

const Wishlist = () => {
    const dispatch = useDispatch();
    const { current } = useSelector(state => state.user);
    const [wishList, setWishList]= useState([])

    const fetchWishlist = async () => {
        const response = await apiGetWishList();
        if (response.success) {
            setWishList(response?.wishList)
            dispatch(getCurrent());
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []); 

    return (
        <div className='w-full relative px-4'>
            <header className='text-3xl font-semibold py-4 border-b border-main'>
                My Wishlist
            </header>
            <div className='py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                {wishList?.map((ele) => (
                    <div key={ele._id}>
                        <Product
                            productData={ele}
                            onWishlistChange= {fetchWishlist}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default memo(Wishlist);