package com.portfolio.cms.service;

import com.portfolio.cms.dto.LoginRequest;
import com.portfolio.cms.dto.RefreshTokenRequest;
import com.portfolio.cms.dto.TokenResponse;
import com.portfolio.cms.entity.Admin;
import com.portfolio.cms.entity.RefreshToken;
import com.portfolio.cms.exception.ApiException;
import com.portfolio.cms.repository.AdminRepository;
import com.portfolio.cms.repository.RefreshTokenRepository;
import com.portfolio.cms.security.JwtTokenProvider;
import com.portfolio.cms.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.refresh-expiration-in-ms:1209600000}") // Default 14 days
    private long refreshExpirationInMs;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
                       AdminRepository adminRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       JwtTokenProvider tokenProvider,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.adminRepository = adminRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TokenResponse login(LoginRequest loginRequest) {
        // Find admin first to verify role constraint (Only active ADMIN can login)
        Admin admin = adminRepository.findByUsername(loginRequest.getUsernameOrEmail())
                .or(() -> adminRepository.findByEmail(loginRequest.getUsernameOrEmail()))
                .orElseThrow(() -> new ApiException("Invalid email/username or password", HttpStatus.UNAUTHORIZED));

        // Perform authentication via security manager (validates BCrypt hashes)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate Access Token (JWT)
        String accessToken = tokenProvider.generateToken(authentication);

        // Create or Update Refresh Token
        RefreshToken refreshToken = createOrUpdateRefreshToken(admin);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .expiresInMs(tokenProvider.getExpirationInMs())
                .username(admin.getUsername())
                .role("ROLE_ADMIN")
                .build();
    }

    @Transactional
    public TokenResponse refreshAccessToken(RefreshTokenRequest request) {
        String tokenValue = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new ApiException("Refresh token not found", HttpStatus.UNAUTHORIZED));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new ApiException("Refresh token expired. Please perform login again.", HttpStatus.UNAUTHORIZED);
        }

        Admin admin = refreshToken.getAdmin();
        String newAccessToken = tokenProvider.generateTokenFromUserId(admin.getId());

        // Rotate Refresh Token for security (optional but highly recommended)
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationInMs));
        refreshTokenRepository.save(refreshToken);

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .expiresInMs(tokenProvider.getExpirationInMs())
                .username(admin.getUsername())
                .role("ROLE_ADMIN")
                .build();
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(refreshTokenRepository::delete);
        SecurityContextHolder.clearContext();
    }

    private RefreshToken createOrUpdateRefreshToken(Admin admin) {
        RefreshToken refreshToken = refreshTokenRepository.findByAdmin(admin)
                .orElseGet(() -> RefreshToken.builder().admin(admin).build());

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpirationInMs));

        return refreshTokenRepository.save(refreshToken);
    }
}
