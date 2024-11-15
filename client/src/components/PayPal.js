// import {
//     PayPalScriptProvider,
//     PayPalButtons,
//     usePayPalScriptReducer
// } from "@paypal/react-paypal-js";
// import { useEffect } from "react";
// import { apiGetUserCart, apiOrder } from "../apis";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
// import { updateCart } from "../store/cart/cartSlice";
// import { useDispatch } from 'react-redux'


// // This value is from the props in the UI
// const style = { "layout": "vertical" };

// function onApprove(data) {
//     // replace this url with your server
//     return fetch("https://react-paypal-js-storybook.fly.dev/api/paypal/capture-order", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             orderID: data.orderID,
//         }),
//     })
//         .then((response) => response.json())
//         .then((orderData) => {
//             // Your code here after capture the order
//         });
// }

// // Custom component to wrap the PayPalButtons and show loading spinner
// const ButtonWrapper = ({ currency, showSpinner, amount, payload, setIsSuccess }) => {
//     const navigate = useNavigate()
//     const [{ isPending, options }, dispatch] = usePayPalScriptReducer();
//     const dispatchRedux = useDispatch()
//     useEffect(() => {
//         dispatch({
//             type: 'resetOptions',
//             value: {
//                 ...options, currency: currency
//             }
//         })
//     }, [currency, showSpinner, payload])

//     const handleSaveOrder = async () => {
//         const response = await apiOrder({ ...payload, status: 'Confirmed' })

//         if (response.success) {
//             setIsSuccess(true)
//             const getCarts = await apiGetUserCart()

//             dispatchRedux(updateCart({ products: getCarts.userCart.cart.products }))
//             setTimeout(() => {
//                 Swal.fire('Chúc mừng!', 'Bạn đã thanh toán thành công', 'success').then(() => {
//                     navigate("/products")
//                 })
//             }, 1000)

//         }

//     }

//     return (
//         <>
//             {(showSpinner && isPending) && <div className="spinner" />}
//             <PayPalButtons
//                 style={style}
//                 disabled={false}
//                 forceReRender={[style, currency, amount]}
//                 fundingSource={undefined}
//                 createOrder={(data, actions) => actions.order.create({
//                     purchase_units: [
//                         { amount: { currency_code: currency, value: amount } }
//                     ]
//                 }).then(orderId => orderId)}
//                 onApprove={(data, actions) => actions.order.capture().then(async (response) => {
//                     if (response.status === 'COMPLETED') {
//                         await handleSaveOrder()
//                     }
//                 })}
//             />
//         </>
//     );
// }

// export default function PayPal({ amount, payload, setIsSuccess }) {
//     return (
//         <div style={{ maxWidth: "750px", minHeight: "200px", margin: 'auto' }}>
//             <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
//                 <ButtonWrapper payload={payload} setIsSuccess={setIsSuccess} currency={'USD'} amount={amount} showSpinner={false} />
//             </PayPalScriptProvider>
//         </div>
//     );
// }

import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";
import { apiGetUserCart, apiOrder } from "../apis";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { updateCart } from "../store/cart/cartSlice";
import { useDispatch } from 'react-redux';

const style = { layout: "vertical" };

const ButtonWrapper = ({ currency, amount, payload, setIsSuccess }) => {
    const navigate = useNavigate();
    const [{ isPending, options }, dispatch] = usePayPalScriptReducer();
    const dispatchRedux = useDispatch();

    useEffect(() => {
        dispatch({
            type: 'resetOptions',
            value: {
                ...options, currency: currency
            }
        });
    }, [currency, options, dispatch]);

    const handleSaveOrder = async () => {
        const response = await apiOrder({ ...payload, status: 'Confirmed' });

        if (response.success) {
            setIsSuccess(true);
            const getCarts = await apiGetUserCart();

            dispatchRedux(updateCart({ products: getCarts.userCart.cart.products }));

            Swal.fire('Chúc mừng!', 'Bạn đã thanh toán thành công', 'success').then(() => {
                navigate("/products");
            });
        }
    };

    return (
        <>
            {isPending && <div className="spinner" />}
            <PayPalButtons
                style={style}
                createOrder={(data, actions) => actions.order.create({
                    purchase_units: [{ amount: { currency_code: currency, value: amount } }]
                })}
                onApprove={async (data, actions) => {
                    const response = await actions.order.capture();
                    if (response.status === 'COMPLETED') {
                        await handleSaveOrder();
                    }
                }}
            />
        </>
    );
};

export default function PayPal({ amount, payload, setIsSuccess }) {
    const [loadPayPal, setLoadPayPal] = useState(false);

    useEffect(() => {
        // Kiểm tra localStorage để xem PayPal đã được tải chưa
        const hasLoadedPayPal = localStorage.getItem('hasLoadedPayPal');
        console.log("hasLoadedPayPal " + hasLoadedPayPal)
        if (!hasLoadedPayPal) {
            setLoadPayPal(true);
            // Đánh dấu rằng PayPal đã được tải
            localStorage.setItem('hasLoadedPayPal', 'true');
        }
    }, []);

    console.log("LOAD PAL PA " + loadPayPal)

    return (
        <div style={{ maxWidth: "750px", minHeight: "200px", margin: 'auto' }}>
            {loadPayPal && (
                <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                    <ButtonWrapper 
                        payload={payload} 
                        setIsSuccess={setIsSuccess} 
                        currency='USD' 
                        amount={amount} 
                    />
                </PayPalScriptProvider>
            )}
        </div>
    );
}