import React from 'react';

// import Category from '../pages/home/Category';
// import Product from '../pages/home/Product';
// import Testimonial from '../pages/home/Testimonial';
// import DailyDeals from '../pages/home/DailyDeals';
import Notification from '../pages/home/Notification';
import ProductNew from '../pages/product/ProductNew';
//import ProductMostViewed from '../pages/product/ProductMostViewed';
import Banner from '../pages/home/Banner';
import BeautyBlog from '../pages/post/Post';
//import CategoryList from '../pages/category/Category';


// import ProductList from "../pages/product/ProductList"; // ✅ thêm dòng này




function Home(props) {
  return (
    <>
      <Banner />
      <ProductNew />
      {/* <CategoryList /> */}
      <BeautyBlog />
      <Banner />
      <Notification />     
    </>
  );
}

export default Home;
