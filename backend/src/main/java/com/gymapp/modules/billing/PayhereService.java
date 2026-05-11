package com.gymapp.modules.billing;

import com.gymapp.config.PayhereProperties;
import com.gymapp.modules.billing.dto.InitiatePayhereRequest;
import com.gymapp.modules.billing.dto.PayhereInitDTO;
import com.gymapp.modules.billing.dto.PayhereNotifyRequest;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayhereService {

    private final PayhereProperties config;
    private final PaymentRepository paymentRepo;
    private final PayhereTransactionRepository txnRepo;
    private final MemberRepository memberRepo;
    private final InvoiceService invoiceService;

    public PayhereInitDTO initiatePayment(InitiatePayhereRequest req) {
        UUID gymId = TenantContext.getGymId();
        Member member = memberRepo.findByIdAndGymId(UUID.fromString(req.memberId()), gymId)
                .orElseThrow(() -> new NoSuchElementException("Member not found"));

        String orderId = "ORD-" + gymId.toString().substring(0, 8).toUpperCase()
                + "-" + System.currentTimeMillis();
        String amount = String.format("%.2f", req.amountLkr() / 100.0);
        String currency = "LKR";
        String hash = generateHash(config.getMerchantId(), orderId, amount, currency);

        String checkoutUrl = config.isSandbox()
                ? (config.getSandboxUrl() != null ? config.getSandboxUrl() : "https://sandbox.payhere.lk/pay/checkout")
                : (config.getCheckoutUrl() != null ? config.getCheckoutUrl() : "https://www.payhere.lk/pay/checkout");

        return new PayhereInitDTO(
                config.getMerchantId(), orderId, amount, currency,
                member.getFirstName(), member.getLastName(),
                member.getEmail(), member.getPhone() != null ? member.getPhone() : "",
                member.getAddress() != null ? member.getAddress() : "", "Colombo", "Sri Lanka",
                req.description() != null ? req.description() : req.paymentType().name(),
                config.getReturnUrl(), config.getCancelUrl(), config.getNotifyUrl(),
                hash, checkoutUrl);
    }

    @Transactional
    public void handleNotification(PayhereNotifyRequest notify) {
        if (!verifySignature(notify)) {
            log.warn("PayHere signature mismatch for order: {}", notify.getOrderId());
            throw new IllegalArgumentException("Invalid PayHere signature");
        }

        PayhereTransaction txn = txnRepo.findByOrderId(notify.getOrderId()).orElse(new PayhereTransaction());
        txn.setGymId(extractGymIdFromOrder(notify.getOrderId()));
        txn.setOrderId(notify.getOrderId());
        txn.setPayhereAmount(new BigDecimal(notify.getPayhereAmount()));
        txn.setPayhereCurrency(notify.getPayhereCurrency());
        txn.setStatusCode(String.valueOf(notify.getStatusCode()));
        txn.setStatusMessage(notify.getStatusMessage());
        txn.setMethod(notify.getMethod());
        txn.setCardHolder(notify.getCardHolderName());
        txn.setCardNo(notify.getCardNo());
        txn.setVerified(true);
        txn.setReceivedAt(LocalDateTime.now());

        Payment payment = paymentRepo.findByPayhereOrderId(notify.getOrderId()).orElse(null);
        if (payment != null) {
            txn.setPaymentId(payment.getId());
            switch (notify.getStatusCode()) {
                case 2  -> { payment.setStatus(PaymentStatus.PAID);   payment.setPaidAt(LocalDateTime.now()); }
                case 0  -> payment.setStatus(PaymentStatus.PENDING);
                case -1, -2 -> payment.setStatus(PaymentStatus.FAILED);
                case -3 -> payment.setStatus(PaymentStatus.PENDING);
            }
            payment.setPayhereStatus(notify.getStatusMessage());
            payment = paymentRepo.save(payment);

            if (payment.getStatus() == PaymentStatus.PAID) {
                Member member = memberRepo.findById(payment.getMemberId()).orElse(null);
                if (member != null) invoiceService.generateForPayment(payment, member);
            }
        }

        txnRepo.save(txn);
        log.info("PayHere notification processed — order={}, status={}", notify.getOrderId(), notify.getStatusCode());
    }

    private String generateHash(String merchantId, String orderId, String amount, String currency) {
        String secret = config.getMerchantSecret();
        String md5Secret = DigestUtils.md5Hex(secret).toUpperCase();
        return DigestUtils.md5Hex(merchantId + orderId + amount + currency + md5Secret).toUpperCase();
    }

    private boolean verifySignature(PayhereNotifyRequest notify) {
        String secret = config.getMerchantSecret();
        if (secret == null || secret.isBlank()) return true;
        String localMd5Secret = DigestUtils.md5Hex(secret).toUpperCase();
        String expected = DigestUtils.md5Hex(
                config.getMerchantId() + notify.getOrderId() + notify.getPayhereAmount()
                + notify.getPayhereCurrency() + notify.getStatusCode() + localMd5Secret
        ).toUpperCase();
        return expected.equals(notify.getMd5sig());
    }

    private UUID extractGymIdFromOrder(String orderId) {
        try {
            String[] parts = orderId.split("-");
            return UUID.fromString(parts[1] + "-" + parts[2] + "-" + parts[3] + "-" + parts[4] + "-" + parts[5]);
        } catch (Exception e) {
            return TenantContext.getGymId();
        }
    }
}
