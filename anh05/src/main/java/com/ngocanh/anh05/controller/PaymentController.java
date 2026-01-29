package com.ngocanh.anh05.controller;
import com.ngocanh.anh05.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor // Dùng Lombok để inject service
public class PaymentController {
    
    private final PaymentService paymentService;

    @GetMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestParam long amount, HttpServletRequest request) throws UnsupportedEncodingException {
        String ipAddress = request.getRemoteAddr();
        String paymentUrl = paymentService.createVnPayPayment(amount, ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("url", paymentUrl);
        return ResponseEntity.ok(response);
    }
}
