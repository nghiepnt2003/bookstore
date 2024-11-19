import React, { useEffect, useState } from 'react';
import { apiGetUsers, apiDeleteUser, apiUpdateUser } from '../../apis/user';
import moment from 'moment';
import { InputField, EditUserForm } from '../../components';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { useDispatch } from "react-redux";
import { showModal } from '../../store/app/appSlice';
import icons from '../../ultils/icons';

const { FaRegEdit, FaTrashAlt, FaPlus } = icons;

const ManageUser = () => {
    const [users, setUsers] = useState(null);
    const [queries, setQueries] = useState({ username: "" });
    const dispatch = useDispatch();

    const fetchUsers = async (params) => {
        console.log("PR "+ JSON.stringify(params))
        const response = await apiGetUsers(params);
        if (response.success) 
            setUsers(response.users);
        else setUsers([]);
    };

    useEffect(() => {
        fetchUsers(queries.username !== '' ? queries : {});
    }, [queries]);

    const handleUpdateUser = async (updatedUserData, userId) => {
        const response = await apiUpdateUser(updatedUserData, userId);
        console.log("RP " + JSON.stringify(response))
        return response // Trả về phản hồi để xử lý ở EditUserForm
    };

    const handlerDeleteUser = (uid, isBlocked) => {
        if(isBlocked)
        {
            Swal.fire({
                title: 'Bạn có chắc chắn muốn xóa???',
                text: 'Bạn đã sẵn sàng xóa chưa???',
                showCancelButton: true
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const response = await apiDeleteUser(uid);
                    if (response.success) {
                        fetchUsers();
                        toast.success("Xóa người dùng thành công");
                    } else toast.error(response.message);
                }
            });
        }
        else
        {
            // Thông báo khi không thể xóa
            Swal.fire({
                title: 'Không thể xóa người dùng!',
                text: 'Người dùng này không bị khóa vì vậy không thể xóa.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
        
    };

    const openEditModal = (user) => {
        dispatch(showModal({ 
            isShowModal: true, 
            modalChildren: <EditUserForm
                user={user}
                onUpdate={handleUpdateUser}
                onCancel={closeModal} // Chỉ cần đóng modal
                fetchUsers={fetchUsers}
            />
        }));
    };

    const closeModal = () => {
        dispatch(showModal({ isShowModal: false, modalChildren: null }));
    };

    return (
        <div className={clsx('w-full')} style={{ backgroundColor: '#f8f8f8' }}>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Quản Lý Tài Khoản</span>
            </h1>
            <div className='w-full p-4'>
                <div className='flex justify-end p-4'>
                    <InputField
                        nameKey={'username'}
                        value={queries.username}
                        setValue={setQueries}
                        style='w500'
                        placeholder='Tìm kiếm tên đăng nhập' // Cập nhật placeholder
                        isHideLabel
                    />
                </div>
                <table className='table-auto mb-6 text-left w-full shadow bg-white'>
                    <thead className='font-bold bg-main text-[13px] text-white'>
                        <tr className='border border-main'>
                            <th className='px-4 py-2 '>STT</th>
                            <th className='px-4 py-2 '>Địa chỉ email</th>
                            <th className='px-4 py-2 '>Tên người dùng</th>
                            <th className='px-4 py-2 '>Vai trò</th>
                            <th className='px-4 py-2 '>Số điện thoại</th>
                            <th className='px-4 py-2 '>Trạng thái</th>
                            <th className='px-4 py-2 '>Ngày tạo</th>
                            <th className='px-8 py-2 '>Lựa chọn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((el, index) => (
                            <tr key={el._id} className='border border-main '>
                                <td className='py-2 px-4'>{index + 1}</td>
                                <td className='py-2 px-4'>{el.email}</td>
                                <td className='py-2 px-4'>{el.username}</td>
                                <td className='py-2 px-4'>{el.role === 1 ? 'admin' : 'customer'}</td>
                                <td className='py-2 px-4'>{el.phone}</td>
                                <td className='py-2 px-4'>{el.isBlocked ===false ? 'Hoạt động' : 'Đã khóa'}</td>
                                <td className='py-2 px-4'>{moment(el.createdAt).format('DD/MM/YYYY')}</td>
                                <td className='py-2 px-4 flex'>
                                    <span onClick={() => openEditModal(el)} className='px-2 text-main hover:underline cursor-pointer'>
                                        <FaRegEdit />
                                    </span>
                                    <span onClick={() => handlerDeleteUser(el._id, el.isBlocked)} className='px-2 text-main hover:underline cursor-pointer'>
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

export default ManageUser;