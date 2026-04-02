package com.edutech.controllers;

import org.springframework.web.bind.annotation.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.InputStream;
import java.util.Map;
import java.util.Scanner;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final String KEY_ID = "rzp_test_SYW156XbFnfQSK";
    private static final String KEY_SECRET = "MIT13xzvtdkirHveMBRcku7G";

    @PostMapping("/create-order")
    public String createOrder(@RequestBody Map<String, Object> body) throws Exception {

        // Amount from frontend (in INR), converted to paise for Razorpay
        int amountInPaise = ((Number) body.getOrDefault("amount", 0)).intValue() * 100;

        URL url = new URL("https://api.razorpay.com/v1/orders");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");

        String auth = KEY_ID + ":" + KEY_SECRET;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        conn.setRequestProperty("Authorization", "Basic " + encodedAuth);
        conn.setDoOutput(true);

        String jsonInput = "{"
                + "\"amount\":" + amountInPaise + ","
                + "\"currency\":\"INR\","
                + "\"receipt\":\"txn_" + System.currentTimeMillis() + "\""
                + "}";

        OutputStream os = conn.getOutputStream();
        os.write(jsonInput.getBytes());
        os.flush();

        InputStream responseStream = conn.getInputStream();
        Scanner scanner = new Scanner(responseStream).useDelimiter("\\A");
        return scanner.hasNext() ? scanner.next() : "{}";
    }

    @PostMapping("/verify")
    public Map<String, String> verifyPayment(@RequestBody Map<String, String> response) {
        try {
            String orderId = response.get("razorpay_order_id");
            String paymentId = response.get("razorpay_payment_id");
            String signature = response.get("razorpay_signature");

            String data = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(KEY_SECRET.getBytes(), "HmacSHA256"));
            byte[] hashBytes = mac.doFinal(data.getBytes());

            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes)
                hex.append(String.format("%02x", b));
            String computed = hex.toString();

            if (computed.equals(signature)) {
                return Map.of("message", "Payment verified successfully!", "status", "SUCCESS");
            } else {
                return Map.of("message", "Payment verification failed.", "status", "FAILED");
            }
        } catch (Exception e) {
            return Map.of("message", "Verification error: " + e.getMessage(), "status", "ERROR");
        }
    }
}
