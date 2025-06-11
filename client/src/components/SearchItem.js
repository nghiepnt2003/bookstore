import React, { memo, useEffect, useState } from 'react';
import icons from '../ultils/icons';
import useDebounce from '../hooks/useDebounce';
import { apiGetProducts } from '../apis';

const { AiOutlineDown } = icons;

const SearchItem = ({ name, activceClick, changeActiveFilter, onDataChange, category }) => {
  const [price, setPrice] = useState({
    from: '',
    to: ''
  });

  // Sử dụng useDebounce cho giá từ và đến
  const debouncedFrom = useDebounce(price.from, 500);
  const debouncedTo = useDebounce(price.to, 500);

  useEffect(() => {
    const data = {};
    if (Number(debouncedFrom) > 0) data.from = debouncedFrom;
    if (Number(debouncedTo) > 0) data.to = debouncedTo;

    fetchData(data);
  }, [debouncedFrom, debouncedTo, onDataChange, category]);

// Hàm gọi API
const fetchData = async (params) => {
  try {
    const formattedParams = {};

    if(category) {
      formattedParams['categories'] = category
    }

    // Chuyển đổi params thành định dạng mà API yêu cầu
    if (params.from) {
      formattedParams['price[gte]'] = params.from; // price[lte] là giá trị tối thiểu
    }
    if (params.to) {
      formattedParams['price[lte]'] = params.to; // price[gte] là giá trị tối đa
    }

    if(params.from && params.to && params.from> params.to)
    {
      //Thông báo
    }
    // const queries = {categories: selectedCategory._id}
    // Gọi API với các tham số đã định dạng
    const response = await apiGetProducts(formattedParams);
    // Gọi hàm onDataChange để thông báo cho component cha
    if (response.success) {
      onDataChange(response.products, formattedParams); // Truyền dữ liệu sản phẩm về component cha
    }
    else
    {
      //Thông báo là không có sản phẩm nào trong khoảng giá này
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

  return (
    <div 
      className='p-3 text-xs text-gray-500 gap-6 relative border border-gray-800 flex justify-between items-center'
      onClick={() => changeActiveFilter(name)}
    >
      <span className='capitalize'>{name}</span>
      <AiOutlineDown />
      {activceClick === name && (
        <div className='absolute top-full left-0 w-fit p-4 z-10 bg-red-200 h-[100px]'>
          <div onClick={e => e.stopPropagation()}>
            <div>
              <span>Nhập giá phù hợp với bạn</span>
              <div className='flex'>
                <div className='flex items-center p-2 gap-2'>
                  <div className='flex items-center gap-2'>
                    <label htmlFor='from'>From</label>
                    <input 
                      className='form-input' 
                      type='number' 
                      id="from"
                      value={price.from}
                      onChange={e => setPrice(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                </div>
                <div className='flex items-center p-2 gap-2'>
                  <div className='flex items-center gap-2'>
                    <label htmlFor='to'>To</label>
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
        </div>
      )}
    </div>
  );
}

export default memo(SearchItem);