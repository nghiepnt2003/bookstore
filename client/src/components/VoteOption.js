import React, { memo, useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.png'
import { voteOptions } from '../ultils/contants'
import { AiFillStar } from 'react-icons/ai'
import Button from './Button'

const VoteOption = ({ productName, handleSubmitVoteOption }) => {
    const modalRef = useRef()
    const [chooseStar, setChooseStar] = useState(null)
    const [comment, setComment] = useState('')
    const [star, setStar] = useState('')
    useEffect(() => {
        modalRef.current.scrollIntoView({ block: 'center' })
    })
    return (
        <div onClick={e => e.stopPropagation()} ref={modalRef} className='bg-white w-[700px] p-4 flex-col gap-4 flex items-center justify-center'>
            <img src={logo} alt="logo" className='w-[300px] my-8 object-contain' />
            <h2 className='text-center text-medium text-lg'>{`Đánh giá sản phẩm ${productName}`}</h2>
            <textarea className='form-textarea w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 placeholder:italic placeholder:text-sm'
                placeholder='Thêm bình luận của bạn'
                value={comment}
                onChange={e => setComment(e.target.value)}
            ></textarea>
            <div className='w-full flex flex-col gap-4'>
                <p className='text-lg font-medium mb-2'>Bạn thấy sản phẩm thế nào?</p>
                <div className='flex items-center justify-center gap-3'>
                    {voteOptions.map(el => (
                        <div className='w-20 h-20 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-md p-2 flex flex-col items-center justify-center gap-1'
                            key={el.id} onClick={() =>
                                setChooseStar(el.id)
                            }
                        > {(Number(chooseStar) && chooseStar >= el.id) ? <AiFillStar color='orange' /> : <AiFillStar color='gray' />}
                            <span className='text-sm'>{el.text}</span>
                        </div>
                    ))}
                </div>
            </div>
            <Button fw name='Gửi' handleOnClick={() => handleSubmitVoteOption({ comment, star: chooseStar })}></Button>
        </div>
    )
}

export default memo(VoteOption)