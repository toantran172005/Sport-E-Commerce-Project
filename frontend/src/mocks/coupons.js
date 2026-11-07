// Dữ liệu Mock tĩnh bám sát Entity Java
export const coupons = [
  {
    "code": "FREESHIP",
    "discountType": "FREE_SHIPPING",
    "discountValue": 0,
    "minOrderAmount": 200000,
    "maxDiscountAmount": 30000,
    "usageLimit": 1000,
    "usedCount": 150,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "isActive": true
  },
  {
    "code": "SPORT2026",
    "discountType": "PERCENTAGE",
    "discountValue": 10,
    "minOrderAmount": 500000,
    "maxDiscountAmount": 100000,
    "usageLimit": 500,
    "usedCount": 80,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "isActive": true
  },
  {
    "code": "YONEX100K",
    "discountType": "FIXED_AMOUNT",
    "discountValue": 100000,
    "minOrderAmount": 1000000,
    "maxDiscountAmount": null,
    "usageLimit": 200,
    "usedCount": 30,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "isActive": true
  },
  {
    "code": "GIAM15PHANTRAM",
    "discountType": "PERCENTAGE",
    "discountValue": 15,
    "minOrderAmount": 800000,
    "maxDiscountAmount": 150000,
    "usageLimit": 300,
    "usedCount": 45,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "isActive": true
  },
  {
    "code": "NEWBIE50K",
    "discountType": "FIXED_AMOUNT",
    "discountValue": 50000,
    "minOrderAmount": 300000,
    "maxDiscountAmount": null,
    "usageLimit": 1000,
    "usedCount": 200,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "isActive": true
  },
  {
    "code": "VIPSPORT",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "minOrderAmount": 1500000,
    "maxDiscountAmount": 300000,
    "usageLimit": 100,
    "usedCount": 10,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "isActive": true
  }
];
export default coupons;
