import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditPublisherForm = ({ publisher, onUpdate, onCancel, fetchPublishers }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (publisher) {
            setFormData({
                name: publisher.name,
                description: publisher.description
            });
        }
    }, [publisher]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Yêu cầu nhập tên nhà xuất bản';
        if (!formData.description) newErrors.description = 'Yêu cầu nhập mô tả';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const response = await onUpdate(formData, publisher._id);
        if (response.success) {
            toast.success('Cập nhật thành công');
            onCancel();
            fetchPublishers(); // Gọi lại danh sách nhà xuất bản
        } else {
            toast.error('Cập nhật thất bại');
        }
    };

    const handleFormClick = (e) => {
        e.stopPropagation(); // Ngăn chặn modal đóng
    };

    return (
        <div className='w-[600px] flex flex-col gap-4 p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
            <form onClick={handleFormClick} onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Tên Nhà Xuất Bản */}
                <div className="flex flex-col">
                    <label htmlFor="name" className="font-semibold mb-1">Tên nhà xuất bản</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tên nhà xuất bản"
                        className="p-2 border border-gray-300 rounded-md text-lg"
                    />
                    {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
                </div>

                {/* Mô Tả */}
                <div className="flex flex-col">
                    <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Mô tả"
                        className="p-2 border border-gray-300 rounded-md text-lg"
                    />
                    {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description}</span>}
                </div>
                
                {/* Nút Cập Nhật và Hủy */}
                <div className="flex justify-between mt-4">
                    <button type="submit" className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition">
                        Cập nhật
                    </button>
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPublisherForm;