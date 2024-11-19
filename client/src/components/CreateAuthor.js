import React, { useEffect, useState } from 'react';
import { apiCreateAuthor } from '../apis'; // Đảm bảo bạn đã định nghĩa apiCreateAuthor
import { toast } from 'react-toastify';
import { Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { showModal } from '../store/app/appSlice';
import icons from '../ultils/icons';
import compressImage from './compressImage';

const { TiCameraOutline } = icons;

const CreateAuthor = ({ onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
    });
    const [avatar, setAvatar] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressedImage = await compressImage(file);
            setAvatar(compressedImage);
            setFormData(prev => ({ ...prev, image: compressedImage }));
        }
        // reader.readAsDataURL(file);
    };

    const handleAddAuthor = async (e) => {
        e.preventDefault();
        setLoading(true);
         //  Kiểm tra các trường bắt buộc
         const { name, description, image} = formData;
         if (!name || !description ||  !image) {
             toast.error('Vui lòng điền đầy đủ thông tin');
             setLoading(false); // Đặt loading về false nếu có lỗi
             e.stopPropagation();
             return; // Ngăn không cho tiếp tục
         }
        try {
            console.log( "FROM DATAT " + JSON.stringify(formData))
            const response = await apiCreateAuthor(formData);
            if (response.success) {
                toast.success('Thêm thành công');
                onRefresh();
                onClose();
            } else {
                toast.error(response?.message);
                e.stopPropagation();
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormClick = (e) => {
        e.stopPropagation(); // Ngăn chặn modal đóng
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
                                    src={avatar}
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