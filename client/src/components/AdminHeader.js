import React, { memo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import path from '../ultils/path';
import { getCurrent } from '../store/user/asyncActions';
import { useDispatch, useSelector } from 'react-redux';
import icons from '../ultils/icons';
import { logout } from '../store/user/userSlice';

const { AiOutlineLogout } = icons;

const AdminHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, current, isLoading } = useSelector(state => state.user);

  useEffect(() => {
    if (isLoggedIn && isLoading === true) {
      dispatch(getCurrent());
    }
  }, [dispatch, isLoggedIn]);

  return (
    <div className='h-[50px] w-full bg-main flex items-center justify-between text-white text-[0.95rem] shadow-sm sticky top-0 z-10'>
      {/* <div className='flex items-center justify-between text-main text-[1rem]'> */}
        <span className='ml-4'>SunShine - Một cuốn sách là một giấc mơ bạn cầm trong tay!</span>
        {isLoggedIn ? (
          <div className='flex items-center'>
            <span className='mr-2'>{`Welcome, ${current?.fullname}`}</span>
            <span 
              onClick={() => dispatch(logout())}
              className='hover:rounded-full hover:bg-gray-200 cursor-pointer hover:text-main mr-4'
            >
              <AiOutlineLogout size={20} />
            </span>
          </div>
        ) : (
          <Link to={`/${path.LOGIN}`} className='hover:text-gray-200 pr-[30px]'>Sign In</Link>
        )}
      </div>
    // </div>
  );
}

export default memo(AdminHeader);