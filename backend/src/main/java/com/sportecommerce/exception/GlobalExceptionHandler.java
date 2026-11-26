package com.sportecommerce.exception;

import com.sportecommerce.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Bắt AppException tùy biến linh hoạt (tự truyền message và HttpStatus mong muốn)
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(AppException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Bắt lỗi 404: Không tìm thấy tài nguyên
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Bắt lỗi 400: Yêu cầu không hợp lệ / logic nghiệp vụ không đúng
     */
    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ApiResponse<Object>> handleBadRequestException(BadRequestException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Bắt lỗi 400: Dữ liệu validate từ @Valid / @Validated không hợp lệ
     * Format errors thành Map: { "tên_field": "thông báo lỗi" }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Dữ liệu gửi lên không hợp lệ", errors));
    }

    /**
     * Bắt lỗi 403: Không có quyền truy cập
     */
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Bạn không có quyền thực hiện thao tác này"));
    }

    /**
     * Bắt lỗi 401: Chưa đăng nhập hoặc token sai / hết hạn
     */
    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Xác thực thất bại hoặc phiên đăng nhập đã hết hạn"));
    }

    /**
     * Bắt lỗi 413: Tệp tải lên vượt giới hạn spring.servlet.multipart.max-file-size
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error("Tệp tải lên quá lớn (tối đa 2 MB)"));
    }

    /**
     * Bắt lỗi 400: Yêu cầu tải tệp thiếu phần "file" hoặc không đúng dạng multipart
     */
    @ExceptionHandler({MissingServletRequestPartException.class, MultipartException.class})
    public ResponseEntity<ApiResponse<Object>> handleMultipart(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Yêu cầu tải tệp không hợp lệ, vui lòng chọn ảnh và thử lại"));
    }

    /**
     * Bắt lỗi 400: Body JSON sai cú pháp / sai kiểu dữ liệu (vd. ngày sinh "abc"), thiếu tham số, sai kiểu tham số URL
     */
    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class
    })
    public ResponseEntity<ApiResponse<Object>> handleMalformedRequest(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Dữ liệu gửi lên không đúng định dạng"));
    }

    /**
     * Bắt lỗi 405: Sai phương thức HTTP
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error("Phương thức yêu cầu không được hỗ trợ"));
    }

    /**
     * Bắt lỗi 404: Đường dẫn API không tồn tại
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNoResource(NoResourceFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Không tìm thấy đường dẫn yêu cầu"));
    }

    /**
     * Bắt lỗi 409: Vi phạm ràng buộc dữ liệu (trùng email/SĐT do hai request đồng thời, xoá bản ghi đang được tham chiếu...)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Vi phạm ràng buộc dữ liệu: {}", ex.getMostSpecificCause().getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Dữ liệu bị trùng lặp hoặc đang được sử dụng, vui lòng kiểm tra lại"));
    }

    /**
     * Bắt lỗi ngắt kết nối do client chủ động hủy (F5, đóng tab, hủy kết nối socket).
     * Chỉ log ở mức DEBUG/INFO, không in stack trace ERROR 500 làm nhiễu log hệ thống.
     */
    @ExceptionHandler({
            org.springframework.web.context.request.async.AsyncRequestNotUsableException.class,
            org.apache.catalina.connector.ClientAbortException.class
    })
    public ResponseEntity<Void> handleClientAbort(Exception ex) {
        log.debug("Client đã ngắt kết nối trước khi response hoàn tất: {} - {}", ex.getClass().getSimpleName(), ex.getMessage());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(java.io.IOException.class)
    public ResponseEntity<?> handleIOException(java.io.IOException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "";
        if (msg.contains("aborted by the software") || msg.contains("Broken pipe") || msg.contains("Connection reset by peer")) {
            log.debug("Client đã ngắt kết nối socket IO: {}", msg);
            return ResponseEntity.noContent().build();
        }
        log.error("Lỗi IO hệ thống: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Lỗi xuất nhập dữ liệu, vui lòng thử lại sau"));
    }

    /**
     * Bắt lỗi 500: Tất cả các lỗi hệ thống không mong muốn còn lại.
     * Ghi log đầy đủ stacktrace ở server, KHÔNG trả chi tiết lỗi nội bộ về cho client.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(Exception ex) {
        log.error("Lỗi hệ thống không mong muốn", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Đã xảy ra lỗi hệ thống, vui lòng thử lại sau"));
    }
}
