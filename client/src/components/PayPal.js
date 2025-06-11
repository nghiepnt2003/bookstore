import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import { useEffect } from "react";
import { apiGetUserCart, apiOrder } from "../apis";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { updateCart } from "../store/cart/cartSlice";
import { useDispatch } from 'react-redux'


// This value is from the props in the UI
const style = { "layout": "vertical" };

// Custom component to wrap the PayPalButtons and show loading spinner
const ButtonWrapper = ({ currency, showSpinner, amount, payload, setIsSuccess }) => {
    const navigate = useNavigate()
    const [{ isPending, options }, dispatch] = usePayPalScriptReducer();
    const dispatchRedux = useDispatch()
    useEffect(() => {
        dispatch({
            type: 'resetOptions',
            value: {
                ...options, currency: currency
            }
        })
    }, [currency, showSpinner, payload])

    const handleSaveOrder = async () => {
        const response = await apiOrder({ ...payload, payment: 'PAYPAL', status: 'Delivering' })

        if (response.success) {
            setIsSuccess(true)
            // const getCarts = await apiGetUserCart()

            // dispatchRedux(updateCart({ products: getCarts.userCart.cart.products }))
            setTimeout(() => {
                Swal.fire('Chúc mừng!', 'Bạn đã thanh toán thành công', 'success').then(() => {
                    navigate("/products")
                })
            }, 1000)

        }

    }

    return (
        <>
            {(showSpinner && isPending) && <div className="spinner" />}
            <PayPalButtons
                style={style}
                disabled={false}
                forceReRender={[style, currency, amount]}
                fundingSource={undefined}
                createOrder={(data, actions) => actions.order.create({
                    purchase_units: [
                        { amount: { currency_code: currency, value: amount } }
                    ]
                }).then(orderId => orderId)}
                onApprove={(data, actions) => actions.order.capture().then(async (response) => {
                    console.log("PL " + JSON.stringify(payload))
                    if (response.status === 'COMPLETED') {
                        await handleSaveOrder()
                    }
                })}
            />
        </>
    );
}

export default function PayPal({ amount, payload, setIsSuccess }) {
    return (
        <div style={{ maxWidth: "750px", minHeight: "200px", margin: 'auto' }}>
            <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                <ButtonWrapper payload={payload} setIsSuccess={setIsSuccess} currency={'USD'} amount={amount} showSpinner={false} />
            </PayPalScriptProvider>
        </div>
    );
}
