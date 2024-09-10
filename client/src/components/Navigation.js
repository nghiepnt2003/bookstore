import React from "react"
import {navigation} from '../ultils/contants'
import {NavLink} from 'react-router-dom'


const Navigation = () => {
    return (
        <div className="w-full flex bg-white justify-center">
            <div className="w-main h-[72px] py-2 px-[20px] gap-5 border-t-[3px] border-b-[3px] border-dotted text-sm flex items-center bg-white">
                {navigation.map(el => (
                    <NavLink
                        to={el.path}
                        key={el.id}
                        className= {({isActive}) => isActive ? 'pr-12 font-medium text-main hover:text-main ': 'pr-12 hover:text-main'}
                    >
                        {el.value}
                    </NavLink>
                ))}
            </div>
        </div>
    )
}

export default  Navigation