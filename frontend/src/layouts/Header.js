import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../services/userService";
import categoryService from "../services/categoryService";
import cartService from "../services/cartService";
import Swal from "sweetalert2";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/fonts/fontawesome/css/all.min.css";
import "../assets/css/style.css"; 

const Header = () => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // 1. Xử lý Tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/product`, { state: { searchKeyword: searchTerm.trim() } });
    }
  };

  // 2. Khởi tạo User
  const initUser = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.userId) {
        try {
          const data = await userService.getUserById(parsedUser.userId);
          setUserInfo(data);
        } catch (err) {
          console.error("Lỗi lấy thông tin user:", err);
        }
      }
    } else {
      setUser(null);
      setUserInfo(null);
    }
  }, []);

  // 3. Lấy số lượng giỏ hàng
  const loadCartCount = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser?.email) {
        const count = await cartService.getCartCount(currentUser.email);
        setCartCount(count);
      } else {
        const localCart = cartService.getCartFromStorage();
        setCartCount(cartService.getTotalItems(localCart?.products || []));
      }
    } catch (error) {
      setCartCount(0);
    }
  };

  // 4. Lấy danh mục từ API
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Lỗi danh mục:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    initUser();
    fetchCategories();
    window.addEventListener("authUpdated", initUser);
    return () => window.removeEventListener("authUpdated", initUser);
  }, [initUser]);

  useEffect(() => {
    loadCartCount();
    window.addEventListener('cartUpdated', loadCartCount);
    return () => window.removeEventListener('cartUpdated', loadCartCount);
  }, [user]);

  // 5. Điều hướng danh mục
  const handleCategoryClick = (category) => {
    navigate(`/product`, { 
      state: { 
        selectedCategory: category.categoryId || category.id, 
        categoryName: category.categoryName || category.name 
      } 
    });
  };

  // 6. Đăng xuất
  const handleLogout = () => {
    Swal.fire({
      title: 'Bạn muốn đăng xuất?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff6a00',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        setUser(null);
        setUserInfo(null);
        setCartCount(0);
        window.dispatchEvent(new Event("authUpdated"));
        navigate("/login");
      }
    });
  };

  // 7. Hiển thị tên User
  const renderUserName = () => {
    if (!user) return "Tài khoản";
    return userInfo?.firstName || user.firstName || user.email?.split('@')[0] || "User";
  };

  return (
    <header className="section-header sticky-top bg-white shadow-sm">
      <div className="top-banner-ads">
        Nội thành Hà Nội - TP. Hồ Chí Minh | GIAO SIÊU TỐC 2H - FREESHIP 0Đ
      </div>

      <section className="header-main-orange">
        <div className="container">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-lg-2 col-md-3 col-6">
              <Link to="/" className="text-decoration-none">
                <h2 className="text-white fw-bold mb-0" style={{ letterSpacing: '-1px' }}>ShopBeAnh</h2>
              </Link>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="col-lg-6 col-md-5 d-none d-md-block">
              <form className="search-bar-wrap" onSubmit={handleSearchSubmit}>
                <button type="submit" className="btn p-0 border-0 bg-transparent">
                  <i className="fa fa-search text-muted me-2"></i>
                </button>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  className="form-control shadow-none" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>

            {/* User & Cart */}
            <div className="col-lg-4 col-md-4 col-6">
              <div className="d-flex justify-content-end align-items-center gap-4">
                
                {/* Dropdown User */}
                <div className="user-dropdown-container">
                  <div className="header-orange-icons text-center" style={{ cursor: 'pointer' }}>
                    <i className="fa fa-user-circle fa-lg d-block mb-1"></i>
                    <span style={{ fontSize: '12px' }}>{renderUserName()}</span>
                  </div>

                  <ul className="user-mega-menu shadow-lg">
                    {!user ? (
                      <>
                        <li><Link to="/login" className="user-menu-item"><i className="fa fa-sign-in-alt"></i> Đăng nhập</Link></li>
                        <li><Link to="/register" className="user-menu-item border-top"><i className="fa fa-user-plus"></i> Đăng ký</Link></li>
                      </>
                    ) : (
                      <>
                        <li><Link to="/profile" className="user-menu-item"><i className="fa fa-id-card"></i> Trang cá nhân</Link></li>
                        <li><Link to="/orders" className="user-menu-item"><i className="fa fa-list-alt"></i> Đơn hàng</Link></li>
                        <li>
                          <button onClick={handleLogout} className="user-menu-item border-top w-100 text-start border-0 bg-transparent text-danger">
                            <i className="fa fa-power-off"></i> Đăng xuất
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                
                {/* Giỏ hàng */}
                <Link to="/cart" className="header-orange-icons position-relative text-decoration-none">
                  <div className="text-center">
                    <i className="fa fa-shopping-basket fa-lg d-block mb-1"></i>
                    <span className="badge rounded-pill bg-white text-danger position-absolute top-0 start-50 translate-middle-x" 
                          style={{ marginTop: '-8px', fontSize: '10px' }}>
                      {cartCount}
                    </span>
                    <span style={{ fontSize: '12px' }}>Giỏ hàng</span>
                  </div>
                </Link>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Bar */}
      <nav className="nav-categories d-none d-lg-block">
        <div className="container">
          <ul className="nav d-flex align-items-center">
            {/* Mega Menu Danh mục */}
            <li className="nav-item dropdown-hover-container">
              <a className="nav-link fw-bold text-dark py-3" href="#" onClick={(e) => e.preventDefault()}>
                <i className="fa fa-bars me-2 text-warning"></i>TẤT CẢ DANH MỤC
              </a>
              <ul className="mega-dropdown-menu shadow-lg scrollable-menu">
                {loadingCategories ? (
                  <li className="text-center p-3 small text-muted">Đang tải...</li>
                ) : (
                  categories.map((cat, idx) => (
                    <li key={idx}>
                      <button 
                        className="mega-dropdown-item border-0 bg-transparent w-100 text-start" 
                        onClick={() => handleCategoryClick(cat)}
                      >
                        {cat.categoryName || cat.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </li>

            {/* Hiển thị nhanh các danh mục ra thanh chính (7 cái đầu) */}
            {!loadingCategories && categories.slice(0, 7).map((cat, idx) => (
              <li className="nav-item" key={`nav-quick-${idx}`}>
                <button 
                  className="nav-link text-dark border-0 bg-transparent py-3 fw-medium text-uppercase small" 
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat.categoryName || cat.name}
                </button>
              </li>
            ))}
            <Link to="/product" className="nav-link text-dark border-0 bg-transparent py-3 fw-medium text-uppercase small ms-3">
              Danh sách sản phẩm
            </Link>
          </ul>
        </div>
      </nav>

      <style>{`
        /* Giới hạn chiều cao và cho phép cuộn menu danh mục */
        .scrollable-menu {
          max-height: 420px;
          overflow-y: auto;
          overflow-x: hidden;
          min-width: 250px;
        }

        /* Tùy chỉnh thanh cuộn đẹp hơn */
        .scrollable-menu::-webkit-scrollbar {
          width: 5px;
        }
        .scrollable-menu::-webkit-scrollbar-thumb {
          background-color: #ff6a00;
          border-radius: 10px;
        }
        .scrollable-menu::-webkit-scrollbar-track {
          background: #f8f9fa;
        }

        /* Hiệu ứng hover cho menu */
        .mega-dropdown-item {
          padding: 10px 20px;
          display: block;
          color: #333;
          transition: all 0.2s;
          font-size: 14px;
        }
        .mega-dropdown-item:hover {
          background-color: #fff5ee;
          color: #ff6a00;
          padding-left: 25px;
        }

        /* Đảm bảo dropdown hiển thị khi hover */
        .dropdown-hover-container:hover .mega-dropdown-menu {
          display: block;
          opacity: 1;
          visibility: visible;
        }
      `}</style>
    </header>
  );
};

export default Header;