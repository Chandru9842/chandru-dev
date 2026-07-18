package com.portfolio.cms.repository;

import com.portfolio.cms.entity.Admin;
import com.portfolio.cms.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByAdmin(Admin admin);
    
    @Modifying
    int deleteByAdmin(Admin admin);
}
