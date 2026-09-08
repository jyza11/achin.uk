# deploy/ — the achin.uk backend box

One instance runs PocketBase behind Caddy. Everything the box needs is in
`cloud-init.yaml`; a lost or reclaimed box is rebuilt from that file plus the
latest backup. Design and roadmap: `../AGENTS.md` › Part 2 › Deployment.

**Nothing in this folder is secret.** The repo is public. Keys, IPs, tokens and
passwords live in your `~/.ssh/config`, the AWS console, Cloudflare, and the
server — never here.

## 1. Before launch (5 min, on your Mac)

1. Make a key for this box only:
   ```bash
   ssh-keygen -t ed25519 -a 64 -f ~/.ssh/achin-api -C achin-api
   ```
   Use a passphrase. Print the public half: `cat ~/.ssh/achin-api.pub`
2. Copy `cloud-init.yaml` somewhere outside the repo and replace
   `REPLACE_WITH_YOUR_PUBLIC_KEY` with that one line. The copy with your key
   is what you paste into AWS; the repo keeps the placeholder.

## 2. Launch parameters (AWS console → EC2 → Launch instance)

| Setting | Value | Why |
|---|---|---|
| Region | `ap-northeast-1` (Tokyo) | ~35 ms from the artist in Taipei |
| AMI | Ubuntu Server **24.04 LTS**, **64-bit (Arm)** | matches the arm64 PocketBase build in cloud-init |
| Instance type | **`t4g.micro`** | 2 vCPU Graviton, 1 GB — enough; 2 GB swap covers bursts |
| Key pair | *Proceed without a key pair* | cloud-init installs your key; the console key is not needed |
| Network → Security group | new, see §3 | |
| Storage | **20 GiB gp3**, encrypted | ~$2/month |
| Advanced → Credit specification | **Standard** | never *Unlimited* — caps burst charges |
| Advanced → User data | paste your edited `cloud-init.yaml` | the whole provision |
| Advanced → IMDSv2 | **Required** | metadata service hardening |

After launch: **Elastic IPs → Allocate → Associate** with the instance. This is
the IP that goes into DNS and `~/.ssh/config`. First boot takes ~3–4 minutes
(package upgrade + Caddy + PocketBase download).

## 3. Security group — the primary firewall

| Type | Port | Source | Note |
|---|---|---|---|
| SSH | 22 | **your current IP/32** | update when your IP changes; never `0.0.0.0/0` |
| HTTP | 80 | Cloudflare IPv4 + IPv6 ranges | ACME challenge + redirect |
| HTTPS | 443 | Cloudflare IPv4 + IPv6 ranges | all real traffic |

Cloudflare's ranges (check <https://www.cloudflare.com/ips/> — they change rarely):

```
173.245.48.0/20  103.21.244.0/22  103.22.200.0/22  103.31.4.0/22
141.101.64.0/18  108.162.192.0/18 190.93.240.0/20  188.114.96.0/20
197.234.240.0/22 198.41.128.0/17  162.158.0.0/15   104.16.0.0/13
104.24.0.0/14    172.64.0.0/13    131.0.72.0/22
2400:cb00::/32   2606:4700::/32   2803:f800::/32   2405:b500::/32
2405:8100::/32   2a06:98c0::/29   2c0f:f248::/32
```

That is 22 inbound rules — under the default limit of 60. **Exception for first
certificate issuance:** Caddy needs Let's Encrypt to reach port 80 *directly*
until the DNS record is proxied. Do §5 step 2 with the record on **DNS only**
(grey cloud), then turn the proxy on. Outbound: allow all (default).

## 4. First login and checks

```
# ~/.ssh/config
Host achin-api
    HostName <ELASTIC_IP>
    User achin
    IdentityFile ~/.ssh/achin-api
    IdentitiesOnly yes
```

```bash
ssh achin-api 'cloud-init status --long; sudo tail -3 /var/log/achin-provision.log; systemctl is-active pocketbase caddy fail2ban docker; sudo ufw status | head -6; free -m | head -2'
```

Expected: `status: done`, `pocketbase health HTTP 200`, four `active`, ufw
`Status: active` with 22/80/443, ~1 GB total with 2 GB swap. If `cloud-init
status` says `error`, read `/var/log/cloud-init-output.log` — the failing
command is the last thing printed.

## 5. After first boot

1. **Push the CMS data** from the repo root (stops the service, copies, restarts):
   ```bash
   ssh achin-api 'sudo systemctl stop pocketbase'
   rsync -az --delete --rsync-path='sudo rsync' pocketbase/pb_migrations/ achin-api:/srv/achin/pb_migrations/
   rsync -az --delete --rsync-path='sudo rsync' pocketbase/pb_hooks/      achin-api:/srv/achin/pb_hooks/
   rsync -az --delete --rsync-path='sudo rsync' pocketbase/pb_data/       achin-api:/srv/achin/pb_data/
   ssh achin-api 'sudo chown -R pocketbase:pocketbase /srv/achin && sudo systemctl start pocketbase && sleep 2 && curl -s http://127.0.0.1:8090/api/health'
   ```
   The dev superuser and the test rows come along; rotate the superuser
   password on the server and delete the test rows before Achin gets access:
   `ssh achin-api 'sudo -u pocketbase /opt/pocketbase/pocketbase superuser upsert <email> <new-password> --dir=/srv/achin/pb_data'`
2. **DNS:** in Cloudflare, `A api` → the Elastic IP, **DNS only** first. Wait
   until `curl -I https://api.achin.uk/api/health` returns 200 (Caddy fetched
   the certificate), then switch the record to **Proxied** and set SSL/TLS mode
   to **Full (strict)**.
3. **Netlify:** environment variable `PUBLIC_PB_URL=https://api.achin.uk` (no
   trailing slash), redeploy, open `/gallery` — paintings should come from the
   CMS, not the bundled fallback.
4. **Backups → Cloudflare R2** (PocketBase dashboard › Settings › Backups):
   S3 endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, region `auto`,
   bucket + access key + secret from your R2 token, **force path-style on**.
   Cron `0 19 * * *` (03:00 Taipei), keep 14. Backups leave AWS on purpose: the
   Free-plan account closes at six months and takes its buckets with it.
5. **Restore drill** (do once, before launch): download a backup zip from the
   dashboard, unzip into a temp `pb_data`, run the local binary against it, open
   `http://127.0.0.1:8090/_/`. If you can see the paintings, the backup works.
6. **Cost guard:** AWS Budgets alarm at $150 of credits. Calendar entry at
   **month 5**: migrate (§7) or *Upgrade Plan* to Paid.

## 6. Day-to-day

- Logs: `ssh achin-api 'sudo journalctl -u pocketbase -n 50'` (Caddy: `-u caddy`).
- Upgrade PocketBase: bump `VERSION` **and** `SHA256` together in the installer
  (values from the release's `checksums.txt`), take a backup, then
  `ssh achin-api 'sudo /usr/local/sbin/install-pocketbase.sh && sudo systemctl restart pocketbase'`.
  Pre-1.0 software: read the changelog first.
- Add a website or service later: one drop-in in `/etc/caddy/sites/<name>.caddy`
  + `sudo systemctl reload caddy`; Docker is already installed for it.
- Security patches install themselves; the box reboots at 20:00 UTC when a
  kernel needs it (a few seconds of downtime, Cloudflare serves cached pages).

## 7. Moving off AWS (month 5, ~1 hour)

Same file, different host: launch any arm64 or amd64 Ubuntu 24.04 VM with this
`cloud-init.yaml` (for amd64 change the installer's ZIP name and SHA256), push
the latest backup into `/srv/achin/pb_data`, point the Cloudflare `A api`
record at the new IP. Nothing in the site changes.
