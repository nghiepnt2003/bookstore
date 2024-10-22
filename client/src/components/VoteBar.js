import React, { useEffect, useRef } from 'react'
import { AiFillStar } from 'react-icons/ai'

const VoteBar = ({ number, ratingCount, ratingTotal }) => {
  const percentRef = useRef()
  useEffect(() => {
    const percent = Math.round(ratingCount * 100 / ratingTotal) || 0
    percentRef.current.style.cssText = `right: ${100 - percent}%`
  }, [ratingCount, ratingTotal])
  return (
    <div className='flex container items-center gap-3 text-gray-600 p-2'>
      <div className='flex items-center justify-center gap-1 text-lg'>
        <span>{number}</span>
        <AiFillStar color='orange' size={20} />
      </div>
      <div className='flex-grow'>
        <div className='w-full h-2 relative bg-gray-300 rounded-l-full rounded-full'>
          <div ref={percentRef} className='absolute inset-y-0 left-0 bg-red-500 rounded-full'></div>
        </div>
      </div>
      <div className='w-[15%] flex justify-end text-xs text-400'>
        {`${ratingCount || 0} đánh giá`}
      </div>
    </div>
  )
}

export default VoteBar