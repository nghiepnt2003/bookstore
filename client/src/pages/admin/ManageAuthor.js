import React, { useEffect, useState } from 'react';
import { apiGetAuthors, apiDeleteAuthor, apiUpdateAuthor } from '../../apis';
import moment from 'moment';
import { InputField, EditAuthorForm, CreateAuthor } from '../../components'; // Đảm bảo EditAuthorForm tồn tại
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { useDispatch } from "react-redux";
import { showModal } from '../../store/app/appSlice';
import icons from '../../ultils/icons';

const { FaRegEdit, FaTrashAlt, FaPlus } = icons;

const ManageAuthor = () => {
    const [authors, setAuthors] = useState(null);
    const [queries, setQueries] = useState({ name: "" });
    const dispatch = useDispatch();

    const fetchAuthors = async (params) => {
        console.log("PR " + JSON.stringify(params))
        if(params && params.name!=="")
            {
                const response = await apiGetAuthors(params);
                if (response.success) 
                    setAuthors(response.authors);
                else setAuthors([]);
            }
        else
        {
            const response = await apiGetAuthors();
            if (response.success) 
                setAuthors(response.authors);
            else setAuthors([]);
        }
       
       
    };

    useEffect(() => {
        console.log("PR TEN" + queries.name)
        if(queries.name && queries.name !=="")
        {
            console.log("QU NAME " + queries.name)
            fetchAuthors({ name: queries.name }); // Truyền đúng tham số tìm kiếm
        }
        else
            fetchAuthors(); // Truyền đúng tham số tìm kiếm
        // fetchAuthors({ name: queries.name }); // Truyền đúng tham số tìm kiếm
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
                    fetchAuthors(queries); // Sử dụng queries để lấy dữ liệu
                    toast.success('Xóa thành công');
                } else toast.error(response.message);
            }
        });
    };

    // Hàm hiển thị thông báo
    // const showToast = (message, type) => {
    //     if (type === 'success') {
    //         toast.success(message);
    //     } else {
    //         toast.error(message);
    //     }
    // };

    const openEditModal = (author) => {
        dispatch(showModal({ 
            isShowModal: true, 
            modalChildren: <EditAuthorForm
                author={author}
                onUpdate={handleUpdateAuthor}
                onCancel={closeModal}
                fetchAuthors={fetchAuthors}
                // showToast={showToast} // Truyền hàm showToast vào đây
            />
        }));
    };

    const closeModal = () => {
        dispatch(showModal({ isShowModal: false, modalChildren: null }));
    };

    const openAddModal = () => {
        dispatch(showModal({
            isShowModal: true,
            modalChildren: (
                <CreateAuthor
                    onClose={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
                    onRefresh={fetchAuthors} // Gọi lại fetch sau khi cập nhật
                />
            ),
        }));
    };

    return (
        <div className={clsx('w-full')} style={{ backgroundColor: '#f8f8f8' }}>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Thông tin Tác Giả</span>
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
                <div className='w-[40px] h-[30px] bg-main text-white rounded text-center justify-center float-end items-center flex cursor-pointer mb-1' onClick={() => openAddModal()}>
                    <FaPlus />
                </div>
                <table className='table-auto mb-6 text-left w-full shadow bg-white'>
                    <thead className='font-bold bg-main text-[13px] text-white'>
                        <tr className='border border-main'>
                            <th className='px-4 py-2 '>STT</th>
                            <th className='px-4 py-2 '>Tên tác giả</th>
                            <th className='px-4 py-2 '>Mô tả</th>
                            <th className='px-4 py-2 '>Hình ảnh</th>
                            <th className='px-4 py-2 '>Ngày tạo</th>
                            <th className='px-4 py-2 '>Lựa chọn</th>
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
                                <td className='py-2 px-4 flex'>
                                    <span onClick={() => openEditModal(el)} className='px-2 text-main hover:underline cursor-pointer'>
                                        <FaRegEdit />
                                    </span>
                                    <span onClick={() => handlerDeleteAuthor(el._id)} className='px-2 text-main hover:underline cursor-pointer'>
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

export default ManageAuthor;