package com.gymapp.modules.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentReminderRepository extends JpaRepository<PaymentReminder, UUID> {

    List<PaymentReminder> findAllByGymIdAndMemberId(UUID gymId, UUID memberId);

    List<PaymentReminder> findAllByPaymentId(UUID paymentId);
}
