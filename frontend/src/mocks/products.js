// Dữ liệu Mock tĩnh bám sát Entity Java
export const products = [
  {
    "id": 1,
    "name": "Vợt Cầu Lông Yonex Nanoflare 800 Pro",
    "slug": "vot-cau-long-yonex-nanoflare-800-pro",
    "description": "Vợt sử dụng công nghệ Nanocell NEO và lõi siêu mỏng giúp tăng tốc độ vung vợt và kiểm soát bóng tối ưu. Trải nghiệm đánh cầu linh hoạt, phù hợp cho người chơi tấn công nhanh.",
    "sportType": "BADMINTON",
    "status": "ACTIVE",
    "basePrice": 3800000,
    "salePrice": 3450000,
    "isFeatured": true,
    "avgRating": 4.6,
    "reviewCount": 20,
    "soldCount": 80,
    "brandId": 3,
    "categoryId": 1,
    "variants": [
      {
        "id": 11,
        "productId": 1,
        "sku": "VOT-CAU--4UG5",
        "size": "4U-G5",
        "color": "Đen / Trắng",
        "price": 3800000,
        "salePrice": 3450000,
        "stock": 10,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 12,
        "productId": 1,
        "sku": "VOT-CAU--3UG5",
        "size": "3U-G5",
        "color": "Xanh Navy",
        "price": 3800000,
        "salePrice": 3450000,
        "stock": 13,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 11,
        "productId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 12,
        "productId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 13,
        "productId": 1,
        "imageUrl": "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 11,
        "productId": 1,
        "attributeName": "Trọng lượng",
        "attributeValue": "4U (80-84g)"
      },
      {
        "id": 12,
        "productId": 1,
        "attributeName": "Độ cứng đũa",
        "attributeValue": "Cứng"
      },
      {
        "id": 13,
        "productId": 1,
        "attributeName": "Chất liệu",
        "attributeValue": "Graphite + Nanocell NEO"
      }
    ],
    "tagIds": [
      1,
      2
    ],
    "category": "Vợt"
  },
  {
    "id": 2,
    "name": "Vợt Cầu Lông Lining Aeronaut 9000C",
    "slug": "vot-cau-long-lining-aeronaut-9000c",
    "description": "Ứng dụng công nghệ ống khí Aeronaut giúp giảm lực cản không khí và tăng sức mạnh khi đập cầu. Cảm giác cầm chắc chắn, phù hợp lối đánh tấn công uy lực.",
    "sportType": "BADMINTON",
    "status": "ACTIVE",
    "basePrice": 3200000,
    "salePrice": null,
    "isFeatured": true,
    "avgRating": 4.699999999999999,
    "reviewCount": 32,
    "soldCount": 115,
    "brandId": 3,
    "categoryId": 1,
    "variants": [
      {
        "id": 21,
        "productId": 2,
        "sku": "VOT-CAU--4UG5",
        "size": "4U-G5",
        "color": "Đen / Trắng",
        "price": 3200000,
        "salePrice": null,
        "stock": 15,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 22,
        "productId": 2,
        "sku": "VOT-CAU--3UG5",
        "size": "3U-G5",
        "color": "Xanh Navy",
        "price": 3200000,
        "salePrice": null,
        "stock": 18,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 21,
        "productId": 2,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 22,
        "productId": 2,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 23,
        "productId": 2,
        "imageUrl": "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 21,
        "productId": 2,
        "attributeName": "Trọng lượng",
        "attributeValue": "3U (85-89g)"
      },
      {
        "id": 22,
        "productId": 2,
        "attributeName": "Độ cứng đũa",
        "attributeValue": "Trung bình cứng"
      },
      {
        "id": 23,
        "productId": 2,
        "attributeName": "Chất liệu",
        "attributeValue": "Carbon fiber + UHB"
      }
    ],
    "tagIds": [
      1,
      3
    ],
    "category": "Vợt"
  },
  {
    "id": 3,
    "name": "Vợt Cầu Lông Yonex Astrox 88D Pro",
    "slug": "vot-cau-long-yonex-astrox-88d-pro",
    "description": "Vợt được thiết kế với hệ thống Rotational Generator System giúp phân bổ trọng lượng thông minh, tăng lực đập. Phù hợp cho người chơi đôi tấn công mạnh mẽ.",
    "sportType": "BADMINTON",
    "status": "ACTIVE",
    "basePrice": 3700000,
    "salePrice": 3350000,
    "isFeatured": false,
    "avgRating": 4.8,
    "reviewCount": 44,
    "soldCount": 150,
    "brandId": 3,
    "categoryId": 1,
    "variants": [
      {
        "id": 31,
        "productId": 3,
        "sku": "VOT-CAU--4UG5",
        "size": "4U-G5",
        "color": "Đen / Trắng",
        "price": 3700000,
        "salePrice": 3350000,
        "stock": 20,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 32,
        "productId": 3,
        "sku": "VOT-CAU--3UG5",
        "size": "3U-G5",
        "color": "Xanh Navy",
        "price": 3700000,
        "salePrice": 3350000,
        "stock": 23,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 31,
        "productId": 3,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 32,
        "productId": 3,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 33,
        "productId": 3,
        "imageUrl": "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 31,
        "productId": 3,
        "attributeName": "Trọng lượng",
        "attributeValue": "4U (80-84g)"
      },
      {
        "id": 32,
        "productId": 3,
        "attributeName": "Độ cứng đũa",
        "attributeValue": "Cứng"
      },
      {
        "id": 33,
        "productId": 3,
        "attributeName": "Chất liệu",
        "attributeValue": "Graphite + Namd"
      }
    ],
    "tagIds": [
      1,
      4
    ],
    "category": "Vợt"
  },
  {
    "id": 4,
    "name": "Giày Cầu Lông Yonex Power Cushion 65Z3",
    "slug": "giay-cau-long-yonex-power-cushion-65z3",
    "description": "Giày tích hợp công nghệ Power Cushion+ giảm chấn hiệu quả và trả lực tốt khi di chuyển. Thiết kế ôm chân, hỗ trợ linh hoạt cho người chơi cầu lông.",
    "sportType": "BADMINTON",
    "status": "ACTIVE",
    "basePrice": 2200000,
    "salePrice": 1950000,
    "isFeatured": false,
    "avgRating": 4.8999999999999995,
    "reviewCount": 56,
    "soldCount": 185,
    "brandId": 3,
    "categoryId": 2,
    "variants": [
      {
        "id": 41,
        "productId": 4,
        "sku": "GIAY-CAU-4UG5",
        "size": "4U-G5",
        "color": "Đen / Trắng",
        "price": 2200000,
        "salePrice": 1950000,
        "stock": 25,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 42,
        "productId": 4,
        "sku": "GIAY-CAU-3UG5",
        "size": "3U-G5",
        "color": "Xanh Navy",
        "price": 2200000,
        "salePrice": 1950000,
        "stock": 28,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 41,
        "productId": 4,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 42,
        "productId": 4,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 43,
        "productId": 4,
        "imageUrl": "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 41,
        "productId": 4,
        "attributeName": "Size",
        "attributeValue": "39-44"
      },
      {
        "id": 42,
        "productId": 4,
        "attributeName": "Chất liệu",
        "attributeValue": "Da tổng hợp + lưới thoáng khí"
      },
      {
        "id": 43,
        "productId": 4,
        "attributeName": "Công nghệ",
        "attributeValue": "Power Cushion+"
      }
    ],
    "tagIds": [
      1,
      5
    ],
    "category": "Giày thể thao"
  },
  {
    "id": 5,
    "name": "Giày Cầu Lông Lining Ranger 5",
    "slug": "giay-cau-long-lining-ranger-5",
    "description": "Giày sử dụng công nghệ đệm Lining Cloud giúp êm ái và giảm mỏi chân khi vận động dài. Đế cao su bám sàn tốt, phù hợp cho cả tập luyện và thi đấu.",
    "sportType": "BADMINTON",
    "status": "ACTIVE",
    "basePrice": 1500000,
    "salePrice": 1280000,
    "isFeatured": false,
    "avgRating": 4.6,
    "reviewCount": 68,
    "soldCount": 220,
    "brandId": 3,
    "categoryId": 2,
    "variants": [
      {
        "id": 51,
        "productId": 5,
        "sku": "GIAY-CAU-4UG5",
        "size": "4U-G5",
        "color": "Đen / Trắng",
        "price": 1500000,
        "salePrice": 1280000,
        "stock": 30,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 52,
        "productId": 5,
        "sku": "GIAY-CAU-3UG5",
        "size": "3U-G5",
        "color": "Xanh Navy",
        "price": 1500000,
        "salePrice": 1280000,
        "stock": 33,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 51,
        "productId": 5,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 52,
        "productId": 5,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 53,
        "productId": 5,
        "imageUrl": "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 51,
        "productId": 5,
        "attributeName": "Size",
        "attributeValue": "38-45"
      },
      {
        "id": 52,
        "productId": 5,
        "attributeName": "Chất liệu",
        "attributeValue": "Vải lưới + da nhân tạo"
      },
      {
        "id": 53,
        "productId": 5,
        "attributeName": "Công nghệ",
        "attributeValue": "Lining Cloud"
      }
    ],
    "tagIds": [
      1,
      6
    ],
    "category": "Giày thể thao"
  },
  {
    "id": 6,
    "name": "Giày Cầu Lông Yonex Aerus Z",
    "slug": "giay-cau-long-yonex-aerus-z",
    "description": "Mẫu giày siêu nhẹ với công nghệ Power Cushion và thiết kế lưới thoáng khí, mang lại cảm giác nhẹ nhàng và thoải mái. Phù hợp cho người chơi ưa thích sự nhanh nhẹn.",
    "sportType": "BADMINTON",
    "status": "ACTIVE",
    "basePrice": 2800000,
    "salePrice": 2550000,
    "isFeatured": false,
    "avgRating": 4.699999999999999,
    "reviewCount": 80,
    "soldCount": 255,
    "brandId": 3,
    "categoryId": 2,
    "variants": [
      {
        "id": 61,
        "productId": 6,
        "sku": "GIAY-CAU-4UG5",
        "size": "4U-G5",
        "color": "Đen / Trắng",
        "price": 2800000,
        "salePrice": 2550000,
        "stock": 35,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 62,
        "productId": 6,
        "sku": "GIAY-CAU-3UG5",
        "size": "3U-G5",
        "color": "Xanh Navy",
        "price": 2800000,
        "salePrice": 2550000,
        "stock": 38,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 61,
        "productId": 6,
        "imageUrl": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 62,
        "productId": 6,
        "imageUrl": "https://images.unsplash.com/photo-1613918431703-aa6322ab85b6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 63,
        "productId": 6,
        "imageUrl": "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 61,
        "productId": 6,
        "attributeName": "Size",
        "attributeValue": "39-44"
      },
      {
        "id": 62,
        "productId": 6,
        "attributeName": "Chất liệu",
        "attributeValue": "Lưới thoáng khí + da tổng hợp"
      },
      {
        "id": 63,
        "productId": 6,
        "attributeName": "Công nghệ",
        "attributeValue": "Power Cushion"
      }
    ],
    "tagIds": [
      1,
      7
    ],
    "category": "Giày thể thao"
  },
  {
    "id": 7,
    "name": "Giày Bóng Đá Nike Phantom GX Pro TF",
    "slug": "giay-bong-da-nike-phantom-gx-pro-tf",
    "description": "Công nghệ Gripknit trên upper mang lại cảm giác bóng chính xác và kiểm soát tối ưu. Đế TF bám sân cỏ nhân tạo tốt, giảm mỏi chân khi chơi cường độ cao.",
    "sportType": "FOOTBALL",
    "status": "ACTIVE",
    "basePrice": 3200000,
    "salePrice": 2790000,
    "isFeatured": true,
    "avgRating": 4.6,
    "reviewCount": 20,
    "soldCount": 80,
    "brandId": 1,
    "categoryId": 2,
    "variants": [
      {
        "id": 71,
        "productId": 7,
        "sku": "GIAY-BON-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 3200000,
        "salePrice": 2790000,
        "stock": 10,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 72,
        "productId": 7,
        "sku": "GIAY-BON-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 3200000,
        "salePrice": 2790000,
        "stock": 13,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 73,
        "productId": 7,
        "sku": "GIAY-BON-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 3200000,
        "salePrice": 2790000,
        "stock": 16,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 71,
        "productId": 7,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 72,
        "productId": 7,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 73,
        "productId": 7,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 71,
        "productId": 7,
        "attributeName": "Thương hiệu",
        "attributeValue": "Nike"
      },
      {
        "id": 72,
        "productId": 7,
        "attributeName": "Màu sắc",
        "attributeValue": "Xanh lá/Đen"
      },
      {
        "id": 73,
        "productId": 7,
        "attributeName": "Kích cỡ",
        "attributeValue": "39-44"
      }
    ],
    "tagIds": [
      1,
      2
    ],
    "category": "Giày thể thao"
  },
  {
    "id": 8,
    "name": "Giày Bóng Đá Puma Future Ultimate TF",
    "slug": "giay-bong-da-puma-future-ultimate-tf",
    "description": "Công nghệ FUZIONFIT+ kết hợp lưới co giãn ôm chân linh hoạt, hỗ trợ xoay trở nhanh. Đế TF cao su đúc bám sân cỏ nhân tạo, êm ái và bền bỉ.",
    "sportType": "FOOTBALL",
    "status": "ACTIVE",
    "basePrice": 3500000,
    "salePrice": null,
    "isFeatured": true,
    "avgRating": 4.699999999999999,
    "reviewCount": 32,
    "soldCount": 115,
    "brandId": 1,
    "categoryId": 2,
    "variants": [
      {
        "id": 81,
        "productId": 8,
        "sku": "GIAY-BON-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 3500000,
        "salePrice": null,
        "stock": 15,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 82,
        "productId": 8,
        "sku": "GIAY-BON-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 3500000,
        "salePrice": null,
        "stock": 18,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 83,
        "productId": 8,
        "sku": "GIAY-BON-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 3500000,
        "salePrice": null,
        "stock": 21,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 81,
        "productId": 8,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 82,
        "productId": 8,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 83,
        "productId": 8,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 81,
        "productId": 8,
        "attributeName": "Thương hiệu",
        "attributeValue": "Puma"
      },
      {
        "id": 82,
        "productId": 8,
        "attributeName": "Màu sắc",
        "attributeValue": "Trắng/Xanh dương"
      },
      {
        "id": 83,
        "productId": 8,
        "attributeName": "Kích cỡ",
        "attributeValue": "39-45"
      }
    ],
    "tagIds": [
      1,
      3
    ],
    "category": "Giày thể thao"
  },
  {
    "id": 9,
    "name": "Giày Bóng Đá Adidas Predator Accuracy.3 TF",
    "slug": "giay-bong-da-adidas-predator-accuracy-3-tf",
    "description": "Vùng Control Zone trên upper tăng độ bám bóng, hỗ trợ sút xoáy hiệu quả. Đế TF bền bỉ, phù hợp thi đấu và luyện tập trên sân cỏ nhân tạo.",
    "sportType": "FOOTBALL",
    "status": "ACTIVE",
    "basePrice": 2200000,
    "salePrice": 1890000,
    "isFeatured": false,
    "avgRating": 4.8,
    "reviewCount": 44,
    "soldCount": 150,
    "brandId": 1,
    "categoryId": 2,
    "variants": [
      {
        "id": 91,
        "productId": 9,
        "sku": "GIAY-BON-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 2200000,
        "salePrice": 1890000,
        "stock": 20,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 92,
        "productId": 9,
        "sku": "GIAY-BON-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 2200000,
        "salePrice": 1890000,
        "stock": 23,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 93,
        "productId": 9,
        "sku": "GIAY-BON-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 2200000,
        "salePrice": 1890000,
        "stock": 26,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 91,
        "productId": 9,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 92,
        "productId": 9,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 93,
        "productId": 9,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 91,
        "productId": 9,
        "attributeName": "Thương hiệu",
        "attributeValue": "Adidas"
      },
      {
        "id": 92,
        "productId": 9,
        "attributeName": "Màu sắc",
        "attributeValue": "Đen/Hồng"
      },
      {
        "id": 93,
        "productId": 9,
        "attributeName": "Kích cỡ",
        "attributeValue": "39-44"
      }
    ],
    "tagIds": [
      1,
      4
    ],
    "category": "Giày thể thao"
  },
  {
    "id": 10,
    "name": "Áo Đấu Nike Dri-FIT Strike",
    "slug": "ao-dau-nike-dri-fit-strike",
    "description": "Công nghệ Dri-FIT thấm hút mồ hôi, giữ cơ thể khô ráo trong suốt trận đấu. Chất liệu nhẹ, co giãn, mang lại sự thoải mái tối đa khi vận động.",
    "sportType": "FOOTBALL",
    "status": "ACTIVE",
    "basePrice": 850000,
    "salePrice": 690000,
    "isFeatured": false,
    "avgRating": 4.8999999999999995,
    "reviewCount": 56,
    "soldCount": 185,
    "brandId": 1,
    "categoryId": 3,
    "variants": [
      {
        "id": 101,
        "productId": 10,
        "sku": "AO-DAU-N-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 850000,
        "salePrice": 690000,
        "stock": 25,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 102,
        "productId": 10,
        "sku": "AO-DAU-N-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 850000,
        "salePrice": 690000,
        "stock": 28,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 103,
        "productId": 10,
        "sku": "AO-DAU-N-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 850000,
        "salePrice": 690000,
        "stock": 31,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 101,
        "productId": 10,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 102,
        "productId": 10,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 103,
        "productId": 10,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 101,
        "productId": 10,
        "attributeName": "Thương hiệu",
        "attributeValue": "Nike"
      },
      {
        "id": 102,
        "productId": 10,
        "attributeName": "Màu sắc",
        "attributeValue": "Đỏ/Trắng"
      },
      {
        "id": 103,
        "productId": 10,
        "attributeName": "Kích cỡ",
        "attributeValue": "S-XXL"
      }
    ],
    "tagIds": [
      1,
      5
    ],
    "category": "Quần áo"
  },
  {
    "id": 11,
    "name": "Áo Đấu Puma TeamLIGA Jersey",
    "slug": "ao-dau-puma-teamlilga-jersey",
    "description": "Vải tái chế dryCELL thoáng khí, nhanh khô và thân thiện môi trường. Form áo thể thao ôm vừa, đường may chắc chắn, bền màu sau nhiều lần giặt.",
    "sportType": "FOOTBALL",
    "status": "ACTIVE",
    "basePrice": 750000,
    "salePrice": 640000,
    "isFeatured": false,
    "avgRating": 4.6,
    "reviewCount": 68,
    "soldCount": 220,
    "brandId": 1,
    "categoryId": 3,
    "variants": [
      {
        "id": 111,
        "productId": 11,
        "sku": "AO-DAU-P-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 750000,
        "salePrice": 640000,
        "stock": 30,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 112,
        "productId": 11,
        "sku": "AO-DAU-P-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 750000,
        "salePrice": 640000,
        "stock": 33,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 113,
        "productId": 11,
        "sku": "AO-DAU-P-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 750000,
        "salePrice": 640000,
        "stock": 36,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 111,
        "productId": 11,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 112,
        "productId": 11,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 113,
        "productId": 11,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 111,
        "productId": 11,
        "attributeName": "Thương hiệu",
        "attributeValue": "Puma"
      },
      {
        "id": 112,
        "productId": 11,
        "attributeName": "Màu sắc",
        "attributeValue": "Xanh navy/Trắng"
      },
      {
        "id": 113,
        "productId": 11,
        "attributeName": "Kích cỡ",
        "attributeValue": "S-XXL"
      }
    ],
    "tagIds": [
      1,
      6
    ],
    "category": "Quần áo"
  },
  {
    "id": 12,
    "name": "Áo Đấu Adidas Tiro 23 Competition",
    "slug": "ao-dau-adidas-tiro-23-competition",
    "description": "Công nghệ AEROREADY kiểm soát độ ẩm, giữ áo nhẹ và khô thoáng. Thiết kế ôm vừa, phù hợp cả thi đấu lẫn mặc hàng ngày.",
    "sportType": "FOOTBALL",
    "status": "ACTIVE",
    "basePrice": 900000,
    "salePrice": 790000,
    "isFeatured": false,
    "avgRating": 4.699999999999999,
    "reviewCount": 80,
    "soldCount": 255,
    "brandId": 1,
    "categoryId": 3,
    "variants": [
      {
        "id": 121,
        "productId": 12,
        "sku": "AO-DAU-A-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 900000,
        "salePrice": 790000,
        "stock": 35,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 122,
        "productId": 12,
        "sku": "AO-DAU-A-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 900000,
        "salePrice": 790000,
        "stock": 38,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 123,
        "productId": 12,
        "sku": "AO-DAU-A-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 900000,
        "salePrice": 790000,
        "stock": 41,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 121,
        "productId": 12,
        "imageUrl": "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 122,
        "productId": 12,
        "imageUrl": "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 123,
        "productId": 12,
        "imageUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 121,
        "productId": 12,
        "attributeName": "Thương hiệu",
        "attributeValue": "Adidas"
      },
      {
        "id": 122,
        "productId": 12,
        "attributeName": "Màu sắc",
        "attributeValue": "Đen/Trắng"
      },
      {
        "id": 123,
        "productId": 12,
        "attributeName": "Kích cỡ",
        "attributeValue": "S-XXL"
      }
    ],
    "tagIds": [
      1,
      7
    ],
    "category": "Quần áo"
  },
  {
    "id": 13,
    "name": "Vợt Tennis Wilson Pro Staff 97 v14",
    "slug": "vot-tennis-wilson-pro-staff-97-v14",
    "description": "Vợt tennis cao cấp với công nghệ Braid 45 tăng độ ổn định và cảm giác bóng chính xác. Thiết kế hướng đến người chơi chuyên nghiệp, mang lại kiểm soát tốt và lực đánh mạnh mẽ.",
    "sportType": "TENNIS",
    "status": "ACTIVE",
    "basePrice": 3800000,
    "salePrice": 3490000,
    "isFeatured": true,
    "avgRating": 4.6,
    "reviewCount": 20,
    "soldCount": 80,
    "brandId": 4,
    "categoryId": 1,
    "variants": [
      {
        "id": 131,
        "productId": 13,
        "sku": "VOT-TENN-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 3800000,
        "salePrice": 3490000,
        "stock": 10,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 132,
        "productId": 13,
        "sku": "VOT-TENN-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 3800000,
        "salePrice": 3490000,
        "stock": 13,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 133,
        "productId": 13,
        "sku": "VOT-TENN-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 3800000,
        "salePrice": 3490000,
        "stock": 16,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 131,
        "productId": 13,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 132,
        "productId": 13,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 133,
        "productId": 13,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 131,
        "productId": 13,
        "attributeName": "Trọng lượng",
        "attributeValue": "315g"
      },
      {
        "id": 132,
        "productId": 13,
        "attributeName": "Kích thước mặt vợt",
        "attributeValue": "97 inch vuông"
      },
      {
        "id": 133,
        "productId": 13,
        "attributeName": "Độ căng dây",
        "attributeValue": "50-60 lbs"
      }
    ],
    "tagIds": [
      1,
      2
    ],
    "category": "Vợt"
  },
  {
    "id": 14,
    "name": "Vợt Tennis Wilson Blade 98 16x19 v8",
    "slug": "vot-tennis-wilson-blade-98-16x19-v8",
    "description": "Vợt tennis với công nghệ FeelFlex cho cảm giác bóng linh hoạt và kiểm soát tối ưu. Phù hợp cho người chơi chuyên nghiệp cần sự cân bằng giữa sức mạnh và độ chính xác.",
    "sportType": "TENNIS",
    "status": "ACTIVE",
    "basePrice": 3200000,
    "salePrice": 2890000,
    "isFeatured": true,
    "avgRating": 4.699999999999999,
    "reviewCount": 32,
    "soldCount": 115,
    "brandId": 4,
    "categoryId": 1,
    "variants": [
      {
        "id": 141,
        "productId": 14,
        "sku": "VOT-TENN-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 3200000,
        "salePrice": 2890000,
        "stock": 15,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 142,
        "productId": 14,
        "sku": "VOT-TENN-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 3200000,
        "salePrice": 2890000,
        "stock": 18,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 143,
        "productId": 14,
        "sku": "VOT-TENN-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 3200000,
        "salePrice": 2890000,
        "stock": 21,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 141,
        "productId": 14,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 142,
        "productId": 14,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 143,
        "productId": 14,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 141,
        "productId": 14,
        "attributeName": "Trọng lượng",
        "attributeValue": "305g"
      },
      {
        "id": 142,
        "productId": 14,
        "attributeName": "Kích thước mặt vợt",
        "attributeValue": "98 inch vuông"
      },
      {
        "id": 143,
        "productId": 14,
        "attributeName": "Mẫu dây",
        "attributeValue": "16x19"
      }
    ],
    "tagIds": [
      1,
      3
    ],
    "category": "Vợt"
  },
  {
    "id": 15,
    "name": "Vợt Tennis Wilson Clash 100 v2",
    "slug": "vot-tennis-wilson-clash-100-v2",
    "description": "Vợt tennis sử dụng công nghệ FreeFlex mang lại độ đàn hồi vượt trội và cảm giác thoải mái. Thiết kế hiện đại giúp người chơi dễ dàng tạo ra những cú đánh uy lực và chính xác.",
    "sportType": "TENNIS",
    "status": "ACTIVE",
    "basePrice": 2800000,
    "salePrice": 2590000,
    "isFeatured": false,
    "avgRating": 4.8,
    "reviewCount": 44,
    "soldCount": 150,
    "brandId": 4,
    "categoryId": 1,
    "variants": [
      {
        "id": 151,
        "productId": 15,
        "sku": "VOT-TENN-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 2800000,
        "salePrice": 2590000,
        "stock": 20,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 152,
        "productId": 15,
        "sku": "VOT-TENN-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 2800000,
        "salePrice": 2590000,
        "stock": 23,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 153,
        "productId": 15,
        "sku": "VOT-TENN-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 2800000,
        "salePrice": 2590000,
        "stock": 26,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 151,
        "productId": 15,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 152,
        "productId": 15,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 153,
        "productId": 15,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 151,
        "productId": 15,
        "attributeName": "Trọng lượng",
        "attributeValue": "295g"
      },
      {
        "id": 152,
        "productId": 15,
        "attributeName": "Kích thước mặt vợt",
        "attributeValue": "100 inch vuông"
      },
      {
        "id": 153,
        "productId": 15,
        "attributeName": "Công nghệ",
        "attributeValue": "FreeFlex"
      }
    ],
    "tagIds": [
      1,
      4
    ],
    "category": "Vợt"
  },
  {
    "id": 16,
    "name": "Bóng Tennis Wilson US Open Extra Duty",
    "slug": "bong-tennis-wilson-us-open-extra-duty",
    "description": "Bóng tennis chính thức của giải US Open với độ bền cao và hiệu suất ổn định trên mọi mặt sân. Lớp vải nỉ extra duty giúp bóng bền bỉ và duy trì độ nảy tốt trong thời gian dài.",
    "sportType": "TENNIS",
    "status": "ACTIVE",
    "basePrice": 350000,
    "salePrice": null,
    "isFeatured": false,
    "avgRating": 4.8999999999999995,
    "reviewCount": 56,
    "soldCount": 185,
    "brandId": 4,
    "categoryId": 4,
    "variants": [
      {
        "id": 161,
        "productId": 16,
        "sku": "BONG-TEN-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 350000,
        "salePrice": null,
        "stock": 25,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 162,
        "productId": 16,
        "sku": "BONG-TEN-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 350000,
        "salePrice": null,
        "stock": 28,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 163,
        "productId": 16,
        "sku": "BONG-TEN-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 350000,
        "salePrice": null,
        "stock": 31,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 161,
        "productId": 16,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 162,
        "productId": 16,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 163,
        "productId": 16,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 161,
        "productId": 16,
        "attributeName": "Loại bóng",
        "attributeValue": "Extra Duty"
      },
      {
        "id": 162,
        "productId": 16,
        "attributeName": "Số lượng",
        "attributeValue": "3 bóng/lon"
      },
      {
        "id": 163,
        "productId": 16,
        "attributeName": "Màu sắc",
        "attributeValue": "Vàng"
      }
    ],
    "tagIds": [
      1,
      5
    ],
    "category": "Bóng & Cầu"
  },
  {
    "id": 17,
    "name": "Bóng Tennis Wilson Championship",
    "slug": "bong-tennis-wilson-championship",
    "description": "Bóng tennis phổ thông với độ bền vượt trội và giá cả phải chăng, phù hợp cho mọi trình độ chơi. Cấu trúc bóng ổn định giúp duy trì độ nảy và tốc độ trong suốt trận đấu.",
    "sportType": "TENNIS",
    "status": "ACTIVE",
    "basePrice": 450000,
    "salePrice": 399000,
    "isFeatured": false,
    "avgRating": 4.6,
    "reviewCount": 68,
    "soldCount": 220,
    "brandId": 4,
    "categoryId": 4,
    "variants": [
      {
        "id": 171,
        "productId": 17,
        "sku": "BONG-TEN-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 450000,
        "salePrice": 399000,
        "stock": 30,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 172,
        "productId": 17,
        "sku": "BONG-TEN-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 450000,
        "salePrice": 399000,
        "stock": 33,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 173,
        "productId": 17,
        "sku": "BONG-TEN-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 450000,
        "salePrice": 399000,
        "stock": 36,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 171,
        "productId": 17,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 172,
        "productId": 17,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 173,
        "productId": 17,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 171,
        "productId": 17,
        "attributeName": "Loại bóng",
        "attributeValue": "Regular Duty"
      },
      {
        "id": 172,
        "productId": 17,
        "attributeName": "Số lượng",
        "attributeValue": "3 bóng/lon"
      },
      {
        "id": 173,
        "productId": 17,
        "attributeName": "Màu sắc",
        "attributeValue": "Vàng"
      }
    ],
    "tagIds": [
      1,
      6
    ],
    "category": "Bóng & Cầu"
  },
  {
    "id": 18,
    "name": "Bóng Tennis Wilson Tour Premier",
    "slug": "bong-tennis-wilson-tour-premier",
    "description": "Bóng tennis cao cấp dành cho giải đấu chuyên nghiệp với lớp vải nỉ mềm mại và độ nảy hoàn hảo. Được thiết kế để mang lại trải nghiệm thi đấu đỉnh cao với độ chính xác và kiểm soát tốt.",
    "sportType": "TENNIS",
    "status": "ACTIVE",
    "basePrice": 550000,
    "salePrice": 499000,
    "isFeatured": false,
    "avgRating": 4.699999999999999,
    "reviewCount": 80,
    "soldCount": 255,
    "brandId": 4,
    "categoryId": 4,
    "variants": [
      {
        "id": 181,
        "productId": 18,
        "sku": "BONG-TEN-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 550000,
        "salePrice": 499000,
        "stock": 35,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 182,
        "productId": 18,
        "sku": "BONG-TEN-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 550000,
        "salePrice": 499000,
        "stock": 38,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 183,
        "productId": 18,
        "sku": "BONG-TEN-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 550000,
        "salePrice": 499000,
        "stock": 41,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 181,
        "productId": 18,
        "imageUrl": "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 182,
        "productId": 18,
        "imageUrl": "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 183,
        "productId": 18,
        "imageUrl": "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 181,
        "productId": 18,
        "attributeName": "Loại bóng",
        "attributeValue": "Tour Premier"
      },
      {
        "id": 182,
        "productId": 18,
        "attributeName": "Số lượng",
        "attributeValue": "3 bóng/lon"
      },
      {
        "id": 183,
        "productId": 18,
        "attributeName": "Màu sắc",
        "attributeValue": "Vàng"
      }
    ],
    "tagIds": [
      1,
      7
    ],
    "category": "Bóng & Cầu"
  },
  {
    "id": 19,
    "name": "Giày Chạy Bộ Marathon Nike Vaporfly 3 Siêu Êm",
    "slug": "giay-chay-bo-marathon-nike-vaporfly-3-sieu-em",
    "description": "Trang bị công nghệ ZoomX foam siêu nhẹ và tấm carbon Flyplate giúp tối ưu hồi lực, mang lại cảm giác êm ái và tốc độ vượt trội. Thiết kế upper lưới thoáng khí ôm chân, phù hợp cho những cung đường marathon dài.",
    "sportType": "RUNNING",
    "status": "ACTIVE",
    "basePrice": 3800000,
    "salePrice": 3490000,
    "isFeatured": true,
    "avgRating": 4.6,
    "reviewCount": 20,
    "soldCount": 80,
    "brandId": 2,
    "categoryId": 2,
    "variants": [
      {
        "id": 191,
        "productId": 19,
        "sku": "GIAY-CHA-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 3800000,
        "salePrice": 3490000,
        "stock": 10,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 192,
        "productId": 19,
        "sku": "GIAY-CHA-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 3800000,
        "salePrice": 3490000,
        "stock": 13,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 193,
        "productId": 19,
        "sku": "GIAY-CHA-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 3800000,
        "salePrice": 3490000,
        "stock": 16,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 191,
        "productId": 19,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 192,
        "productId": 19,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 193,
        "productId": 19,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 191,
        "productId": 19,
        "attributeName": "Thương hiệu",
        "attributeValue": "Nike"
      },
      {
        "id": 192,
        "productId": 19,
        "attributeName": "Chất liệu",
        "attributeValue": "ZoomX foam, lưới thoáng khí"
      },
      {
        "id": 193,
        "productId": 19,
        "attributeName": "Kích cỡ",
        "attributeValue": "39-45"
      }
    ],
    "tagIds": [
      1,
      2
    ],
    "category": "Giày thể thao"
  },
  {
    "id": 20,
    "name": "Áo Chạy Bộ Nam Nike Dri-FIT ADV Thoáng Khí",
    "slug": "ao-chay-bo-nam-nike-dri-fit-adv-thoang-khi",
    "description": "Công nghệ Dri-FIT ADV thấm hút mồ hôi nhanh, kết hợp lưới thoáng khí ở lưng và nách giúp cơ thể luôn khô ráo. Form áo ôm nhẹ, co giãn linh hoạt, mang lại sự thoải mái tối đa khi chạy đường dài.",
    "sportType": "RUNNING",
    "status": "ACTIVE",
    "basePrice": 850000,
    "salePrice": 690000,
    "isFeatured": true,
    "avgRating": 4.699999999999999,
    "reviewCount": 32,
    "soldCount": 115,
    "brandId": 2,
    "categoryId": 3,
    "variants": [
      {
        "id": 201,
        "productId": 20,
        "sku": "AO-CHAY--Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 850000,
        "salePrice": 690000,
        "stock": 15,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 202,
        "productId": 20,
        "sku": "AO-CHAY--Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 850000,
        "salePrice": 690000,
        "stock": 18,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 203,
        "productId": 20,
        "sku": "AO-CHAY--Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 850000,
        "salePrice": 690000,
        "stock": 21,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 201,
        "productId": 20,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 202,
        "productId": 20,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 203,
        "productId": 20,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 201,
        "productId": 20,
        "attributeName": "Thương hiệu",
        "attributeValue": "Nike"
      },
      {
        "id": 202,
        "productId": 20,
        "attributeName": "Chất liệu",
        "attributeValue": "Polyester tái chế, lưới thoáng khí"
      },
      {
        "id": 203,
        "productId": 20,
        "attributeName": "Kích cỡ",
        "attributeValue": "S-XXL"
      }
    ],
    "tagIds": [
      1,
      3
    ],
    "category": "Quần áo"
  },
  {
    "id": 21,
    "name": "Quần Short Chạy Bộ Nam Adidas Adizero Thoáng Khí",
    "slug": "quan-short-chay-bo-nam-adidas-adizero-thoang-khi",
    "description": "Chất liệu vải siêu nhẹ, thoáng khí với công nghệ AEROREADY giúp quản lý mồ hôi hiệu quả. Thiết kế short ngắn có lớp lót bên trong, mang lại sự tự do chuyển động và thoải mái suốt hành trình marathon.",
    "sportType": "RUNNING",
    "status": "ACTIVE",
    "basePrice": 950000,
    "salePrice": 790000,
    "isFeatured": false,
    "avgRating": 4.8,
    "reviewCount": 44,
    "soldCount": 150,
    "brandId": 2,
    "categoryId": 3,
    "variants": [
      {
        "id": 211,
        "productId": 21,
        "sku": "QUAN-SHO-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 950000,
        "salePrice": 790000,
        "stock": 20,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 212,
        "productId": 21,
        "sku": "QUAN-SHO-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 950000,
        "salePrice": 790000,
        "stock": 23,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 213,
        "productId": 21,
        "sku": "QUAN-SHO-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 950000,
        "salePrice": 790000,
        "stock": 26,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 211,
        "productId": 21,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 212,
        "productId": 21,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 213,
        "productId": 21,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 211,
        "productId": 21,
        "attributeName": "Thương hiệu",
        "attributeValue": "Adidas"
      },
      {
        "id": 212,
        "productId": 21,
        "attributeName": "Chất liệu",
        "attributeValue": "Vải tái chế, AEROREADY"
      },
      {
        "id": 213,
        "productId": 21,
        "attributeName": "Kích cỡ",
        "attributeValue": "S-XXL"
      }
    ],
    "tagIds": [
      1,
      4
    ],
    "category": "Quần áo"
  },
  {
    "id": 22,
    "name": "Giày Chạy Bộ Marathon Adidas Adizero Adios Pro 3 Siêu Êm",
    "slug": "giay-chay-bo-marathon-adidas-adizero-adios-pro-3-sieu-em",
    "description": "Sử dụng công nghệ Lightstrike Pro siêu nhẹ và bộ thanh EnergyRods giúp tối ưu hiệu suất, mang lại cảm giác êm ái và đàn hồi cao. Upper lưới thoáng khí ôm chân, lý tưởng cho các giải marathon chuyên nghiệp.",
    "sportType": "RUNNING",
    "status": "ACTIVE",
    "basePrice": 3800000,
    "salePrice": 3590000,
    "isFeatured": false,
    "avgRating": 4.8999999999999995,
    "reviewCount": 56,
    "soldCount": 185,
    "brandId": 2,
    "categoryId": 2,
    "variants": [
      {
        "id": 221,
        "productId": 22,
        "sku": "GIAY-CHA-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 3800000,
        "salePrice": 3590000,
        "stock": 25,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 222,
        "productId": 22,
        "sku": "GIAY-CHA-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 3800000,
        "salePrice": 3590000,
        "stock": 28,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 223,
        "productId": 22,
        "sku": "GIAY-CHA-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 3800000,
        "salePrice": 3590000,
        "stock": 31,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 221,
        "productId": 22,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 222,
        "productId": 22,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 223,
        "productId": 22,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 221,
        "productId": 22,
        "attributeName": "Thương hiệu",
        "attributeValue": "Adidas"
      },
      {
        "id": 222,
        "productId": 22,
        "attributeName": "Chất liệu",
        "attributeValue": "Lightstrike Pro, lưới thoáng khí"
      },
      {
        "id": 223,
        "productId": 22,
        "attributeName": "Kích cỡ",
        "attributeValue": "39-46"
      }
    ],
    "tagIds": [
      1,
      5
    ],
    "category": "Giày thể thao"
  },
  {
    "id": 23,
    "name": "Áo Chạy Bộ Nữ Adidas Own The Run Thoáng Khí",
    "slug": "ao-chay-bo-nu-adidas-own-the-run-thoang-khi",
    "description": "Công nghệ AEROREADY thấm hút mồ hôi vượt trội, kết hợp các panel lưới thoáng khí giúp lưu thông không khí tốt. Form áo nữ tính, co giãn nhẹ, mang lại sự thoải mái và tự tin khi chạy bộ.",
    "sportType": "RUNNING",
    "status": "ACTIVE",
    "basePrice": 750000,
    "salePrice": 590000,
    "isFeatured": false,
    "avgRating": 4.6,
    "reviewCount": 68,
    "soldCount": 220,
    "brandId": 2,
    "categoryId": 3,
    "variants": [
      {
        "id": 231,
        "productId": 23,
        "sku": "AO-CHAY--Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 750000,
        "salePrice": 590000,
        "stock": 30,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 232,
        "productId": 23,
        "sku": "AO-CHAY--Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 750000,
        "salePrice": 590000,
        "stock": 33,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 233,
        "productId": 23,
        "sku": "AO-CHAY--Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 750000,
        "salePrice": 590000,
        "stock": 36,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 231,
        "productId": 23,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 232,
        "productId": 23,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 233,
        "productId": 23,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 231,
        "productId": 23,
        "attributeName": "Thương hiệu",
        "attributeValue": "Adidas"
      },
      {
        "id": 232,
        "productId": 23,
        "attributeName": "Chất liệu",
        "attributeValue": "Polyester tái chế, lưới thoáng khí"
      },
      {
        "id": 233,
        "productId": 23,
        "attributeName": "Kích cỡ",
        "attributeValue": "XS-XL"
      }
    ],
    "tagIds": [
      1,
      6
    ],
    "category": "Quần áo"
  },
  {
    "id": 24,
    "name": "Quần Legging Chạy Bộ Nữ Nike Dri-FIT Fast Thoáng Khí",
    "slug": "quan-legging-chay-bo-nu-nike-dri-fit-fast-thoang-khi",
    "description": "Chất liệu Dri-FIT co giãn 4 chiều, thoáng khí và thấm hút mồ hôi nhanh, giúp cơ thể luôn khô ráo. Thiết kế legging ôm sát với các đường may phẳng giảm ma sát, mang lại sự thoải mái tối đa khi chạy marathon.",
    "sportType": "RUNNING",
    "status": "ACTIVE",
    "basePrice": 1200000,
    "salePrice": 990000,
    "isFeatured": false,
    "avgRating": 4.699999999999999,
    "reviewCount": 80,
    "soldCount": 255,
    "brandId": 2,
    "categoryId": 3,
    "variants": [
      {
        "id": 241,
        "productId": 24,
        "sku": "QUAN-LEG-Size40",
        "size": "Size 40",
        "color": "Đen / Trắng",
        "price": 1200000,
        "salePrice": 990000,
        "stock": 35,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 242,
        "productId": 24,
        "sku": "QUAN-LEG-Size41",
        "size": "Size 41",
        "color": "Xanh Navy",
        "price": 1200000,
        "salePrice": 990000,
        "stock": 38,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 243,
        "productId": 24,
        "sku": "QUAN-LEG-Size42",
        "size": "Size 42",
        "color": "Đỏ Cam",
        "price": 1200000,
        "salePrice": 990000,
        "stock": 41,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 241,
        "productId": 24,
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 242,
        "productId": 24,
        "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 243,
        "productId": 24,
        "imageUrl": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 241,
        "productId": 24,
        "attributeName": "Thương hiệu",
        "attributeValue": "Nike"
      },
      {
        "id": 242,
        "productId": 24,
        "attributeName": "Chất liệu",
        "attributeValue": "Dri-FIT, spandex co giãn"
      },
      {
        "id": 243,
        "productId": 24,
        "attributeName": "Kích cỡ",
        "attributeValue": "XS-XL"
      }
    ],
    "tagIds": [
      1,
      7
    ],
    "category": "Quần áo"
  },
  {
    "id": 25,
    "name": "Tạ Tay Bọc Cao Su Hexagon 5kg Cao Cấp",
    "slug": "ta-tay-boc-cao-su-hexagon-5kg-cao-cap",
    "description": "Tạ tay hexagon bọc cao su đúc nguyên khối, chống trượt và bảo vệ sàn hiệu quả. Tay cầm mạ crôm chống gỉ, phù hợp tập luyện tại nhà và phòng gym chuyên nghiệp.",
    "sportType": "GYM",
    "status": "ACTIVE",
    "basePrice": 450000,
    "salePrice": 399000,
    "isFeatured": true,
    "avgRating": 4.6,
    "reviewCount": 20,
    "soldCount": 80,
    "brandId": 8,
    "categoryId": 6,
    "variants": [
      {
        "id": 251,
        "productId": 25,
        "sku": "TA-TAY-B-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 450000,
        "salePrice": 399000,
        "stock": 10,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 252,
        "productId": 25,
        "sku": "TA-TAY-B-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 450000,
        "salePrice": 399000,
        "stock": 13,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 253,
        "productId": 25,
        "sku": "TA-TAY-B-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 450000,
        "salePrice": 399000,
        "stock": 16,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 251,
        "productId": 25,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 252,
        "productId": 25,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 253,
        "productId": 25,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 251,
        "productId": 25,
        "attributeName": "Trọng lượng",
        "attributeValue": "5kg"
      },
      {
        "id": 252,
        "productId": 25,
        "attributeName": "Chất liệu",
        "attributeValue": "Cao su đúc + thép mạ crôm"
      },
      {
        "id": 253,
        "productId": 25,
        "attributeName": "Loại",
        "attributeValue": "Tạ đơn hexagon"
      }
    ],
    "tagIds": [
      1,
      2
    ],
    "category": "Dụng cụ tập luyện"
  },
  {
    "id": 26,
    "name": "Bộ Tạ Tay Bọc Cao Su Hexagon 2x10kg Kèm Giá Đỡ",
    "slug": "bo-ta-tay-boc-cao-su-hexagon-2x10kg-kem-gia-do",
    "description": "Bộ đôi tạ hexagon 10kg bọc cao su nguyên chất, kèm giá đỡ chắc chắn tiện lợi. Thiết kế 6 cạnh chống lăn, an toàn cho mọi bài tập sức mạnh.",
    "sportType": "GYM",
    "status": "ACTIVE",
    "basePrice": 1850000,
    "salePrice": 1650000,
    "isFeatured": true,
    "avgRating": 4.699999999999999,
    "reviewCount": 32,
    "soldCount": 115,
    "brandId": 8,
    "categoryId": 6,
    "variants": [
      {
        "id": 261,
        "productId": 26,
        "sku": "BO-TA-TA-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 1850000,
        "salePrice": 1650000,
        "stock": 15,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 262,
        "productId": 26,
        "sku": "BO-TA-TA-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 1850000,
        "salePrice": 1650000,
        "stock": 18,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 263,
        "productId": 26,
        "sku": "BO-TA-TA-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 1850000,
        "salePrice": 1650000,
        "stock": 21,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 261,
        "productId": 26,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 262,
        "productId": 26,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 263,
        "productId": 26,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 261,
        "productId": 26,
        "attributeName": "Trọng lượng",
        "attributeValue": "2 x 10kg"
      },
      {
        "id": 262,
        "productId": 26,
        "attributeName": "Chất liệu",
        "attributeValue": "Cao su đúc + thép không gỉ"
      },
      {
        "id": 263,
        "productId": 26,
        "attributeName": "Phụ kiện",
        "attributeValue": "Kèm giá đỡ sắt sơn tĩnh điện"
      }
    ],
    "tagIds": [
      1,
      3
    ],
    "category": "Dụng cụ tập luyện"
  },
  {
    "id": 27,
    "name": "Dây Kháng Lực Tập Gym 5 Mức Độ Kèm Túi Đựng",
    "slug": "day-khang-luc-tap-gym-5-muc-do-kem-tui-dung",
    "description": "Bộ 5 dây kháng lực latex tự nhiên với lực kéo từ 5-25kg, hỗ trợ đa dạng bài tập. Kèm túi đựng tiện mang theo, phù hợp tập tại nhà hoặc du lịch.",
    "sportType": "GYM",
    "status": "ACTIVE",
    "basePrice": 350000,
    "salePrice": 299000,
    "isFeatured": false,
    "avgRating": 4.8,
    "reviewCount": 44,
    "soldCount": 150,
    "brandId": 8,
    "categoryId": 6,
    "variants": [
      {
        "id": 271,
        "productId": 27,
        "sku": "DAY-KHAN-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 350000,
        "salePrice": 299000,
        "stock": 20,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 272,
        "productId": 27,
        "sku": "DAY-KHAN-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 350000,
        "salePrice": 299000,
        "stock": 23,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 273,
        "productId": 27,
        "sku": "DAY-KHAN-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 350000,
        "salePrice": 299000,
        "stock": 26,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 271,
        "productId": 27,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 272,
        "productId": 27,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 273,
        "productId": 27,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 271,
        "productId": 27,
        "attributeName": "Số dây",
        "attributeValue": "5 dây"
      },
      {
        "id": 272,
        "productId": 27,
        "attributeName": "Chất liệu",
        "attributeValue": "Latex tự nhiên"
      },
      {
        "id": 273,
        "productId": 27,
        "attributeName": "Lực kéo",
        "attributeValue": "5-25kg"
      }
    ],
    "tagIds": [
      1,
      4
    ],
    "category": "Dụng cụ tập luyện"
  },
  {
    "id": 28,
    "name": "Dây Kháng Lực Cao Cấp Với Tay Cầm Xốp Non 3 Mức Độ",
    "slug": "day-khang-luc-cao-cap-voi-tay-cam-xop-non-3-muc-do",
    "description": "Dây kháng lực bọc dù siêu bền, tay cầm xốp non êm ái chống trơn. Ba mức lực 10/15/20kg đáp ứng linh hoạt nhu cầu tập luyện.",
    "sportType": "GYM",
    "status": "ACTIVE",
    "basePrice": 520000,
    "salePrice": 450000,
    "isFeatured": false,
    "avgRating": 4.8999999999999995,
    "reviewCount": 56,
    "soldCount": 185,
    "brandId": 8,
    "categoryId": 6,
    "variants": [
      {
        "id": 281,
        "productId": 28,
        "sku": "DAY-KHAN-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 520000,
        "salePrice": 450000,
        "stock": 25,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 282,
        "productId": 28,
        "sku": "DAY-KHAN-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 520000,
        "salePrice": 450000,
        "stock": 28,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 283,
        "productId": 28,
        "sku": "DAY-KHAN-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 520000,
        "salePrice": 450000,
        "stock": 31,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 281,
        "productId": 28,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 282,
        "productId": 28,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 283,
        "productId": 28,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 281,
        "productId": 28,
        "attributeName": "Số mức lực",
        "attributeValue": "3 mức (10/15/20kg)"
      },
      {
        "id": 282,
        "productId": 28,
        "attributeName": "Chất liệu dây",
        "attributeValue": "Dù bọc cao su"
      },
      {
        "id": 283,
        "productId": 28,
        "attributeName": "Tay cầm",
        "attributeValue": "Xốp non chống trượt"
      }
    ],
    "tagIds": [
      1,
      5
    ],
    "category": "Dụng cụ tập luyện"
  },
  {
    "id": 29,
    "name": "Thảm Tập Yoga TPE Cao Cấp 6mm Chống Trượt",
    "slug": "tham-tap-yoga-tpe-cao-cap-6mm-chong-truot",
    "description": "Thảm yoga TPE 6mm hai lớp với bề mặt nhám chống trượt vượt trội. Độ đàn hồi cao bảo vệ khớp, kèm dây đeo tiện lợi khi di chuyển.",
    "sportType": "GYM",
    "status": "ACTIVE",
    "basePrice": 650000,
    "salePrice": 549000,
    "isFeatured": false,
    "avgRating": 4.6,
    "reviewCount": 68,
    "soldCount": 220,
    "brandId": 8,
    "categoryId": 6,
    "variants": [
      {
        "id": 291,
        "productId": 29,
        "sku": "THAM-TAP-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 650000,
        "salePrice": 549000,
        "stock": 30,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 292,
        "productId": 29,
        "sku": "THAM-TAP-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 650000,
        "salePrice": 549000,
        "stock": 33,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 293,
        "productId": 29,
        "sku": "THAM-TAP-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 650000,
        "salePrice": 549000,
        "stock": 36,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 291,
        "productId": 29,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 292,
        "productId": 29,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 293,
        "productId": 29,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 291,
        "productId": 29,
        "attributeName": "Độ dày",
        "attributeValue": "6mm"
      },
      {
        "id": 292,
        "productId": 29,
        "attributeName": "Chất liệu",
        "attributeValue": "TPE thân thiện môi trường"
      },
      {
        "id": 293,
        "productId": 29,
        "attributeName": "Kích thước",
        "attributeValue": "183 x 61 cm"
      }
    ],
    "tagIds": [
      1,
      6
    ],
    "category": "Dụng cụ tập luyện"
  },
  {
    "id": 30,
    "name": "Thảm Tập Gym Yoga Cao Su Tự Nhiên 8mm Siêu Bám",
    "slug": "tham-tap-gym-yoga-cao-su-tu-nhien-8mm-sieu-bam",
    "description": "Thảm cao su tự nhiên 8mm siêu bám, chịu lực tốt cho cả bài tập gym và yoga. Bề mặt thoáng khí, dễ vệ sinh, độ bền vượt trội theo thời gian.",
    "sportType": "GYM",
    "status": "ACTIVE",
    "basePrice": 1250000,
    "salePrice": 1050000,
    "isFeatured": false,
    "avgRating": 4.699999999999999,
    "reviewCount": 80,
    "soldCount": 255,
    "brandId": 8,
    "categoryId": 6,
    "variants": [
      {
        "id": 301,
        "productId": 30,
        "sku": "THAM-TAP-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 1250000,
        "salePrice": 1050000,
        "stock": 35,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 302,
        "productId": 30,
        "sku": "THAM-TAP-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 1250000,
        "salePrice": 1050000,
        "stock": 38,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 303,
        "productId": 30,
        "sku": "THAM-TAP-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 1250000,
        "salePrice": 1050000,
        "stock": 41,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 301,
        "productId": 30,
        "imageUrl": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 302,
        "productId": 30,
        "imageUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 303,
        "productId": 30,
        "imageUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 301,
        "productId": 30,
        "attributeName": "Độ dày",
        "attributeValue": "8mm"
      },
      {
        "id": 302,
        "productId": 30,
        "attributeName": "Chất liệu",
        "attributeValue": "Cao su tự nhiên"
      },
      {
        "id": 303,
        "productId": 30,
        "attributeName": "Kích thước",
        "attributeValue": "185 x 68 cm"
      }
    ],
    "tagIds": [
      1,
      7
    ],
    "category": "Dụng cụ tập luyện"
  },
  {
    "id": 31,
    "name": "Bóng Rổ Molten BG4500 Da PU Cao Cấp",
    "slug": "bong-ro-molten-bg4500-da-pu-cao-cap",
    "description": "Bóng rổ Molten BG4500 sử dụng da PU tổng hợp bền bỉ, mang lại độ bám tối ưu và cảm giác êm ái khi thi đấu. Thiết kế 12 múi kinh điển giúp kiểm soát bóng chính xác trong mọi pha xử lý.",
    "sportType": "BASKETBALL",
    "status": "ACTIVE",
    "basePrice": 1250000,
    "salePrice": 990000,
    "isFeatured": true,
    "avgRating": 4.6,
    "reviewCount": 20,
    "soldCount": 80,
    "brandId": 5,
    "categoryId": 4,
    "variants": [
      {
        "id": 311,
        "productId": 31,
        "sku": "BONG-RO--M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 1250000,
        "salePrice": 990000,
        "stock": 10,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 312,
        "productId": 31,
        "sku": "BONG-RO--L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 1250000,
        "salePrice": 990000,
        "stock": 13,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 313,
        "productId": 31,
        "sku": "BONG-RO--XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 1250000,
        "salePrice": 990000,
        "stock": 16,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 311,
        "productId": 31,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 312,
        "productId": 31,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 313,
        "productId": 31,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 311,
        "productId": 31,
        "attributeName": "Chất liệu",
        "attributeValue": "Da PU tổng hợp"
      },
      {
        "id": 312,
        "productId": 31,
        "attributeName": "Kích thước",
        "attributeValue": "Size 7 (tiêu chuẩn)"
      },
      {
        "id": 313,
        "productId": 31,
        "attributeName": "Trọng lượng",
        "attributeValue": "600g"
      }
    ],
    "tagIds": [
      1,
      2
    ],
    "category": "Bóng & Cầu"
  },
  {
    "id": 32,
    "name": "Bóng Rổ Spalding NBA Zi/O Excel Da PU",
    "slug": "bong-ro-spalding-nba-zio-excel-da-pu",
    "description": "Bóng rổ Spalding NBA Zi/O Excel với lớp da PU composite tăng độ đàn hồi và khả năng chống mài mòn. Rãnh sâu giúp tăng ma sát, mang lại trải nghiệm nảy ổn định trên mọi mặt sân.",
    "sportType": "BASKETBALL",
    "status": "ACTIVE",
    "basePrice": 1450000,
    "salePrice": null,
    "isFeatured": true,
    "avgRating": 4.699999999999999,
    "reviewCount": 32,
    "soldCount": 115,
    "brandId": 5,
    "categoryId": 4,
    "variants": [
      {
        "id": 321,
        "productId": 32,
        "sku": "BONG-RO--M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 1450000,
        "salePrice": null,
        "stock": 15,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 322,
        "productId": 32,
        "sku": "BONG-RO--L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 1450000,
        "salePrice": null,
        "stock": 18,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 323,
        "productId": 32,
        "sku": "BONG-RO--XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 1450000,
        "salePrice": null,
        "stock": 21,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 321,
        "productId": 32,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 322,
        "productId": 32,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 323,
        "productId": 32,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 321,
        "productId": 32,
        "attributeName": "Chất liệu",
        "attributeValue": "Da PU composite"
      },
      {
        "id": 322,
        "productId": 32,
        "attributeName": "Kích thước",
        "attributeValue": "Size 7"
      },
      {
        "id": 323,
        "productId": 32,
        "attributeName": "Sử dụng",
        "attributeValue": "Trong nhà & ngoài trời"
      }
    ],
    "tagIds": [
      1,
      3
    ],
    "category": "Bóng & Cầu"
  },
  {
    "id": 33,
    "name": "Kính Bơi Speedo Vanquisher 2.0 Chống Sương Mù",
    "slug": "kinh-boi-speedo-vanquisher-2-0-chong-suong-mu",
    "description": "Kính bơi Speedo Vanquisher 2.0 trang bị tròng kính chống sương mù và lớp đệm silicone mềm êm, mang lại tầm nhìn rộng và thoải mái. Dây đeo điều chỉnh linh hoạt giúp giữ kính chắc chắn khi bơi lội.",
    "sportType": "SWIMMING",
    "status": "ACTIVE",
    "basePrice": 550000,
    "salePrice": 420000,
    "isFeatured": false,
    "avgRating": 4.8,
    "reviewCount": 44,
    "soldCount": 150,
    "brandId": 5,
    "categoryId": 5,
    "variants": [
      {
        "id": 331,
        "productId": 33,
        "sku": "KINH-BOI-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 550000,
        "salePrice": 420000,
        "stock": 20,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 332,
        "productId": 33,
        "sku": "KINH-BOI-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 550000,
        "salePrice": 420000,
        "stock": 23,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 333,
        "productId": 33,
        "sku": "KINH-BOI-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 550000,
        "salePrice": 420000,
        "stock": 26,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 331,
        "productId": 33,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 332,
        "productId": 33,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 333,
        "productId": 33,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 331,
        "productId": 33,
        "attributeName": "Chất liệu tròng",
        "attributeValue": "Polycarbonate chống sương"
      },
      {
        "id": 332,
        "productId": 33,
        "attributeName": "Đệm mắt",
        "attributeValue": "Silicone y tế"
      },
      {
        "id": 333,
        "productId": 33,
        "attributeName": "Màu sắc",
        "attributeValue": "Đen/Xanh"
      }
    ],
    "tagIds": [
      1,
      4
    ],
    "category": "Phụ kiện"
  },
  {
    "id": 34,
    "name": "Nút Tai Bơi Speedo Silicone Chống Nước",
    "slug": "nut-tai-boi-speedo-silicone-chong-nuoc",
    "description": "Nút tai bơi Speedo làm từ silicone mềm, ôm khít tai và ngăn nước hiệu quả khi luyện tập. Thiết kế nhỏ gọn, dễ vệ sinh, phù hợp cho cả người mới và vận động viên.",
    "sportType": "SWIMMING",
    "status": "ACTIVE",
    "basePrice": 350000,
    "salePrice": 280000,
    "isFeatured": false,
    "avgRating": 4.8999999999999995,
    "reviewCount": 56,
    "soldCount": 185,
    "brandId": 5,
    "categoryId": 5,
    "variants": [
      {
        "id": 341,
        "productId": 34,
        "sku": "NUT-TAI--M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 350000,
        "salePrice": 280000,
        "stock": 25,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 342,
        "productId": 34,
        "sku": "NUT-TAI--L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 350000,
        "salePrice": 280000,
        "stock": 28,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 343,
        "productId": 34,
        "sku": "NUT-TAI--XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 350000,
        "salePrice": 280000,
        "stock": 31,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 341,
        "productId": 34,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 342,
        "productId": 34,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 343,
        "productId": 34,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 341,
        "productId": 34,
        "attributeName": "Chất liệu",
        "attributeValue": "Silicone mềm"
      },
      {
        "id": 342,
        "productId": 34,
        "attributeName": "Loại",
        "attributeValue": "Nút tai chống nước"
      },
      {
        "id": 343,
        "productId": 34,
        "attributeName": "Kèm theo",
        "attributeValue": "Hộp đựng"
      }
    ],
    "tagIds": [
      1,
      5
    ],
    "category": "Phụ kiện"
  },
  {
    "id": 35,
    "name": "Băng Bảo Vệ Đầu Gối McDavid 6446 Neoprene",
    "slug": "bang-bao-ve-dau-goi-mcdavid-6446-neoprene",
    "description": "Băng bảo vệ đầu gối McDavid 6446 dùng chất liệu neoprene giữ ấm và hỗ trợ khớp khi vận động mạnh. Thiết kế ôm sát với lỗ thoáng khí giúp giảm ma sát và tăng sự ổn định cho đầu gối.",
    "sportType": "BASKETBALL",
    "status": "ACTIVE",
    "basePrice": 850000,
    "salePrice": 690000,
    "isFeatured": false,
    "avgRating": 4.6,
    "reviewCount": 68,
    "soldCount": 220,
    "brandId": 5,
    "categoryId": 5,
    "variants": [
      {
        "id": 351,
        "productId": 35,
        "sku": "BANG-BAO-M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 850000,
        "salePrice": 690000,
        "stock": 30,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 352,
        "productId": 35,
        "sku": "BANG-BAO-L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 850000,
        "salePrice": 690000,
        "stock": 33,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 353,
        "productId": 35,
        "sku": "BANG-BAO-XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 850000,
        "salePrice": 690000,
        "stock": 36,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 351,
        "productId": 35,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 352,
        "productId": 35,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 353,
        "productId": 35,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 351,
        "productId": 35,
        "attributeName": "Chất liệu",
        "attributeValue": "Neoprene cao cấp"
      },
      {
        "id": 352,
        "productId": 35,
        "attributeName": "Kích cỡ",
        "attributeValue": "S/M/L/XL"
      },
      {
        "id": 353,
        "productId": 35,
        "attributeName": "Công dụng",
        "attributeValue": "Bảo vệ & giữ ấm khớp gối"
      }
    ],
    "tagIds": [
      1,
      6
    ],
    "category": "Phụ kiện"
  },
  {
    "id": 36,
    "name": "Đai Bảo Vệ Cổ Tay Bauerfeind ManuRhizo",
    "slug": "dai-bao-ve-co-tay-bauerfeind-manurhizo",
    "description": "Đai bảo vệ cổ tay Bauerfeind ManuRhizo sử dụng vải dệt y tế co giãn, hỗ trợ cố định khớp và giảm đau hiệu quả. Thiết kế mỏng nhẹ, thoáng khí, phù hợp khi chơi thể thao hoặc vận động hàng ngày.",
    "sportType": "BASKETBALL",
    "status": "ACTIVE",
    "basePrice": 3800000,
    "salePrice": 3200000,
    "isFeatured": false,
    "avgRating": 4.699999999999999,
    "reviewCount": 80,
    "soldCount": 255,
    "brandId": 5,
    "categoryId": 5,
    "variants": [
      {
        "id": 361,
        "productId": 36,
        "sku": "DAI-BAO--M",
        "size": "M",
        "color": "Đen / Trắng",
        "price": 3800000,
        "salePrice": 3200000,
        "stock": 35,
        "weightGram": 250,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 362,
        "productId": 36,
        "sku": "DAI-BAO--L",
        "size": "L",
        "color": "Xanh Navy",
        "price": 3800000,
        "salePrice": 3200000,
        "stock": 38,
        "weightGram": 270,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      },
      {
        "id": 363,
        "productId": 36,
        "sku": "DAI-BAO--XL",
        "size": "XL",
        "color": "Đỏ Cam",
        "price": 3800000,
        "salePrice": 3200000,
        "stock": 41,
        "weightGram": 290,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isActive": true
      }
    ],
    "images": [
      {
        "id": 361,
        "productId": 36,
        "imageUrl": "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
        "isPrimary": true,
        "sortOrder": 0
      },
      {
        "id": 362,
        "productId": 36,
        "imageUrl": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 1
      },
      {
        "id": 363,
        "productId": 36,
        "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
        "isPrimary": false,
        "sortOrder": 2
      }
    ],
    "attributes": [
      {
        "id": 361,
        "productId": 36,
        "attributeName": "Chất liệu",
        "attributeValue": "Vải dệt y tế co giãn"
      },
      {
        "id": 362,
        "productId": 36,
        "attributeName": "Kích cỡ",
        "attributeValue": "S/M/L"
      },
      {
        "id": 363,
        "productId": 36,
        "attributeName": "Xuất xứ",
        "attributeValue": "Đức"
      }
    ],
    "tagIds": [
      1,
      7
    ],
    "category": "Phụ kiện"
  }
];
