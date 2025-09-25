package com.veri.taskmanager.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StandardResponse<T> {
    private String status;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String path;
    private Integer count;
    private PaginationMeta pagination;

    public StandardResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public StandardResponse(String status, String message) {
        this();
        this.status = status;
        this.message = message;
    }

    public StandardResponse(String status, String message, T data) {
        this(status, message);
        this.data = data;
    }

    public StandardResponse(String status, String message, T data, String path) {
        this(status, message, data);
        this.path = path;
    }

    public static <T> StandardResponse<T> success(String message, T data) {
        return new StandardResponse<>("success", message, data);
    }

    public static <T> StandardResponse<T> success(String message, T data, String path) {
        return new StandardResponse<>("success", message, data, path);
    }

    public static <T> StandardResponse<T> created(String message, T data, String location) {
        StandardResponse<T> response = new StandardResponse<>("created", message, data);
        response.setPath(location);
        return response;
    }

    public static <T> StandardResponse<T> error(String message) {
        return new StandardResponse<>("error", message);
    }

    public static <T> StandardResponse<T> error(String message, String path) {
        return new StandardResponse<>("error", message, null, path);
    }

    @Data
    public static class PaginationMeta {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;

        public PaginationMeta(int page, int size, long totalElements, int totalPages, boolean first, boolean last) {
            this.page = page;
            this.size = size;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.first = first;
            this.last = last;
        }
    }
}