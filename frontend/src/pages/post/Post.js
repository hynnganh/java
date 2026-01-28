import React from 'react';

// DỮ LIỆU BÀI VIẾT MỚI - CẬP NHẬT 2026
const INTERNET_POSTS = [
  {
    title: "Chăm sóc hàng rào bảo vệ da: Chìa khóa cho làn da không tuổi",
    desc: "Tại sao Ceramide và Niacinamide lại trở thành bộ đôi 'cứu cánh' cho những làn da bị tổn thương do lạm dụng peel da?",
    img: "https://images.pexels.com/photos/3762466/pexels-photo-3762466.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "25/01/2026",
    link: "https://www.elle.vn/cham-soc-da",
    source: "Elle Beauty"
  },
  {
    title: "Retinol cho người mới bắt đầu: Đừng để 'cháy' da vì thiếu hiểu biết",
    desc: "Hướng dẫn chi tiết cách sử dụng phác đồ 'kẹp thịt' (Sandwich) giúp giảm kích ứng tối đa khi sử dụng Vitamin A liều cao.",
    img: "https://images.pexels.com/photos/3616992/pexels-photo-3616992.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "22/01/2026",
    link: "https://vogue.com/beauty",
    source: "Vogue Magazine"
  },
  {
    title: "Ánh sáng xanh từ điện thoại: Kẻ thù thầm lặng gây sạm nám",
    desc: "Bạn có biết kem chống nắng thông thường có thể không bảo vệ bạn khỏi HEV? Hãy tìm kiếm màng lọc sắt oxit ngay!",
    img: "https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "20/01/2026",
    link: "https://bazaarvietnam.vn/",
    source: "Bazaar VN"
  }
];

const BeautyBlog = () => {
  return (
    <section className="container mt-5 pt-5 border-top">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div className="border-start border-4 border-dark ps-3">
          <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '1px' }}>CHUYÊN MỤC BEAUTY</h3>
          <p className="text-muted mb-0 small uppercase">Tin tức & Bí quyết từ chuyên gia da liễu</p>
        </div>
        <button className="btn btn-outline-dark btn-sm rounded-0 px-4 fw-bold">XEM BLOG</button>
      </div>
      
      <div className="row">
        {INTERNET_POSTS.map((post, idx) => (
          <div key={idx} className="col-lg-4 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100 overflow-hidden post-card-beauty" style={{ borderRadius: '0px' }}>
              <div className="position-relative overflow-hidden" style={{ height: '260px' }}>
                <img 
                  src={post.img} 
                  className="card-img-top h-100 w-100 transition-zoom" 
                  alt={post.title} 
                  style={{ objectFit: 'cover' }} 
                />
                <div className="position-absolute bottom-0 start-0 bg-dark text-white px-3 py-1 small fw-bold">
                  {post.source}
                </div>
              </div>
              <div className="card-body p-4 bg-white">
                <div className="d-flex align-items-center mb-2">
                  <span className="text-primary fw-bold small me-2">#SKINCARE</span>
                  <span className="text-muted small border-start ps-2">{post.date}</span>
                </div>
                <h5 className="card-title fw-bold mb-3 article-title">
                  {post.title}
                </h5>
                <p className="card-text text-muted small mb-4 article-desc">
                  {post.desc}
                </p>
                <a 
                  href={post.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-dark fw-bold text-decoration-none border-bottom border-2 border-primary pb-1 small"
                >
                  ĐỌC BÀI VIẾT <i className="fa fa-long-arrow-right ms-2"></i>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .post-card-beauty { 
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); 
        }
        .transition-zoom { 
          transition: transform 0.8s ease; 
        }
        .post-card-beauty:hover .transition-zoom { 
          transform: scale(1.1); 
        }
        .post-card-beauty:hover { 
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; 
        }
        .article-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          min-height: 45px;
        }
        .article-desc {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 54px;
        }
        .text-primary { color: #ff6a00 !important; }
        .border-primary { border-color: #ff6a00 !important; }
      `}</style>
    </section>
  );
};

export default BeautyBlog;