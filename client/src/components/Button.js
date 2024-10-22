import React, { memo } from 'react'

const Button = ({name, handleOnClick, style, iconsBefore, iconAfter, fw }) => {
  return (
    <button
        type='button'
        className={style? style: `px-4 py-2 rounded-md text-white bg-main text-semibold my-2 ${fw? 'w-full' : 'w-fit'} hover:bg-opacity-80 transition`}
        onClick={() => {handleOnClick && handleOnClick()}}
    >
        {iconsBefore}
        <span>{name}</span>
        {iconAfter}
    </button>
  )
}

export default memo(Button)
