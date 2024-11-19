import React,{memo, Fragment, useState} from 'react'
import logo from '../../src/assets/logokonen.png'
import { adminSidebar } from '../ultils/contants'
import { Link, NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { AiOutlineDown} from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { logout } from '../store/user/userSlice'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'

const activedStyle = 'px-4 py-2 flex items-center gap-2 bg-main rounded text-white hover: transition-transform duration-200 ease-in-out transform hover:translate-y-[-2px]'
const notActivedStyle = 'px-4 py-2 flex items-center gap-2 hover:bg-pink-200 rounded transition-transform duration-200 ease-in-out transform hover:translate-y-[-2px]'

const AdminSidebar = () => {
    const dispatch = useDispatch()
    const [actived, setActived] = useState([])
    const handleShowTabs = (tabID) => {
        if(actived.some(el => el === tabID)) setActived(prev => prev.filter(el => el !== tabID))
        else setActived(prev => [...prev, tabID])
    }
    return (
        <div className='bg-[#ffe8f4] h-full py-4 shadow'>
            <div className='flex flex-col p-4 justify-center gap-2 items-center cursor-pointer'>
            <img src={logo} alt='logo' className='w-[200px] object-contain bg-none'></img>
            </div>
            <div>
                {adminSidebar.map(el => (
                   <Fragment key={el.id}>
                    <NavLink 
                    to={el.path}
                    className={({isActive}) => clsx(isActive && activedStyle, !isActive && notActivedStyle)}
                    >
                        <span>{el.icon}</span>
                        <span>{el.text}</span>
                    </NavLink>
                   </Fragment>
                ))}
            </div>
        </div>
    )
}

export default memo(AdminSidebar) 