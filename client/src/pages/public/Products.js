import React, { memo, useEffect, useState, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { Breadcrumb, InputSelect, Product } from "../../components";
import { apiGetProducts } from "../../apis";
import Masonry from 'react-masonry-css';
import { createSlug } from '../../ultils/helpers';
import { useSelector } from "react-redux";
import { sorts } from "../../ultils/contants";
import icons from '../../ultils/icons';
import useDebounce from '../../hooks/useDebounce';

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

    const selectedCategory = categories ? categories.find(cat => createSlug(cat.name) === category) : null;

    const fetchProductsByCategory = async () => {
        const params = {};
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
        
        const response = await apiGetProducts(params);
        if (response.success) {
            setProducts(response.products);
        }
    };

    useEffect(() => {
        fetchProductsByCategory();
    }, [debouncedFrom, debouncedTo, sort, selectedCategory, activeClick]);

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

    return (
        <div>
            <div className="w-main border p-4 flex justify-between mt-8 m-auto">
                <div className="w-4/5 flex-auto flex flex-col">
                    <div className="flex items-center gap-3">
                        Filter by: 
                        <div 
                            className='p-3 text-xs text-gray-500 gap-6 relative border border-gray-800 flex justify-between items-center'
                            onClick={() => changeActiveFilter('Price')}
                        >
                            <span className='capitalize'>Giá</span>
                            <AiOutlineDown />
                            {activeClick === 'Price' && (
                                <div className='absolute top-full left-0 w-fit p-4 z-10 bg-red-200'>
                                    <div onClick={e => e.stopPropagation()}>
                                        <div>
                                            <span>Nhập giá phù hợp với bạn</span>
                                            <div className='flex'>
                                                <div className='flex items-center p-2 gap-2'>
                                                    <label htmlFor='from'>Từ</label>
                                                    <input 
                                                        className='form-input' 
                                                        type='number' 
                                                        id="from"
                                                        value={price.from}
                                                        onChange={e => setPrice(prev => ({ ...prev, from: e.target.value }))}
                                                    />
                                                </div>
                                                <div className='flex items-center p-2 gap-2'>
                                                    <label htmlFor='to'>Đến</label>
                                                    <input 
                                                        className='form-input' 
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
            <div className="w-full h-[500px]"></div>
        </div>
    );
};

export default Products;
