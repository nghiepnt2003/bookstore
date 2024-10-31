import React from 'react';

const CategorySelect = ({ categories, selectedCategories, onChange, onRemove }) => {
    console.log("selectedCategories " + JSON.stringify(selectedCategories))
    return (
        <div className="flex flex-col w-full">
            <label htmlFor="category" className="font-semibold mb-1">Danh mục</label>
            <select
                name='category'
                onChange={onChange}
                className="p-2 border border-gray-300 rounded-md text-lg"
                value="" // Có thể điều chỉnh giá trị này nếu cần
            >
                <option value=''>Chọn danh mục</option>
                {categories?.map((cat) => (
                    !selectedCategories.some(selectedCat => selectedCat._id === cat._id) && (
                        <option 
                            key={cat._id} 
                            value={JSON.stringify({ _id: cat._id, name: cat.name })} // Ghi lại đối tượng dưới dạng chuỗi JSON
                        >
                            {cat.name}
                        </option>
                    )
                ))}
            </select>
            <div className="mt-2">
                {selectedCategories.map(({ _id, name }) => (
                    <span key={_id} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                        {name}
                        <button 
                            type="button" 
                            onClick={() => onRemove(_id)} 
                            className="ml-1 text-blue-500 hover:text-blue-700"
                        >×</button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default CategorySelect;