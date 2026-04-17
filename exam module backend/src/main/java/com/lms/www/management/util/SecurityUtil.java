package com.lms.www.management.util;

import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Component("managementSecurityUtil")
public class SecurityUtil {

    private final JwtTokenParser jwtTokenParser;

    public SecurityUtil(JwtTokenParser jwtTokenParser) {
        this.jwtTokenParser = jwtTokenParser;
    }

    /**
     * Extracts the instructor/userId from the JWT token in the current HTTP request.
     * @return the logged-in user's ID
     */
    public Long getInstructorId() {
        return getUserId();
    }

    /**
     * Extracts the user ID from the JWT token in the current HTTP request.
     * @return the logged-in user's ID
     */
    public Long getUserId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Long userId = jwtTokenParser.getUserIdFromToken(token);
                if (userId != null) {
                    return userId;
                }
            }
        }
        // Fallback for development if no token is provided
        return 1L;
    }
}
