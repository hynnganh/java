import React, { useState, useEffect } from 'react';

// 1. IMPORT ẢNH TỪ ASSETS
import BannerImg1 from '../../assets/images/banners/banner6.jpg';
import BannerImg2 from '../../assets/images/banners/banner7.jpg';
import BannerImg3 from '../../assets/images/banners/banner4.jpg';
import SidePromo1 from '../../assets/images/banners/slide1.jpg';
import SidePromo2 from '../../assets/images/banners/slide2.jpg';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    { id: 1, img: BannerImg1, title: "Khuyến mãi 1" },
    { id: 2, img: BannerImg2, title: "Khuyến mãi 2" },
    { id: 3, img: BannerImg3, title: "Khuyến mãi 3" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <section className="hero-section py-2" style={{ backgroundColor: '#fdfdfd' }}>
      <div className="container">
        {/* Giới hạn độ rộng container nếu muốn nhỏ hơn nữa */}
        <div className="row g-2"> {/* Giảm g-3 xuống g-2 để các ảnh khít nhau hơn */}
          
          {/* --- CỘT TRÁI: BANNER CHÍNH (Thu nhỏ chiều cao) --- */}
          <div className="col-lg-8 col-md-12">
            <div className="main-banner position-relative overflow-hidden rounded-3 shadow-sm" 
                 style={{ height: '400px' }}> {/* GIẢM CHIỀU CAO TẠI ĐÂY */}
              
              <div 
                className="d-flex h-100" 
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`,
                  transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}
              >
                {banners.map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-100 h-100">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-100 h-100" 
                      style={{ objectFit: 'cover' }} 
                    />
                  </div>
                ))}
              </div>

              {/* Nút điều hướng (Nhỏ lại một chút) */}
              <button 
                className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle ms-2 d-none d-md-flex align-items-center justify-content-center shadow-sm"
                onClick={prevSlide}
                style={{ width: '35px', height: '35px', zIndex: 5, opacity: 0.7, border: 'none' }}
              >
                <i className="fas fa-chevron-left text-secondary small"></i>
              </button>
              <button 
                className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle me-2 d-none d-md-flex align-items-center justify-content-center shadow-sm"
                onClick={nextSlide}
                style={{ width: '35px', height: '35px', zIndex: 5, opacity: 0.7, border: 'none' }}
              >
                <i className="fas fa-chevron-right text-secondary small"></i>
              </button>

              {/* Dots (Nhỏ lại) */}
              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex" style={{ zIndex: 5 }}>
                {banners.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    style={{ 
                      width: index === currentSlide ? '20px' : '8px', 
                      height: '8px',
                      borderRadius: '10px',
                      backgroundColor: index === currentSlide ? '#ff6a00' : 'rgba(255, 255, 255, 0.7)',
                      margin: '0 4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- CỘT PHẢI: BANNER PHỤ (Tự động khớp chiều cao) --- */}
          <div className="col-lg-4 d-none d-lg-block">
            <div className="d-flex flex-column h-100">
              
              <div className="side-banner-item mb-2 flex-grow-1 rounded-3 overflow-hidden shadow-sm">
                <a href="/promo-1">
                  <img 
                    src={SidePromo1} 
                    alt="Side Promo 1" 
                    className="w-100 h-100" 
                    style={{ objectFit: 'cover', minHeight: '170px' }} 
                  />
                </a>
              </div>

              <div className="side-banner-item flex-grow-1 rounded-3 overflow-hidden shadow-sm">
                <a href="/promo-2">
                  <img 
                    src={SidePromo2} 
                    alt="Side Promo 2" 
                    className="w-100 h-100" 
                    style={{ objectFit: 'cover', minHeight: '170px' }} 
                  />
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;