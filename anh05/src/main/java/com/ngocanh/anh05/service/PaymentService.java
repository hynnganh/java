package com.ngocanh.anh05.service;
import java.io.UnsupportedEncodingException;

public interface PaymentService {
    String createVnPayPayment(long amount, String ipAddress) throws UnsupportedEncodingException;
}
