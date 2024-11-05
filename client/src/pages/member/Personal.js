// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import moment from 'moment';
// import { Dialog, Button } from '@mui/material';
// import { apiChangePassword, apiUpdateUser1 } from '../../apis';
// import { getCurrent } from '../../store/user/asyncActions';

// const Personal = () => {
//     const [avatar, setAvatar] = useState(null);
//     const [showDialog, setShowDialog] = useState(false);
//     const [password, setPassword] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [error, setError] = useState({});
//     const [addresses, setAddresses] = useState(['']); // Khởi tạo với một ô input địa chỉ
//     const dispatch = useDispatch();
//     const { current } = useSelector(state => state.user);

//     useEffect(() => {
//         dispatch(getCurrent());
//     }, [dispatch]);

//     useEffect(() => {
//         resetForm();
//     }, [current]);

//     const resetForm = () => {
//         if (current) {
//             setAddresses(current.address.length > 0 ? current.address : ['']); // Giữ lại ít nhất một ô
//             setName(current.fullname || '');
//             setPhone(current.phone || '');
//             setBirthday(current.birthday ? moment(current.birthday).format('YYYY-MM-DD') : '');
//         }
//     };

//     const [name, setName] = useState(current?.fullname || '');
//     const [phone, setPhone] = useState(current?.phone || '');
//     const [birthday, setBirthday] = useState(current?.birthday ? moment(current.birthday).format('YYYY-MM-DD') : '');

//     const handleAddressChange = (index, value) => {
//         const updatedAddresses = [...addresses];
//         updatedAddresses[index] = value;
//         setAddresses(updatedAddresses);
//     };

//     const handleAddAddress = () => {
//         setAddresses([...addresses, '']); // Thêm một địa chỉ trống
//     };

//     const handleRemoveAddress = (index) => {
//         const updatedAddresses = addresses.filter((_, i) => i !== index);
//         setAddresses(updatedAddresses);
//     };

//     const handleResetPassword = async () => {
//         if (!password) {
//             setError(prev => ({ ...prev, password: "Vui lòng nhập mật khẩu hiện tại" }));
//             return;
//         }
//         if (!newPassword) {
//             setError(prev => ({ ...prev, newPassword: "Vui lòng nhập mật khẩu mới" }));
//             return;
//         }

//         const response = await apiChangePassword({ currentPassword: password, newPassword });
//         toast[response.success ? 'success' : 'error'](response.mess);
//         if (response.success) setShowDialog(false);
//     };

//     const handleUpdateInfo = async () => {
//         const formData = new FormData();
//         if (avatar) formData.append('avatar', avatar);
//         formData.append('name', name);
//         formData.append('phone', phone);
//         addresses.forEach((addr, index) => {
//             formData.append(`address[${index}]`, addr);
//         });
//         formData.append('birthday', birthday);

//         const response = await apiUpdateUser1(formData);
//         toast[response.success ? 'success' : 'error'](response.success ? 'Cập nhật thông tin thành công' : 'Cập nhật thất bại');
//         if (response.success) {
//             dispatch(getCurrent()); // Cập nhật lại thông tin sau khi sửa
//         }
//     };

//     const handleChooseImage = (e) => {
//         const file = e.target.files[0];
//         file.preview = URL.createObjectURL(file);
//         setAvatar(file);
//     };

//     return (
//         <div className='w-full relative p-4'>
//             <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
//                 {/* Nội dung Dialog */}
//             </Dialog>
//             <header className='text-3xl font-semibold py-4 border-b border-b-main'>
//                 Thông tin cá nhân
//             </header>
//             <div className='flex justify-between mt-4'>
//                 <div className='w-1/2 pr-4'>
//                     <h2 className='text-xl font-semibold'>Thông tin hiện tại</h2>
//                     <div className='flex flex-col gap-2 mt-4'>
//                         <div>
//                             <span className='font-medium'>Tên:</span>
//                             <span className='text-main'>{current?.fullname}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium'>Số điện thoại:</span>
//                             <span className='text-main'>{current?.phone}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium'>Ngày sinh:</span>
//                             <span className='text-main'>{moment(current?.birthday).format('DD/MM/YYYY')}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium'>Email:</span>
//                             <span className='text-main'>{current?.email}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium'>Trạng thái tài khoản:</span>
//                             <span className='text-main'>{current?.isBlocked ? 'Đã hoạt động' : 'Đã khóa'}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium'>Quyền:</span>
//                             <span className='text-main'>{current?.role === 2 ? 'user' : 'admin'}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium'>Ngày tạo tài khoản:</span>
//                             <span className='text-main'>{moment(current?.createdAt).format('DD/MM/YYYY')}</span>
//                         </div>
//                         <div className='flex flex-col gap-2 mt-4'>
//                             <label className='font-semibold' htmlFor='images'>Tải ảnh lên</label>
//                             <input type='file' id='images' onChange={handleChooseImage} />
//                             <img className='h-[150px] w-[150px]' src={avatar ? avatar.preview : current.avatar || 'https://api.multiavatar.com/default.png'} alt="Avatar preview" />
//                         </div>
//                     </div>
//                 </div>
//                 <div className='w-1/2 pl-4'>
//                     <form className='flex flex-col gap-4' onSubmit={e => { e.preventDefault(); handleUpdateInfo(); }}>
//                         <h2 className='text-xl font-semibold'>Chỉnh sửa thông tin</h2>
//                         <div>
//                             <label className='font-semibold' htmlFor="name">Tên của bạn:</label>
//                             <input
//                                 id='name'
//                                 value={name}
//                                 onChange={e => setName(e.target.value)}
//                                 className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
//                                 placeholder='Nhập tên của bạn'
//                             />
//                         </div>
//                         <div>
//                             <label className='font-semibold'>Địa chỉ của bạn:</label>
//                             {addresses.map((address, index) => (
//                                 <div key={index} className='flex items-center mb-2'>
//                                     <input
//                                         value={address}
//                                         onChange={e => handleAddressChange(index, e.target.value)}
//                                         className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
//                                         placeholder='Nhập địa chỉ của bạn'
//                                     />
//                                     <button type="button" onClick={() => handleRemoveAddress(index)} className='ml-2 text-red-500'>
//                                         Xóa
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                         <button type="button" onClick={handleAddAddress} className='mt-2 text-blue-500'>
//                             Thêm địa chỉ
//                         </button>
//                         <div>
//                             <label className='font-semibold' htmlFor="phone">Số điện thoại:</label>
//                             <input
//                                 id='phone'
//                                 value={phone}
//                                 onChange={e => setPhone(e.target.value)}
//                                 className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
//                                 placeholder='Nhập số điện thoại của bạn'
//                             />
//                         </div>
//                         <div>
//                             <label className='font-semibold' htmlFor="birthday">Ngày sinh:</label>
//                             <input
//                                 id='birthday'
//                                 type='date'
//                                 value={birthday}
//                                 onChange={e => setBirthday(e.target.value)}
//                                 className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
//                             />
//                         </div>
//                         <div className='w-full flex justify-end'>
//                             <Button type='submit' className='bg-main text-white rounded'>Cập nhật thông tin</Button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//             <button type='button' className='w-[120px] h-[40px] bg-main text-white rounded text-center mt-4' onClick={() => setShowDialog(true)}>Đổi mật khẩu</button>
//         </div>
//     );
// };

// export default Personal;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Dialog, Button } from '@mui/material';
import { apiChangePassword, apiUpdateUser1 } from '../../apis';
import { getCurrent } from '../../store/user/asyncActions';

const Personal = () => {
    const [avatar, setAvatar] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState({});
    const [addresses, setAddresses] = useState(['']); // Khởi tạo với một ô input địa chỉ
    const dispatch = useDispatch();
    const { current } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getCurrent());
    }, [dispatch]);

    useEffect(() => {
        resetForm();
    }, [current]);

    const resetForm = () => {
        if (current) {
            setAddresses(current.address.length > 0 ? current.address : ['']); // Giữ lại ít nhất một ô
            setName(current.fullname || '');
            setPhone(current.phone || '');
            setBirthday(current.birthday ? moment(current.birthday).format('YYYY-MM-DD') : '');
        }
    };

    const [name, setName] = useState(current?.fullname || '');
    const [phone, setPhone] = useState(current?.phone || '');
    const [birthday, setBirthday] = useState(current?.birthday ? moment(current.birthday).format('YYYY-MM-DD') : '');

    const handleAddressChange = (index, value) => {
        const updatedAddresses = [...addresses];
        updatedAddresses[index] = value;
        setAddresses(updatedAddresses);
    };

    const handleAddAddress = () => {
        setAddresses([...addresses, '']); // Thêm một địa chỉ trống
    };

    const handleRemoveAddress = (index) => {
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(updatedAddresses);
    };

    const handleResetPassword = async () => {
        if (!password) {
            setError(prev => ({ ...prev, password: "Vui lòng nhập mật khẩu hiện tại" }));
            return;
        }
        if (!newPassword) {
            setError(prev => ({ ...prev, newPassword: "Vui lòng nhập mật khẩu mới" }));
            return;
        }

        const response = await apiChangePassword({ currentPassword: password, newPassword });
        toast[response.success ? 'success' : 'error'](response.mess);
        if (response.success) setShowDialog(false);
    };

    const handleUpdateInfo = async () => {
        const formData = new FormData();
        if (avatar) formData.append('avatar', avatar);
        formData.append('name', name);
        formData.append('phone', phone);
        addresses.forEach((addr, index) => {
            formData.append(`address[${index}]`, addr);
        });
        formData.append('birthday', birthday);

        const response = await apiUpdateUser1(formData);
        toast[response.success ? 'success' : 'error'](response.success ? 'Cập nhật thông tin thành công' : 'Cập nhật thất bại');
        if (response.success) {
            dispatch(getCurrent()); // Cập nhật lại thông tin sau khi sửa
        }
    };

    const handleChooseImage = (e) => {
        const file = e.target.files[0];
        file.preview = URL.createObjectURL(file);
        setAvatar(file);
    };

    return (
        <div className='w-full relative p-4 bg-gray-100 rounded-lg shadow-md'>
            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                {/* Nội dung Dialog */}
            </Dialog>
            <header className='text-3xl font-semibold py-4 border-b border-gray-300'>
                Thông tin cá nhân
            </header>
            <div className='flex justify-between mt-4'>
                <div className='w-1/2 pr-4'>
                    <h2 className='text-xl font-semibold'>Thông tin hiện tại</h2>
                    <div className='flex flex-col gap-2 mt-4'>
                        <div>
                            <span className='font-medium'>Tên:</span>
                            <span className='text-main'>{current?.fullname}</span>
                        </div>
                        <div>
                            <span className='font-medium'>Số điện thoại:</span>
                            <span className='text-main'>{current?.phone}</span>
                        </div>
                        <div>
                            <span className='font-medium'>Ngày sinh:</span>
                            <span className='text-main'>{moment(current?.birthday).format('DD/MM/YYYY')}</span>
                        </div>
                        <div>
                            <span className='font-medium'>Email:</span>
                            <span className='text-main'>{current?.email}</span>
                        </div>
                        <div>
                            <span className='font-medium'>Trạng thái tài khoản:</span>
                            <span className='text-main'>{current?.isBlocked ? 'Đã hoạt động' : 'Đã khóa'}</span>
                        </div>
                        <div>
                            <span className='font-medium'>Quyền:</span>
                            <span className='text-main'>{current?.role === 2 ? 'user' : 'admin'}</span>
                        </div>
                        <div>
                            <span className='font-medium'>Ngày tạo tài khoản:</span>
                            <span className='text-main'>{moment(current?.createdAt).format('DD/MM/YYYY')}</span>
                        </div>
                        <div>
                            <span className='font-medium'>Địa chỉ:</span>
                            {current.address.length > 0 ? (
                                current.address.map((address, index) => (
                                    <div key={index} className='text-main mt-1'>{address}</div>
                                ))
                            ) : (
                                <span className='text-gray-500'>Chưa có địa chỉ nào</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className='w-1/2 pl-4'>
                    <form className='flex flex-col gap-4' onSubmit={e => { e.preventDefault(); handleUpdateInfo(); }}>
                        <h2 className='text-xl font-semibold'>Chỉnh sửa thông tin</h2>
                        <div>
                            <label className='font-semibold' htmlFor="name">Tên của bạn:</label>
                            <input
                                id='name'
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
                                placeholder='Nhập tên của bạn'
                            />
                        </div>
                        <div>
                            <label className='font-semibold'>Địa chỉ của bạn:</label>
                            {addresses.map((address, index) => (
                                <div key={index} className='flex items-center mb-2'>
                                    <input
                                        value={address}
                                        onChange={e => handleAddressChange(index, e.target.value)}
                                        className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
                                        placeholder='Nhập địa chỉ của bạn'
                                    />
                                    <button type="button" onClick={() => handleRemoveAddress(index)} className='ml-2 text-red-500'>
                                        Xóa
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddAddress} className='mt-2 text-blue-500'>
                            Thêm địa chỉ
                        </button>
                        <div>
                            <label className='font-semibold' htmlFor="phone">Số điện thoại:</label>
                            <input
                                id='phone'
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
                                placeholder='Nhập số điện thoại của bạn'
                            />
                        </div>
                        <div>
                            <label className='font-semibold' htmlFor="birthday">Ngày sinh:</label>
                            <input
                                id='birthday'
                                type='date'
                                value={birthday}
                                onChange={e => setBirthday(e.target.value)}
                                className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='font-semibold' htmlFor='images'>Tải ảnh lên</label>
                            <input type='file' id='images' onChange={handleChooseImage} />
                            <img className='h-[150px] w-[150px] rounded-full mt-2' src={avatar ? avatar.preview : current.avatar || 'https://api.multiavatar.com/default.png'} alt="Avatar preview" />
                        </div>
                        <div className='w-full flex justify-end'>
                            <Button type='submit' className='bg-main text-white rounded'>Cập nhật thông tin</Button>
                        </div>
                    </form>
                </div>
            </div>
            <button type='button' className='w-[120px] h-[40px] bg-main text-white rounded text-center mt-4' onClick={() => setShowDialog(true)}>Đổi mật khẩu</button>
        </div>
    );
};

export default Personal;