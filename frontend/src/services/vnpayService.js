import express from "express";
import cors from "cors";
import crypto from "crypto";
import moment from "moment";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const vnp_TmnCode = "5KKPWZ0N"; 
const vnp_HashSecret = "QZF9BDG3EG6JO4ZKUWB2H2TBWXLL9K5H";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = `http://localhost:3000/vnpay_return`;

app.get("/payment", (req, res) => {
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    let amount = req.query.amount || 10000;

    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': moment(date).format('HHmmss'),
        'vnp_OrderInfo': 'Thanh toán đơn hàng mỹ phẩm',
        'vnp_OrderType': 'other',
        'vnp_Amount': amount * 100,
        'vnp_ReturnUrl': vnp_ReturnUrl,
        'vnp_IpAddr': '127.0.0.1',
        'vnp_CreateDate': createDate
    };

    vnp_Params = Object.keys(vnp_Params).sort().reduce((obj, key) => {
        obj[key] = vnp_Params[key];
        return obj;
    }, {});

    let querystring = new URLSearchParams(vnp_Params).toString();
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(querystring, 'utf-8')).digest("hex"); 
    
    res.json({ url: vnp_Url + "?" + querystring + "&vnp_SecureHash=" + signed });
});

app.get("/vnpay_return", (req, res) => {
    const responseCode = req.query.vnp_ResponseCode;
    // Link quay về React (Port 8081)
    const finalLink = `http://localhost:8081/payment-success?vnp_ResponseCode=${responseCode}`;

    res.send(`
        <html>
            <body style="text-align:center;padding-top:100px;font-family:sans-serif;">
                <h2>Đang xử lý kết quả thanh toán...</h2>
                <script>setTimeout(() => { window.location.href = "${finalLink}"; }, 1000);</script>
            </body>
        </html>
    `);
});

app.listen(PORT, () => console.log(`🚀 VNPay Server chạy tại: http://localhost:${PORT}`));