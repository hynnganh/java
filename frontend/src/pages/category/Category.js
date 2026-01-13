import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../../services/categoryService';

const CategoryHome = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const colors = ['#FFD1DC', '#E0BBE4', '#BEE7E8', '#D4F0F0', '#FFDFD3', '#F0E68C'];

  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setLoading(false);
    };
    fetchCats();
  }, []);

  if (loading && categories.length === 0) return null;

  return (
    <section className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: '1px' }}>
          <i className="fa fa-tags me-2 text-primary"></i>Danh mục quan tâm
        </h4>
        <button 
          className="btn btn-link text-decoration-none fw-bold p-0 text-primary" 
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Thu gọn' : 'Xem tất cả'} 
          <i className={`fa fa-chevron-${showAll ? 'up' : 'right'} ms-1`}></i>
        </button>
      </div>

      <div className={showAll ? "row g-4" : "d-flex overflow-auto pb-2 no-scrollbar"}>
        {categories.map((cat, index) => (
          <div 
            key={cat.categoryId} 
            className={showAll ? "col-lg-3 col-md-4 col-6" : "flex-shrink-0 me-4"}
            style={!showAll ? { width: '140px' } : {}} // Tăng chiều rộng lên 140px
          >
            <Link to={`/category/${cat.categoryId}`} className="text-decoration-none">
              <div className="category-card text-center h-100">
                <div 
                  className="icon-circle mb-3 mx-auto d-flex align-items-center justify-content-center shadow-sm"
                  style={{ 
                    width: '90px',  // Tăng kích thước vòng tròn lên 90px
                    height: '90px', 
                    backgroundColor: colors[index % colors.length],
                    borderRadius: '25px', 
                    fontSize: '32px', // Chữ to hơn
                    fontWeight: 'bold',
                    color: '#fff',
                    transition: '0.4s'
                  }}
                >
                  {cat.categoryName.charAt(0).toUpperCase()}
                </div>
                
                <div className="category-name text-dark fw-bold mb-0 text-truncate px-1" style={{ fontSize: '1.1rem' }}>
                  {cat.categoryName}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        /* Ẩn thanh cuộn cho Chrome, Safari và Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Ẩn thanh cuộn cho IE, Edge và Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
          display: flex;
          flex-wrap: nowrap;
          -webkit-overflow-scrolling: touch;
        }

        .category-card:hover .icon-circle {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 15px 25px rgba(0,0,0,0.15) !important;
        }
        
        .category-card:hover .category-name {
          color: #0d6efd !important;
        }
      `}</style>
    </section>
  );
};

export default CategoryHome;