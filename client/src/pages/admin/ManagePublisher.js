import React, { useEffect, useState } from 'react';
import { apiGetPublishers, apiDeletePublisher, apiUpdatePublisher } from '../../apis';
import moment from 'moment';
import { InputField, EditPublisherForm, CreatePublisher } from '../../components'; // Đảm bảo EditPublisherForm tồn tại
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { useDispatch } from "react-redux";
import { showModal } from '../../store/app/appSlice';
import icons from '../../ultils/icons';

const { FaRegEdit, FaTrashAlt, FaPlus } = icons;

const ManagePublisher = () => {
    const [publishers, setPublishers] = useState(null);
    const [queries, setQueries] = useState({ name: "" });
    const dispatch = useDispatch();

    const fetchPublishers = async (params) => {
        const response = await apiGetPublishers(params);
        if (response.success) 
            setPublishers(response.publishers);
        else setPublishers([]);
    };

    useEffect(() => {
        console.log("QUERI NAME " + JSON.stringify(queries))
        if (queries.name && queries.name !== "")
            fetchPublishers({ name: queries.name });
        else
            fetchPublishers();
    }, [queries]);

    const handleUpdatePublisher = async (updatedPublisherData, publisherId) => {
        const response = await apiUpdatePublisher(updatedPublisherData, publisherId);
        console.log("KQUA " + JSON.stringify(JSON))
        return response;
    };

    const openEditModal = (publisher) => {
        dispatch(showModal({ 
            isShowModal: true, 
            modalChildren: <EditPublisherForm
                publisher={publisher}
                onUpdate={handleUpdatePublisher}
                onCancel={closeModal}
                fetchPublishers={fetchPublishers}
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
                <CreatePublisher
                    onClose={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
                    onRefresh={fetchPublishers} // Gọi lại fetch sau khi cập nhật
                />
            ),
        }));
    };

    return (
        <div className={clsx('w-full')} style={{ backgroundColor: '#f8f8f8' }}>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Thông tin Nhà Xuất Bản</span>
            </h1>
            <div className='w-full p-4'>
                <div className='flex justify-end p-4'>
                    <InputField
                        nameKey={'name'}
                        value={queries.name}
                        setValue={setQueries}
                        style='w500'
                        placeholder='Tìm kiếm tên nhà xuất bản' // Cập nhật placeholder
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
                            <th className='px-4 py-2 '>Tên nhà xuất bản</th>
                            <th className='px-4 py-2 '>Mô tả</th>
                            <th className='px-4 py-2 '>Lựa chọn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {publishers?.map((el, index) => (
                            <tr key={el._id} className='border border-main '>
                                <td className='py-2 px-4'>{index + 1}</td>
                                <td className='py-2 px-4'>{el.name}</td>
                                <td className='py-2 px-4'>{el.description}</td>
                                <td className='py-2 px-4'>
                                    <span onClick={() => openEditModal(el)} className='px-2 text-main hover:underline cursor-pointer'>
                                        <FaRegEdit />
                                    </span>
                                    {/*<span onClick={() => handlerDeletePublisher(el._id)} className='px-2 text-main hover:underline cursor-pointer'>Xóa</span> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagePublisher;