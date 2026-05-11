package com.gymapp.simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class MemberApiSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl(System.getProperty("baseUrl", "http://localhost:9090"))
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .header("Authorization", s"Bearer ${System.getProperty("token", "test-token")}")
    .header("X-Branch-ID", System.getProperty("branchId", "00000000-0000-0000-0000-000000000001"))

  val gymId    = System.getProperty("gymId",    "00000000-0000-0000-0000-000000000001")
  val branchId = System.getProperty("branchId", "00000000-0000-0000-0000-000000000001")

  val listMembers = scenario("List Members")
    .exec(
      http("GET /api/v1/members")
        .get("/api/v1/members?page=0&size=20")
        .check(status.is(200))
        .check(jsonPath("$.data.content").exists)
    )
    .pause(1)
    .exec(
      http("GET /api/v1/members/stats")
        .get("/api/v1/members/stats")
        .check(status.is(200))
        .check(jsonPath("$.data.totalMembers").exists)
    )

  val searchMembers = scenario("Search Members")
    .exec(
      http("GET /api/v1/members?search=Kamal")
        .get("/api/v1/members?page=0&size=20&search=Kamal")
        .check(status.is(200))
    )
    .pause(500.milliseconds)
    .exec(
      http("GET /api/v1/members?status=ACTIVE")
        .get("/api/v1/members?page=0&size=20&status=ACTIVE")
        .check(status.is(200))
    )

  val billingFlow = scenario("Billing Summary")
    .exec(
      http("GET billing summary")
        .get("/api/v1/billing/payments/summary?from=2025-01-01&to=2025-12-31")
        .check(status.is(200))
        .check(jsonPath("$.data.totalRevenueLkr").exists)
    )
    .pause(1)
    .exec(
      http("GET payments list")
        .get("/api/v1/billing/payments?page=0&size=20")
        .check(status.is(200))
    )

  setUp(
    listMembers.inject(
      atOnceUsers(5),
      rampUsers(20).during(30.seconds)
    ),
    searchMembers.inject(
      nothingFor(5.seconds),
      rampUsers(10).during(20.seconds)
    ),
    billingFlow.inject(
      nothingFor(10.seconds),
      constantUsersPerSec(2).during(30.seconds)
    )
  )
    .protocols(httpProtocol)
    .assertions(
      global.responseTime.max.lt(3000),
      global.responseTime.percentile(95).lt(1500),
      global.successfulRequests.percent.gte(99)
    )
}
