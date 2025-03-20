import React, { useEffect, useState } from 'react'
import { apiGetProducts } from '../../apis'
import moment from 'moment'
import Dialog from '@mui/material/Dialog'
import { InputForm } from '../../components'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Search from 'antd/es/input/Search'
import { Pagination, DatePicker, Input, Badge, Row, Col } from 'antd'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import useDebounce from '../../hooks/useDebounce'
import { Carousel } from 'antd';
import { apiCreateDiscount, apiDeleteDiscount, apiGetAllDiscounts, apiUpdateDiscount, apiApplyProductInDiscount, apiGetProductInDiscount, apiUpdateProduct , apiGetDiscount} from '../../apis'

const { RangePicker } = DatePicker;

const Flashsale = () => {
    const { handleSubmit, reset, register, getValues, formState: { errors }, setValue, watch } = useForm({
        name: '',
    })

    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");
    const debounceSearch = useDebounce(searchValue, 300);

    const [startDateFilter, setStartDateFilter] = useState(undefined);
    const [endDateFilter, setEndDateFilter] = useState(undefined);

    const [page, setPage] = useState(1);

    const [flashSalePageMetadata, setFlashSalePageMetadata] = useState({});

    const [showDialog, setShowDialog] = useState(false)
    const [dialogLabel, setDialogLabel] = useState('Thêm')
    const [isEdit, setIsEdit] = useState(false);
    const [productFlashSaleEdit, setProductFlashSaleEdit] = useState([]);
    const [productPage, setProductPage] = useState(1);
    const [productSearchValue, setProductSearchValue] = useState("");
    const debounceProductSearch = useDebounce(productSearchValue, 300);

    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [isShowProductsFS, setIsShowProductsFS] = useState(false);
    const [showProductsFS, setShowProductsFS] = useState([]);
    const [oldiscount, setOldiscount] = useState({})

    const handleCloseShowProductsFS = () => {
        setIsShowProductsFS(false);
        setShowProductsFS([]);
    }

    const handleShowProductsFS = async (el) => {
        setIsShowProductsFS(true);
        const rsp = await apiGetProductInDiscount(el?._id);
        if(rsp.success)
        {
            const viewProducts = rsp?.products?.map(e => {          
                return { ...e, discountRate: el.discountPercentage }
            }).filter(item => item !== null);
            console.log(viewProducts);
            setShowProductsFS(viewProducts);
        }
    }

    const onSearch = async (value) => {
        if (value) {
            setSearchValue(value);
        } else {
            setSearchValue("");
            await fetchFlashSales(page, undefined, startDateFilter, endDateFilter);
        }
    }

    useEffect(() => {
        if (debounceSearch) {
            fetchFlashSales(page, debounceSearch, startDateFilter, endDateFilter);
        }
    }, [debounceSearch])

    const handleChangePage = (pagePaginate) => {
        setPage(pagePaginate)
    }

    const onChangeRangePicker = (_date, dateString) => {
        if (!dateString[0] || !dateString[1]) {
            setStartDateFilter(undefined);
            setEndDateFilter(undefined);
            fetchFlashSales(page, debounceSearch);
            return;
        }
        setStartDateFilter(dateString[0]);
        setEndDateFilter(dateString[1]);
        fetchFlashSales(page, debounceSearch, dateString[0], dateString[1]);
    }

    const handleClose = () => {
        reset()
        setShowDialog(false)
        setSelectedProducts([])
        setProductPage(1);
    }

    const restoreOldProducts = async (oldProducts) => {
        console.log("OLDPRODUCT " + JSON.stringify(oldProducts));
    
        try {
            const results = await Promise.all(
                oldProducts.map(async (oldProduct) => {
                    console.log("OLID " +  oldProduct._id + "    " + oldProduct.discount )
                    const updateData = { ...oldProduct, discount: oldProduct.discount }; // Khôi phục discount cũ
                    const response = await apiUpdateProduct(updateData, oldProduct._id);
                    
                    if (!response.success) {
                        console.error(`Failed to update product ID ${oldProduct._id}:`, response.message);
                    } else {
                        console.log(`Successfully restored product ID ${oldProduct._id}`);
                    }
                    return response; // Trả về phản hồi
                })
            );
    
            // Kiểm tra xem có bất kỳ cập nhật nào không thành công
            const allSuccess = results.every(res => res.success);
            if (allSuccess) {
                console.log("All products restored successfully.");
            } else {
                console.warn("Some products failed to restore.");
            }
        } catch (error) {
            console.error("Error restoring old products:", error);
        }
    };

    const handleCreate = async () => {
        const id = getValues('_id')
        if (id) {
            const response = await apiUpdateDiscount({ ...watch() }, id);
                        
            if (response.success) {
                const rsp = await apiGetProductInDiscount(id);
                const oldProducts = [...rsp.products];
                
                // Đặt discount thành null cho tất cả sản phẩm cũ
                const updatedProducts = await Promise.all(
                    oldProducts.map(async e => {
                        const updateData = { ...e, discount: null }; 
                        return await apiUpdateProduct(updateData, e._id); 
                    })
                );
        
                try {
                    // Lặp qua từng sản phẩm và gọi API
                    const rs = await Promise.all(
                        selectedProducts.map(product => 
                            apiApplyProductInDiscount(product._id, id)
                        )
                    );
        
                    // Kiểm tra xem có bất kỳ phản hồi nào không thành công
                    const allSuccess = rs.every(response => response.success);
        
                    if (allSuccess) { 
                        setShowDialog(false);
                        toast.success('Sửa thành công');
                        fetchFlashSales();
                        reset();
                    } else {
                        // await apiUpdateDiscount(oldiscount, id);
                        await restoreOldProducts(oldProducts);
                        toast.error('Sửa thất bại');
                    }
                } catch (error) {
                    console.error("Error applying discount:", error);
                    // Khôi phục lại dữ liệu cũ
                    await restoreOldProducts(oldProducts);
                    toast.error('Sửa thất bại 22');
                }
            } else {
                toast.error(response.message);
            }
        }
        else {
            const response = await apiCreateDiscount({ ...watch()})
            if (response.success) {
                const discountId = response?.newDiscount?._id;
                try {
                    // Lặp qua từng sản phẩm và gọi API
                    const rs = await Promise.all(
                      selectedProducts.map(product => 
                        apiApplyProductInDiscount(product._id,discountId)
                      )
                    );
                    let loi = false;
                    rs.forEach(response => {
                        if (!response.success) {
                          loi = true;
                        } 
                      });
                    if(loi==false)
                    { 
                        setShowDialog(false)
                        toast.success('Thêm thành công')
                        fetchFlashSales()
                        reset()
                    } else {
                        const drs = await apiDeleteDiscount(discountId);
                        if(drs.success)
                            toast.error('Ngày kết thúc không hợp lệ')
                    }
                  } catch (error) {
                    console.error("Error applying discount:", error);
                    throw error; // Hoặc xử lý lỗi theo cách khác nếu cần
                }
            } else toast.error('Thêm thất bại 9999')
        }
    }

    const handleShowdialog = async (el) => {
        console.log("SỬA " + JSON.stringify(el))
        const rsp = await apiGetProducts();
        setProducts(rsp.products);
        setSelectedProducts([]);
        // setProductFlashSaleEdit([]);

        if (el) {
            setIsEdit(true);
            // setProductFlashSaleEdit(el.products);
            const response = await apiGetProductInDiscount(el?._id);
            console.log("ĐÊ "+ el?._id+" ID " + JSON.stringify(response))
            if(response.success)
            {
                const newSelectedProducts = response?.products?.map(e => {          
                    return { ...e, discountRate: el.discountPercentage }
                }).filter(item => item !== null);

            // const newSelectedProducts = rsp.productData?.map(e => {
            //     const product = el?.products?.find(p => p.product._id === e._id);
            //     if (product) {
            //         return { ...e, discountRate: product.discountRate, quantity: product.quantity }
            //     }
            //     return null;
            // }).filter(item => item !== null);
            setSelectedProducts(newSelectedProducts);
            }
            setDialogLabel('Sửa')
            Object.keys(el).forEach(key => {
                if (key === 'startDate' || 'endDate' === key) {
                    setValue(key, moment(el[key]).format('yyyy-MM-DD'))
                } else {
                    setValue(key, el[key])
                }
            })
        }
        else {
            setDialogLabel('Thêm');
            setIsEdit(false);
            reset()
        }
        setShowDialog(true)
    }

    const handleSelectProduct = (product) => {
        if (selectedProducts?.find(p => p._id === product._id)) {
            const newSelectedProducts = selectedProducts.filter(p => p._id !== product._id);
            setSelectedProducts(newSelectedProducts);
        } else {
            setSelectedProducts(prev => [...prev, product]);
        }
    }

    const fetchFlashSales = async (page = 1, name = undefined, startDate = undefined, endDate = undefined) => {
        const response = await apiGetAllDiscounts(page, name, startDate, endDate);
        if (response.success) {
            setFlashSalePageMetadata(response);
        }
        else {
            setFlashSalePageMetadata([]);
        }
    }

    useEffect(() => {
        fetchFlashSales(page, debounceSearch, startDateFilter, endDateFilter);
    }, [page])

    const handleDeleteFlashSale = async (fid) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa???',
            text: 'Bạn đã sẵn sàng xóa Flash Sale chưa???',
            showCancelButton: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await apiDeleteDiscount(fid);
                if (response.success) {
                    toast.success('Xóa thành công');
                    fetchFlashSales(); // Lấy danh sách voucher đã cập nhật
                } else {
                    toast.error('Xóa thất bại');
                }
            }
        });
    };
    return (
        <div className='w-full flex flex-col gap-3 relative overflow-x-scroll p-4'>
            <div className='flex justify-between items-center'>
                <Search
                    className="w-[40vw]"
                    placeholder="Nhập tên mã giảm giá..."
                    allowClear
                    enterButton="Search"
                    size="large"
                    value={searchValue}
                    onChange={(e) => onSearch(e.target.value)}
                />
                <RangePicker onChange={onChangeRangePicker} />
            </div>
            <table className='table-auto'>
                <thead className='border bg-main text-white border-white '>
                    <tr className='border border-main'>
                        <th className='text-center py-2'>STT</th>
                        <th className='text-center py-2'>Mã flash sale</th>
                        <th className='text-center py-2'>Tên</th>
                        <th className='text-center py-2'>Bắt đầu</th>
                        <th className='text-center py-2'>Kết thúc</th>
                        {/* <th className='text-center py-2'>Trạng thái</th> */}
                        <th className='text-center py-2'>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {flashSalePageMetadata?.discounts?.map((el, index) => (
                        <tr className='border border-main' key={el._id}>
                            <td className='text-center py-2'>{index + 1}</td>
                            <td className='text-center py-2'>{el?._id}</td>
                            <td className='text-center py-2'>{el?.name}</td>
                            <td className='text-center py-2'>{moment(el?.startDate).format('DD/MM/YYYY')}</td>
                            <td className='text-center py-2'>{moment(el?.endDate).format('DD/MM/YYYY')}</td>
                            {/* <td className='text-center py-2'>{el?.status}</td> */}
                            <td className='text-center py-2'>
                                <span onClick={() => handleShowProductsFS(el)} className='text-main hover:underline cursor-pointer px-1'>Xem</span>
                                <span onClick={() => handleShowdialog(el)} className='text-main hover:underline cursor-pointer px-1'>Sửa</span>
                                <span onClick={() => handleDeleteFlashSale(el._id)} className='text-main hover:underline cursor-pointer px-1'>Xóa</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className='flex items-center justify-center'>
                <Pagination onChange={handleChangePage} defaultCurrent={1} total={flashSalePageMetadata?.totalItems || 0} pageSize={5} showSizeChanger={false} />
            </div>

            <div className='w-[100px] h-[50px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={() => handleShowdialog(null)}>Thêm mới</div>
            <Dialog maxWidth='xl' open={showDialog} onClose={handleClose}>
                <div className='p-[20px] w-[1200px]'>
                    <InputForm
                        label='Tên Flash Sale'
                        placeholder='Nhập tên flash sale'
                        fw
                        register={register}
                        errols={errors}
                        id={'name'}
                        validate={{ required: 'Yêu cầu nhập ' }}
                    />
                    <InputForm
                        label='Phần trăm giảm giá'
                        placeholder='Nhập phần trăm giảm giá'
                        fw
                        register={register}
                        errols={errors}
                        id={'discountPercentage'}
                        validate={{ required: 'Yêu cầu nhập ' }}
                    />
                    <InputForm
                        type='date'
                        label='Bắt đầu'
                        placeholder='Nhập ngày bắt đầu'
                        fw
                        register={register}
                        errols={errors}
                        id={'startDate'}
                        validate={{ required: 'Yêu cầu nhập ' }}
                    />
                    <InputForm
                        type='date'
                        label='Kết thúc'
                        placeholder='Nhập ngày kết thúc'
                        fw
                        register={register}
                        errols={errors}
                        id={'endDate'}
                        validate={{ required: 'Yêu cầu nhập ' }}
                    />
                    {/* {isEdit &&
                        <>
                            <div className='mb-4'>Chọn trạng thái</div>
                            <select
                                className='form-input px-[20px] my-auto border border-main w-full'
                                {...register("status")}
                            >
                                <option value='Upcoming'>Upcoming</option>
                                <option value='Active'>Active</option>
                            </select>
                        </>
                    } */}

                    <div className='flex justify-between items-center mt-4'>
                        Chọn sản phẩm
                        <Search
                            className="w-[40vw]"
                            placeholder="Nhập tên sản phẩm..."
                            allowClear
                            enterButton="Search"
                            size="large"
                            value={productSearchValue}
                            onChange={(e) => setProductSearchValue(e.target.value)}
                        />
                    </div>
                    <div className='flex flex-col px-4 my-4'>
                        <Row>
                            {products?.filter(prod => {
                                const regex = new RegExp(debounceProductSearch, 'i');
                                return regex.test(prod.name);
                            })?.slice((productPage - 1) * 8, productPage * 8)?.map((e, _i) => (
                                <Col span={6} key={e._id} className='w-full p-2'>
                                    <div className={`flex flex-col gap-2 w-full border-2 ${selectedProducts?.find(p => p._id === e._id) ? 'border-green-400' : 'border-slate-200'}`}>
                                        <img onClick={() => handleSelectProduct(e)} className='w-full h-[180px] object-contain object-center cursor-pointer' src={e?.image} />
                                        {/* {selectedProducts.find(p => p._id === e._id) &&
                                            <div className='flex gap-2 px-2'>
                                                {/* {/* <Input defaultValue={
                                                    productFlashSaleEdit.find(pfs => pfs.product._id === e._id)?.discountRate ||
                                                    selectedProducts.find(pfs => pfs._id === e._id)?.discountRate
                                                }/>
                                                <Input defaultValue={
                                                    productFlashSaleEdit.find(pfs => pfs.product._id === e._id)?.quantity ||
                                                    selectedProducts.find(pfs => pfs._id === e._id)?.quantity
                                                } />
                                                <Badge count={e.stockQuantity} /> 
                                            </div>
                                        } */}
                                        <span className='w-full h-[80px] break-words p-4'>{e.name}</span>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <div className='flex items-center justify-center'>
                            <Pagination onChange={(page) => { setProductPage(page) }} defaultCurrent={1} total={products?.filter(prod => {
                                const regex = new RegExp(debounceProductSearch, 'i');
                                return regex.test(prod.name);
                            }).length || 0} pageSize={8} showSizeChanger={false} />
                        </div>
                    </div>
                    <div className='justify-end flex pt-2'>
                        <div className='w-[80px] h-[40px] bg-main text-white rounded text-center justify-center items-center flex cursor-pointer' onClick={handleCreate}>{dialogLabel}</div>
                    </div>
                </div>
            </Dialog>
            <Dialog maxWidth='xl' open={isShowProductsFS} onClose={handleCloseShowProductsFS}>
                <div className='w-full p-[40px]'>
                    <Carousel className='w-[800px]' arrows dots={false} infinite>
                        {showProductsFS?.map((e, i) => (
                            <div key={i} className='p-10'>
                                <div className='flex flex-col w-full justify-center items-center'>
                                    <img className='w-[300px] object-cover object-center' src={e?.image} />
                                    <Badge count={`${e.discountRate} %`}>
                                        <p className='font-medium max-w-[500px] truncate p-2'>{e.name}</p>
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </Carousel>
                </div>
            </Dialog>
        </div>
    )
}

export default Flashsale

