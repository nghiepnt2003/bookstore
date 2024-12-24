import React, { useEffect, useState, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { Button, Product } from "../../components";
import { apiGetProducts } from "../../apis";
import Masonry from 'react-masonry-css';
import { createSlug } from '../../ultils/helpers';
import { useSelector } from "react-redux";
import { sorts } from "../../ultils/contants";
import icons from '../../ultils/icons';
import useDebounce from '../../hooks/useDebounce';
import { Pagination, Input } from 'antd';

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};

const {CiSearch} = icons

const Products = () => {
    const { category } = useParams();
    const [products, setProducts] = useState(null);
    const { categories } = useSelector(state => state.app);
    const [sort, setSort] = useState(null);
    const [price, setPrice] = useState({ from: '', to: '' });
    const debouncedFrom = useDebounce(price.from, 500);
    const debouncedTo = useDebounce(price.to, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [limit, setLimit] = useState(10); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const debouncedSearchTerm = useDebounce(searchTerm, 500); 

    const selectedCategory = categories ? categories.find(cat => createSlug(cat.name) === category) : null;

    const fetchProductsByCategory = async () => {
        const tam = currentPage;
        const params = {
            page: currentPage,
            limit: limit,
        };
        if (selectedCategory) {
            params.categories = selectedCategory._id;
        }
        if (debouncedFrom) {
            params['price[gte]'] = debouncedFrom;
        }
        if (debouncedTo) {
            params['price[lte]'] = debouncedTo;
        }
        if (sort) {
            params.sort = sort;
        }
        if (debouncedSearchTerm) {
            params.name = debouncedSearchTerm;
        }

        // params.page = tam;

        const response = await apiGetProducts(params);
        if (response.success) {
            setProducts(response.products);
            setTotalProducts(response.counts); 
        }
        else
        {
            setProducts([])
            setTotalProducts(0); 

        }
    };
      // useEffect riêng để kiểm tra và thiết lập lại trang
      useEffect(() => {
        if (debouncedFrom || debouncedTo || debouncedSearchTerm) {
            setCurrentPage(1);
        }
    }, [debouncedFrom, debouncedTo, debouncedSearchTerm]);

    useEffect(() => {
        fetchProductsByCategory();
    }, [debouncedFrom, debouncedTo, sort, selectedCategory, currentPage, limit, debouncedSearchTerm]);

    const u = useCallback(() => {

    },[])

    const changeValue = useCallback((value) => {
        // setSort(value);
        setSort(prevSort => (prevSort === value ? null : value));
        setCurrentPage(1); 
    }, []);

    const handlePageSizeChange = (current, newSize) => {
        setLimit(newSize); 
    };

    const handleSearch = (value) => {
        setCurrentPage(1); 
        setSearchTerm(value);
    };

    return (
        <div>
           {/* Thanh tìm kiếm nằm riêng trên cùng */}
           <div className="w-main flex mt-8 m-auto">
                <div className="relative w-[800px] ml-[400px] mr-[100px]">
                    <Input
                        className="w-full"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onSearch={handleSearch}
                    />
                    <div className="absolute right-0 top-[50%] transform -translate-y-[50%] bg-blue-600 p-3">
                        <CiSearch className="text-white" />
                    </div>
                </div>
            </div>

            {/* Bộ lọc và sắp xếp nằm chung hàng dưới */}
            <div className="w-main flex justify-between mt-8 border-t border-gray-200">
                <div className="flex items-center gap-3 mt-4">
                    <div className='flex items-center'>
                        <span className="mr-2 font-semibold">Lọc theo giá:</span>
                        <div className='flex'>
                            <div className='flex items-center'>
                                <input
                                    className='form-input w-[130px] ml-1 mr-1' 
                                    type='number' 
                                    id="from"
                                    placeholder="Từ"
                                    value={price.from}
                                    onChange={e => {
                                        const value = e.target.value === '' ? '' : Math.max(0, e.target.value);
                                        setPrice(prev => ({ ...prev, from: value }));
                                    }}
                                />
                                VNĐ
                            </div>
                            <span className="ml-1 mr-1 flex items-center justify-center">-</span>
                            <div className='flex items-center'>
                                <input
                                    className='form-input w-[130px] ml-1 mr-1' 
                                    type='number' 
                                    id="to"
                                    placeholder="Đến"
                                    value={price.to}
                                    onChange={e => {
                                        const value = e.target.value === '' ? '' : Math.max(0, e.target.value);
                                        setPrice(prev => ({ ...prev, to: value }));
                                    }}
                                />
                                VNĐ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sắp xếp bằng các nút */}
                <div className="flex items-center gap-3">
                    <span className="font-semibold">Sắp xếp theo:</span>
                    {sorts.map((option) => (
                        <button 
                            key={option.value} 
                            className={`p-2 border rounded ${sort === option.value ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                            onClick={() => changeValue(option.value)}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hiển thị sản phẩm */}
            <div className="mt-8 m-auto">
                {products?.length === 0 ? (  // Kiểm tra nếu danh sách sản phẩm rỗng
                    <div className="text-center text-lg font-semibold italic text-gray-500 mb-[500px]">
                        Không tìm thấy sản phẩm phù hợp
                    </div>
                ) : (
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="my-masonry-grid flex mx-[-16px]"
                        columnClassName="my-masonry-grid_column"
                    >
                        {products?.map(el => (
                            <Product 
                                key={el._id}
                                productData={el}
                            />
                        ))}
                    </Masonry>
                )}
            </div>

            {/* Phân trang */}
            <div className="w-main m-auto my-4 flex justify-center">
                <Pagination
                    current={currentPage}
                    pageSize={limit}
                    total={totalProducts}
                    onChange={page => setCurrentPage(page)}
                    showSizeChanger={true}
                    onShowSizeChange={handlePageSizeChange}
                />
            </div>
            <div className="w-full h-[100px]"></div>
        </div>
    );
};

export default Products;