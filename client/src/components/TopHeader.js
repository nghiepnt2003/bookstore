import React, { memo } from 'react'
import { Link} from 'react-router-dom'
import path from '../ultils/path'

const TopHeader = () => {
  return (
    <div className='h-[38px] w-full bg-[#f73995] flex items-center justify-center'>
        <div className='w-main flex items-center justify-between text-white text-[0.9rem]'>
            <span>ODER ONLINE OR CALL US (+1450) 056 7077</span>
            <Link to = {`/${path.LOGIN}`} className='hover:text-gray-800'>Sign In or Create Account</Link>
        </div>
    </div>
  )
}

export default memo(TopHeader)
