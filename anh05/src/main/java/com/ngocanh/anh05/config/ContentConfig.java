// package com.ngocanh.anh05.config;

// import org.springframework.context.annotation.Configuration;
// import org.springframework.http.MediaType;
// import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration
// public class ContentConfig implements WebMvcConfigurer {
//     @Override
//     public void configureContentNegotiation(@SuppressWarnings("null") ContentNegotiationConfigurer configurer) {
//         configurer.favorParameter(true).parameterName("mediaType").defaultContentType(MediaType.APPLICATION_JSON)
//                 .mediaType("json", MediaType.APPLICATION_JSON).mediaType("xml", MediaType.APPLICATION_XML);
//     }
// }

package com.ngocanh.anh05.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ContentConfig implements WebMvcConfigurer {

    // Lấy đường dẫn ảnh từ file properties (mặc định là "images/" nếu deploy)
    @Value("${project.image}")
    private String path;

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.favorParameter(true)
                  .parameterName("mediaType")
                  .defaultContentType(MediaType.APPLICATION_JSON)
                  .mediaType("json", MediaType.APPLICATION_JSON)
                  .mediaType("xml", MediaType.APPLICATION_XML);
    }

    // 1. CẤU HÌNH CORS: Cho phép Frontend (Vercel) gọi API
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://ten-mien-frontend-cua-nang.vercel.app", "http://localhost:3000") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // 2. CẤU HÌNH TRÌNH ĐỌC ẢNH: Để xem được ảnh qua link API
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Giúp Spring hiểu link /api/public/products/image/** tương ứng với thư mục vật lý
        registry.addResourceHandler("/api/public/products/image/**")
                .addResourceLocations("file:" + path);
    }
}