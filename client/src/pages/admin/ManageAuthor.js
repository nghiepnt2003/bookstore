import React, { useEffect, useState } from 'react';
import { apiGetAuthors, apiDeleteAuthor, apiUpdateAuthor } from '../../apis/author'; // Cập nhật API
import moment from 'moment';
import { InputField, EditAuthorForm } from '../../components'; // Đảm bảo EditAuthorForm tồn tại
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { useDispatch } from "react-redux";
import { showModal } from '../../store/app/appSlice';

const ManageAuthor = () => {
    const [authors, setAuthors] = useState(null);
    const [queries, setQueries] = useState({ name: "" });
    const dispatch = useDispatch();

    const fetchAuthors = async (params) => {
        const response = await apiGetAuthors(params);
        if (response.success) 
            setAuthors(response.authors);
        else setAuthors([]);
    };

    useEffect(() => {
        fetchAuthors(queries.name !== '' ? queries : {});
    }, [queries]);

    const handleUpdateAuthor = async (updatedAuthorData, authorId) => {
        const response = await apiUpdateAuthor(updatedAuthorData, authorId);
        return response; // Trả về phản hồi để xử lý trong EditAuthorForm
    };

    const handlerDeleteAuthor = (authorId) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa?',
            text: 'Bạn đã sẵn sàng xóa chưa?',
            showCancelButton: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await apiDeleteAuthor(authorId);
                if (response.success) {
                    fetchAuthors();
                    toast.success(response.message);
                } else toast.error(response.message);
            }
        });
    };

    const openEditModal = (author) => {
        dispatch(showModal({ 
            isShowModal: true, 
            modalChildren: <EditAuthorForm
                author={author}
                onUpdate={handleUpdateAuthor}
                onCancel={closeModal}
                fetchAuthors={fetchAuthors}
            />
        }));
    };

    const closeModal = () => {
        dispatch(showModal({ isShowModal: false, modalChildren: null }));
    };

    return (
        <div className={clsx('w-full')} style={{ backgroundColor: '#f8f8f8' }}>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Quản Lý Tác Giả</span>
            </h1>
            <div className='w-full p-4'>
                <div className='flex justify-end p-4'>
                    <InputField
                        nameKey={'name'}
                        value={queries.name}
                        setValue={setQueries}
                        style='w500'
                        placeholder='Tìm kiếm tên tác giả' // Cập nhật placeholder
                        isHideLabel
                    />
                </div>
                <table className='table-auto mb-6 text-left w-full shadow bg-white'>
                    <thead className='font-bold bg-main text-[13px] text-white'>
                        <tr className='border border-main'>
                            <th className='px-4 py-2 '>STT</th>
                            <th className='px-4 py-2 '>Tên tác giả</th>
                            <th className='px-4 py-2 '>Mô tả</th>
                            <th className='px-4 py-2 '>Hình ảnh</th>
                            <th className='px-4 py-2 '>Ngày tạo</th>
                            <th className='px-8 py-2 '>Lựa chọn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {authors?.map((el, index) => (
                            <tr key={el._id} className='border border-main '>
                                <td className='py-2 px-4'>{index + 1}</td>
                                <td className='py-2 px-4'>{el.name}</td>
                                <td className='py-2 px-4'>{el.description}</td>
                                <td className='py-2 px-4'>
                                    <img src={el.image} alt={el.name} className="w-20 h-20 object-cover" />
                                </td>
                                <td className='py-2 px-4'>{moment(el.createdAt).format('DD/MM/YYYY')}</td>
                                <td className='py-2 px-4'>
                                    <span onClick={() => openEditModal(el)} className='px-2 text-main hover:underline cursor-pointer'>Sửa</span>
                                    <span onClick={() => handlerDeleteAuthor(el._id)} className='px-2 text-main hover:underline cursor-pointer'>Xóa</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAuthor;