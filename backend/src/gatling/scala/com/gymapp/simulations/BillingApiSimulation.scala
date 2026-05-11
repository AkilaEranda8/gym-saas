package com.gymapp.simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class BillingApiSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl(System.getProperty("baseUrl", "http://localhost:9090"))
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .header("Authorization", s"Bearer ${System.getProperty("token", "test-token")}")
    .header("X-Branch-ID", System.getProperty("branchId", "00000000-0000-0000-0000-000000000001"))

  val discountCodes = Array("SAVE10", "PROMO20", "WELCOME5", "LOYALTY15")
    .map(c => Map("code" -> c))
    .toSeq
    .circular

  val paymentsList = scenario("List Payments")
    .exec(
      http("GET payments page 0")
        .get("/api/v1/billing/payments?page=0&size=20")
        .check(status.is(200))
        .check(jsonPath("$.data.content").exists)
    )
    .pause(500.milliseconds)
    .exec(
      http("GET payments page 1")
        .get("/api/v1/billing/payments?page=1&size=20")
        .check(status.in(200, 204))
    )

  val billingSummary = scenario("Billing Summary")
    .exec(
      http("GET billing summary current year")
        .get("/api/v1/billing/payments/summary?from=2025-01-01&to=2025-12-31")
        .check(status.is(200))
        .check(jsonPath("$.data.totalRevenueLkr").ofType[Double].exists)
    )
    .pause(1)
    .exec(
      http("GET monthly revenue")
        .get("/api/v1/billing/payments/monthly-revenue")
        .check(status.is(200))
    )
    .pause(500.milliseconds)
    .exec(
      http("GET revenue by type")
        .get("/api/v1/billing/payments/revenue-by-type")
        .check(status.is(200))
    )

  val discountValidation = scenario("Validate Discounts")
    .feed(discountCodes)
    .exec(
      http("POST validate discount")
        .post("/api/v1/billing/discounts/validate")
        .body(StringBody("""{"code":"${code}","amountLkr":350000}"""))
        .check(status.in(200, 400, 404))
    )

  setUp(
    paymentsList.inject(
      atOnceUsers(3),
      rampUsers(15).during(20.seconds)
    ),
    billingSummary.inject(
      nothingFor(5.seconds),
      constantUsersPerSec(3).during(30.seconds)
    ),
    discountValidation.inject(
      nothingFor(8.seconds),
      rampUsers(10).during(15.seconds)
    )
  )
    .protocols(httpProtocol)
    .assertions(
      global.responseTime.max.lt(4000),
      global.responseTime.percentile(95).lt(2000),
      global.successfulRequests.percent.gte(98)
    )
}
