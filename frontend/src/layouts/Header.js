import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import userService from "../services/userService";
import categoryService from "../services/categoryService";
import cartService from "../services/cartService";
import Swal from "sweetalert2";

// Thêm link FontAwesome CDN vào index.html của mày hoặc import trực tiếp ở đây để fix icon
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

const Header = () => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Khi search thì nhảy về trang product với keyword
      navigate("/product", { state: { searchKeyword: searchTerm.trim() } });
    }
  };

  const initUser = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.userId) {
        try {
          const data = await userService.getUserById(parsedUser.userId);
          setUserInfo(data);
        } catch (err) { console.error(err); }
      }
    } else { setUser(null); setUserInfo(null); }
  }, []);

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
    } catch (error) { setCartCount(0); }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (err) { console.error(err); } finally { setLoadingCategories(false); }
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

  const handleCategoryClick = (category) => {
    const id = category.categoryId || category.id;
    navigate(`/category/${id}`);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Xác nhận đăng xuất?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6a00',
      confirmButtonText: 'Đăng xuất',
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

  return (
    <header className="main-header sticky-top bg-white shadow-sm border-bottom">
      <div className="top-ads py-1 text-center text-white fw-medium" style={{ background: '#ff6a00', fontSize: '12px' }}>
        🚚 Miễn phí vận chuyển cho đơn hàng từ 500K
      </div>

      <section className="header-middle py-3">
        <div className="container">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-lg-3 col-6">
              <Link to="/" className="text-decoration-none">
                <h2 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-1.5px' }}>
                  Shop<span style={{ color: '#ff6a00' }}>BeAnh</span>
                </h2>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="col-lg-5 d-none d-lg-block">
              <form onSubmit={handleSearchSubmit} className="search-box position-relative">
                <input 
                  type="text" 
                  className="form-control rounded-pill border-2 px-4 shadow-none" 
                  style={{ borderColor: '#ff6a00', height: '42px' }}
                  placeholder="Mày muốn mua gì hôm nay?..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn position-absolute end-0 top-0 h-100 rounded-pill px-4 text-white" 
                        style={{ background: '#ff6a00' }} type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>

            {/* User & Cart Icons */}
            <div className="col-lg-4 col-6">
              <div className="d-flex justify-content-end align-items-center gap-3">
                
                {/* User */}
                <div className="nav-item-dropdown position-relative">
                  <div className="d-flex align-items-center gap-3" style={{ cursor: 'pointer' }}>
                    <div className="icon-avatar border rounded-circle d-flex align-items-center justify-content-center bg-light" style={{ width: '40px', height: '40px' }}>
                      <i className="fas fa-user text-secondary"></i>
                    </div>
                    <div className="d-none d-md-block text-start">
                      <span className="fw-bold small d-block">
                        {user ? (userInfo?.firstName || "Tài khoản") : "Đăng nhập"}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown-content shadow-lg border-0 rounded-3">
                    {!user ? (
                      <>
                        <Link to="/login" className="drop-link">Đăng nhập</Link>
                        <Link to="/register" className="drop-link border-top">Đăng ký</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/profile" className="drop-link">Cá nhân</Link>
                        <Link to="/orders" className="drop-link">Đơn hàng</Link>
                        <button onClick={handleLogout} className="drop-link w-100 border-0 bg-transparent text-start text-danger border-top">Đăng xuất</button>
                      </>
                    )}
                  </div>
                </div>

                {/* Giỏ hàng */}
                <Link to="/cart" className="text-decoration-none d-flex align-items-center gap-2 text-dark">
                  <div className="position-relative border rounded-circle d-flex align-items-center justify-content-center bg-orange-light" style={{ width: '40px', height: '40px', background: '#fff5ee' }}>
                    <i className="fas fa-shopping-cart" style={{ color: '#ff6a00' }}></i>
                    <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle border border-white" style={{ fontSize: '10px' }}>
                      {cartCount}
                    </span>
                  </div>
                </Link>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Ngang */}
      <nav className="nav-bottom py-0 d-none d-lg-block border-top">
        <div className="container">
          <ul className="nav align-items-center">
            {/* Mega Menu Danh mục */}
            <li className="nav-item category-dropdown-wrapper">
              <span className="nav-link text-dark fw-bold py-3 px-3 d-flex align-items-center pointer" style={{ cursor: 'pointer' }}>
                <i className="fas fa-bars me-2 text-warning"></i> DANH MỤC
              </span>
              <div className="category-mega-menu shadow-lg border-0">
                {loadingCategories ? <div className="p-3 small text-muted">Đang tải...</div> : (
                  categories.map((cat, i) => (
                    <button key={i} className="cat-item-btn" onClick={() => handleCategoryClick(cat)}>
                      {cat.categoryName || cat.name}
                    </button>
                  ))
                )}
              </div>
            </li>

            {/* LINK TẤT CẢ SẢN PHẨM - MỚI THÊM */}
            <li className="nav-item">
              <Link to="/product" className="nav-quick-link py-3 px-3 d-block text-decoration-none fw-bold" style={{ color: '#ff6a00' }}>
                <i className="fas fa-grid-2 me-1"></i> TẤT CẢ SẢN PHẨM
              </Link>
            </li>
            
            {/* Danh mục nhanh */}
            {!loadingCategories && categories.slice(0, 5).map((cat, i) => (
              <li className="nav-item" key={i}>
                <button className="nav-quick-link py-3 px-3" onClick={() => handleCategoryClick(cat)}>
                  {cat.categoryName || cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <style>{`
        /* Fix Icon không hiện: đảm bảo icon dùng FontAwesome 5/6 */
        @import url('https://use.fontawesome.com/releases/v5.15.4/css/all.css');

        .dropdown-content, .category-mega-menu {
          display: none; position: absolute; background: white; z-index: 1000; top: 100%;
        }
        .nav-item-dropdown:hover .dropdown-content { display: block; animation: slideUp 0.2s ease; }
        .category-dropdown-wrapper:hover .category-mega-menu { display: block; animation: slideUp 0.2s ease; }

        .drop-link { display: block; padding: 10px 20px; color: #333; text-decoration: none; font-size: 14px; }
        .drop-link:hover { background: #fff5ee; color: #ff6a00; }

        .category-mega-menu { width: 220px; border-radius: 0 0 8px 8px; }
        .cat-item-btn {
          display: block; width: 100%; border: none; background: none; text-align: left;
          padding: 10px 20px; font-size: 14px; color: #555; transition: 0.2s;
        }
        .cat-item-btn:hover { background: #fff5ee; color: #ff6a00; padding-left: 25px; }

        .nav-quick-link {
          border: none; background: none; font-size: 13px; font-weight: 600; color: #444; 
          text-transform: uppercase; transition: 0.2s;
        }
        .nav-quick-link:hover { color: #ff6a00; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pointer { cursor: pointer; }
      `}</style>
    </header>
  );
};

export default Header;