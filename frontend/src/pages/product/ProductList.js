import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import ProductCard from "../product/ProductCard";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "",
    searchKeyword: "",
    priceRange: "all", // Thêm state khoảng giá
    sortBy: "price",
    sortOrder: "asc"
  });

  // 1. LẮNG NGHE DỮ LIỆU TỪ HEADER
  useEffect(() => {
    if (location.state) {
      const { searchKeyword, selectedCategory } = location.state;
      setFilters(prev => ({
        ...prev,
        searchKeyword: searchKeyword || "",
        categoryId: selectedCategory || ""
      }));
      if (searchKeyword) setSearchTerm(searchKeyword);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 2. Debounce tìm kiếm
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchKeyword: searchTerm }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 3. Tải danh mục
  useEffect(() => {
    categoryService.getAllCategories().then(data => setCategories(data || []));
  }, []);

  // 4. HÀM TẢI SẢN PHẨM & LỌC GIÁ
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const PAGE_SIZE = 1000;
    try {
      let response;
      const { categoryId, searchKeyword, sortBy, sortOrder, priceRange } = filters;

      // Gọi API dựa trên tiêu chí
      if (searchKeyword) {
        response = await productService.searchProducts(searchKeyword, 0, PAGE_SIZE, sortBy, sortOrder);
      } else if (categoryId) {
        response = await productService.getProductsByCategory(categoryId, 0, PAGE_SIZE, sortBy, sortOrder);
      } else {
        response = await productService.getAllProducts(0, PAGE_SIZE, sortBy, sortOrder);
      }

      let data = response?.content || [];

      // Logic Lọc theo giá tại Client (Nếu API của bạn không hỗ trợ filter giá trực tiếp)
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        data = data.filter(p => {
          const price = p.price;
          if (max) return price >= min && price <= max;
          return price >= min; // Trường hợp "Trên 1.000.000"
        });
      }

      setProducts(data);
    } catch (err) {
      setProducts([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 5. HÀM XÓA BỘ LỌC
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      categoryId: "",
      searchKeyword: "",
      priceRange: "all",
      sortBy: "price",
      sortOrder: "asc"
    });
    navigate("/product", { state: {}, replace: true });
  };

  return (
    <section className="container mt-5 pb-5">
      {/* Thanh bộ lọc đa năng */}
      <div className="row g-2 mb-4 bg-light p-3 rounded-4 align-items-center shadow-sm">
        
        {/* Lọc danh mục */}
        <div className="col-md-2">
          <select 
            value={filters.categoryId} 
            onChange={(e) => setFilters(p => ({ ...p, categoryId: e.target.value }))}
            className="form-select rounded-pill border-0 shadow-sm"
          >
            <option value="">Danh mục</option>
            {categories.map(c => (
              <option key={c.id || c.categoryId} value={c.id || c.categoryId}>{c.categoryName || c.name}</option>
            ))}
          </select>
        </div>

        {/* Lọc Giá */}
        <div className="col-md-2">
          <select 
            value={filters.priceRange} 
            onChange={(e) => setFilters(p => ({ ...p, priceRange: e.target.value }))}
            className="form-select rounded-pill border-0 shadow-sm"
          >
            <option value="all">Khoảng giá</option>
            <option value="0-100000">Dưới 100k</option>
            <option value="100000-300000">100k - 300k</option>
            <option value="300000-500000">300k - 500k</option>
            <option value="500000-1000000">500k - 1tr</option>
            <option value="1000000">Trên 1tr</option>
          </select>
        </div>
        
        {/* Tìm kiếm nhanh */}
        <div className="col-md-6">
          <div className="position-relative">
            <i className="fa fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input 
              type="text" 
              className="form-control rounded-pill border-0 shadow-sm ps-5"
              placeholder="Tìm tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Nút làm mới */}
        <div className="col-md-2 text-end">
          <button 
            className="btn btn-white rounded-pill w-100 shadow-sm text-danger fw-medium"
            onClick={handleClearFilters}
          >
            <i className="fa fa-sync-alt me-1"></i> Xóa
          </button>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className={`row transition-all ${loading ? 'opacity-50' : ''}`}>
        {products.length > 0 ? (
          products.map(p => <ProductCard key={p.id || p.productId} product={p} />)
        ) : !loading && (
          <div className="text-center py-5">
            <i className="fa fa-search-minus fa-4x text-light mb-3"></i>
            <h4 className="text-muted">Không tìm thấy sản phẩm nào phù hợp</h4>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;