package com.ngocanh.anh05.config;

import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;

public class VNPAYConfig {
    // Thông số môi trường Sandbox (Test) của VNPay
    public static String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static String vnp_ReturnUrl = "http://localhost:3000/payment-success";
    public static String vnp_TmnCode = "5KKPWZ0N";
    public static String vnp_HashSecret = "QZF9BDG3EG6JO4ZKUWB2H2TBWXLL9K5H";

    // Hàm băm dữ liệu theo thuật toán HMAC SHA512 (VNPay yêu cầu)
    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) throw new NullPointerException();
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }
}
