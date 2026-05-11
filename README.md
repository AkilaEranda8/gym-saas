# 🏋️ PowerHouse Gym SaaS

Multi-tenant Gym Management SaaS with **Keycloak Token Introspection** authentication.

---

## Architecture

```
Client (Next.js / React Native)
    │  Bearer Token
    ▼
NGINX Gateway (:80 / :443)
    ├── /api/*     → Spring Boot :9090
    ├── /realms/*  → Keycloak    :8080
    └── /*         → Next.js     :3000
         │
Spring Boot → POST Keycloak /token/introspect
         │       { active, gym_id, roles }
         ▼
TenantContext.setGymId(gym_id)
         │
PostgreSQL (gym_id scoped queries)
```

---

## Quick Start

### 1. Configure environment
```bash
cp .env.example .env
# Edit .env with your secrets
```

### 2. Start all services
```bash
docker-compose up -d
```

### 3. Configure Keycloak
Open http://localhost:8080 and login with `admin / adminpassword`

**Create Realm:**
- Name: `gym-saas`

**Create Client `gym-api`:**
- Client Type: OpenID Connect
- Client Authentication: ON (confidential)
- Service Accounts: ON ← required for introspection
- Valid Redirect URIs: `*`

**Client Secret:** Go to Credentials tab → copy secret → set in `.env` as `KEYCLOAK_CLIENT_SECRET`

**Create Realm Roles:**
- `GYM_OWNER`
- `MANAGER`
- `TRAINER`
- `MEMBER`
- `SUPER_ADMIN`

**Service Account Permissions** (for Keycloak Admin API):
- Client → Service Account Roles → Client Roles → `realm-management`
- Assign: `manage-users`, `view-users`, `assign-roles`

**Custom Claim Mapper** (to include `gym_id` in token):
- Client Scopes → `gym-api-dedicated` → Add Mapper → User Attribute
  - Name: `gym_id`
  - User Attribute: `gym_id`
  - Token Claim Name: `gym_id`
  - Claim JSON Type: String
  - Add to introspection token: ON

**Create Client `gym-app`** (for frontend):
- Client Type: OpenID Connect
- Client Authentication: OFF (public)
- Direct Access Grants: ON
- Standard Flow: ON
- Valid Redirect URIs: `http://localhost:3000/*`
- Web Origins: `http://localhost:3000`

### 4. Register first gym
```bash
curl -X POST http://localhost:9090/api/v1/auth/register-gym \
  -H "Content-Type: application/json" \
  -d '{
    "gymName": "PowerHouse Gym",
    "ownerName": "Kamal Perera",
    "email": "kamal@powerhouse.lk",
    "password": "SecurePass123!"
  }'
```

### 5. Login via Keycloak
```bash
curl -X POST http://localhost:8080/realms/gym-saas/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=gym-app" \
  -d "username=kamal@powerhouse.lk" \
  -d "password=SecurePass123!"
```

### 6. Call API with token
```bash
curl http://localhost:9090/api/v1/members \
  -H "Authorization: Bearer <access_token>"
```

---

## API Endpoints

| Module        | Endpoints                                      | Roles                  |
|---------------|------------------------------------------------|------------------------|
| Auth          | `POST /api/v1/auth/register-gym`               | Public                 |
| Gym           | `GET/PUT /api/v1/gym`                          | GYM_OWNER, MANAGER     |
| Branches      | `CRUD /api/v1/branches`                        | GYM_OWNER, MANAGER     |
| Members       | `CRUD /api/v1/members`                         | GYM_OWNER, MANAGER     |
| Plans         | `CRUD /api/v1/plans`                           | GYM_OWNER, MANAGER     |
| Classes       | `CRUD /api/v1/classes` + `/book`               | All roles              |
| Trainers      | `CRUD /api/v1/trainers` + `/assign`            | GYM_OWNER, MANAGER     |
| Workouts      | `CRUD /api/v1/workouts`                        | TRAINER, MANAGER       |
| Nutrition     | `CRUD /api/v1/nutrition`                       | TRAINER, MANAGER       |
| Shop          | `CRUD /api/v1/shop/products` + `/orders`       | All roles              |
| Lockers       | `CRUD /api/v1/lockers` + `/assign`             | GYM_OWNER, MANAGER     |
| Equipment     | `CRUD /api/v1/equipment` + `/maintenance`      | GYM_OWNER, MANAGER     |
| Billing       | `GET /api/v1/billing/payments`                 | GYM_OWNER, MANAGER     |
| Notifications | `GET/PATCH /api/v1/notifications`              | Authenticated          |
| Reports       | `GET /api/v1/reports/*`                        | GYM_OWNER, MANAGER     |

---

## Tech Stack

| Layer         | Technology                                  |
|---------------|---------------------------------------------|
| Auth          | Keycloak 24 (Token Introspection)           |
| Backend       | Spring Boot 3.2, Java 21                    |
| Database      | PostgreSQL 16 + Flyway migrations           |
| Cache         | Redis 7 (introspection cache 60s TTL)       |
| Messaging     | RabbitMQ 3 (email + push queues)            |
| Frontend      | Next.js 14, TailwindCSS, shadcn/ui          |
| Gateway       | Nginx (rate limiting, CORS, SSL)            |
| Monitoring    | Sentry, Spring Actuator                     |
| Containers    | Docker + Docker Compose                     |

---

## Database Tables (22)

`gyms` · `branches` · `members` · `plans` · `member_plans` ·
`payments` · `fitness_classes` · `class_bookings` · `trainers` ·
`trainer_assignments` · `workout_plans` · `workout_exercises` ·
`nutrition_plans` · `nutrition_items` · `products` · `shop_orders` ·
`order_items` · `lockers` · `locker_assignments` · `equipment` ·
`equipment_maintenance` · `notifications`

---

## Security Flow

```
Every API request:
  1. NGINX → Spring Boot (Bearer token in header)
  2. Spring Security → POST Keycloak /token/introspect
  3. Redis cache check (60s TTL — max 1 call/token/minute)
  4. Keycloak → { active: true, gym_id: "uuid", roles: ["GYM_OWNER"] }
  5. TenantFilter → TenantContext.setGymId(gym_id)
  6. @PreAuthorize("hasRole('GYM_OWNER')") → passes
  7. Service → WHERE gym_id = TenantContext.getGymId()
  8. TenantContext.clear() in finally block
```
