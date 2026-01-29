package com.ngocanh.anh05.controller;

import com.ngocanh.anh05.entity.Product;
import com.ngocanh.anh05.repository.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("*")
public class AiController {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Autowired private ProductRepo productRepository;

    @Transactional
    @PostMapping("/ask")
    public ResponseEntity<?> askGemini(@RequestBody Map<String, Object> payload) {
        try {
            String userMsg = (String) payload.get("message");
            
            // 1. Giữ nguyên logic tìm model cũ của nàng
            String modelName = findWorkingModel();
            
            // 2. Lấy danh sách sản phẩm để AI biết đường tư vấn
            List<Product> allProducts = productRepository.findAll();
            String context = allProducts.stream()
                .map(p -> "ID:" + p.getProductId() + "-" + p.getProductName())
                .collect(Collectors.joining(", "));

            // 3. Tạo Prompt (Thêm yêu cầu trả về ID sản phẩm)
            String prompt = "Bạn là trợ lý Ngọc Anh Beauty. Danh sách sản phẩm của shop: [" + context + "]. "
                          + "Hãy tư vấn cho khách: " + userMsg + ". "
                          + "Nếu có sản phẩm nào trong danh sách trên phù hợp, hãy liệt kê ID của chúng ở cuối câu theo dạng: [IDS:1,2,3].";

            // 4. Giữ nguyên URL v1beta và cách gọi RestTemplate của nàng
            String url = "https://generativelanguage.googleapis.com/v1beta/" + modelName + ":generateContent?key=" + apiKey;
            
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> body = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);
            
            // 5. Bóc tách kết quả từ Gemini
            List candidates = (List) response.getBody().get("candidates");
            Map firstCand = (Map) candidates.get(0);
            Map content = (Map) firstCand.get("content");
            List parts = (List) content.get("parts");
            String aiReply = ((Map) parts.get(0)).get("text").toString();

            // 6. Xử lý bóc tách IDS để gửi về cho Card
            List<Map<String, Object>> suggestedProducts = new ArrayList<>();
            if (aiReply.contains("[IDS:")) {
                try {
                    int start = aiReply.indexOf("[IDS:") + 5;
                    int end = aiReply.indexOf("]", start);
                    String[] ids = aiReply.substring(start, end).split(",");
                    Set<Long> idSet = Arrays.stream(ids).map(s -> Long.parseLong(s.trim())).collect(Collectors.toSet());
                    
                    // Chỉ lấy những field cần thiết để FE hiện Card (Tránh lỗi Lazy Loading)
                    suggestedProducts = allProducts.stream()
                        .filter(p -> idSet.contains(p.getProductId()))
                        .map(p -> {
                            Map<String, Object> m = new HashMap<>();
                            m.put("productId", p.getProductId());
                            m.put("productName", p.getProductName());
                            m.put("price", p.getPrice());
                            m.put("specialPrice", p.getSpecialPrice());
                            m.put("image", p.getImage());
                            return m;
                        }).collect(Collectors.toList());
                } catch (Exception e) {
                    System.err.println("Lỗi bóc tách IDS: " + e.getMessage());
                }
            }

            // 7. Làm sạch câu trả lời (Xóa phần [IDS:...] khỏi tin nhắn chat)
            String cleanReply = aiReply.replaceAll("\\[IDS:.*?\\]", "").trim();

            // Trả về đúng format để Frontend hiện Card
            return ResponseEntity.ok(Map.of(
                "reply", cleanReply,
                "suggested_products", suggestedProducts
            ));

        } catch (Exception e) {
            System.err.println("=== [LỖI]: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("reply", "Lỗi rồi nàng ơi: " + e.getMessage()));
        }
    }

    // Giữ nguyên hàm tìm Model của nàng
    private String findWorkingModel() {
        String listUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
        RestTemplate restTemplate = new RestTemplate();
        try {
            Map response = restTemplate.getForObject(listUrl, Map.class);
            List<Map> models = (List<Map>) response.get("models");
            for (Map m : models) {
                String name = m.get("name").toString();
                if (name.contains("gemini-1.5-flash")) return name;
            }
            return models.get(0).get("name").toString();
        } catch (Exception e) {
            return "models/gemini-1.5-flash"; 
        }
    }
}