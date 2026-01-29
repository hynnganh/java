-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 29, 2026 at 05:45 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ngocanhjava`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `address_id` bigint(20) NOT NULL,
  `building_name` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`address_id`, `building_name`, `city`, `country`, `pincode`, `state`, `street`) VALUES
(3, 'Building A', 'Hanoi', 'VN', '100000', 'HN', 'Default Street');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `banner_id` bigint(20) NOT NULL,
  `background_color` varchar(50) DEFAULT NULL,
  `button_text` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `display_order` int(11) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `target_url` varchar(255) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `cart_id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_active` bit(1) DEFAULT NULL,
  `total_price` double DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`cart_id`, `created_at`, `is_active`, `total_price`, `user_id`) VALUES
(1, NULL, NULL, 0, 1),
(7, NULL, NULL, 357000, 8),
(9, '2026-01-27 16:00:30.000000', b'1', 0, 10);

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` bigint(20) NOT NULL,
  `discount` double NOT NULL,
  `product_price` double NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `cart_id` bigint(20) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`cart_item_id`, `discount`, `product_price`, `quantity`, `cart_id`, `product_id`) VALUES
(14, 15, 357000, 1, 7, 3);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` bigint(20) NOT NULL,
  `category_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`) VALUES
(1, 'Sữa Rửa Mặt'),
(2, 'Toner'),
(3, 'Serum'),
(4, 'Kem dưỡng ẩm'),
(5, 'Kem chống nắng'),
(7, 'Kem dưỡng mắt'),
(8, 'Nước tẩy trang'),
(9, 'Tẩy tế bào chết'),
(10, 'Chăm sóc môi'),
(11, 'Dưỡng thể'),
(12, 'Chăm sóc tóc');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `order_date` date DEFAULT NULL,
  `order_status` varchar(255) DEFAULT NULL,
  `shipping_address` varchar(500) NOT NULL,
  `total_amount` double DEFAULT NULL,
  `payment_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `email`, `order_date`, `order_status`, `shipping_address`, `total_amount`, `payment_id`) VALUES
(6, 'beanh@gmail.com', '2026-01-19', 'Order Accepted !', 'fbee3', 80000, 6),
(7, 'beanh@gmail.com', '2026-01-19', 'Order Accepted !', 'fbee3', 80000, 7),
(8, 'beanh123@gmail.com', '2026-01-21', 'SHIPPED', 'dsfdgfyguhijokp', 315000, 8),
(9, 'anhbebong208@gmail.com', '2026-01-28', 'DELIVERED', 'gsjdjd', 403000, 9),
(10, 'anhbebong208@gmail.com', '2026-01-28', 'Order Accepted !', 'gsjdjd', 357000, 10),
(11, 'anhbebong208@gmail.com', '2026-01-28', 'CANCELLED', 'gsjdjdh', 315000, 11);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` bigint(20) NOT NULL,
  `discount` double NOT NULL,
  `ordered_product_price` double NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `order_id` bigint(20) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `discount`, `ordered_product_price`, `quantity`, `order_id`, `product_id`) VALUES
(7, 20, 80000, 1, 6, 1),
(8, 20, 80000, 1, 7, 1),
(9, 10, 315000, 1, 8, 2),
(10, 10, 315000, 1, 9, 2),
(11, 20, 88000, 1, 9, 1),
(12, 15, 357000, 1, 10, 3),
(13, 10, 315000, 1, 11, 2);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` bigint(20) NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `payment_method`) VALUES
(1, 'COD'),
(2, 'COD'),
(3, 'MOMO'),
(4, 'BANKING'),
(5, 'COD'),
(6, 'COD'),
(7, 'COD'),
(8, 'COD'),
(9, 'COD'),
(10, 'COD'),
(11, 'COD');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` bigint(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount` double NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `price` double NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `sold` int(11) NOT NULL DEFAULT 0,
  `special_price` double NOT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `category_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `description`, `discount`, `image`, `price`, `product_name`, `quantity`, `sold`, `special_price`, `views`, `category_id`) VALUES
(1, 'Sữa rửa mặt dịu nhẹ cho da nhạy cảm', 20, 'c43eeb30-8613-4825-8021-30e36f3a1ab2.png', 110000, 'Sữa Rửa Mặt Simple', 19, 0, 88000, 0, 1),
(2, 'Serum cấp ẩm và phục hồi da', 10, 'serumha.jpg', 350000, 'Serum Hyaluronic Acid', 1098, 0, 315000, 0, 3),
(3, 'Kem dưỡng ẩm giúp da mềm mịn', 15, 'kemduonglaneige.jpg', 420000, 'Kem Dưỡng Ẩm Laneige', 57, 0, 357000, 0, 4),
(4, 'Kem chống nắng bảo vệ da SPF50+', 20, 'kcnanessa.jpg', 300000, 'Kem Chống Nắng Anessa', 79, 0, 240000, 0, 5),
(6, 'Tinh chất phục hồi da hư tổn', 10, 'tonerhoacuc.jpg', 390000, 'Tinh Chất SK-II', 34, 0, 351000, 0, 2),
(7, 'Kem dưỡng vùng mắt giảm quầng thâm', 5, 'kemmatinnisfree.jpg', 280000, 'Kem Mắt Innisfree', 69, 0, 266000, 0, 7),
(8, 'Nước tẩy trang làm sạch sâu', 8, 'taytrangbioderma.jpg', 200000, 'Nước Tẩy Trang Bioderma', 120, 0, 184000, 0, 8),
(9, 'Tẩy tế bào chết chiết xuất cà phê', 12, 'taytebaochecocoon.jpg', 220000, 'Tẩy Tế Bào Chết Cocoon', 89, 0, 193600, 0, 9),
(10, 'Son dưỡng môi chiết xuất thiên nhiên', 0, 'sonduongvaseline.jpg', 120000, 'Son Dưỡng Môi Vaseline', 144, 0, 120000, 0, 10),
(13, 'Nước hoa hồng dưỡng ẩm sâu cho da khô và nhạy cảm', 10, 'toner-hadalabo.png', 180000, 'Toner Hada Labo', 121, 0, 162000, 0, 2),
(14, 'Toner làm dịu da, giảm kích ứng, cân bằng độ ẩm', 8, 'toner-eucerin.jpg', 220000, 'Toner Eucerin', 87, 0, 202400, 0, 2),
(15, 'Nước hoa hồng chiết xuất thiên nhiên giúp sáng da', 12, 'tonerluvmier.jpg', 200000, 'Toner Luvmier', 76, 0, 176000, 0, 2),
(52, 'xiinkd', 12, '10a8fb47-d396-4ea4-8956-a6cb93826942.jpg', 200000, 'sdf', 1, 0, 176000, 0, 4);

-- --------------------------------------------------------

--
-- Table structure for table `products_seq`
--

CREATE TABLE `products_seq` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products_seq`
--

INSERT INTO `products_seq` (`next_val`) VALUES
(151);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` bigint(20) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `comment`, `created_at`, `rating`, `product_id`, `user_id`) VALUES
(1, 'sản phẩm rẻ, làm sạch tầm trung, phù hợp da nhạy cảm', '2026-01-28 21:31:42.000000', 5, 1, 10);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` bigint(20) NOT NULL,
  `role_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(101, 'ADMIN'),
(102, 'USER');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(30) DEFAULT NULL,
  `last_name` varchar(30) DEFAULT NULL,
  `mobile_number` varchar(10) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `first_name`, `last_name`, `mobile_number`, `password`) VALUES
(1, '1234@gmail.com', 'ngoccc', 'ahhhhg', '0936274645', '$2a$10$M2TKmdsO7SdDjbFIgxn1l.gMujCe1baWD6RpBn7drMwOxuLrGFj/C'),
(8, 'beanh123@gmail.com', 'beanh', 'xindep', '0965843675', '$2a$10$Zums.DG5NQdxDp5/uNZNAu73wrTETZOFdHFzT8Hzvhp3QBuJJ6nQu'),
(10, 'anhbebong208@gmail.com', 'ngocccc', 'anhhhhh', '0936274645', '$2a$10$oMhTbqsjUTTVFDrBHlmTsuEx8qULF4MPQgMU/6lTvkXEdFd8Y6rWa');

-- --------------------------------------------------------

--
-- Table structure for table `user_address`
--

CREATE TABLE `user_address` (
  `user_id` bigint(20) NOT NULL,
  `address_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_address`
--

INSERT INTO `user_address` (`user_id`, `address_id`) VALUES
(1, 3),
(8, 3),
(10, 3);

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `user_id` bigint(20) NOT NULL,
  `role_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_role`
--

INSERT INTO `user_role` (`user_id`, `role_id`) VALUES
(1, 101),
(8, 102),
(10, 101);

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`address_id`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`banner_id`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`),
  ADD UNIQUE KEY `UK_64t7ox312pqal3p7fg9o503c2` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`),
  ADD KEY `FKpcttvuq4mxppo8sxggjtn5i2c` (`cart_id`),
  ADD KEY `FK1re40cjegsfvw58xrkdp6bac6` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `UK_haujdjk1ohmeixjhnhslchrp1` (`payment_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`),
  ADD KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `FKpl51cejpw4gy5swfar8br9ngi` (`product_id`),
  ADD KEY `FKcgy7qjc1r99dp117y9en6lxye` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- Indexes for table `user_address`
--
ALTER TABLE `user_address`
  ADD KEY `FKpv7y2l6mvly37lngi3doarqhd` (`address_id`),
  ADD KEY `FKrmincuqpi8m660j1c57xj7twr` (`user_id`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `FKt7e7djp752sqn6w22i6ocqy6q` (`role_id`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKq85ckb2tlq3h7k56ovtqnjls2` (`user_id`,`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `address_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `banner_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `FKb5o626f86h46m4s7ms6ginnop` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `FK1re40cjegsfvw58xrkdp6bac6` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `FKpcttvuq4mxppo8sxggjtn5i2c` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK8aol9f99s97mtyhij0tvfj41f` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `FKcgy7qjc1r99dp117y9en6lxye` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `user_address`
--
ALTER TABLE `user_address`
  ADD CONSTRAINT `FKpv7y2l6mvly37lngi3doarqhd` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`),
  ADD CONSTRAINT `FKrmincuqpi8m660j1c57xj7twr` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `user_role`
--
ALTER TABLE `user_role`
  ADD CONSTRAINT `FKj345gk1bovqvfame88rcx7yyx` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `FKt7e7djp752sqn6w22i6ocqy6q` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
