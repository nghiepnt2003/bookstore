// import React, { useEffect, useState } from 'react';
// import { apiCreateAuthor } from '../apis'; // Đảm bảo bạn đã định nghĩa apiCreateAuthor
// import { toast } from 'react-toastify';
// import { Spin } from 'antd';
// import { useDispatch } from 'react-redux';
// import { showModal } from '../store/app/appSlice';
// import icons from '../ultils/icons';
// import compressImage from './compressImage';

// const { TiCameraOutline } = icons;

// const CreateAuthor = ({ onClose, onRefresh }) => {
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         image: '',
//     });
//     const [avatar, setAvatar] = useState('');

//     // const handleFileChange = async (e) => {
//     //     const file = e.target.files[0];
//     //     if (file) {
//     //         const compressedImage = await compressImage(file);
//     //         setAvatar(URL.createObjectURL(compressedImage));
//     //         setFormData(prev => ({ ...prev, image: compressedImage.name }));
//     //     }
//     //     // reader.readAsDataURL(file);
//     // };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setAvatar(reader.result); // Chuyển đổi thành Base64 để hiển thị preview
//                 setFormData(prev => ({ ...prev, image: reader.result }));
//             };
//             reader.readAsDataURL(file);
//         }
//     };
//     const handleAddAuthor = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//          //  Kiểm tra các trường bắt buộc
//          const { name, description, image} = formData;
//          if (!name || !description ||  !image) {
//              toast.error('Vui lòng điền đầy đủ thông tin');
//              setLoading(false); // Đặt loading về false nếu có lỗi
//              e.stopPropagation();
//              return; // Ngăn không cho tiếp tục
//          }
//         try {
//             console.log( "FROM DATAT " + JSON.stringify(formData))
//             const response = await apiCreateAuthor(formData);
//             if (response?.success) {
//                 toast.success('Thêm thành công');
//                 onRefresh();
//                 onClose();
//             } else {
//                 toast.error(response?.message);
//                 e.stopPropagation();
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error('Có lỗi xảy ra');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleFormClick = (e) => {
//         e.stopPropagation(); // Ngăn chặn modal đóng
//     };

//     return (
//         <Spin size='large' spinning={loading}>
//             <div className='w-[500px] flex flex-col gap-4 relative p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
//                 <form onClick={handleFormClick} onSubmit={handleAddAuthor} className="flex flex-col gap-4">
//                     {/* Cột Avatar */}
//                     <div className="flex flex-col items-center w-full relative border border-gray-300 rounded-md h-40">
//                         <input
//                             type='file'
//                             accept="image/*"
//                             onChange={handleFileChange}
//                             className="absolute inset-0 cursor-pointer opacity-0 z-10"
//                         />
//                         {avatar ? (
//                             <div className="relative">
//                                 <img
//                                     src={avatar}
//                                     alt="Avatar Preview"
//                                     className="w-32 h-32 object-cover rounded-md"
//                                 />
//                                 <TiCameraOutline className="absolute bottom-2 right-2 h-8 w-8 text-white bg-gray-600 rounded-full p-1" />
//                             </div>
//                         ) : (
//                             <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center">
//                                 <TiCameraOutline className="h-8 w-8 text-gray-400" />
//                             </div>
//                         )}
                        
//                     </div>

//                     {/* Tên Tác Giả */}
//                     <div className="flex flex-col">
//                         <label htmlFor="name" className="font-semibold mb-1">Tên tác giả</label>
//                         <input
//                             type='text'
//                             name='name'
//                             value={formData.name}
//                             onChange={handleInputChange}
//                             className="p-2 border border-gray-300 rounded-md text-lg"
//                             required
//                         />
//                     </div>

//                     {/* Mô Tả */}
//                     <div className="flex flex-col">
//                         <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
//                         <textarea
//                             name='description'
//                             value={formData.description}
//                             onChange={handleInputChange}
//                             className="p-2 border border-gray-300 rounded-md text-lg"
//                         />
//                     </div>
//                 </form>

//                 {/* Nút Thêm và Đóng */}
//                 <div className="flex justify-between mt-4">
//                     <button type='submit' onClick={handleAddAuthor} className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition">
//                         Thêm tác giả
//                     </button>
//                     <button type='button' onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
//                         Đóng
//                     </button>
//                 </div>
//             </div>
//         </Spin>
//     );
// };

// export default CreateAuthor;

import React, { useState } from 'react';
import { apiCreateAuthor } from '../apis';
import { toast } from 'react-toastify';
import { Spin } from 'antd';
import icons from '../ultils/icons';
// import compressImage from './compressImage'; // Giữ lại nếu bạn muốn nén ảnh

const { TiCameraOutline } = icons;

const CreateAuthor = ({ onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        // Không còn lưu 'image' (Base64) trực tiếp trong formData nữa
    });
    const [avatar, setAvatar] = useState(''); // Dùng để hiển thị ảnh preview (vẫn là Base64)
    const [selectedFile, setSelectedFile] = useState(null); // **MỚI**: Lưu trữ đối tượng File thực tế

    // --- Xử lý thay đổi file ảnh (đã cập nhật) ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // Lưu trữ file thực tế để gửi đi
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result); // Chuyển đổi thành Base64 để hiển thị preview
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null); // Nếu người dùng bỏ chọn file
            setAvatar(''); // Xóa preview
        }
    };

    const handleAddAuthor = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { name, description } = formData;

        // Kiểm tra các trường bắt buộc
        if (!name || !description || !selectedFile) { // Yêu cầu selectedFile
            toast.error('Vui lòng điền đầy đủ thông tin và chọn ảnh tác giả.');
            setLoading(false);
            return;
        }

        // Tạo đối tượng FormData để gửi file và các trường khác
        const authorFormData = new FormData();
        authorFormData.append('name', name);
        authorFormData.append('description', description);
        authorFormData.append('image', selectedFile); // Thêm file ảnh thực tế vào FormData

        try {
            const response = await apiCreateAuthor(authorFormData); // Gửi FormData
            if (response?.success) {
                toast.success('Thêm tác giả thành công');
                onRefresh(); // Gọi hàm refresh danh sách tác giả
                onClose(); // Đóng modal
            } else {
                toast.error(response?.message || 'Có lỗi xảy ra khi tạo tác giả.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormClick = (e) => {
        e.stopPropagation(); // Ngăn chặn modal đóng khi click vào form
    };

    return (
        <Spin size='large' spinning={loading}>
            <div className='w-[500px] flex flex-col gap-4 relative p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
                <form onClick={handleFormClick} onSubmit={handleAddAuthor} className="flex flex-col gap-4">
                    {/* Cột Avatar */}
                    <div className="flex flex-col items-center w-full relative border border-gray-300 rounded-md h-40">
                        <input
                            type='file'
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 cursor-pointer opacity-0 z-10"
                        />
                        {avatar ? (
                            <div className="relative">
                                <img
                                    src={avatar} // Hiển thị preview Base64
                                    alt="Avatar Preview"
                                    className="w-32 h-32 object-cover rounded-md"
                                />
                                <TiCameraOutline className="absolute bottom-2 right-2 h-8 w-8 text-white bg-gray-600 rounded-full p-1" />
                            </div>
                        ) : (
                            <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center">
                                <TiCameraOutline className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Tên Tác Giả */}
                    <div className="flex flex-col">
                        <label htmlFor="name" className="font-semibold mb-1">Tên tác giả</label>
                        <input
                            type='text'
                            name='name'
                            value={formData.name}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md text-lg"
                            required
                        />
                    </div>

                    {/* Mô Tả */}
                    <div className="flex flex-col">
                        <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
                        <textarea
                            name='description'
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3} // Tăng số hàng để dễ nhập liệu hơn
                            className="p-2 border border-gray-300 rounded-md text-lg"
                        />
                    </div>
                </form>

                {/* Nút Thêm và Đóng */}
                <div className="flex justify-between mt-4">
                    <button type='submit' onClick={handleAddAuthor} className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition">
                        Thêm tác giả
                    </button>
                    <button type='button' onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
                        Đóng
                    </button>
                </div>
            </div>
        </Spin>
    );
};

export default CreateAuthor;
