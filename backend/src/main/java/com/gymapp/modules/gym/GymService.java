package com.gymapp.modules.gym;

import com.gymapp.modules.gym.dto.GymResponse;
import com.gymapp.modules.gym.dto.UpdateGymRequest;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GymService {

    private final GymRepository gymRepository;
    private final CurrentUser currentUser;

    public GymResponse getMyGym() {
        UUID gymId = TenantContext.getGymId();
        Gym gym = gymRepository.findById(gymId)
            .orElseThrow(() -> new NoSuchElementException("Gym not found"));
        return GymResponse.from(gym);
    }

    @Transactional
    public GymResponse updateGym(UpdateGymRequest request) {
        UUID gymId = TenantContext.getGymId();
        Gym gym = gymRepository.findById(gymId)
            .orElseThrow(() -> new NoSuchElementException("Gym not found"));

        if (request.name()    != null) gym.setName(request.name());
        if (request.phone()   != null) gym.setPhone(request.phone());
        if (request.address() != null) gym.setAddress(request.address());
        if (request.logoUrl() != null) gym.setLogoUrl(request.logoUrl());

        return GymResponse.from(gymRepository.save(gym));
    }
}
