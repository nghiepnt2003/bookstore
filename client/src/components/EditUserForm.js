import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const options = [
    { value: 'Hoạt động', code: false },
    { value: 'Đã khóa', code: true }
];

const EditUserForm = ({ user, onUpdate, onCancel, fetchUsers }) => {
    const [formData, setFormData] = useState({
        username: '',
        role: '',
        phone: '',
        status: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                role: user.role,
                phone: user.phone,
                status: user.isBlocked
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Yêu cầu nhập tên';
        if (!formData.role) newErrors.role = 'Yêu cầu nhập vai trò';
        if (!formData.phone) newErrors.phone = 'Yêu cầu nhập số điện thoại';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => { 
        e.preventDefault();
        if (!validateForm()) return;

        const response = await onUpdate(formData, user._id);
        console.log(response)
        if (response.success) {
            console.log("AAAAAAA")
            toast.success(response.message);
            onCancel();
            fetchUsers(); // Đảm bảo rằng bạn gọi fetchUsers ở đây
        } else {
            toast.error(response.message);
        }
    };

    const handleFormClick = (e) => {
        e.stopPropagation(); // Ngăn chặn cú nhấp chuột đóng modal
    };

    return (
        <form
            onClick={handleFormClick}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 p-6 border border-gray-300 rounded-lg bg-white w-96 mx-auto"
        >
            <div className="flex flex-col">
                <label htmlFor="username" className="font-semibold mb-1">Tên người dùng</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Tên người dùng"
                    className="p-2 border border-gray-300 rounded-md text-lg"
                />
                {errors.username && <span className="text-red-500 text-sm mt-1">{errors.username}</span>}
            </div>
            <div className="flex flex-col">
                <label htmlFor="role" className="font-semibold mb-1">Vai trò</label>
                <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Vai trò"
                    className="p-2 border border-gray-300 rounded-md text-lg"
                />
                {errors.role && <span className="text-red-500 text-sm mt-1">{errors.role}</span>}
            </div>
            <div className="flex flex-col">
                <label htmlFor="phone" className="font-semibold mb-1">Số điện thoại</label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Số điện thoại"
                    className="p-2 border border-gray-300 rounded-md text-lg"
                />
                {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
            </div>
            <div className="flex flex-col">
                <label htmlFor="status" className="font-semibold mb-1">Trạng thái</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded-md text-lg"
                >
                    <option value="" disabled>Chọn trạng thái</option>
                    {options.map(option => (
                        <option key={option.value} value={option.code}>
                            {option.value}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex justify-between">
                <button type="submit" className="px-4 py-2 bg-main text-white rounded-md hover:bg-main transition">
                    Cập nhật
                </button>
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
                    Hủy
                </button>
            </div>
        </form>
    );
};

export default EditUserForm;