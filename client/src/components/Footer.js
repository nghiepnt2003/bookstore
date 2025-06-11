import React, { memo } from 'react'
import Logo from '../assets/logo.png'
import icons from '../ultils/icons'

const Footer = () => {

    const { FaPhone, FaLocationDot, MdOutlineEmail, FaCheck, FaArrowRightArrowLeft, MdSupportAgent, FaTruckFast, FaFacebookSquare, FaInstagram, FaTiktok, FaMale, FaFemale } = icons
    
    return (
        <div className='w-full bg-white flex justify-center mb-10px border-t-[6px] border-solid border-main'>
                <div className='w-main h-[236px] flex justify-between '>
                    <div class="flex-none w-2/5">
                        <img  className='w-[182px] h-[80px] mt-2' src={Logo} alt='Logo'/>
                        <p className="italic text-[0.8rem] mb-2 mt-1">Một cuốn sách là một giấc mơ bạn cầm trong tay!</p>
                        <div className='flex items-center mt-3 text-[0.9rem]'>
                            <FaLocationDot className='mr-2 text-main'/>
                            Số 01 Võ Văn Ngân - Linh Chiểu - Thủ Đức - Hồ Chí Minh
                        </div>
                        <div className='flex items-center mt-3  text-[0.9rem]'>
                            <MdOutlineEmail className='mr-2 text-main'/>
                            support@example.com
                        </div>
                        <div className='flex items-center mt-3  text-[0.9rem]'>
                            <FaPhone className='mr-2 text-main'/>
                            035 - 793 - 3895
                        </div>
                    </div>
                    <div class="flex-none w-1/5 mt-4 mb-2 ml-10">
                        <p className='text-[1rem] font-bold text-[#333] mb-6 mt-6'>ABOUT US</p>
                        <div className='flex items-center text-[0.9rem]'>
                           <FaCheck className='mr-2 text-main'/>
                            Quality Product
                        </div>
                        <div className='flex items-center text-[0.9rem] mt-3'>
                           <FaTruckFast className='mr-2 text-main'/>
                            Free Shipping
                        </div>
                        <div className='flex items-center text-[0.9rem] mt-3'>
                            <FaArrowRightArrowLeft className='mr-2 text-main' />
                            14-Day Return
                        </div>
                        <div className='flex items-center text-[0.9rem] mt-3'>
                           <MdSupportAgent className='mr-2 text-main'/>
                            24/7 Support
                        </div>
                    </div>
                    <div class="flex-none w-1/5 mt-4 mb-2 ml-10">
                    <p className='text-[1rem] font-bold text-[#333] mb-6 mt-6'>SOCIAL</p>
                        <div className='flex items-center text-[0.9rem]'>
                           <FaFacebookSquare className='mr-2 text-main'/>
                           SunShine Book Store
                        </div>
                        <div className='flex items-center text-[0.9rem] mt-3'>
                           <FaInstagram className='mr-2 text-main'/>
                           BookStore_SunShine
                        </div>
                        <div className='flex items-center  text-[0.9rem] mt-3'>
                            <FaTiktok className='mr-2 text-main'/>
                            ID: ShunShine01BS
                        </div>
                    </div>
                    <div class="flex-none w-1/5 mt-4 mb-2 ml-10">
                    <p className='text-[1rem] font-bold text-[#333] mb-6 mt-6'>FOUNDERS</p>
                        <div className='flex items-center text-[0.9rem] mt-3'>
                           <FaMale className='mr-2 text-main'/>
                           Thành Nghiệp
                        </div>
                        <div className='flex items-center text-[0.9rem] mt-3'>
                           <FaFemale  className='mr-2 text-main'/>
                           Ánh Nguyệt
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default memo(Footer)
