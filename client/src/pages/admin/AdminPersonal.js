import React, { useEffect, useState } from 'react';
import { ButtonAdmin } from '../../components';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { apiUpdateUser1, apiChangePassword } from '../../apis';
import { getCurrent } from '../../store/user/asyncActions';
import { toast } from 'react-toastify';
import { Dialog } from '@mui/material';
import { Button, Checkbox } from 'antd';
import { CameraOutlined } from '@ant-design/icons'; // Import biểu tượng camera
import { useNavigate } from "react-router-dom"; 
import path from '../../ultils/path';

const AdminPersonal = () => {
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const [avatar, setAvatar] = useState(null);
    const [formData, setFormData] = useState({
        fullname: '',
        phone: '',
        address: '',
        birthday: '',
    });
    const [errors, setErrors] = useState({});
    const { current } = useSelector(state => state.user);
    const [showDialog, setShowDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isShowPassword, setIsShowPassword] = useState(false);

    const dispatch = useDispatch();

    const handleResetPassword = async () => {
        if (password && newPassword) {
            const response = await apiChangePassword({ currentPassword: password, newPassword });
            if (response.success) {
                toast.success(response.mess);
                setShowDialog(false);
            } else {
                toast.error(response.mess);
            }
        } else {
            if (!password) setErrors(prev => ({ ...prev, password: "Vui lòng nhập mật khẩu hiện tại" }));
            if (!newPassword) setErrors(prev => ({ ...prev, newPassword: "Vui lòng nhập mật khẩu mới" }));
        }
    };

    return (
        <div className='w-full relative px-4'>
            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <div className='w-[500px] p-[20px]'>
                    <div className='flex flex-col gap-4'>
                        <label htmlFor="currentPassword">Vui lòng nhập mật khẩu</label>
                        <input
                            type={isShowPassword ? "text" : "password"}
                            id="currentPassword"
                            className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
                            placeholder='Mật khẩu hiện tại'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <p className='text-red-500 mt-[4px]'>{errors.password}</p>
                        <input
                            type={isShowPassword ? "text" : "password"}
                            id="newPassword"
                            className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
                            placeholder='Mật khẩu mới'
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <p className='text-red-500 mt-[4px]'>{errors.newPassword}</p>
                    </div>
                    <div className='mt-2 flex justify-end w-full'>
                        <Checkbox checked={isShowPassword} onChange={() => setIsShowPassword(prev => !prev)}>
                            Show
                        </Checkbox>
                    </div>
                    <div className='flex items-center justify-end z-10 mt-4 w-full gap-4'>
                        <Button
                            disabled={Object.keys(errors).length > 0}
                            onClick={handleResetPassword}
                        >
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </Dialog>

            <header className='text-3xl font-semibold py-4 border-b border-b-main'>
                Thông tin cá nhân
            </header>
            <div className='flex justify-center w-main'>
                <div>

                </div>
                <form className='mx-auto py-8 flex flex-col gap-4'>
                    <div className='flex justify-between'>
                        {/* Column for Labels */}
                        <div className='flex flex-col w-1/2'>
                            <div className='flex'>
                                <label className='font-medium'>Tên:</label>
                                <span className='text-main'> {current?.fullname}</span>
                            </div>
                            <div className='flex'>
                                <label className='font-medium'>Địa chỉ của bạn:</label>
                                <span className='text-main'>{current?.address}</span>                          
                            </div>
                            <div className='flex'>
                                <label className='font-medium'>Số điện thoại:</label>
                                <span className='text-main'>{current?.phone}</span>
                            </div>
                            <div className='flex'>
                                <label className='font-medium'>Email:</label>
                                <span className='text-main'>{current?.email}</span>
                            </div>
                            <div className='flex'>
                                <label className='font-medium'>Ngày tạo:</label>
                                <span className='text-main'>{moment(current?.createdAt).format('DD/MM/YYYY')}</span>
                            </div>
                        </div>
                    </div>
                    <div className='w-[120px] h-[40px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={() => setShowDialog(true)}>Đổi mật khẩu</div>
                </form>
            </div>
        </div>
    );
};

export default AdminPersonal;