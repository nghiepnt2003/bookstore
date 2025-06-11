// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import moment from 'moment';
// import { Dialog, Button } from '@mui/material';
// import { FaCamera } from 'react-icons/fa';
// import { apiChangePassword, apiUpdateUser1 } from '../../apis';
// import { getCurrent } from '../../store/user/asyncActions';
// import { ClipLoader } from 'react-spinners'; // Nhập ClipLoader từ react-spinners
// import { Checkbox } from 'antd'

// const Personal = () => {
//     const [avatar, setAvatar] = useState(null);
//     const [showDialog, setShowDialog] = useState(false);
//     const [password, setPassword] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [error, setError] = useState({});
//     const [addresses, setAddresses] = useState(['']);
//     const dispatch = useDispatch();
//     const { current } = useSelector(state => state.user);
//     const [loading, setLoading] = useState(false); // State cho loading
//     const [isShowPassword, setIsShowPassWord] = useState(false)
//     const [compare, setCompare] = useState(true)

//     useEffect(() => {
//         dispatch(getCurrent());
//     }, [dispatch]);

//     useEffect(() => {
//         resetForm();
//     }, [current]);

//     const resetForm = () => {
//         if (current) {
//             setAddresses(current.address.length > 0 ? current.address : ['']);
//             setName(current.fullname || '');
//             setPhone(current.phone || '');
//             setBirthday(current.birthday ? moment(current.birthday).format('YYYY-MM-DD') : '');
//             setAvatar(null);
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
//         setAddresses([...addresses, '']);
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

//         console.log(password + " " + newPassword)

//         const response = await apiChangePassword({ oldPassword: password, newPassword: newPassword });
//         if (response?.success) 
//         {
//             setShowDialog(false);
//             toast.success("Cập nhật mật khẩu thành công")
//         }
//         else 
//         {
//             toast.error(response.message)
//         }
           
//     };

//     const handleUpdateInfo = async () => {
//         setLoading(true); // Bắt đầu loading
//         const formData = new FormData();
        
//         // Nếu có avatar (hình ảnh mới), thêm vào formData
//         if (avatar) {
//             formData.append('image', avatar); // Đảm bảo tên 'image' khớp với tên mà API mong đợi
//         }
//         if(current?.fullname !==name)
//             formData.append('fullname', name);
//         if(current?.phone !== phone)
//             formData.append('phone', phone);
    
//         // Thêm địa chỉ vào formData
//         addresses.forEach((addr, index) => {
//             if (addr) { // Kiểm tra địa chỉ không trống
//                 formData.append(`address[${index}]`, addr);
//             }
//         });
    
//         try {
//             const response = await apiUpdateUser1(formData);
//             // Kiểm tra phản hồi
//             if (response) {
//                 console.log("REPON " + JSON.stringify(response))
//                 toast[response.success ? 'success' : 'error'](
//                     response.success ? 'Cập nhật thông tin thành công' : 'Cập nhật thất bại'
//                 );
//                 setLoading(false); // Kết thúc loading
//                 if (response.success) {
//                     dispatch(getCurrent());
//                 }
//             } else {
//                 setLoading(false); // Kết thúc loading
//                 toast.error('Phản hồi không hợp lệ từ máy chủ.');

//             }
//         } catch (error) {
//             setLoading(false); // Kết thúc loading
//             console.error('Lỗi khi cập nhật thông tin:', error);
//             toast.error('Có lỗi xảy ra khi cập nhật thông tin.');
//         }
//     };

//     const handleChooseImage = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             file.preview = URL.createObjectURL(file);
//             setAvatar(file);
//         }
//     };

//     return (
//         <div className='w-full relative p-4'>
//              {loading && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
//                     <ClipLoader color="#3498db" loading={loading} size={50} /> {/* Sử dụng ClipLoader */}
//                 </div>
//             )}
//             <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
//                 <div className='w-[500px] p-[20px]'>
//                     <div className='flex flex-col gap-4 '>
//                         <label htmlFor="password">Vui lòng nhập mật khẩu</label>
//                         <input type={isShowPassword ? "text" : "password"}
//                             id="currentPassword"
//                             className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
//                             placeholder='Mật khẩu hiện tại'
//                             value={password}
//                             onChange={e => setPassword(e.target.value)}
//                         />
//                         <p className='text-red-500 mt-[4px]'>{error?.password}</p>
//                         <input type={isShowPassword ? "text" : "password"}
//                             id="newPassword"
//                             className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
//                             placeholder='Mật khẩu mới'
//                             value={newPassword}
//                             onChange={e => setNewPassword(e.target.value)}
//                         />
//                         <p className='text-red-500 mt-[4px]'>{error?.newPassword}</p>
//                     </div >
//                     <div className='mt-2 flex justify-end w-full'>
//                         <Checkbox checked={isShowPassword} onChange={() => setIsShowPassWord(prev => !prev)}>
//                             Show
//                         </Checkbox>
//                     </div>
//                     <div className='flex items-center justify-end z-10 mt-4 w-full gap-4'>
//                         <Button
//                             // disabled={Object.keys(error).length > 0}
//                             onClick={handleResetPassword} >
//                             Xác nhận
//                         </Button>
//                     </div>
//                 </div>
//             </Dialog>
//             <header className='text-3xl font-semibold py-4 border-b border-gray-300'>
//                 Thông tin cá nhân
//             </header>
//             <div className='flex justify-between mt-4 ml-8'>
//                 <div className='w-1/2 pr-4'>
//                     <h2 className='text-xl font-semibold'>Thông tin hiện tại</h2>
//                     <div className='flex flex-col gap-2 mt-4'>
//                         <div>
//                             <span className='font-medium mr-2'>Tên:</span>
//                             <span className='text-main'>{current?.fullname}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium mr-2'>Số điện thoại:</span>
//                             <span className='text-main'>{current?.phone}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium mr-2'>Email:</span>
//                             <span className='text-main'>{current?.email}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium mr-2'>Ngày tạo tài khoản:</span>
//                             <span className='text-main'>{moment(current?.createdAt).format('DD/MM/YYYY')}</span>
//                         </div>
//                         <div>
//                             <span className='font-medium mr-2'>Địa chỉ:</span>
//                             {current?.address.length > 0 ? (
//                                 current?.address?.map((address, index) => (
//                                     <div key={index} className='text-main mt-1'>{address}</div>
//                                 ))
//                             ) : (
//                                 <span className='text-gray-500'>Chưa có địa chỉ nào</span>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//                 <div className='w-1/2 pl-4'>
//                     <h2 className='text-xl font-semibold'>Chỉnh sửa thông tin</h2>
//                     <form className='flex flex-col gap-4 mt-4' onSubmit={e => { e.preventDefault(); handleUpdateInfo(); }}>
//                         <div className='flex gap-4 mb-4'>
//                             <div className='relative h-[150px] w-[150px] rounded-full mr-14'>
//                                 <img className='h-[150px] w-[150px] rounded-full' src={avatar ? avatar.preview : current.image || 'https://api.multiavatar.com/default.png'} alt="Avatar preview" />
//                                 <input
//                                     type='file'
//                                     id='images'
//                                     onChange={handleChooseImage}
//                                     className='absolute inset-0 opacity-0 cursor-pointer h-[150px] w-[150px] rounded-full'
//                                 />
//                                 <div className='absolute bottom-0 left-4 p-1 bg-white rounded-full shadow'>
//                                     <FaCamera className='text-main cursor-pointer' size={24} onClick={() => document.getElementById('images').click()} />
//                                 </div>
//                                 <span className='text-sm flex justify-center text-gray-500'>*.jpeg, *.jpg, *.png.</span>
//                                 {/* <span className='text-sm flex justify-center'>Maximum 100KB</span> */}
//                             </div>
//                             <div className='flex flex-col justify-center'>
//                                 <div className='w-full'>
//                                     <label className='font-semibold' htmlFor="name">Tên của bạn:</label>
//                                     <input
//                                         id='name'
//                                         value={name}
//                                         onChange={e => setName(e.target.value)}
//                                         className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
//                                         placeholder='Nhập tên của bạn'
//                                     />
//                                 </div>
//                                 <div className='w-full mt-2'>
//                                     <label className='font-semibold' htmlFor="phone">Số điện thoại:</label>
//                                     <input
//                                         id='phone'
//                                         value={phone}
//                                         onChange={e => setPhone(e.target.value)}
//                                         className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
//                                         placeholder='Nhập số điện thoại của bạn'
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                         <div>
//                             <label className='font-semibold'>Địa chỉ của bạn:</label>
//                             {addresses?.map((address, index) => (
//                                 <div key={index} className='flex items-center mb-2'>
//                                     <input
//                                         value={address}
//                                         onChange={e => handleAddressChange(index, e.target.value)}
//                                         className={`w-[510px] h-[50px] pl-2 border rounded border-main outline-none`}
//                                         placeholder='Nhập địa chỉ của bạn'
//                                     />
//                                     <button type="button" onClick={() => handleRemoveAddress(index)} className='ml-2 text-red-500'>
//                                         Xóa
//                                     </button>
//                                 </div>
//                             ))}
//                             <button type="button" onClick={handleAddAddress} className='mt-2 text-blue-500'>
//                                 Thêm địa chỉ
//                             </button>
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
import { FaCamera } from 'react-icons/fa';
import { apiChangePassword, apiUpdateUser1 } from '../../apis';
import { getCurrent } from '../../store/user/asyncActions';
import { ClipLoader } from 'react-spinners'; // Nhập ClipLoader từ react-spinners
import { Checkbox } from 'antd'

const Personal = () => {
    const [avatar, setAvatar] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState({});
    // const [addresses, setAddresses] = useState(['']);
    const [address, setAddress] = useState('')
    const dispatch = useDispatch();
    const { current } = useSelector(state => state.user);
    const [loading, setLoading] = useState(false); // State cho loading
    const [isShowPassword, setIsShowPassWord] = useState(false)
    const [compare, setCompare] = useState(true)
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        dispatch(getCurrent());
    }, [dispatch]);

    useEffect(() => {
        resetForm();
    }, [current]);

    const resetForm = () => {
        if (current) {
            // setAddresses(current.address.length > 0 ? current.address : ['']);
            setAddress(current.address[0] || '')
            setName(current.fullname || '');
            setPhone(current.phone || '');
            setBirthday(current.birthday ? moment(current.birthday).format('YYYY-MM-DD') : '');
            setAvatar(null);
        }
    };

    const [name, setName] = useState(current?.fullname || '');
    const [phone, setPhone] = useState(current?.phone || '');
    const [birthday, setBirthday] = useState(current?.birthday ? moment(current.birthday).format('YYYY-MM-DD') : '');

    const handleResetPassword = async () => {
        const isPasswordComplex = (password) => {
            const passwordComplexityPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            return passwordComplexityPattern.test(password);
        };
        if (!password) {
            setError(prev => ({ ...prev, password: "Vui lòng nhập mật khẩu hiện tại" }));
            return;
        }
        if (!newPassword) {
            setError(prev => ({ ...prev, newPassword: "Vui lòng nhập mật khẩu mới" }));
            return;
        }
        if (!isPasswordComplex(newPassword)) {
            setError(prev => ({ ...prev, newPassword: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt." }));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(prev => ({ ...prev, confirmPassword: "Mật khẩu mới và xác nhận mật khẩu không khớp" }));
            return;
        }    

        console.log(password + " " + newPassword)

        const response = await apiChangePassword({ oldPassword: password, newPassword: newPassword });
        if (response?.success) 
        {
            setShowDialog(false);
            toast.success("Đổi mật khẩu thành công")
        }
        else 
        {
            toast.error(response.message)
        }
           
    };

    const handleUpdateInfo = async () => {
        setLoading(true); // Bắt đầu loading
        const formData = new FormData();
        
        // Nếu có avatar (hình ảnh mới), thêm vào formData
        if (avatar) {
            formData.append('image', avatar); // Đảm bảo tên 'image' khớp với tên mà API mong đợi
        }
        if(current?.fullname !==name)
            formData.append('fullname', name);
        if(current?.phone !== phone)
            formData.append('phone', phone);
        if(current?.address[0] !== address)
            formData.append('address[0]', address);
    
        try {
            const response = await apiUpdateUser1(formData);
            // Kiểm tra phản hồi
            if (response) {
                console.log("REPON " + JSON.stringify(response))
                toast[response.success ? 'success' : 'error'](
                    response.success ? 'Cập nhật thông tin thành công' : response.message
                );
                setLoading(false); // Kết thúc loading
                if (response.success) {
                    dispatch(getCurrent());
                }
            } else {
                setLoading(false); // Kết thúc loading
                toast.error('Phản hồi không hợp lệ từ máy chủ.');

            }
        } catch (error) {
            setLoading(false); // Kết thúc loading
            console.error('Lỗi khi cập nhật thông tin:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin.');
        }
    };

    const handleChooseImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            file.preview = URL.createObjectURL(file);
            setAvatar(file);
        }
    };

    return (
        <div className='w-full relative p-4'>
             {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
                    <ClipLoader color="#3498db" loading={loading} size={50} /> {/* Sử dụng ClipLoader */}
                </div>
            )}
            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <div className='w-[500px] p-[20px]'>
                    <div className='flex flex-col gap-4 '>
                        <label htmlFor="password">Vui lòng nhập mật khẩu</label>
                        <input type={isShowPassword ? "text" : "password"}
                            id="currentPassword"
                            className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
                            placeholder='Mật khẩu hiện tại'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <p className='text-red-500 mt-[4px]'>{error?.password}</p>
                        <input type={isShowPassword ? "text" : "password"}
                            id="newPassword"
                            className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
                            placeholder='Mật khẩu mới'
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <p className='text-red-500 mt-[4px]'>{error?.newPassword}</p>
                        <input 
                            type={isShowPassword ? "text" : "password"}
                            id="confirmPassword"
                            className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
                            placeholder='Xác nhận mật khẩu mới'
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <p className='text-red-500 mt-[4px]'>{error?.confirmPassword}</p>
                    </div >
                    <div className='mt-2 flex justify-end w-full'>
                        <Checkbox checked={isShowPassword} onChange={() => setIsShowPassWord(prev => !prev)}>
                            Show
                        </Checkbox>
                    </div>
                    <div className='flex items-center justify-end z-10 mt-4 w-full gap-4'>
                        <Button
                            // disabled={Object.keys(error).length > 0}
                            onClick={handleResetPassword} >
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </Dialog>
            <header className='text-3xl font-semibold py-4 border-b border-gray-300'>
                Thông tin cá nhân
            </header>
            <div className='flex justify-between mt-4 ml-8'>
                <div className='w-1/2 pr-4'>
                    <h2 className='text-xl font-semibold'>Thông tin hiện tại</h2>
                    <div className='flex flex-col gap-2 mt-4'>
                        <div>
                            <span className='font-medium mr-2'>Tên:</span>
                            <span className='text-main'>{current?.fullname}</span>
                        </div>
                        <div>
                            <span className='font-medium mr-2'>Số điện thoại:</span>
                            <span className='text-main'>{current?.phone}</span>
                        </div>
                        <div>
                            <span className='font-medium mr-2'>Email:</span>
                            <span className='text-main'>{current?.email}</span>
                        </div>
                        <div>
                            <span className='font-medium mr-2'>Ngày tạo tài khoản:</span>
                            <span className='text-main'>{moment(current?.createdAt).format('DD/MM/YYYY')}</span>
                        </div>
                        <div>
                            <span className='font-medium mr-2'>Địa chỉ:</span>
                            {current?.address.length > 0 ? (
                                current?.address?.map((address, index) => (
                                    <div key={index} className='text-main mt-1'>{address}</div>
                                ))
                            ) : (
                                <span className='text-gray-500'>Chưa có địa chỉ nào</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className='w-1/2 pl-4'>
                    <h2 className='text-xl font-semibold'>Chỉnh sửa thông tin</h2>
                    <form className='flex flex-col gap-4 mt-4' onSubmit={e => { e.preventDefault(); handleUpdateInfo(); }}>
                        <div className='flex gap-4 mb-4'>
                            <div className='relative h-[150px] w-[150px] rounded-full mr-14'>
                                <img className='h-[150px] w-[150px] rounded-full' src={avatar ? avatar.preview : current.image || 'https://antimatter.vn/wp-content/uploads/2022/11/anh-avatar-trang-tron.jpg'} alt="Avatar preview" />
                                <input
                                    type='file'
                                    id='images'
                                    onChange={handleChooseImage}
                                    className='absolute inset-0 opacity-0 cursor-pointer h-[150px] w-[150px] rounded-full'
                                />
                                <div className='absolute bottom-0 left-4 p-1 bg-white rounded-full shadow'>
                                    <FaCamera className='text-main cursor-pointer' size={24} onClick={() => document.getElementById('images').click()} />
                                </div>
                                <span className='text-sm flex justify-center text-gray-500'>*.jpeg, *.jpg, *.png.</span>
                                {/* <span className='text-sm flex justify-center'>Maximum 100KB</span> */}
                            </div>
                            <div className='flex flex-col justify-center'>
                                <div className='w-full'>
                                    <label className='font-semibold' htmlFor="name">Tên của bạn:</label>
                                    <input
                                        id='name'
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
                                        placeholder='Nhập tên của bạn'
                                    />
                                </div>
                                <div className='w-full mt-2'>
                                    <label className='font-semibold' htmlFor="phone">Số điện thoại:</label>
                                    <input
                                        id='phone'
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
                                        placeholder='Nhập số điện thoại của bạn'
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className='font-semibold'>Địa chỉ của bạn:</label>
                            <input
                                id='address'
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className={`w-full h-[50px] pl-2 border rounded border-main outline-none`}
                                placeholder='Nhập địa chỉ của bạn'
                            />
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