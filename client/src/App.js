import React, {useEffect} from 'react';
import { Route, Routes } from 'react-router-dom'
import { Login, Home, Public, FAQ, Blog, Products, DetailProduct, ResetPassword,Register } from './pages/public'
import path from './ultils/path';
import { getCategories} from './store/app/asyncActions'
import { useDispatch, useSelector } from 'react-redux'
import { Modal } from './components';
import { AdminLayout, ManageProduct, ManageOrder, ManageUser, CreateProduct, Dashboard } from './pages/admin';
import { MemberLayout, Personal } from './pages/member';

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
        <Route path={path.PUBLIC} element={<Public />}>
          <Route path={path.HOME} element={<Home />}></Route>
          <Route path={path.FAQ} element={<FAQ />}></Route>
          <Route path={path.BLOG} element={<Blog />}></Route>
          <Route path={path.PRODUCTS} element={<Products />}></Route>
          <Route path={path.DETAIL_PRODUCT__PID__TITLE} element={<DetailProduct />}></Route>
          <Route path={path.RESET_PASSWORD} element={<ResetPassword />}></Route>
          <Route path={path.ALL} element={<Home />}></Route>
        </Route>
        <Route path={path.ADMIN} element={<AdminLayout />}>
          <Route path={path.DASHBOARD} element={<Dashboard />} />
          <Route path={path.MANAGE_ORDER} element={<ManageOrder />} />
          <Route path={path.MANAGE_PRODUCT} element={<ManageProduct />} />
          <Route path={path.MANAGE_USER} element={<ManageUser />} />
          <Route path={path.CREATE_PRODUCT} element={<CreateProduct />} />
        </Route>
        <Route path={path.MEMBER} element={<MemberLayout />}>
          <Route path={path.PERSONAL} element={<Personal />} />
        </Route>
        <Route path={path.LOGIN} element={<Login />}></Route>
      </Routes>
    </div>
  );
}

export default App;
