import React from "react";
import { NavLink } from "react-router-dom";
import { createSlug } from '../ultils/helpers';
import { useSelector } from "react-redux";

const Sidebar = () => {
    const { categories } = useSelector(state => state.app);
    
    return (
        <div className="flex flex-col border min-h-[360px] shadow-custom p-4 bg-[#fff] h-[360px] overflow-y-auto">
            {categories?.map(el => (
                <NavLink
                    key={createSlug(el.name)}
                    to={`product/${createSlug(el.name)}`}
                    className={({ isActive }) => 
                        isActive 
                            ? 'bg-main text-white px-5 pt-[15px] pb-[14px] text-base hover:text-main' 
                            : 'px-5 pt-[15px] pb-[14px] text-base hover:text-main'
                    }
                >
                    {el.name}
                </NavLink>
            ))}
        </div>
    );
};

export default Sidebar;