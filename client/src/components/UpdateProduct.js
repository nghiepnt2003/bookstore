import React, { memo, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { apiGetAuthors, apiGetPublishers, apiUpdateProduct } from '../apis';
import { toast } from 'react-toastify';
import { Spin } from 'antd';
import icons from '../ultils/icons';
import CategorySelect from './CategorySelect';
import AuthorSelect from './AuthorSelect';
import compressImage from './compressImage';

const { TiCameraOutline } = icons;

const UpdateProduct = ({ editProduct, onClose, onRefresh }) => {
    const { categories } = useSelector(state => state.app);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        pageNumber: '',
        author: [],
        publisher: '',
        categories: [],
        description: '',
        soldCount: '',
        image: '',
    });
    const [avatar, setAvatar] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);

    useEffect(() => {
        if (editProduct) {
            setFormData({
                name: editProduct.name || '',
                price: editProduct.price || '',
                pageNumber: editProduct.pageNumber || '',
                author: editProduct.author?.map(auth => auth._id) || [],
                publisher: editProduct.publisher?._id || '',
                categories: editProduct.categories?.map(cat => cat._id) || [],
                description: editProduct.description || '',
                soldCount: editProduct.soldCount || '',
                image: editProduct.image || '',
            });
            setAvatar(editProduct.image);
            setSelectedCategories(editProduct.categories?.map(cat => ({ _id: cat._id, name: cat.name })) || []);
            setSelectedAuthors(editProduct.author?.map(auth => ({_id: auth._id, name: auth.name})) || []);
        }
    }, [editProduct]);

    const fetchAuthors = async () => {
        try {
            const response = await apiGetAuthors();
            if (response.success && Array.isArray(response.authors)) {
                setAuthors(response.authors);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPublishers = async () => {
        try {
            const response = await apiGetPublishers();
            if (response.success && Array.isArray(response.publishers)) {
                setPublishers(response.publishers)
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAuthors();
        fetchPublishers()
    }, []);

    // const handleFileChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             setAvatar(reader.result);
    //             setFormData(prev => ({ ...prev, image: reader.result }));
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressedImage = await compressImage(file);
            setAvatar(compressedImage);
            setFormData(prev => ({ ...prev, image: compressedImage }));
        }
        // reader.readAsDataURL(file);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log("FORMDATA " + JSON.stringify(formData))
            console.log("ANH LỚN "+formData.image.length)
            const response = await apiUpdateProduct({ ...formData, categories: selectedCategories, author: selectedAuthors }, editProduct._id);
            if (response.success) {
                toast.success('Cập nhật sản phẩm thành công');
                onRefresh();
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleFormClick = (e) => {
        e.stopPropagation(); // Ngăn chặn modal đóng
    };

    const removeCategory = useCallback((categoryId) => {
        setSelectedCategories(prev => prev.filter(cat => cat._id !== categoryId));
    }, []);

    const handleSelectChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'category' && value) {
            const selectedCategory = JSON.parse(value);
            if (!selectedCategories.some(cat => cat._id === selectedCategory._id)) {
                setSelectedCategories(prev => [...prev, selectedCategory]);
            }
        }
    }, [selectedCategories]);

    const handleSelectChangeAuthor = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'author' && value) {
            const selectedAuthor = JSON.parse(value);
            if (!selectedAuthors.some(auth => auth._id === selectedAuthor._id)) {
                setSelectedAuthors(prev => [...prev, selectedAuthor]);
            }
        }
    }, [selectedAuthors]);

    const removeAuthor = useCallback((authId) => {
        setSelectedAuthors(prev => prev.filter(auth => auth._id !== authId));
    }, []);

    // Hàm cập nhật formData khi nhập
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Spin size='large' spinning={loading}>
            <div className='w-[900px] flex flex-col gap-4 relative p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
                <form onClick={handleFormClick} onSubmit={handleUpdateProduct} className="flex flex-col md:flex-row gap-4">
                    {/* Cột Avatar */}
                    <div className="flex flex-col items-center w-full md:w-1/4 relative border border-gray-300 rounded-md h-80">
                        <input
                            type='file'
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 cursor-pointer opacity-0 z-10"
                        />
                        {avatar ? (
                            <div className="relative">
                                <img
                                    src={avatar}
                                    alt="Avatar Preview"
                                    className="w-50 h-80 object-cover p-4"
                                />
                                <TiCameraOutline className="absolute bottom-2 right-2 h-8 w-8 text-white bg-gray-600 rounded-full p-1" />
                            </div>
                        ) : (
                            <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center">
                                <TiCameraOutline className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Cột Thông Tin Sản Phẩm */}
                    <div className="flex flex-col w-full md:w-3/4 border border-gray-300 rounded-md p-4">
                        {/* Tên Sản Phẩm */}
                        <div className="flex flex-col w-full">
                            <label htmlFor="name" className="font-semibold mb-1">Tên sản phẩm</label>
                            <input
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange} // Thêm onChange
                                className="p-2 border border-gray-300 rounded-md text-lg"
                            />
                        </div>

                        {/* Giá, Số Trang, và Số Lượng Còn Lại */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex flex-col">
                                <label htmlFor="price" className="font-semibold mb-1">Giá</label>
                                <input
                                    type='number'
                                    name='price'
                                    value={formData.price}
                                    onChange={handleInputChange} // Thêm onChange
                                    className="p-2 border border-gray-300 rounded-md text-lg"
                                />
                            </div>
                            <div className="flex flex-col w-[160px]">
                                <label htmlFor="pageNumber" className="font-semibold mb-1">Số trang</label>
                                <input
                                    type='number'
                                    name='pageNumber'
                                    value={formData.pageNumber}
                                    onChange={handleInputChange} // Thêm onChange
                                    className="p-2 border border-gray-300 rounded-md text-lg"
                                />
                            </div>
                            <div className="flex flex-col w-[160px]">
                                <label htmlFor="soldCount" className="font-semibold mb-1">Đã bán</label>
                                <input
                                    type='number'
                                    name='soldCount'
                                    value={formData.soldCount}
                                    readOnly
                                    className="p-2 border border-gray-300 rounded-md text-lg"
                                />
                            </div>
                        </div>

                        {/* Mô Tả */}
                        <div className="flex flex-col">
                            <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
                            <textarea
                                name='description'
                                value={formData.description}
                                onChange={handleInputChange} // Thêm onChange
                                className="p-2 border border-gray-300 rounded-md text-lg"
                            />
                        </div>
                        <CategorySelect
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onChange={handleSelectChange}
                            onRemove={removeCategory}
                        />
                        <AuthorSelect
                            authors={authors}
                            selectedAuthors={selectedAuthors}
                            onChange={handleSelectChangeAuthor}
                            onRemove={removeAuthor}
                        />

                        {/* Nhà Xuất Bản */}
                        <div className="flex flex-col">
                            <label htmlFor="publisher" className="font-semibold mb-1">Nhà xuất bản</label>
                            <select
                                name='publisher'
                                value={formData.publisher}
                                onChange={handleInputChange} // Thêm onChange
                                className="p-2 border border-gray-300 rounded-md text-lg"
                            >
                                <option value=''>Chọn nhà xuất bản</option>
                                {publishers.map((publisher) => (
                                    <option key={publisher._id} value={publisher._id}>
                                        {publisher.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </form>

                {/* Nút Cập Nhật và Đóng */}
                <div className="flex justify-between mt-4">
                    <button type='submit' onClick={handleUpdateProduct} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                        Cập nhật sản phẩm
                    </button>
                    <button type='button' onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
                        Đóng
                    </button>
                </div>
            </div>
        </Spin>
    );
};

export default memo(UpdateProduct);