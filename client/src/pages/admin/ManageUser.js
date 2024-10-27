import React, { useCallback, useEffect, useState } from 'react'
import { apiGetUsers, apiUpdateUser, apiDeleteUser } from '../../apis/user'
import moment from 'moment'
import { InputField, InputForm, AdminButton, Select } from '../../components'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import clsx from 'clsx'

const options = [
    {
      value: 'Hoạt động',
      code: true
    },
    {
        value: 'Đã khóa',
        code: false
    }
]
const ManageUser = () => {
    const { handleSubmit, register, formState: { errors }, reset } = useForm({
        email: '',
        name: '',
        role: '',
        phone: '',
        status: ''
    })
    const [users, setUsers] = useState(null)
    const [queries, setQueries] = useState({
        name: ""
    })
    const [update, setUpdate] = useState(false)
    const [editE, seteditE] = useState(null)
    const fetchUsers = async (params) => {
        const response = await apiGetUsers(params)
        if (response.success) 
            setUsers(response.users)
        else setUsers([])
    }

    const render = useCallback(() => {
        setUpdate(!update)
    }, [update])
    useEffect(() => {
        if (queries.name !== '') 
            fetchUsers(queries)
        else 
            fetchUsers()
    }, [queries, update])
    console.log("USERS " + JSON.stringify(users))
    const handleUpdate = async (data) => {
        const response = await apiUpdateUser(data, editE._id)
        if (response.success) {
            seteditE(null)
            render()
            toast.success(response.mes)
        } else toast.error(response.mes)
    }
    const handlerDeleteUser = (uid) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa???',
            text: 'Bạn đã sẵn sàng xóa chưa???',
            showCancelButton: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await apiDeleteUser(uid)
                if (response.success) {
                    render()
                    toast.success(response.message)
                } else toast.error(response.message)
            }
        })
    }
    useEffect(() => {
        reset({
            status: editE?.status || '',
            name: editE?.name || '',
            role: editE?.role || '',
            phone: editE?.phone || '',
        })
    }, [editE])
    return (
        <div className={clsx('w-full', editE && 'pl-2')}>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <span>Quản Lý Thành Viên</span>
            </h1>
            <div className='w-full p-4'>
                <div className='flex justify-end p-4'>
                    <InputField
                        nameKey={'name'}
                        value={queries.name}
                        setValue={setQueries}
                        style='w500'
                        placeholder={'Tìm kiếm tên người dùng'}
                        isHideLabel
                    />
                </div>
                <form onSubmit={handleSubmit(handleUpdate)} >
                    {editE && <AdminButton type='submit'>Cập nhật</AdminButton>}
                    <table className='table-auto mb-6 text-left w-full'>
                        <thead className='font-bold bg-main text-[13px] text-white'>
                            <tr className='border border-main'>
                                <th className='px-4 py-2 '>STT</th>
                                <th className='px-4 py-2 '>Địa chỉ email</th>
                                <th className='px-4 py-2 '>Tên người dùng</th>
                                <th className='px-4 py-2 '>Quyền</th>
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
                                    <td className='py-2 px-4'>{editE?._id === el._id
                                        ? <InputForm
                                            fw
                                            register={register}
                                            errols={errors}
                                            id={'name'}
                                            validate={{ required: 'Yêu cầu nhập ' }}
                                        /> : <span>{el.username}</span>}</td>
                                    <td className='py-2 px-4'>{editE?._id === el._id ? <InputForm
                                        fw
                                        register={register}
                                        errols={errors}
                                        id={'role'}
                                        validate={{ required: 'Yêu cầu nhập ' }}
                                    /> : <span>{el.role}</span>}</td>
                                    <td className='py-2 px-4'>{editE?._id === el._id
                                        ? <InputForm
                                            fw
                                            register={register}
                                            errols={errors}
                                            id={'phone'}
                                            validate={{
                                                required: 'Yêu cầu nhập ',
                                                pattern: {
                                                    value: /^[62|0]+\d{9}/gi,
                                                    message: 'Nhập lại số diện thoại'
                                                }

                                            }}
                                        /> : <span>{el.phone}</span>}</td>
                                    <td className='py-2 px-4'>{editE?._id === el._id
                                        ? <Select
                                            options={options}
                                            fullwidth
                                            register={register}
                                            errors={errors}
                                            id='status'
                                        /> : <span>{el.status ? 'Hoạt động' : 'Đã khóa'}</span>}</td>
                                    <td className='py-2 px-4'>{moment(el.createdAt).format('DD/MM/YYYY')}</td>
                                    <td className='py-2 px-4'>
                                        {editE?._id === el._id ? <span onClick={() => seteditE(null)} className='px-2 text-main hover:underline cursor-pointer'>Hủy</span>
                                            : <span onClick={() => seteditE(el)} className='px-2 text-main hover:underline cursor-pointer'>Sửa</span>}
                                        <span onClick={() => handlerDeleteUser(el._id)} className='px-2 text-main hover:underline cursor-pointer'>Xóa</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </form>

            </div>
        </div>
    )
}

export default ManageUser