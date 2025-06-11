import React, { useState } from 'react';
import { apiCreatePublisher } from '../apis'; // Đảm bảo bạn đã định nghĩa hàm API này
import { toast } from 'react-toastify';
import { Spin } from 'antd';

const CreatePublisher = ({ onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const handleAddPublisher = async (e) => {
        e.preventDefault();
        setLoading(true);
         //  Kiểm tra các trường bắt buộc
         const { name, description} = formData;
         if (!name || !description) {
             toast.error('Vui lòng điền đầy đủ thông tin');
             setLoading(false); // Đặt loading về false nếu có lỗi
             e.stopPropagation();
             return; // Ngăn không cho tiếp tục
         }
        try {
            const response = await apiCreatePublisher(formData);
            if (response.success) {
                toast.success('Thêm thành công');
                onRefresh();
                onClose();
            } else {
                toast.error('Mô tả quá dài. Vui lòng thử lại');
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
                <form onClick={handleFormClick} onSubmit={handleAddPublisher} className="flex flex-col gap-4">
                    {/* Tên nhà xuất bản */}
                    <div className="flex flex-col">
                        <label htmlFor="name" className="font-semibold mb-1">Tên nhà xuất bản</label>
                        <input
                            type='text'
                            name='name'
                            value={formData.name}
                            onChange={handleInputChange}
                            className="p-2 border border-gray-300 rounded-md text-lg"
                            required
                        />
                    </div>

                    {/* Mô tả */}
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
                    <button type='submit' onClick={handleAddPublisher} className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition">
                        Thêm nhà xuất bản
                    </button>
                    <button type='button' onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
                        Đóng
                    </button>
                </div>
            </div>
        </Spin>
    );
};

export default CreatePublisher;