// import React, { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import logo from "../../assets/logo.png"
// import { cash } from '../../ultils/contants'
// import { useLocation, useNavigate } from "react-router-dom"
// import { Button, Form, Input, message, Modal, Select } from 'antd';
// import { apiGetAddress, apiGetUserCart, apiOrder ,apiCheckout} from '../../apis'
// import { toast } from 'react-toastify'
// import { useDispatch, useSelector } from 'react-redux'
// import { Spin } from 'antd'
// import { updateCart } from '../../store/cart/cartSlice'
// import { useDebounce } from 'use-debounce';
// import {Congrat, PayPal} from '../../components'
// import { getCurrent } from '../../store/user/asyncActions'
// import { formatMoney, renderStarFromNumber } from "../../ultils/helpers";

// const { Option } = Select;

// const Checkout = () => {

//     const dispatch = useDispatch()
//     const navigate = useNavigate()
//     const location = useLocation()
//     const [form] = Form.useForm();
//     const [paymentMethod, setPaymentMethod] = useState(cash)
//     const [total, setTotal] = useState(0)
//     const { listCheckout } = location.state || []
//     const [loading, setLoading] = useState(false)
//     const [list, setList] = useState([])
//     const [isSuccess, setIsSuccess] = useState(false)
//     const { current } = useSelector(state => state.user)
//     const [suggestedAddresses, setSuggestedAddresses] = useState([]); // Danh sách địa chỉ gợi ý
//     const [selectedAddress, setSelectedAddress] = useState(''); // Địa chỉ được chọn
//     const [payPalPayload, setPayPalPayload] = useState({
//         products: [],
//         paymentMethod: "PayPal",
//         total: 0,
//         recipient: '',
//         phone: '',
//         address: '',
//         note: '',
//         // Khởi tạo các trường khác nếu cần
//     });
//     const [formData, setFormData] = useState({
//         recipient: current?.fullname,
//         phone: current?.phone,
//         address: current?.address[0],
//         note: '',
//     });
//     // const [debouncedFormData] = useDebounce(formData, 5000); // 3000ms là thời gian trì hoãn

//     // Hàm cập nhật trạng thái sản phẩm
//     const updateCheckoutStatus = async () => {
//         const productIds = listCheckout.map(item => item.product._id);
//         try {
//             // Duyệt qua từng sản phẩm trong listCheckout và gọi apiCheckout
//             for (const item of listCheckout) {
//                 const response = await apiCheckout(item._id, {
//                     selectedForCheckout: false, // Giả sử muốn đặt selectedForCheckout là true
//                 });
//             }
//         } catch (error) {
//             toast.error("Lỗi khi thanh toán: " + error.message);
//         }
//     };

//     // Gọi hàm khi component unmount
//     useEffect(() => {
//         return () => {
//             updateCheckoutStatus(); // Cập nhật trạng thái khi người dùng rời trang
//         };
//     }, []);

//     React.useEffect(() => {
//         // fetchSuggestedAddresses();
//         setList(listCheckout)
//     }, [])

//     // Fetch danh sách địa chỉ gợi ý từ API
//     const fetchSuggestedAddresses = async () => {
//         try {
//             // Giả sử bạn có API để lấy địa chỉ gợi ý
//             const response = await apiGetAddress();
//             console.log(response);

//             // Kiểm tra xem response.addresses có phải là mảng không
//             if (Array.isArray(response.addresses)) {
//                 console.log('Địa chỉ gợi ý:', response.addresses + " " + typeof(response.addresses));
//                 setSuggestedAddresses(response.addresses);
//             } else {
//                 console.warn('response.addresses không phải là mảng:', response.addresses);
//             }
//         } catch (error) {
//             console.error('Error fetching suggested addresses:', error);
//         }
//     };

//     // console.log("fetchSuggestedAddresses " + suggestedAddresses + " " + typeof(suggestedAddresses))

//     React.useEffect(() => {

//         const result = list.reduce((acc, curr) => acc + curr.quantity * curr.product.price, 0)
//         setTotal(result)
//     }, [list])

//     const onFinish = async (values) => {
//         console.log("VALUES " + JSON.stringify(values))
//         const products = list.map(item => ({
//             product: item.product._id,
//             count: item.quantity,
//         }))

//         const dataOrder = {
//             products,
//             paymentMethod,
//             total,
//             ...values
//         }
//         console.log("DATA ORDER " + JSON.stringify(dataOrder))
//         try {
//             setLoading(true)
//             const response = await apiOrder({
//                 recipientName: dataOrder.recipient,
//                 recipientPhone: dataOrder.phone,
//                 payment: dataOrder.paymentMethod,
//                 shippingAddress: dataOrder.address,
//             })
//             if (response.success) {
//                 Modal.success({
//                     title: 'Thành công!',
//                     content: (
//                         <div className='flex flex-col items-center justify-center'>
//                             <p className='text-[16px] text-[#333] font-[500]'>Chúc mừng bạn đã đặt hàng thành công</p>
//                             <p className="text-[14px] text-[#333]">Tiếp tục mua hàng ngay...</p>
//                         </div>
//                     ),
//                     onOk() { navigate("/products") },
//                 });
//                 const getCarts = await apiGetUserCart();
//                 dispatch(updateCart({ products: getCarts.cart.items }));
//             } else {
//                 if (response.status === "soldout") {

//                     if (response.product.length === listCheckout.length) {

//                         Modal.warning({
//                             title: 'Lưu ý',
//                             content: (
//                                 <div className='flex flex-col items-center justify-center'>
//                                     {
//                                         response.product.map(productItem => (
//                                             <p key={productItem._id} className='text-[16px] text-[#333] font-[500]'>
//                                                 {productItem.productName}
//                                             </p>
//                                         ))
//                                     }
//                                     <p>Hiện tại đã hết hàng. Vui lòng chọn sản phẩm khác để đặt hàng</p>
//                                 </div>
//                             ),
//                             onOk() { navigate("/products") },
//                         });
//                     } else {

//                         Modal.confirm({
//                             title: 'Lưu ý',
//                             content: (
//                                 <div className='flex flex-col'>
//                                     {
//                                         response.product.map(productItem => (
//                                             <p key={productItem._id} className='text-[16px] text-[#333] font-[500]'>
//                                                 {productItem.productName}
//                                             </p>
//                                         ))
//                                     }
//                                     <p>Hiện tại đã hết hàng. Vui lòng</p>
//                                     <p>Nhấn <span className='font-[600]'>[Tiếp tục]</span> để đặt các sản phẩm còn lại</p>
//                                     <p>Nhấn <span className='font-[600]'>[Hủy]</span> để hủy đặt hàng</p>
//                                 </div>
//                             ),
//                             onOk() {
//                                 const newList = list.filter(listItem => !response.product.some(pItem => pItem._id === listItem.product._id))
//                                 console.log(newList)
//                                 setList(newList)
//                                 message.info("Tiếp tục mua hàng")
//                             },
//                             onCancel() {
//                                 navigate("/")
//                                 message.info("Đã hủy đặt hàng")
//                             },
//                             okText: "Tiếp tục",
//                             cancelText: "Hủy"
//                         });
//                     }
//                 } else {
//                     toast.error(response.mess)
//                 }
//             }
//             setLoading(false)
//         } catch (err) {
//             setLoading(false)
//         }

//     }

//     const handleFormChange = (_, allValues) => {
//         console.log("ALLVALUES " + JSON.stringify(allValues))
//         setFormData(allValues);
//     };
//     const createPayPalPayload = () => {
//         console.log("FORMDATA " + JSON.stringify(formData))
//         const data = {
//             products: list.map(item => ({
//                 product: item.product._id,
//                 count: item.quantity,
//             })),
//             paymentMethod: "PayPal",
//             // total,
//             // // Add additional form data here
//             // ...formData
//             // // ...debouncedFormData
//             total,
//             recipientName: formData.recipient, // Add recipient name
//             recipientPhone: formData.phone, // Add recipient phone
//             shippingAddress: formData.address, // Add shipping address
//             note: formData.note, // Include note if necessary
//         };
//         console.log("PAYPAL DATA"+ JSON.stringify(data));
//         return data;
//     };

//     React.useEffect(() => {
//         const newPayload = createPayPalPayload();
//         const timeoutId = setTimeout(() => {
//             setPayPalPayload(newPayload);
//         }, 3500);

//         return () => clearTimeout(timeoutId);
//     }, [formData, list]);

//     const handleAddressSelect = (value) => {
//         setSelectedAddress(value); // Cập nhật địa chỉ đã chọn
//         form.setFieldsValue({ address: value }); // Cập nhật giá trị ô Input
//         // form.se
//     };
//     // React.useEffect(() => {
//     //         if(isSuccess) dispatch(getCurrent())
//     //     }, [isSuccess])

//     return (
//         <Spin spinning={loading} size={"large"}>
//             {isSuccess && <Congrat />}
//             <div className="pb-[50px]">
//                 <div class="flex flex-col items-center border-b bg-white sm:flex-row sm:px-10 lg:px-20 xl:px-32">
//                     <Link to="/">
//                         <img src={logo} alt="Logo" style={{
//                             width: "200px",
//                             height: "100px",
//                             objectFit: "contain"
//                         }} />
//                     </Link>
//                 </div>
//                 <div class="grid sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32">
//                     <div class="px-4 pt-8">
//                         <p class="text-xl pb-[10px] font-bold border-b border-solid border-[#555]">Thanh toán đơn hàng</p>
//                         <p class="mt-8 text-lg">Danh sách sản phẩm</p>
//                         <div class="mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6">

//                             {
//                                 list.map(item => (
//                                     <div key={item.product._id} class="flex flex-col rounded-lg bg-white sm:flex-row">
//                                         <img class="m-2 h-24 w-28 rounded-md border object-contain" src={item.product.image} alt="" />
//                                         <div class="flex w-[350px] flex-col px-4 py-4">
//                                             <span class="font-semibold">{item.product.productName}</span>
//                                             <p class="text-lg font-bold">
//                                                 {`${formatMoney(item.product.price)}`.toLocaleString('vi-VN', {
//                                                     style: 'currency',
//                                                     currency: 'VND',
//                                                 })}
//                                             </p>
//                                             <span class="float-right text-gray-400">x {item.quantity}</span>
//                                         </div>
//                                     </div>
//                                 ))
//                             }

//                         </div>

//                         <p class="mt-8 text-lg">Phương thức thanh toán</p>
//                         <form class="mt-5 grid gap-6">
//                             <div class="relative">
//                                 <input class="peer hidden" id="radio_1" type="radio" name="radio" checked={paymentMethod === cash} />
//                                 <span class="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
//                                 <label class="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4" for="radio_1">
//                                     <img class="w-14 object-contain" src="/images/naorrAeygcJzX0SyNI4Y0.png" alt="" />
//                                     <div class="ml-5">
//                                         <span class="mt-2 font-semibold">Thanh toán bằng tiền mặt</span>
//                                         <p class="text-slate-500 text-sm leading-6">Giao trong vòng: 2-4 ngày</p>
//                                     </div>
//                                 </label>
//                             </div>
//                             <div className='w-full mx-auto'>
//                             {(!total)? (
//                                 <p>Giá trị tiền không hợp lệ.</p>
//                             ) : (
//                                 <PayPal
//                                     payload={payPalPayload}
//                                     setIsSuccess={setIsSuccess}
//                                     amount={(total / 24250).toFixed(2)} />
//                             )}
//                             </div>
//                         </form>
//                         {/* <p class="mt-8 text-lg">Voucher</p>
//                         <div className="flex items-center mt-[20px]">
//                             <Input className="mr-[10px]" placeholder="Nhập mã voucher" />
//                             <Button>Áp dụng</Button>
//                         </div> */}
//                     </div>
//                     <div class="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0">
//                         <p class="text-xl mb-[40px]">Thông tin đơn hàng</p>

//                         <div class="">
//                             {/* Thông tin người đặt */}
//                             <Form
//                                 form={form}
//                                 style={{
//                                     width: '100%'
//                                 }}
//                                 layout="vertical"
//                                 onFinish={onFinish}
//                                 onValuesChange={handleFormChange}
//                                 autoComplete="off"
//                             >
//                                 <Form.Item
//                                     label="Người nhận"
//                                     name="recipient"
//                                     initialValue={current?.fullname || ''}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: 'Thông tin này không được để trống!',
//                                         },
//                                     ]}
//                                 >
//                                     <Input placeholder='Nhập tên người nhận' />
//                                 </Form.Item>

//                                 <Form.Item
//                                     label="Số điện thoại"
//                                     name="phone"
//                                     initialValue={current?.phone || ''}
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: 'Thông tin này không được để trống!',
//                                         },
//                                     ]}
//                                 >
//                                     <Input placeholder="Nhập số điện thoại" />
//                                 </Form.Item>

//                                 <Form.Item
//                                     label="Địa chỉ giao hàng"
//                                     name="address"
//                                     //current?.address.length-1
//                                     initialValue={(current?.address[0])} // Thiết lập giá trị mặc định
//                                     rules={[
//                                         {
//                                             required: true,
//                                             message: 'Thông tin này không được để trống!',
//                                         },
//                                     ]}
//                                 >
//                                     <Input placeholder="Nhập địa chỉ giao hàng" />
//                                     {/* <Select
//                                         placeholder="Gợi ý địa chỉ"
//                                         style={{ width: '100%', marginTop: '10px' }}
//                                         onChange={handleAddressSelect}
//                                     >
//                                         {suggestedAddresses.map((address, index) => (
//                                             <Option key={index} value={address}>
//                                                 {address} {/* Hiển thị địa chỉ
//                                             </Option>
//                                         ))}
//                                     </Select>*/}
//                                 </Form.Item>

//                                 <Form.Item
//                                     label="Ghi chú"
//                                     name="note"
//                                     initialValue=""
//                                 >
//                                     <Input placeholder="Lưu ý..." />
//                                 </Form.Item>

//                                 {/* Tổng cộng */}
//                                 <div class="mt-6 border-b py-2"></div>
//                                 <div class="mt-6 flex items-center justify-between">
//                                     <p class="text-sm text-gray-900">Tổng tiền</p>
//                                     <p class="text-2xl font-semibold text-gray-900">
//                                         {
//                                             total.toLocaleString('vi-VN', {
//                                                 style: 'currency',
//                                                 currency: 'VND',
//                                             })
//                                         }
//                                     </p>
//                                 </div>

//                                 <Form.Item
//                                     className='w-full mt-[40px]'
//                                 >
//                                     <button htmlType="submit" class="mt-4 mb-8 w-full rounded-md bg-gray-900 px-6 py-3 text-white">
//                                         Thanh toán
//                                     </button>
//                                 </Form.Item>
//                             </Form>

//                         </div>

//                     </div>
//                 </div>

//             </div>
//         </Spin>
//     )
// }

// export default Checkout

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import { cash } from "../../ultils/contants";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Input, message, Modal, Select } from "antd";
import {
  apiGetAddress,
  apiGetUserCart,
  apiOrder,
  apiCheckout,
} from "../../apis";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import { updateCart } from "../../store/cart/cartSlice";
import { useDebounce } from "use-debounce";
import { Congrat, PayPal } from "../../components";
import { getCurrent } from "../../store/user/asyncActions";
import { formatMoney, renderStarFromNumber } from "../../ultils/helpers";
import { MoMoPayment } from "../../components";

const { Option } = Select;

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [showMoMoPayment, setShowMoMoPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(cash);
  const [total, setTotal] = useState(0);
  const { listCheckout } = location.state || [];
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const { current } = useSelector((state) => state.user);
  const [suggestedAddresses, setSuggestedAddresses] = useState([]); // Danh sách địa chỉ gợi ý
  const [selectedAddress, setSelectedAddress] = useState(""); // Địa chỉ được chọn
  const [payPalPayload, setPayPalPayload] = useState({
    products: [],
    paymentMethod: "PayPal",
    total: 0,
    recipient: "",
    phone: "",
    address: "",
    note: "",
    // Khởi tạo các trường khác nếu cần
  });
  const [formData, setFormData] = useState({
    recipient: current?.fullname,
    phone: current?.phone,
    address: current?.address[0],
    note: "",
  });
  // const [debouncedFormData] = useDebounce(formData, 5000); // 3000ms là thời gian trì hoãn

  // Hàm cập nhật trạng thái sản phẩm
  const updateCheckoutStatus = async () => {
    const productIds = listCheckout.map((item) => item.product._id);
    try {
      // Duyệt qua từng sản phẩm trong listCheckout và gọi apiCheckout
      for (const item of listCheckout) {
        const response = await apiCheckout(item._id, {
          selectedForCheckout: false, // Giả sử muốn đặt selectedForCheckout là true
        });
      }
    } catch (error) {
      toast.error("Lỗi khi thanh toán: " + error.message);
    }
  };

  // Gọi hàm khi component unmount
  useEffect(() => {
    return () => {
      updateCheckoutStatus(); // Cập nhật trạng thái khi người dùng rời trang
    };
  }, []);

  React.useEffect(() => {
    // fetchSuggestedAddresses();
    setList(listCheckout);
  }, []);

  // Fetch danh sách địa chỉ gợi ý từ API
  const fetchSuggestedAddresses = async () => {
    try {
      // Giả sử bạn có API để lấy địa chỉ gợi ý
      const response = await apiGetAddress();
      console.log(response);

      // Kiểm tra xem response.addresses có phải là mảng không
      if (Array.isArray(response.addresses)) {
        console.log(
          "Địa chỉ gợi ý:",
          response.addresses + " " + typeof response.addresses
        );
        setSuggestedAddresses(response.addresses);
      } else {
        console.warn(
          "response.addresses không phải là mảng:",
          response.addresses
        );
      }
    } catch (error) {
      console.error("Error fetching suggested addresses:", error);
    }
  };

  // console.log("fetchSuggestedAddresses " + suggestedAddresses + " " + typeof(suggestedAddresses))

  React.useEffect(() => {
    const result = list.reduce(
      (acc, curr) => acc + curr.quantity * curr.product.price,
      0
    );
    setTotal(result);
  }, [list]);

  const onFinish = async (values) => {
    const products = list.map((item) => ({
      product: item.product._id,
      count: item.quantity,
    }));

    const dataOrder = {
      products,
      paymentMethod,
      total,
      ...values,
    };
    try {
      setLoading(true);
      const response = await apiOrder({
        recipientName: dataOrder.recipient,
        recipientPhone: dataOrder.phone,
        payment: dataOrder.paymentMethod,
        shippingAddress: dataOrder.address,
      });
      if (response.success) {
        if (dataOrder?.paymentMethod === "MOMO") {
          console.log("MOMO " + JSON.stringify(response));
          window.location.href = response?.momoData?.payUrl;
        } else {
          Modal.success({
            title: "Thành công!",
            content: (
              <div className="flex flex-col items-center justify-center">
                <p className="text-[16px] text-[#333] font-[500]">
                  Chúc mừng bạn đã đặt hàng thành công
                </p>
                <p className="text-[14px] text-[#333]">
                  Tiếp tục mua hàng ngay...
                </p>
              </div>
            ),
            onOk() {
              navigate("/products");
            },
          });
        }
        const getCarts = await apiGetUserCart();
        dispatch(updateCart({ products: getCarts.cart.items }));
      } else {
        if (response.status === "soldout") {
          if (response.product.length === listCheckout.length) {
            Modal.warning({
              title: "Lưu ý",
              content: (
                <div className="flex flex-col items-center justify-center">
                  {response.product.map((productItem) => (
                    <p
                      key={productItem._id}
                      className="text-[16px] text-[#333] font-[500]"
                    >
                      {productItem.productName}
                    </p>
                  ))}
                  <p>
                    Hiện tại đã hết hàng. Vui lòng chọn sản phẩm khác để đặt
                    hàng
                  </p>
                </div>
              ),
              onOk() {
                navigate("/products");
              },
            });
          } else {
            Modal.confirm({
              title: "Lưu ý",
              content: (
                <div className="flex flex-col">
                  {response.product.map((productItem) => (
                    <p
                      key={productItem._id}
                      className="text-[16px] text-[#333] font-[500]"
                    >
                      {productItem.productName}
                    </p>
                  ))}
                  <p>Hiện tại đã hết hàng. Vui lòng</p>
                  <p>
                    Nhấn <span className="font-[600]">[Tiếp tục]</span> để đặt
                    các sản phẩm còn lại
                  </p>
                  <p>
                    Nhấn <span className="font-[600]">[Hủy]</span> để hủy đặt
                    hàng
                  </p>
                </div>
              ),
              onOk() {
                const newList = list.filter(
                  (listItem) =>
                    !response.product.some(
                      (pItem) => pItem._id === listItem.product._id
                    )
                );
                console.log(newList);
                setList(newList);
                message.info("Tiếp tục mua hàng");
              },
              onCancel() {
                navigate("/");
                message.info("Đã hủy đặt hàng");
              },
              okText: "Tiếp tục",
              cancelText: "Hủy",
            });
          }
        } else {
          toast.error(response?.message);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleFormChange = (_, allValues) => {
    setFormData(allValues);
  };
  const createPayPalPayload = () => {
    const data = {
      products: list.map((item) => ({
        product: item.product._id,
        count: item.quantity,
      })),
      paymentMethod: "PayPal",
      // total,
      // // Add additional form data here
      // ...formData
      // // ...debouncedFormData
      total,
      recipientName: formData.recipient, // Add recipient name
      recipientPhone: formData.phone, // Add recipient phone
      shippingAddress: formData.address, // Add shipping address
      note: formData.note, // Include note if necessary
    };
    return data;
  };

  React.useEffect(() => {
    const newPayload = createPayPalPayload();
    const timeoutId = setTimeout(() => {
      setPayPalPayload(newPayload);
    }, 3500);

    return () => clearTimeout(timeoutId);
  }, [formData, list]);

  const handleAddressSelect = (value) => {
    setSelectedAddress(value); // Cập nhật địa chỉ đã chọn
    form.setFieldsValue({ address: value }); // Cập nhật giá trị ô Input
    // form.se
  };
  // React.useEffect(() => {
  //         if(isSuccess) dispatch(getCurrent())
  //     }, [isSuccess])

  const handlePaymentSuccess = () => {
    // Handle successful payment (e.g., redirect or show confirmation)
    message.success("Thanh toán thành công!");
  };

  return (
    <Spin spinning={loading} size={"large"}>
      {/* {isSuccess && <Congrat />} */}
      {isSuccess}
      <div className="pb-[50px]">
        <div class="flex flex-col items-center border-b bg-white sm:flex-row sm:px-10 lg:px-20 xl:px-32">
          <Link to="/">
            <img
              src={logo}
              alt="Logo"
              style={{
                width: "200px",
                height: "100px",
                objectFit: "contain",
              }}
            />
          </Link>
        </div>
        <div class="grid sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32">
          <div class="px-4 pt-8">
            <p class="text-xl pb-[10px] font-bold border-b border-solid border-[#555]">
              Thanh toán đơn hàng
            </p>
            <p class="mt-8 text-lg">Danh sách sản phẩm</p>
            <div class="mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-6">
              {list.map((item) => (
                <div
                  key={item.product._id}
                  class="flex flex-col rounded-lg bg-white sm:flex-row"
                >
                  <img
                    class="m-2 h-24 w-28 rounded-md border object-contain"
                    src={item.product.image}
                    alt=""
                  />
                  <div class="flex w-[350px] flex-col px-4 py-4">
                    <span class="font-semibold">
                      {item.product.productName}
                    </span>
                    <p class="text-lg font-bold">
                      {`${formatMoney(item.product.price)}`.toLocaleString(
                        "vi-VN",
                        {
                          style: "currency",
                          currency: "VND",
                        }
                      )}
                    </p>
                    <span class="float-right text-gray-400">
                      x {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p class="mt-8 text-lg">Phương thức thanh toán</p>
            <form className="mt-5 grid gap-6">
              <div className="relative">
                <input
                  className="peer hidden"
                  id="radio_1"
                  type="radio"
                  name="paymentMethod"
                  value={cash}
                  checked={paymentMethod === cash}
                  onChange={() => setPaymentMethod(cash)}
                />
                <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
                <label
                  className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                  htmlFor="radio_1"
                >
                  <img
                    className="w-14 object-contain"
                    src="https://png.pngtree.com/png-clipart/20190925/original/pngtree-cartoon-hand-drawn-green-dollar-banknote-illustration-png-image_4887775.jpg"
                    alt="Cash Payment"
                  />
                  <div className="ml-5">
                    <span className="mt-2 font-semibold">
                      Thanh toán bằng tiền mặt
                    </span>
                    <p className="text-slate-500 text-sm leading-6">
                      Giao trong vòng: 2-4 ngày
                    </p>
                  </div>
                </label>
              </div>
              <div className="relative">
                <input
                  className="peer hidden"
                  id="radio_2"
                  type="radio"
                  name="paymentMethod"
                  value="MOMO"
                  checked={paymentMethod === "MOMO"}
                  onChange={() => setPaymentMethod("MOMO")}
                />
                <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white"></span>
                <label
                  className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                  htmlFor="radio_2"
                >
                  <img
                    className="w-14 object-contain"
                    src="https://developers.momo.vn/v3/vi/assets/images/square-8c08a00f550e40a2efafea4a005b1232.png"
                    alt="MoMo Payment"
                  />
                  <div className="ml-5">
                    <span className="mt-2 font-semibold">
                      Thanh toán bằng MoMo
                    </span>
                  </div>
                </label>
              </div>
              <div className="w-full mx-auto">
                {!total ? (
                  <p>Giá trị tiền không hợp lệ.</p>
                ) : (
                  <PayPal
                    payload={payPalPayload}
                    setIsSuccess={setIsSuccess}
                    amount={(total / 24250).toFixed(2)}
                  />
                )}
              </div>
            </form>
            {/* <p class="mt-8 text-lg">Voucher</p>
                        <div className="flex items-center mt-[20px]">
                            <Input className="mr-[10px]" placeholder="Nhập mã voucher" />
                            <Button>Áp dụng</Button>
                        </div> */}
          </div>
          <div class="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0">
            <p class="text-xl mb-[40px]">Thông tin đơn hàng</p>

            <div class="">
              {/* Thông tin người đặt */}
              <Form
                form={form}
                style={{
                  width: "100%",
                }}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={handleFormChange}
                autoComplete="off"
              >
                <Form.Item
                  label="Người nhận"
                  name="recipient"
                  initialValue={current?.fullname || ""}
                  rules={[
                    {
                      required: true,
                      message: "Thông tin này không được để trống!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên người nhận" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  initialValue={current?.phone || ""}
                  rules={[
                    {
                      required: true,
                      message: "Thông tin này không được để trống!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ giao hàng"
                  name="address"
                  //current?.address.length-1
                  initialValue={current?.address[0]} // Thiết lập giá trị mặc định
                  rules={[
                    {
                      required: true,
                      message: "Thông tin này không được để trống!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập địa chỉ giao hàng" />
                  {/* <Select
                                        placeholder="Gợi ý địa chỉ"
                                        style={{ width: '100%', marginTop: '10px' }}
                                        onChange={handleAddressSelect}
                                    >
                                        {suggestedAddresses.map((address, index) => (
                                            <Option key={index} value={address}>
                                                {address} {/* Hiển thị địa chỉ 
                                            </Option>
                                        ))}
                                    </Select>*/}
                </Form.Item>

                <Form.Item label="Ghi chú" name="note" initialValue="">
                  <Input placeholder="Lưu ý..." />
                </Form.Item>

                {/* Tổng cộng */}
                <div class="mt-6 border-b py-2"></div>
                <div class="mt-6 flex items-center justify-between">
                  <p class="text-sm text-gray-900">Tổng tiền</p>
                  <p class="text-2xl font-semibold text-gray-900">
                    {total.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>
                </div>

                <Form.Item className="w-full mt-[40px]">
                  <button
                    htmlType="submit"
                    class="mt-4 mb-8 w-full rounded-md bg-gray-900 px-6 py-3 text-white"
                  >
                    Thanh toán
                  </button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default Checkout;
