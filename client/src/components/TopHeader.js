import React, { memo , useEffect} from 'react'
import { Link} from 'react-router-dom'
import path from '../ultils/path'
import { getCurrent } from '../store/user/asyncActions'
import { useDispatch, useSelector } from 'react-redux'
import icons from '../ultils/icons'
import { logout } from '../store/user/userSlice'

const { AiOutlineLogout} = icons

const TopHeader = () => {
  const dispatch = useDispatch()
  const {isLoggedIn, current, isLoading} = useSelector(state => state.user)
  useEffect(() => {
    if(isLoggedIn && isLoading==true)
        dispatch(getCurrent())
    
  }, [dispatch, isLoggedIn])
  return (
    <div className='h-[38px] w-full bg-[#f73995] flex items-center justify-center'>
        <div className='w-main flex items-center justify-between text-white text-[0.9rem]'>
            <span>ODER ONLINE OR CALL US (+1450) 056 7077</span>
            {isLoggedIn 
              ? <div className='flex items-center'>
                  <span className='mr-2'>{`Wellcome, ${current?.fullname}`}</span>
                  <span 
                    onClick={() => dispatch(logout())}
                    className='hover:rounded-full hover:bg-gray-200 cursor-pointer hover:text-main p-2'
                  >
                    <AiOutlineLogout  size={18}/>
                  </span>
                </div>
              : <Link to = {`/${path.LOGIN}`} className='hover:text-gray-800'>Sign In or Create Account</Link>
            }
        </div>
    </div>
  )
}

export default memo(TopHeader)
