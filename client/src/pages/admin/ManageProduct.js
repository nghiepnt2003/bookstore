import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showModal } from '../../store/app/appSlice';
import UpdateProduct from '../../components/UpdateProduct';
import { apiDeleteProduct, apiGetProducts } from '../../apis/product';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Pagination, Input, Select } from 'antd';
import icons from '../../ultils/icons';
import CreateProduct from '../../components/CreateProduct';

const { Search } = Input;
const { Option } = Select;  // Thêm Select cho sắp xếp
const { FaRegEdit, FaTrashAlt, FaPlus } = icons;

const ManageProduct = () => {
    const dispatch = useDispatch();
    const [count, setCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(''); // State cho tìm kiếm
    const [sort, setSort] = useState('name'); // State cho sắp xếp

    // Hàm gọi API để lấy sản phẩm
    const fetchProducts = async (limit, page, name, sort) => {
        try {
            let response;
            if(name)
                response = await apiGetProducts({ limit, page, sort, name});
            else
                response = await apiGetProducts({ limit, page, sort});
            if (response.success) {
                setProducts(response.products);
                setCount(response.counts);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts(10, page, searchTerm, sort); // Gọi hàm fetch với tham số tìm kiếm và sắp xếp
    }, [page, searchTerm, sort]); // Thay đổi khi page, searchTerm hoặc sort thay đổi

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
                    fetchProducts(10, 1, searchTerm ,sort); // Cập nhật lại danh sách sản phẩm
                } else {
                    toast.error('Đã có lỗi xảy ra');
                }
            }
        });
    };

    const openEditModal = (product) => {
        dispatch(showModal({
            isShowModal: true,
            modalChildren: (
                <UpdateProduct
                    editProduct={product}
                    onClose={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
                    onRefresh={() => fetchProducts(10, 1, searchTerm, sort)} // Gọi lại fetch sau khi cập nhật
                />
            ),
        }));
        setPage(1);
    };

    const openAddModal = () => {
        dispatch(showModal({
            isShowModal: true,
            modalChildren: (
                <CreateProduct
                    onClose={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
                    onRefresh={() => fetchProducts(10, 1, searchTerm, sort)} // Gọi lại fetch sau khi cập nhật
                />
            ),
        }));
        setPage(1);
    };

    const onSearch = (value) => {
        setSearchTerm(value); // Cập nhật giá trị tìm kiếm
        setPage(1); // Reset về trang đầu
    };

    const handleSortChange = (value) => {
        setSort(value); // Cập nhật giá trị sắp xếp
        setPage(1); // Reset về trang đầu
    };

    return (
        <div className='w-full flex flex-col gap-3 relative overflow-x-auto'>
            <div className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 border-b border-b-main'>
                <h1 className='text-3xl font-bold tracking-tight'>Quản lý sản phẩm</h1>
            </div>
            <div className='px-[20px]'>
                <div className='flex w-full justify-end items-center py-4 px-2 mb-[20px]'>
                    <Search
                        className="w-full h-[50px]"
                        placeholder="Nhập tên sản phẩm..."
                        allowClear
                        onSearch={onSearch} // Sử dụng hàm onSearch
                        enterButton="Tìm kiếm"
                    />
                </div>
                <div className='flex items-center  justify-between mb-4'>
                    <Select
                        defaultValue="name"
                        onChange={handleSortChange}
                        className="w-[200px] mr-4"
                    >
                        <Option value="name">Tên A-Z</Option>
                        <Option value="-name">Tên Z-A</Option>
                        <Option value="price">Giá Thấp đến Cao</Option>
                        <Option value="-price">Giá Cao đến Thấp</Option>
                        <Option value="soldCount">Đã bán Tăng Dần</Option>
                        <Option value="-soldCount">Đã bán Giảm Dần</Option>
                    </Select>

                    <div className='w-[40px] h-[30px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer mb-1' onClick={() => openAddModal()}>
                        <FaPlus />
                    </div>
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
