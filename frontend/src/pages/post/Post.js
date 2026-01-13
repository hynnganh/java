import React from 'react';

// DỮ LIỆU BÀI VIẾT LẤY TỪ INTERNET
const INTERNET_POSTS = [
  {
    title: "Xu hướng Skincare 2026: Khi 'Skin-Minimalism' lên ngôi",
    desc: "Tối giản hóa quy trình chăm sóc da không chỉ giúp tiết kiệm thời gian mà còn giúp da 'thở' tốt hơn...",
    img: "https://images.pexels.com/photos/3762871/pexels-photo-3762871.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "12/01/2026",
    link: "https://www.elle.vn/cham-soc-da",
    source: "Elle Vietnam"
  },
  {
    title: "Cách chọn Serum Vitamin C cho từng loại da",
    desc: "Vitamin C là hoạt chất vàng trong việc làm sáng da và mờ thâm, nhưng chọn nồng độ bao nhiêu là đủ?",
    img: "https://images.pexels.com/photos/3618606/pexels-photo-3618606.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "10/01/2026",
    link: "https://vogue.com/beauty",
    source: "Vogue Beauty"
  },
  {
    title: "Top 10 thành phần mỹ phẩm 'thuần chay' được săn đón",
    desc: "Mỹ phẩm thuần chay (Vegan Beauty) đang trở thành tiêu chuẩn mới của người tiêu dùng hiện đại...",
    img: "https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=800",
    date: "08/01/2026",
    link: "https://bazaarvietnam.vn/",
    source: "Bazaar VN"
  }
];

const BeautyBlog = () => {
  return (
    <section className="container mt-5 pt-5 border-top">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">KIẾN THỨC LÀM ĐẸP</h3>
          <p className="text-muted mb-0">Cập nhật tin tức Skincare từ các tạp chí hàng đầu</p>
        </div>
        <a href="https://elle.vn" target="_blank" rel="noreferrer" className="btn btn-link text-primary p-0 fw-bold text-decoration-none">Xem thêm</a>
      </div>
      
      <div className="row">
        {INTERNET_POSTS.map((post, idx) => (
          <div key={idx} className="col-md-4 mb-4">
            <div className="card border-0 shadow-sm h-100 overflow-hidden post-card-beauty">
              <div className="position-relative overflow-hidden">
                <img src={post.img} className="card-img-top" alt={post.title} 
                     style={{height: '240px', objectFit: 'cover', transition: '0.5s'}} />
                <div className="position-absolute top-0 end-0 m-3 badge bg-white text-dark shadow-sm">
                  {post.source}
                </div>
              </div>
              <div className="card-body p-4">
                <small className="text-muted d-block mb-2">{post.date}</small>
                <h6 className="card-title fw-bold mb-3" style={{ lineHeight: '1.5', height: '48px', overflow: 'hidden' }}>
                  {post.title}
                </h6>
                <p className="card-text text-muted small mb-3" style={{ height: '60px', overflow: 'hidden' }}>
                  {post.desc}
                </p>
                <a href={post.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm rounded-pill px-4 fw-bold">
                  Đọc tại {post.source} <i className="fa fa-external-link-alt ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .post-card-beauty:hover img { transform: scale(1.1); }
        .post-card-beauty { transition: 0.3s; }
        .post-card-beauty:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
      `}</style>
    </section>
  );
};

export default BeautyBlog;