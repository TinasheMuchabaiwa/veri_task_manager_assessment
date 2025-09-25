package com.veri.taskmanager.util;

import com.veri.taskmanager.dto.StandardResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

public class ResponseUtil {

    public static <T> ResponseEntity<StandardResponse<T>> success(String message, T data) {
        StandardResponse<T> response = StandardResponse.success(message, data);
        return ResponseEntity.ok(response);
    }

    public static <T> ResponseEntity<StandardResponse<T>> created(String message, T data, Object resourceId) {
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(resourceId)
                .toUri();

        StandardResponse<T> response = StandardResponse.created(message, data, location.toString());

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(location);
        headers.set("X-Resource-Created", "true");

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .headers(headers)
                .body(response);
    }

    public static <T> ResponseEntity<StandardResponse<T>> noContent(String message) {
        StandardResponse<T> response = StandardResponse.success(message, null);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Operation", "delete");

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .headers(headers)
                .body(response);
    }

    public static <T> ResponseEntity<StandardResponse<T>> notFound(String message) {
        StandardResponse<T> response = StandardResponse.error(message);
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    public static <T> ResponseEntity<StandardResponse<T>> badRequest(String message) {
        StandardResponse<T> response = StandardResponse.error(message);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    public static <T> ResponseEntity<StandardResponse<T>> unauthorized(String message) {
        StandardResponse<T> response = StandardResponse.error(message);
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    public static <T> ResponseEntity<StandardResponse<T>> withPagination(String message, T data,
            int page, int size, long totalElements, int totalPages, boolean first, boolean last) {

        StandardResponse<T> response = StandardResponse.success(message, data);
        response.setPagination(new StandardResponse.PaginationMeta(page, size, totalElements, totalPages, first, last));
        response.setCount(data instanceof java.util.Collection ? ((java.util.Collection<?>) data).size() : 1);

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Total-Count", String.valueOf(totalElements));
        headers.set("X-Page", String.valueOf(page));
        headers.set("X-Page-Size", String.valueOf(size));
        headers.set("X-Total-Pages", String.valueOf(totalPages));

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(response);
    }
}