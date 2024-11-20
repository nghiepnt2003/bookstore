import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showModal } from '../../store/app/appSlice'; // Import action để hiển thị modal
import UpdateProduct from '../../components/UpdateProduct';
import { apiDeleteProduct, apiGetProducts } from '../../apis/product';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Pagination, Input } from 'antd';
import icons from '../../ultils/icons';
import CreateProduct from '../../components/CreateProduct';

const { Search } = Input;
const { FaRegEdit, FaTrashAlt, FaPlus } = icons;

const ManageProduct = () => {
    const dispatch = useDispatch();
    const [count, setCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);

    const fetchProducts = async (limit, page) => {
        try {
            const response = await apiGetProducts({ limit, page });
            if (response.success) {
                setProducts(response.products);
                setCount(response.counts);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts(10, page);
    }, [page]);

    const handleDeleteProduct = (pid) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Bạn có chắc chắn muốn xóa sản phẩm?',
            icon: 'warning',
            showCancelButton: true,
        }).then(async (rs) => {
            if (rs.isConfirmed) {
                const response = await apiDeleteProduct(pid);
                if (response.success) {
                    toast.success('Xóa thành công');
                    fetchProducts(10, page); // Cập nhật lại danh sách sản phẩm
                } else {
                    toast.error('Đã có lỗi xảy ra');
                }
            }
        });
    };

    const openEditModal = (product) => {
        console.log("PRODUCT " + JSON.stringify(product))
        dispatch(showModal({
            isShowModal: true,
            modalChildren: (
                <UpdateProduct
                    editProduct={product}
                    onClose={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
                    onRefresh={fetchProducts} // Gọi lại fetch sau khi cập nhật
                />
            ),
        }));
        setPage(1)
    };

    const openAddModal = () => {
        dispatch(showModal({
            isShowModal: true,
            modalChildren: (
                <CreateProduct
                    onClose={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
                    onRefresh={fetchProducts} // Gọi lại fetch sau khi cập nhật
                />
            ),
        }));
        setPage(1)
    };


    return (
        <div className='w-full flex flex-col gap-3 relative overflow-x-auto'>
            <div className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <h1 className='text-3xl font-bold tracking-tight'>Quản lý sản phẩm</h1>
            </div>
            <div className='px-[20px]'>
                {/* <div className='flex w-full justify-end items-center py-4 px-2 mb-[20px]'>
                    <Search
                        className="w-[60vw]"
                        placeholder="Nhập tên sản phẩm..."
                        allowClear
                        enterButton="Search"
                    />
                </div> */}
                <div className='w-[40px] h-[30px] bg-main text-white rounded text-center justify-center float-end items-center flex cursor-pointer mb-1' onClick={() => openAddModal()}>
                    <FaPlus />
                </div>
                <table className='mb-6 text-left w-full shadow bg-white'>
                    <thead className='font-bold bg-main text-[13px] text-white'>
                        <tr className='border border-main'>
                            <th className='px-4 py-2'>STT</th>
                            <th className='px-6 py-2'>Avatar</th>
                            <th className='px-6 py-2'>Tên sản phẩm</th>
                            <th className='px-6 py-2'>Danh mục</th>
                            <th className='px-6 py-2'>Giá</th>
                            <th className='px-6 py-2'>Đã bán</th>
                            <th className='px-6 py-2'>Đánh giá</th>
                            <th className='px-6 py-2'>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((el, index) => (
                            <tr className='border border-main' key={el._id}>
                                <td className='py-2 px-6'>{index + 1}</td>
                                <td className='py-2 px-6'>
                                    <img src={el.image} alt='avatar' className='w-12 h-12 object-cover' />
                                </td>
                                <td className='py-2 px-6'>{el.name}</td>
                                <td className='py-2 px-6'>{el.categories.map(cat => cat.name).join(', ')}</td>
                                <td className='py-2 px-6'>{el.price}</td>
                                <td className='py-2 px-6'>{el.soldCount}</td>
                                <td className='py-2 px-6'>{el.averageRating}</td>
                                <td className='py-2 px-6 flex items-center justify-center'>
                                    <span onClick={() => openEditModal(el)} className='text-main hover:underline cursor-pointer px-1'>
                                        <FaRegEdit />
                                    </span>
                                    <span onClick={() => handleDeleteProduct(el._id)} className='text-main hover:underline cursor-pointer px-1'>
                                        <FaTrashAlt />
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='w-full p-[40px] flex items-center justify-center'>
                    <Pagination
                        defaultPageSize={10}
                        current={page}
                        onChange={setPage}
                        total={count}
                        showSizeChanger={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default ManageProduct;