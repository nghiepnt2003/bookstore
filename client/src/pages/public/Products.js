import React, { memo, useEffect, useState, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { Breadcrumb, InputSelect, Product} from "../../components";
import { apiGetProducts } from "../../apis";
import Masonry from 'react-masonry-css';
import { createSlug } from '../../ultils/helpers';
import { useSelector } from "react-redux";
import { sorts } from "../../ultils/contants";
import icons from '../../ultils/icons';
import useDebounce from '../../hooks/useDebounce';
import { Pagination, Spin, Input } from 'antd';

const { AiOutlineDown } = icons;

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};

const Products = () => {
    const { category } = useParams();
    const [products, setProducts] = useState(null);
    const [activeClick, setActiveClick] = useState(null);
    const { categories } = useSelector(state => state.app);
    const [sort, setSort] = useState(null);
    const [price, setPrice] = useState({ from: '', to: '' });
    const debouncedFrom = useDebounce(price.from, 500);
    const debouncedTo = useDebounce(price.to, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [limit, setLimit] = useState(10); // Số sản phẩm mỗi trang
    const [searchTerm, setSearchTerm] = useState(''); // State cho tìm kiếm
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Sử dụng debounce cho tìm kiếm

    const selectedCategory = categories ? categories.find(cat => createSlug(cat.name) === category) : null;

    const fetchProductsByCategory = async () => {
        const params = {
            page: currentPage, // Thêm thông số trang vào yêu cầu
            limit: limit, // Thêm thông số giới hạn sản phẩm mỗi trang
        };
        if (selectedCategory) {
            params.categories = selectedCategory._id;
        }
        if(activeClick)
        {
            if (debouncedFrom) {
                params['price[gte]'] = debouncedFrom;
            }
            if (debouncedTo) {
                params['price[lte]'] = debouncedTo;
            }
        }
        if (sort) {
            params.sort = sort;
        }
        // Thêm tham số tìm kiếm vào yêu cầu
        if (debouncedSearchTerm) {
            params.page = 1
            params.name = debouncedSearchTerm;
        }

        const response = await apiGetProducts(params);
        console.log("KQUA " + JSON.stringify(response))
        if (response.success) {
            setProducts(response.products);
            setTotalProducts(response.counts); // Cập nhật tổng số sản phẩm
        }
    };

    useEffect(() => {
        fetchProductsByCategory();
    }, [debouncedFrom, debouncedTo, sort, selectedCategory, activeClick, currentPage, limit, debouncedSearchTerm]);

    const changeActiveFilter = useCallback((name) => {
        if(activeClick === name)
        {
            setActiveClick(null)
        }
        else
        {
            setActiveClick(name)
        }
    }, [activeClick]);

    const changeValue = useCallback((value) => {
        setSort(value);
    }, []);

    const handlePageSizeChange = (current, newSize) => {
        setLimit(newSize); // Cập nhật số sản phẩm mỗi trang
    };

    const handleSearch = (value) => {
        setCurrentPage(1); // Đặt lại trang về 1 khi tìm kiếm
        setSearchTerm(value);
    };

    return (
        <div>
            <div className="w-main border p-4 flex justify-between mt-8 m-auto">
                <div className="w-1/5 flex-auto flex flex-col">
                    <div className="flex items-center gap-3">
                        Filter by: 
                        <div 
                            className='p-3 text-xs text-gray-500 gap-6 relative border border-gray-800 flex justify-between items-center bg-white w-[100px]'
                            onClick={() => changeActiveFilter('Price')}
                        >
                            <span className='capitalize'>Giá</span>
                            <AiOutlineDown />
                            {activeClick === 'Price' && (
                                <div className='absolute top-full left-0 w-fit p-4 z-10 bg-white border border-main'>
                                    <div onClick={e => e.stopPropagation()}>
                                        <div>
                                            <span>Nhập giá phù hợp với bạn</span>
                                            <div className='flex'>
                                                <div className='flex items-center p-2 gap-2'>
                                                    <label htmlFor='from'>Từ</label>
                                                    <input 
                                                        className='form-input w-[150px]' 
                                                        type='number' 
                                                        id="from"
                                                        value={price.from}
                                                        onChange={e => setPrice(prev => ({ ...prev, from: e.target.value }))}
                                                    />
                                                </div>
                                                <div className='flex items-center p-2 gap-2'>
                                                    <label htmlFor='to'>Đến</label>
                                                    <input 
                                                        className='form-input w-[150px]' 
                                                        type='number' 
                                                        id="to"
                                                        value={price.to}
                                                        onChange={e => setPrice(prev => ({ ...prev, to: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-3/5 flex-auto flex">
                    {/* Search Input */}
                    <Input.Search
                        className="w-[700px]"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onSearch={handleSearch}
                        enterButton= {
                            <button style={{
                                height: '43px', // Chiều cao của nút
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0 5px 5px 0', // Bo tròn góc trên
                                padding: '0 20px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                Search
                            </button>
                        }
                    />
                </div>
                <div className="w-1/5 flex-auto flex flex-col">
                    <div className="flex items-center gap-3">
                        Sort by:
                        <InputSelect 
                            changeValue={changeValue}
                            value={sort}
                            options={sorts}
                        />
                    </div>                   
                </div>
            </div>
            <div className="mt-8 m-auto">
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
            </div>
           {/* Phân trang */}
        <div className="w-main m-auto my-4 flex justify-center">
            <Pagination
                current={currentPage}
                pageSize={limit}
                total={totalProducts}
                onChange={page => setCurrentPage(page)}
                showSizeChanger={true} // Bạn có thể bật tắt chức năng thay đổi số sản phẩm mỗi trang
                onShowSizeChange={handlePageSizeChange} // Hàm xử lý khi thay đổi số sản phẩm mỗi trang
            />
        </div>
            <div className="w-full h-[100px]"></div>
        </div>
    );
};

export default Products;
