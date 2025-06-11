import React, { useEffect, useState } from 'react';
import { apiDeleteCategory, apiGetCategories, apiUpdateCategory, apiCreateCategory } from '../../apis';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import Dialog from '@mui/material/Dialog';
import icons from '../../ultils/icons';

const { FaRegEdit, FaTrashAlt, FaPlus } = icons;

const ManageCategory = () => {
    const [categories, setCategories] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Trạng thái thêm hoặc cập nhật
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');

    const fetchCategories = async () => {
        const response = await apiGetCategories();
        if (response.success) {
            setCategories(response?.categories);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async () => {
        if (!categoryName) {
            toast.error('Tên danh mục không được để trống');
            return;
        }

        const response = await apiCreateCategory({ name: categoryName });
        if (response.success) {
            setShowDialog(false);
            setCategoryName('');
            toast.success('Thêm thành công');
            fetchCategories();
        } else {
            toast.error('Thêm thất bại: ' + response.message);
        }
    };

    const handleEdit = (category) => {
        setCategoryName(category.name);
        setCurrentCategory(category);
        setIsEditing(true); // Đặt trạng thái là đang cập nhật
        setShowDialog(true);
    };

    const handleUpdate = async () => {
        if (!categoryName) {
            toast.error('Tên danh mục không được để trống');
            return;
        }

        const response = await apiUpdateCategory({ name: categoryName }, currentCategory._id);
        if (response.success) {
            setCurrentCategory(null);
            setShowDialog(false);
            setCategoryName('');
            setIsEditing(false); // Đặt lại trạng thái
            toast.success('Cập nhật thành công');
            fetchCategories();
        } else {
            toast.error('Cập nhật thất bại: ' + response.message);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa???',
            text: 'Bạn đã sẵn sàng xóa chưa???',
            showCancelButton: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await apiDeleteCategory(id);
                if (response.success) {
                    toast.success('Xóa thành công');
                    fetchCategories();
                } else {
                    toast.error('Xóa thất bại: ' + response.message);
                }
            }
        });
    };

    return (
        <div className={clsx('w-full')}>
            <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                <div className='p-[20px] w-[400px]'>
                    <label className='block mb-2'>Tên danh mục sản phẩm</label>
                    <input
                        type='text'
                        placeholder='Nhập tên danh mục sản phẩm'
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className='border p-2 w-full'
                    />
                    <div className='justify-end flex pt-2'>
                        <button 
                            onClick={isEditing ? handleUpdate : handleCreate}
                            className='w-[80px] h-[40px] bg-main text-white rounded cursor-pointer'
                        >
                            {isEditing ? 'Cập nhật' : 'Thêm'}
                        </button>
                    </div>
                </div>
            </Dialog>

            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Quản lý danh mục sản phẩm</span>
            </h1>
            <div className='w-full p-4'>
                <div className='w-[40px] h-[30px] bg-main text-white rounded text-center justify-center float-end items-center flex cursor-pointer mb-1' onClick={() => { setShowDialog(true); setIsEditing(false); setCategoryName(''); }}>
                    <FaPlus />
                </div>
                <table className='mb-6 text-left w-full shadow bg-white'>
                    <thead className='font-bold bg-main text-[13px] text-white'>
                        <tr className='border border-main'>
                            <th className='px-4 py-2'>STT</th>
                            <th className='px-6 py-2'>Tên danh mục sản phẩm</th>
                            <th className='px-6 py-2'>Ngày cập nhật</th> {/* Thêm cột Ngày cập nhật */}
                            <th className='px-4 py-2'>Lựa chọn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories?.map((category, index) => (
                            <tr key={category._id} className='border border-main'>
                                <td className='py-2 px-4'>{index + 1}</td>
                                <td className='py-2 px-6'>{category.name}</td>
                                <td className='py-2 px-6'>{new Date(category.updatedAt).toLocaleDateString()}</td> {/* Hiển thị ngày cập nhật */}
                                <td className='py-2 px-4 flex'>
                                    <span onClick={() => handleEdit(category)} className='px-1 text-main hover:underline cursor-pointer'>
                                        <FaRegEdit />
                                    </span>
                                    <span onClick={() => handleDelete(category._id)} className='px-1 text-main hover:underline cursor-pointer'>
                                        <FaTrashAlt />
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageCategory;