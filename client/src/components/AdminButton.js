import React, {memo} from 'react'

const AdminButton = ({ children, handleOnClick, style, fw, type= 'button' }) => {
    const a=1;
    return ( 
        <button type={type}
        className={style ? style :` my-2 px-4 py-2 rounded-md text-white bg-main text-semibold ${fw ? 'w-full' : 'w-fit'}`}
        onClick={() => { handleOnClick && handleOnClick()}}
            >
            {children}
        </button>
    )
}

export default memo(AdminButton) 