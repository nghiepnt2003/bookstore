import React, { memo } from 'react'
import avatar from '../assets/avatar.jpg'
import moment from 'moment'
import { renderStarFromNumber } from '../ultils/helpers'

const Comment = ({ image = avatar, name = 'Anonymous', updatedAt, star, comment }) => {
  return (
    <div className='flex gap-3 p-2 hover:bg-gray-50 transition-colors duration-150 rounded-lg'>
      <div className='flex-none'>
        <img src={image} alt="avatar" className='w-10 h-10 object-cover rounded-full shadow-sm' />
      </div>
      <div className='flex flex-col flex-1 min-w-0'>
        <div className='flex justify-between items-center'>
          <h3 className='font-semibold text-md truncate'>{name}</h3>
          <span className='text-xs text-gray-500'>{moment(updatedAt)?.fromNow()}</span>
        </div>
        <div className='flex flex-col gap-2 pl-4 text-sm mt-4 border border-gray-300 py-2 bg-gray-100'>
          <span className='flex items-center text-sm mb-1'>
            <span className='font-semibold'>Đánh giá:</span>
            <span className='flex items-center ml-2'>{renderStarFromNumber(star)?.map((el, index) => (
              <span key={index}>{el}</span>
            ))}</span>
          </span>
          <span className='flex gap-1'>
            <span className='font-medium'>Bình luận:</span>
            <span className='flex items-center gap-1'>{comment}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(Comment)