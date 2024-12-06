import React, { useEffect, useState } from 'react';
import { apiGetInventories, apiCreateInventory, apiGetProducts } from '../../apis';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import icons from '../../ultils/icons'; // Giả sử bạn có biểu tượng xóa trong icons
import { DetailInventory } from '../../components';
import { showModal } from '../../store/app/appSlice';

const { TiDeleteOutline, FaEye } = icons;

const ManageStore = () => {
    const dispatch = useDispatch();
    const [inventories, setInventories] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('add'); // Mặc định chỉ có tab Nhập hàng
    const [note, setNote] = useState('');
    const [details, setDetails] = useState([]);
    const [store, setStore] = useState(0);

    const fetchInventories = async () => {
        const response = await apiGetInventories();
        if (response.success) {
            setInventories(response.inventories);
        }
    };

    const fetchProducts = async () => {
        const response = await apiGetProducts({ limit: 1000 });
        if (response.success) {
            setProducts(response.products);
            const availableProducts = response.products.filter(product => product.stockQuantity > 0);
            setStore(availableProducts.length)
        }
    };

    useEffect(() => {
        fetchInventories();
        fetchProducts();
    }, []);

    const handleAddDetail = (product) => {
        setDetails([...details, { 
            productId: product._id, 
            name: product.name, 
            price: product.price,
            quantity: "", 
            unitCost: "" // Mặc định giá nhập là 0
        }]);
    };

    const handleDetailChange = (index, event) => {
        const { name, value } = event.target;
        const newDetails = [...details];
        // Chỉ cập nhật nếu giá trị là số dương hoặc bằng 0
        if (value === '' || Number(value) >= 0) {
            newDetails[index][name] = value;
        }
        
        setDetails(newDetails);
    };

    const handleRemoveDetail = (index) => {
        const newDetails = details.filter((_, i) => i !== index);
        setDetails(newDetails);
    };

    const handleCreate = async () => {
        if (!note || details.length === 0) {
            toast.error('Ghi chú và chi tiết kho không được để trống');
            return;
        }
        
        // Kiểm tra từng chi tiết nhập hàng
        for (const detail of details) {
            if (!detail.quantity || !detail.unitCost) {
                toast.error('Số lượng và giá nhập không được để trống');
                return;
            }
        }

        const response = await apiCreateInventory({ note, details });
        if (response.success) {
            setNote('');
            setDetails([]);
            toast.success('Thêm kho thành công');
            fetchInventories();
            setActiveTab('history'); // Chuyển đến tab lịch sử nhập hàng
        } else {
            toast.error('Thêm kho thất bại: ' + response.message);
        }
    };

    const openViewDetails = (inventory) => {
        
        dispatch(showModal({
            isShowModal: true,
            modalChildren: (
                <DetailInventory
                    viewInventory={inventory}
                    onClose={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
                />
            ),
        }));
    };

    return (
        <div className={clsx('w-full')}>
            <h1 className='h-[75px] justify-between flex items-center text-3xl font-bold px-4 mb-4'>
                <span>Quản lý Kho Hàng</span>
                <span className='text-xl text-main'>Kho: {store}</span>
            </h1>

            <div className='flex mb-4'>
                <button 
                    className={clsx('px-4 py-2', activeTab === 'add' ? 'bg-main text-white border-main border-r' : 'border-main border-r border-b')}
                    onClick={() => setActiveTab('add')}
                >
                    Nhập hàng
                </button>
                <button 
                    className={clsx('px-4 py-2', activeTab === 'history' ? 'bg-main text-white' : 'border-main border-b')}
                    onClick={() => setActiveTab('history')}
                >
                    Lịch sử nhập hàng
                </button>
            </div>

            {activeTab === 'add' && (
                <div className='p-4'>
                    <label className='block mb-2'>Ghi chú</label>
                    <input
                        type='text'
                        placeholder='Nhập ghi chú'
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className='border p-2 w-full mb-4'
                    />
                    
                    <h3 className='text-xl mb-4'>Chi tiết nhập hàng</h3>
                    {details?.map((detail, index) => (
                        <div key={index} className='mb-2 flex items-center border-b'>
                            <span className='mr-2 text-main'>{detail.name} (Giá bán: {detail.price} VNĐ)</span>
                            <span className='mr-2'>Số lượng</span>
                            <input
                                type='number'
                                name='quantity'
                                min='1'
                                value={detail.quantity}
                                placeholder='Ex: 20'
                                onChange={(e) => handleDetailChange(index, e)}
                                className='border p-2 w-[120px] mb-1'
                            />
                            <span className='mr-2 ml-4'>Giá nhập</span>
                            <input
                                type='number'
                                name='unitCost'
                                min='0'
                                placeholder='Ex: 5000'
                                value={detail.unitCost}
                                onChange={(e) => handleDetailChange(index, e)}
                                className='border p-2 w-[150px] mb-1 ml-2'
                            />
                            <button 
                                onClick={() => handleRemoveDetail(index)} 
                                className='ml-2 text-red-500'
                            >
                                <TiDeleteOutline className='w-7 h-7 '/>
                            </button>
                        </div>
                    ))}

                    <div className='flex justify-end pt-2'>
                        <button 
                            onClick={handleCreate}
                            className='w-[80px] h-[40px] bg-main text-white rounded cursor-pointer hover:bg-[#f68ac0]'
                        >
                            Thêm
                        </button>
                    </div>

                    <h3 className='text-xl mb-4'>Chọn sản phẩm</h3>
                    <table className='mb-6 w-full shadow bg-white'>
                        <thead className='bg-main text-white'>
                            <tr>
                                <th className='px-2 py-2'>STT</th>
                                <th className='px-6 py-2'>Ảnh</th>
                                <th className='px-6 py-2'>Tên sản phẩm</th>
                                <th className='px-6 py-2'>Giá bán</th>
                                <th className='px-6 py-2'>Thêm vào chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.map((product, index) => (
                                <tr key={product._id}>
                                    <td className='px-6 py-2'>{index + 1}</td>
                                    <td className='py-2 px-6 flex items-center justify-center'>
                                        <img src={product.image} alt='avatar' className='w-12 h-12 object-cover' />
                                    </td>
                                    <td className='px-6 py-2'>{product.name}</td>
                                    <td className='px-6 py-2 flex items-center justify-center'>{product.price} VNĐ</td>
                                    <td className='px-6 py-2 text-center'>
                                        <button 
                                            onClick={() => handleAddDetail(product)}
                                            className='bg-blue-500 text-white p-1 rounded hover:bg-blue-700 transition duration-300'>
                                            Thêm
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'history' && (
                <div className='w-full p-4'>
                    <table className='mb-6 text-left w-full shadow bg-white'>
                        <thead className='font-bold bg-main text-[13px] text-white'>
                            <tr className='border border-main'>
                                <th className='px-4 py-2'>STT</th>
                                <th className='px-6 py-2'>Ghi chú</th>
                                <th className='px-6 py-2'>Tổng chi phí</th>
                                <th className='px-6 py-2'>Ngày cập nhật</th>
                                <th className='px-4 py-2'>Lựa chọn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventories?.map((inventory, index) => (
                                <tr key={inventory._id} className='border border-main'>
                                    <td className='py-2 px-4'>{index + 1}</td>
                                    <td className='py-2 px-6'>{inventory.note}</td>
                                    <td className='py-2 px-6'>{inventory.totalCost} VNĐ</td>
                                    <td className='py-2 px-6'>{new Date(inventory.updatedAt).toLocaleDateString()}</td>
                                    <td className='py-2 px-7'>
                                        <FaEye onClick={() => openViewDetails(inventory)} className='w-7 h-7 text-main hover:underline cursor-pointer px-1'/>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageStore;