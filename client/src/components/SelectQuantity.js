import React, { memo } from 'react'

const SelectQuantity = ({quantity, handleQuantity,handleChangeQuantity}) => {
  return (
    <div className='flex items-center'>
        <span onClick={() => handleChangeQuantity('minus')} className='p-2 border-r cursor-pointer border-black'>-</span>
        <input
            className='py-2 outline-none w-[50px] text-center'
            type='text'
            value={quantity}
            onChange={e => handleQuantity(e.target.value)}
        />
        <span onClick={() => handleChangeQuantity('plus')} className='p-2 border-l cursor-pointer border-black'>+</span>
    </div>
  )
}

export default memo(SelectQuantity)
