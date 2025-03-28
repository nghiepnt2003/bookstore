import React, {useEffect} from 'react';
import { Route, Routes } from 'react-router-dom'
import { Login, Home, Public, FAQ, Blog, Products, DetailProduct, ResetPassword , Payment} from './pages/public'
import path from './ultils/path';
import { getCategories} from './store/app/asyncActions'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, CallbackComponent, MoMoPayment } from './components';
import { AdminLayout, ManageProduct, ManageOrder, ManageUser, Dashboard, ManageCategory, ManageAuthor, AdminPersonal, ManagePublisher, ManageStore, Messenger, Flashsale } from './pages/admin';
import { MemberLayout, Personal, History, MyCart, Checkout } from './pages/member';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MoMotSuccessPage from './pages/public/MoMoSuccessPage';
import WishList from './pages/member/WishList';

function App() {
  const dispatch = useDispatch();
  const {isShowModal, modalChildren} = useSelector(state => state.app)
  useEffect(() => {
    dispatch(getCategories());
  }, []);  

  return (
    <div className="font-main bg-[#f8f8f8] relative">
    {isShowModal && <Modal>{modalChildren}</Modal>}
      <Routes>
        <Route path={path.CHECKOUT} element={<Checkout />} />
        <Route path={path.PUBLIC} element={<Public />}>
          <Route path={path.HOME} element={<Home />}></Route>
          <Route path={path.FAQ} element={<FAQ />}></Route>
          <Route path={path.BLOG} element={<Blog />}></Route>
          <Route path={path.PRODUCTS} element={<Products />}></Route>
          <Route path={path.RESET_PASSWORD} element={<ResetPassword />}></Route>
          <Route path={path.DETAIL_PRODUCT__PID__TITLE} element={<DetailProduct />}></Route>
          <Route path={path.LOGIN_GG} element={<CallbackComponent />} />
          <Route path={path.ALL} element={<Home />}></Route>
        </Route>
        <Route path={path.ADMIN} element={<AdminLayout />}>
          <Route path={path.DASHBOARD} element={<Dashboard />} />
          <Route path={path.MANAGE_ORDER} element={<ManageOrder />} />
          <Route path={path.MANAGE_CATEGORY} element={<ManageCategory />} />
          <Route path={path.MANAGE_PRODUCT} element={<ManageProduct />} />
          <Route path={path.MANAGE_USER} element={<ManageUser />} />
          <Route path={path.MANAGE_INFO_AUTHOR} element={<ManageAuthor />} />
          <Route path={path.MANAGE_INFO_PUBLISHER} element={<ManagePublisher />} />
          {/* <Route path={path.ADMINPERSONAL} element={<AdminPersonal />} /> */}
          <Route path={path.MESSENGER} element={<Messenger />} />
          <Route path={path.FLASHSALE} element={<Flashsale />} />
          <Route path={path.MANAGE_STORE} element={<ManageStore />} />
          <Route path={path.ALL} element={<Dashboard />}></Route>
        </Route>
        <Route path={path.MEMBER} element={<MemberLayout />}>
          <Route path={path.PERSONAL} element={<Personal />} />
          <Route path={path.MY_CART} element={<MyCart />} />
          <Route path={path.HISTORY} element={<History />} />
          <Route path={path.WISHLIST} element={<WishList />} />
        </Route>
        <Route path={path.LOGIN} element={<Login />}></Route>
        <Route path={path.MOMO} element={<MoMotSuccessPage />}></Route>
        <Route path={path.PAYMENT} element={<Payment />} />
      </Routes>
      <ToastContainer
        limit={1}
        position="top-right" // Vị trí của toast
        autoClose={5000} // Thời gian tự động đóng (ms)
        hideProgressBar={false} // Ẩn thanh tiến độ
        newestOnTop={false} // Toast mới nhất sẽ ở trên cùng
        closeOnClick // Đóng khi nhấp chuột vào toast
        rtl={false} // Hỗ trợ ngôn ngữ RTL
        pauseOnFocusLoss // Tạm dừng khi mất tiêu điểm
        draggable // Cho phép kéo thả
        pauseOnHover // Tạm dừng khi hover chuột
      />
    </div>
  );
}

export default App;
