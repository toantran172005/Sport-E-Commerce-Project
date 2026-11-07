// Dữ liệu Mock tĩnh bám sát Entity Java
export const orders = [
  {
    "id": 1,
    "orderCode": "ORD-2026001",
    "status": "PENDING",
    "subTotal": 7350000,
    "discountAmount": 50000,
    "shippingFee": 0,
    "taxAmount": 0,
    "totalAmount": 7300000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": null,
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": 1,
    "orderItems": [
      {
        "id": 11,
        "orderId": 1,
        "variantId": 11,
        "productNameSnapshot": "Vợt Cầu Lông Yonex Nanoflare 800 Pro",
        "skuSnapshot": "VOT-CAU--4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 3450000,
        "quantity": 1,
        "subtotal": 3450000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 12,
        "orderId": 1,
        "variantId": 41,
        "productNameSnapshot": "Giày Cầu Lông Yonex Power Cushion 65Z3",
        "skuSnapshot": "GIAY-CAU-4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 1950000,
        "quantity": 2,
        "subtotal": 3900000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 11,
        "orderId": 1,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      }
    ],
    "payment": {
      "id": 11,
      "orderId": 1,
      "method": "COD",
      "status": "PENDING",
      "amount": 7300000,
      "transactionCode": "TXN-9999",
      "paidAt": null
    },
    "shipment": {
      "id": 11,
      "orderId": 1,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-188",
      "status": "PENDING",
      "shippingFee": 0,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": null,
      "deliveredAt": null,
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 2,
    "orderCode": "ORD-2026002",
    "status": "CONFIRMED",
    "subTotal": 5760000,
    "discountAmount": 0,
    "shippingFee": 30000,
    "taxAmount": 0,
    "totalAmount": 5790000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": "2026-03-15T09:00:00Z",
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": null,
    "orderItems": [
      {
        "id": 21,
        "orderId": 2,
        "variantId": 21,
        "productNameSnapshot": "Vợt Cầu Lông Lining Aeronaut 9000C",
        "skuSnapshot": "VOT-CAU--4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 3200000,
        "quantity": 1,
        "subtotal": 3200000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 22,
        "orderId": 2,
        "variantId": 51,
        "productNameSnapshot": "Giày Cầu Lông Lining Ranger 5",
        "skuSnapshot": "GIAY-CAU-4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 1280000,
        "quantity": 2,
        "subtotal": 2560000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 21,
        "orderId": 2,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 22,
        "orderId": 2,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      }
    ],
    "payment": {
      "id": 21,
      "orderId": 2,
      "method": "BANK_TRANSFER",
      "status": "PENDING",
      "amount": 5790000,
      "transactionCode": "TXN-19998",
      "paidAt": null
    },
    "shipment": {
      "id": 21,
      "orderId": 2,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-288",
      "status": "PENDING",
      "shippingFee": 30000,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": null,
      "deliveredAt": null,
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 3,
    "orderCode": "ORD-2026003",
    "status": "PROCESSING",
    "subTotal": 8450000,
    "discountAmount": 50000,
    "shippingFee": 30000,
    "taxAmount": 0,
    "totalAmount": 8430000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": "2026-03-15T09:00:00Z",
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": 1,
    "orderItems": [
      {
        "id": 31,
        "orderId": 3,
        "variantId": 31,
        "productNameSnapshot": "Vợt Cầu Lông Yonex Astrox 88D Pro",
        "skuSnapshot": "VOT-CAU--4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 3350000,
        "quantity": 1,
        "subtotal": 3350000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 32,
        "orderId": 3,
        "variantId": 61,
        "productNameSnapshot": "Giày Cầu Lông Yonex Aerus Z",
        "skuSnapshot": "GIAY-CAU-4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 2550000,
        "quantity": 2,
        "subtotal": 5100000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 31,
        "orderId": 3,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 32,
        "orderId": 3,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      },
      {
        "id": 33,
        "orderId": 3,
        "status": "PROCESSING",
        "note": "Kho đang đóng gói hàng hóa",
        "createdAt": "2026-03-15T11:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Kho"
        }
      }
    ],
    "payment": {
      "id": 31,
      "orderId": 3,
      "method": "COD",
      "status": "PENDING",
      "amount": 8430000,
      "transactionCode": "TXN-29997",
      "paidAt": null
    },
    "shipment": {
      "id": 31,
      "orderId": 3,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-388",
      "status": "PENDING",
      "shippingFee": 30000,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": null,
      "deliveredAt": null,
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 4,
    "orderCode": "ORD-2026004",
    "status": "SHIPPED",
    "subTotal": 7530000,
    "discountAmount": 0,
    "shippingFee": 0,
    "taxAmount": 0,
    "totalAmount": 7530000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": "2026-03-15T09:00:00Z",
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": null,
    "orderItems": [
      {
        "id": 41,
        "orderId": 4,
        "variantId": 41,
        "productNameSnapshot": "Giày Cầu Lông Yonex Power Cushion 65Z3",
        "skuSnapshot": "GIAY-CAU-4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 1950000,
        "quantity": 1,
        "subtotal": 1950000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 42,
        "orderId": 4,
        "variantId": 71,
        "productNameSnapshot": "Giày Bóng Đá Nike Phantom GX Pro TF",
        "skuSnapshot": "GIAY-BON-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 2790000,
        "quantity": 2,
        "subtotal": 5580000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 41,
        "orderId": 4,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 42,
        "orderId": 4,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      },
      {
        "id": 43,
        "orderId": 4,
        "status": "PROCESSING",
        "note": "Kho đang đóng gói hàng hóa",
        "createdAt": "2026-03-15T11:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Kho"
        }
      },
      {
        "id": 44,
        "orderId": 4,
        "status": "SHIPPED",
        "note": "Đã bàn giao cho đơn vị vận chuyển GHN Express",
        "createdAt": "2026-03-16T08:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      }
    ],
    "payment": {
      "id": 41,
      "orderId": 4,
      "method": "BANK_TRANSFER",
      "status": "PENDING",
      "amount": 7530000,
      "transactionCode": "TXN-39996",
      "paidAt": null
    },
    "shipment": {
      "id": 41,
      "orderId": 4,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-488",
      "status": "IN_TRANSIT",
      "shippingFee": 0,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": "2026-03-16T08:00:00Z",
      "deliveredAt": null,
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 5,
    "orderCode": "ORD-2026005",
    "status": "DELIVERED",
    "subTotal": 8280000,
    "discountAmount": 50000,
    "shippingFee": 30000,
    "taxAmount": 0,
    "totalAmount": 8260000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": "2026-03-15T09:00:00Z",
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": 1,
    "orderItems": [
      {
        "id": 51,
        "orderId": 5,
        "variantId": 51,
        "productNameSnapshot": "Giày Cầu Lông Lining Ranger 5",
        "skuSnapshot": "GIAY-CAU-4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 1280000,
        "quantity": 1,
        "subtotal": 1280000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 52,
        "orderId": 5,
        "variantId": 81,
        "productNameSnapshot": "Giày Bóng Đá Puma Future Ultimate TF",
        "skuSnapshot": "GIAY-BON-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 3500000,
        "quantity": 2,
        "subtotal": 7000000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 51,
        "orderId": 5,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 52,
        "orderId": 5,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      },
      {
        "id": 53,
        "orderId": 5,
        "status": "PROCESSING",
        "note": "Kho đang đóng gói hàng hóa",
        "createdAt": "2026-03-15T11:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Kho"
        }
      },
      {
        "id": 54,
        "orderId": 5,
        "status": "SHIPPED",
        "note": "Đã bàn giao cho đơn vị vận chuyển GHN Express",
        "createdAt": "2026-03-16T08:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      },
      {
        "id": 55,
        "orderId": 5,
        "status": "DELIVERED",
        "note": "Giao hàng thành công đến tay người nhận",
        "createdAt": "2026-03-17T14:30:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      }
    ],
    "payment": {
      "id": 51,
      "orderId": 5,
      "method": "COD",
      "status": "PAID",
      "amount": 8260000,
      "transactionCode": "TXN-49995",
      "paidAt": "2026-03-17T14:30:00Z"
    },
    "shipment": {
      "id": 51,
      "orderId": 5,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-588",
      "status": "DELIVERED",
      "shippingFee": 30000,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": "2026-03-16T08:00:00Z",
      "deliveredAt": "2026-03-17T14:30:00Z",
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 6,
    "orderCode": "ORD-2026006",
    "status": "DELIVERED",
    "subTotal": 6330000,
    "discountAmount": 0,
    "shippingFee": 30000,
    "taxAmount": 0,
    "totalAmount": 6360000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": "2026-03-15T09:00:00Z",
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": null,
    "orderItems": [
      {
        "id": 61,
        "orderId": 6,
        "variantId": 61,
        "productNameSnapshot": "Giày Cầu Lông Yonex Aerus Z",
        "skuSnapshot": "GIAY-CAU-4UG5",
        "variantSnapshot": "4U-G5 • Đen / Trắng",
        "unitPrice": 2550000,
        "quantity": 1,
        "subtotal": 2550000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 62,
        "orderId": 6,
        "variantId": 91,
        "productNameSnapshot": "Giày Bóng Đá Adidas Predator Accuracy.3 TF",
        "skuSnapshot": "GIAY-BON-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 1890000,
        "quantity": 2,
        "subtotal": 3780000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 61,
        "orderId": 6,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 62,
        "orderId": 6,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      },
      {
        "id": 63,
        "orderId": 6,
        "status": "PROCESSING",
        "note": "Kho đang đóng gói hàng hóa",
        "createdAt": "2026-03-15T11:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Kho"
        }
      },
      {
        "id": 64,
        "orderId": 6,
        "status": "SHIPPED",
        "note": "Đã bàn giao cho đơn vị vận chuyển GHN Express",
        "createdAt": "2026-03-16T08:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      },
      {
        "id": 65,
        "orderId": 6,
        "status": "DELIVERED",
        "note": "Giao hàng thành công đến tay người nhận",
        "createdAt": "2026-03-17T14:30:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      }
    ],
    "payment": {
      "id": 61,
      "orderId": 6,
      "method": "BANK_TRANSFER",
      "status": "PAID",
      "amount": 6360000,
      "transactionCode": "TXN-59994",
      "paidAt": "2026-03-17T14:30:00Z"
    },
    "shipment": {
      "id": 61,
      "orderId": 6,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-688",
      "status": "DELIVERED",
      "shippingFee": 30000,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": "2026-03-16T08:00:00Z",
      "deliveredAt": "2026-03-17T14:30:00Z",
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 7,
    "orderCode": "ORD-2026007",
    "status": "CANCELED",
    "subTotal": 4170000,
    "discountAmount": 50000,
    "shippingFee": 0,
    "taxAmount": 0,
    "totalAmount": 4120000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": "Khách hàng đổi ý muốn chọn màu khác",
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": null,
    "canceledAt": "2026-03-15T10:00:00Z",
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": 1,
    "orderItems": [
      {
        "id": 71,
        "orderId": 7,
        "variantId": 71,
        "productNameSnapshot": "Giày Bóng Đá Nike Phantom GX Pro TF",
        "skuSnapshot": "GIAY-BON-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 2790000,
        "quantity": 1,
        "subtotal": 2790000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 72,
        "orderId": 7,
        "variantId": 101,
        "productNameSnapshot": "Áo Đấu Nike Dri-FIT Strike",
        "skuSnapshot": "AO-DAU-N-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 690000,
        "quantity": 2,
        "subtotal": 1380000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 71,
        "orderId": 7,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 72,
        "orderId": 7,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      },
      {
        "id": 76,
        "orderId": 7,
        "status": "CANCELED",
        "note": "Khách hàng yêu cầu hủy: Đổi ý muốn chọn màu khác",
        "createdAt": "2026-03-15T10:00:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      }
    ],
    "payment": {
      "id": 71,
      "orderId": 7,
      "method": "COD",
      "status": "CANCELLED",
      "amount": 4120000,
      "transactionCode": "TXN-69993",
      "paidAt": null
    },
    "shipment": {
      "id": 71,
      "orderId": 7,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-788",
      "status": "PENDING",
      "shippingFee": 0,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": null,
      "deliveredAt": null,
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 8,
    "orderCode": "ORD-2026008",
    "status": "RETURN_REQUESTED",
    "subTotal": 4780000,
    "discountAmount": 0,
    "shippingFee": 30000,
    "taxAmount": 0,
    "totalAmount": 4810000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": "2026-03-15T09:00:00Z",
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": null,
    "orderItems": [
      {
        "id": 81,
        "orderId": 8,
        "variantId": 81,
        "productNameSnapshot": "Giày Bóng Đá Puma Future Ultimate TF",
        "skuSnapshot": "GIAY-BON-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 3500000,
        "quantity": 1,
        "subtotal": 3500000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 82,
        "orderId": 8,
        "variantId": 111,
        "productNameSnapshot": "Áo Đấu Puma TeamLIGA Jersey",
        "skuSnapshot": "AO-DAU-P-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 640000,
        "quantity": 2,
        "subtotal": 1280000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 81,
        "orderId": 8,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 82,
        "orderId": 8,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      },
      {
        "id": 83,
        "orderId": 8,
        "status": "PROCESSING",
        "note": "Kho đang đóng gói hàng hóa",
        "createdAt": "2026-03-15T11:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Kho"
        }
      },
      {
        "id": 84,
        "orderId": 8,
        "status": "SHIPPED",
        "note": "Đã bàn giao cho đơn vị vận chuyển GHN Express",
        "createdAt": "2026-03-16T08:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      },
      {
        "id": 85,
        "orderId": 8,
        "status": "DELIVERED",
        "note": "Giao hàng thành công đến tay người nhận",
        "createdAt": "2026-03-17T14:30:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      }
    ],
    "payment": {
      "id": 81,
      "orderId": 8,
      "method": "BANK_TRANSFER",
      "status": "PENDING",
      "amount": 4810000,
      "transactionCode": "TXN-79992",
      "paidAt": null
    },
    "shipment": {
      "id": 81,
      "orderId": 8,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-888",
      "status": "IN_TRANSIT",
      "shippingFee": 30000,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": null,
      "deliveredAt": null,
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 9,
    "orderCode": "ORD-2026009",
    "status": "RETURNED",
    "subTotal": 3470000,
    "discountAmount": 50000,
    "shippingFee": 30000,
    "taxAmount": 0,
    "totalAmount": 3450000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": "2026-03-15T09:00:00Z",
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": 1,
    "orderItems": [
      {
        "id": 91,
        "orderId": 9,
        "variantId": 91,
        "productNameSnapshot": "Giày Bóng Đá Adidas Predator Accuracy.3 TF",
        "skuSnapshot": "GIAY-BON-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 1890000,
        "quantity": 1,
        "subtotal": 1890000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 92,
        "orderId": 9,
        "variantId": 121,
        "productNameSnapshot": "Áo Đấu Adidas Tiro 23 Competition",
        "skuSnapshot": "AO-DAU-A-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 790000,
        "quantity": 2,
        "subtotal": 1580000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 91,
        "orderId": 9,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 92,
        "orderId": 9,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      },
      {
        "id": 93,
        "orderId": 9,
        "status": "PROCESSING",
        "note": "Kho đang đóng gói hàng hóa",
        "createdAt": "2026-03-15T11:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Kho"
        }
      },
      {
        "id": 94,
        "orderId": 9,
        "status": "SHIPPED",
        "note": "Đã bàn giao cho đơn vị vận chuyển GHN Express",
        "createdAt": "2026-03-16T08:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      },
      {
        "id": 95,
        "orderId": 9,
        "status": "DELIVERED",
        "note": "Giao hàng thành công đến tay người nhận",
        "createdAt": "2026-03-17T14:30:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      }
    ],
    "payment": {
      "id": 91,
      "orderId": 9,
      "method": "COD",
      "status": "PENDING",
      "amount": 3450000,
      "transactionCode": "TXN-89991",
      "paidAt": null
    },
    "shipment": {
      "id": 91,
      "orderId": 9,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-988",
      "status": "PENDING",
      "shippingFee": 30000,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": null,
      "deliveredAt": null,
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  },
  {
    "id": 10,
    "orderCode": "ORD-2026010",
    "status": "DELIVERED",
    "subTotal": 7670000,
    "discountAmount": 0,
    "shippingFee": 0,
    "taxAmount": 0,
    "totalAmount": 7670000,
    "shippingAddressSnapshot": "Số 12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP. Hồ Chí Minh",
    "note": "Giao giờ hành chính, gọi trước khi giao 15 phút",
    "cancelReason": null,
    "placedAt": "2026-03-15T08:30:00Z",
    "confirmedAt": "2026-03-15T09:00:00Z",
    "canceledAt": null,
    "createdAt": "2026-03-15T08:30:00Z",
    "updatedAt": "2026-03-17T14:30:00Z",
    "userId": 1,
    "shippingAddressId": 1,
    "couponId": null,
    "orderItems": [
      {
        "id": 101,
        "orderId": 10,
        "variantId": 101,
        "productNameSnapshot": "Áo Đấu Nike Dri-FIT Strike",
        "skuSnapshot": "AO-DAU-N-Size40",
        "variantSnapshot": "Size 40 • Đen / Trắng",
        "unitPrice": 690000,
        "quantity": 1,
        "subtotal": 690000,
        "createdAt": "2026-03-15T08:30:00Z"
      },
      {
        "id": 102,
        "orderId": 10,
        "variantId": 131,
        "productNameSnapshot": "Vợt Tennis Wilson Pro Staff 97 v14",
        "skuSnapshot": "VOT-TENN-M",
        "variantSnapshot": "M • Đen / Trắng",
        "unitPrice": 3490000,
        "quantity": 2,
        "subtotal": 6980000,
        "createdAt": "2026-03-15T08:30:00Z"
      }
    ],
    "orderStatusHistories": [
      {
        "id": 101,
        "orderId": 10,
        "status": "PENDING",
        "note": "Đơn hàng đã được tạo thành công bởi khách hàng",
        "createdAt": "2026-03-15T08:30:00Z",
        "changedBy": {
          "id": 1,
          "fullName": "Toàn Trần"
        }
      },
      {
        "id": 102,
        "orderId": 10,
        "status": "CONFIRMED",
        "note": "Hệ thống đã xác nhận đơn hàng",
        "createdAt": "2026-03-15T09:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Bán Hàng"
        }
      },
      {
        "id": 103,
        "orderId": 10,
        "status": "PROCESSING",
        "note": "Kho đang đóng gói hàng hóa",
        "createdAt": "2026-03-15T11:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "NV Kho"
        }
      },
      {
        "id": 104,
        "orderId": 10,
        "status": "SHIPPED",
        "note": "Đã bàn giao cho đơn vị vận chuyển GHN Express",
        "createdAt": "2026-03-16T08:00:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      },
      {
        "id": 105,
        "orderId": 10,
        "status": "DELIVERED",
        "note": "Giao hàng thành công đến tay người nhận",
        "createdAt": "2026-03-17T14:30:00Z",
        "changedBy": {
          "id": 5,
          "fullName": "Bưu tá GHN"
        }
      }
    ],
    "payment": {
      "id": 101,
      "orderId": 10,
      "method": "BANK_TRANSFER",
      "status": "PAID",
      "amount": 7670000,
      "transactionCode": "TXN-99990",
      "paidAt": "2026-03-17T14:30:00Z"
    },
    "shipment": {
      "id": 101,
      "orderId": 10,
      "providerId": 1,
      "trackingNumber": "GHN-SP2026-1088",
      "status": "DELIVERED",
      "shippingFee": 0,
      "estimatedDeliveryDate": "2026-03-18",
      "shippedAt": "2026-03-16T08:00:00Z",
      "deliveredAt": "2026-03-17T14:30:00Z",
      "provider": {
        "id": 1,
        "name": "Giao Hàng Nhanh",
        "code": "GHN",
        "isActive": true
      }
    }
  }
];
export default orders;
