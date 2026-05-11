"""
PowerHouse Gym SaaS — Server Deployment Script
Usage: python deploy.py
Requires: pip install paramiko
"""

import paramiko
import sys
import time

# ─── Server Config ────────────────────────────────────────
SERVER_HOST  = "49.12.207.238"
SERVER_USER  = "root"
SERVER_PORT  = 22
APP_DIR      = "/opt/gymapp"
GIT_REPO     = "https://github.com/AkilaEranda8/gym-saas.git"
OLD_PASSWORD = "#Wu3|9@xwE8u"
NEW_PASSWORD = "GymSaaS@2026!"   # ← server ලෙ set වෙන new password
SSL_EMAIL    = "admin@hexalyte.com"
SSL_DOMAINS  = "gym.hexalyte.com,api.gym.hexalyte.com,rabbitmq.gym.hexalyte.com"
# ──────────────────────────────────────────────────────────

DEPLOY_COMMANDS = [
    # Install Docker & Git
    "apt-get update -y",
    "apt-get install -y git curl certbot",
    "curl -fsSL https://get.docker.com | sh",
    "apt-get install -y docker-compose-plugin",

    # Clone repo (skip if already exists)
    f"[ -d {APP_DIR} ] && echo 'Repo already cloned' || git clone {GIT_REPO} {APP_DIR}",

    # Pull latest changes
    f"git -C {APP_DIR} pull origin main",

    # Copy .env if not already present
    f"[ -f {APP_DIR}/.env ] && echo '.env exists, skipping' || cp {APP_DIR}/.env.production {APP_DIR}/.env",

    # Firewall
    "ufw allow 80 && ufw allow 443 && echo 'y' | ufw enable || true",

    # ── SSL: get certs before nginx starts (standalone mode) ──
    # Stop nginx if already running
    f"docker compose -f {APP_DIR}/docker-compose.yml stop gym-nginx 2>/dev/null || true",

    # Get Let's Encrypt certificate (all 3 domains in one cert)
    f"certbot certonly --standalone --non-interactive --agree-tos "
    f"-m {SSL_EMAIL} "
    f"-d gym.hexalyte.com -d api.gym.hexalyte.com -d rabbitmq.gym.hexalyte.com "
    f"--cert-name gym.hexalyte.com || echo 'Cert already exists or failed — check manually'",

    # Build & start all containers (nginx now has certs)
    f"docker compose -f {APP_DIR}/docker-compose.yml up -d --build",

    # Auto-renew cron (runs twice daily)
    "(crontab -l 2>/dev/null; echo '0 3 * * * certbot renew --quiet && "
    f"docker compose -f {APP_DIR}/docker-compose.yml restart gym-nginx') | crontab -",

    # Show running containers
    "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'",
]


def run_command(client, cmd, timeout=300):
    print(f"\n\033[94m▶ {cmd}\033[0m")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    for line in iter(stdout.readline, ""):
        print(f"  {line}", end="")
    exit_code = stdout.channel.recv_exit_status()
    err = stderr.read().decode().strip()
    if err:
        print(f"\033[93m  WARN: {err}\033[0m")
    if exit_code != 0:
        print(f"\033[91m  ✗ Command failed (exit {exit_code})\033[0m")
    else:
        print(f"\033[92m  ✓ Done\033[0m")
    return exit_code


def change_password(host, port, user, old_pw, new_pw):
    """Change password using chpasswd (non-interactive, works as root)"""
    print("  Handling forced password change...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=old_pw, timeout=15)

    cmd = f"echo '{user}:{new_pw}' | chpasswd"
    stdin, stdout, stderr = client.exec_command(cmd)
    stdout.channel.recv_exit_status()
    err = stderr.read().decode().strip()
    client.close()

    if err:
        print(f"\033[93m  chpasswd warn: {err}\033[0m")
    print("\033[92m  ✓ Password changed to NEW_PASSWORD\033[0m")


def connect(password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(SERVER_HOST, port=SERVER_PORT, username=SERVER_USER, password=password, timeout=15)
    return client


def main():
    print("=" * 55)
    print("  PowerHouse Gym SaaS — Deployment Script")
    print("=" * 55)
    print(f"  Host : {SERVER_HOST}")
    print(f"  User : {SERVER_USER}")
    print(f"  Dir  : {APP_DIR}")
    print("=" * 55)

    # Step 1 — try connecting with new password first (already changed?)
    print(f"\nConnecting to {SERVER_HOST}...")
    client = None
    try:
        client = connect(NEW_PASSWORD)
        print("\033[92m✓ Connected with new password!\033[0m\n")
    except Exception:
        pass

    # Step 2 — if new password failed, try old password then force-change it
    if client is None:
        try:
            client = connect(OLD_PASSWORD)
            print("\033[93m⚠ Connected with old password — changing password...\033[0m")
            client.close()
            change_password(SERVER_HOST, SERVER_PORT, SERVER_USER, OLD_PASSWORD, NEW_PASSWORD)
            time.sleep(2)
            client = connect(NEW_PASSWORD)
            print("\033[92m✓ Reconnected with new password!\033[0m\n")
        except Exception as e:
            print(f"\033[91m✗ Connection failed: {e}\033[0m")
            sys.exit(1)

    failed = 0
    for cmd in DEPLOY_COMMANDS:
        code = run_command(client, cmd)
        if code != 0:
            failed += 1
        time.sleep(1)

    client.close()

    print("\n" + "=" * 55)
    if failed == 0:
        print("\033[92m  ✓ Deployment complete!\033[0m")
        print(f"\n  Frontend  → http://gym.hexalyte.com")
        print(f"  API       → http://api.gym.hexalyte.com")
        print(f"  RabbitMQ  → http://rabbitmq.gym.hexalyte.com")
        print(f"  Keycloak  → https://auth.hexalyte.com")
    else:
        print(f"\033[91m  ✗ Deployment finished with {failed} error(s)\033[0m")
        print("  Check output above and fix issues in .env on the server.")
    print("=" * 55)


if __name__ == "__main__":
    main()
