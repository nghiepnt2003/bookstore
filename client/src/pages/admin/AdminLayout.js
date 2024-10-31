// import React from 'react'
// import { Outlet, Navigate } from 'react-router-dom'
// import path from '../../ultils/path'
// import { useSelector } from 'react-redux'
// import { AdminSidebar, AdminHeader } from '../../components'

// const AdminLayout = () => {
//   const { isLoggedIn, current} = useSelector(state => state.user)
//   if (!isLoggedIn || !current || +current.role!==1) return <Navigate to={`/${path.LOGIN}`} replace={true} />

//     return (
//         <div className='flex w-full bg-gray-100 min-h-screen relative text-gray-900'>
//             <div className='w-[327px] top-0 bottom-0 flex-none fixed'>
//                 <AdminSidebar />
//             </div>
//             {/* <div className='w-[327px]'></div>
//             <div className='flex-1 overflow-x-scroll'>
//                 <Outlet />
//             </div> */}
//             <div className='flex-1 overflow-x-scroll ml-[327px]'>
//                 <AdminHeader /> {/* Thêm AdminHeader ở đây */}
//                 <div className='p-4'> {/* Thêm padding cho nội dung bên dưới header */}
//                 <Outlet />
//             </div>
//       </div>
//         </div>
//     )
// }

// export default AdminLayout

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import path from '../../ultils/path';
import { useSelector } from 'react-redux';
import { AdminSidebar, AdminHeader } from '../../components';

const AdminLayout = () => {
  const { isLoggedIn, current } = useSelector(state => state.user);
  
  if (!isLoggedIn || !current || +current.role !== 1) {
    return <Navigate to={`/${path.LOGIN}`} replace={true} />;
  }

  return (
    <div className='flex flex-col w-full bg-gray-100 min-h-screen relative text-gray-900'>
      <AdminHeader className="w-full top-0 bottom-0 flex-none fixed" /> {/* Header chiếm toàn bộ chiều rộng */}
      <div className='flex flex-1'>
        <div className='w-[327px] top-[50px] bottom-0 flex-none fixed'>
          <AdminSidebar />
        </div>
        <div className='flex-1 overflow-x-scroll ml-[327px] p-4'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;