// Dữ liệu Mock tĩnh bám sát Entity Java
export const notifications = [
  {
    "id": 1,
    "userId": 1,
    "type": "ORDER_UPDATE",
    "title": "Đơn hàng đã được giao",
    "content": "Đơn hàng #12345 của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại Sàn Nhà!",
    "referenceId": 12345,
    "isRead": false,
    "createdAt": "2026-06-10T08:30:00Z"
  },
  {
    "id": 2,
    "userId": 1,
    "type": "PROMOTION",
    "title": "Khuyến mãi tháng 6",
    "content": "Giảm giá 15% cho tất cả giày thể thao. Nhập mã GIAM15PHANTRAM ngay!",
    "referenceId": null,
    "isRead": true,
    "createdAt": "2026-06-01T00:00:00Z"
  },
  {
    "id": 3,
    "userId": 1,
    "type": "REVIEW_REPLY",
    "title": "Phản hồi đánh giá",
    "content": "Cảm ơn bạn đã đánh giá sản phẩm Vợt cầu lông Yonex. Chúng tôi rất vui vì bạn hài lòng.",
    "referenceId": 678,
    "isRead": false,
    "createdAt": "2026-06-05T14:20:00Z"
  },
  {
    "id": 4,
    "userId": 1,
    "type": "SYSTEM",
    "title": "Bảo trì hệ thống",
    "content": "Hệ thống sẽ bảo trì từ 2h-4h sáng ngày 15/06/2026. Mong bạn thông cảm.",
    "referenceId": null,
    "isRead": true,
    "createdAt": "2026-06-12T09:00:00Z"
  },
  {
    "id": 5,
    "userId": 1,
    "type": "ORDER_UPDATE",
    "title": "Đơn hàng đang vận chuyển",
    "content": "Đơn hàng #12346 đang trên đường giao đến bạn. Dự kiến giao trong 2 ngày tới.",
    "referenceId": 12346,
    "isRead": false,
    "createdAt": "2026-06-11T10:15:00Z"
  },
  {
    "id": 6,
    "userId": 1,
    "type": "PROMOTION",
    "title": "Mã giảm giá mới",
    "content": "Bạn nhận được mã NEWBIE50K giảm 50k cho đơn hàng từ 300k. Sử dụng ngay!",
    "referenceId": null,
    "isRead": true,
    "createdAt": "2026-06-08T16:45:00Z"
  },
  {
    "id": 7,
    "userId": 1,
    "type": "REVIEW_REPLY",
    "title": "Phản hồi đánh giá",
    "content": "Cảm ơn bạn đã phản hồi về chất lượng bóng đá. Chúng tôi sẽ cải thiện.",
    "referenceId": 679,
    "isRead": true,
    "createdAt": "2026-06-07T11:30:00Z"
  },
  {
    "id": 8,
    "userId": 1,
    "type": "SYSTEM",
    "title": "Cập nhật chính sách",
    "content": "Chính sách đổi trả đã được cập nhật từ 01/06/2026. Vui lòng xem chi tiết trên website.",
    "referenceId": null,
    "isRead": false,
    "createdAt": "2026-06-01T08:00:00Z"
  }
];
export default notifications;
