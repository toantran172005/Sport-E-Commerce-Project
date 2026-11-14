// true  => dùng dữ liệu giả lập trong src/mocks (không cần backend)
// false => gọi Spring Boot API thật (VITE_API_URL, mặc định http://localhost:8080/api)
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
