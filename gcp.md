# GCP Next Steps – Cloud Build & Cloud Run

Use this guide to run CI (build) with **Cloud Build** and CD (deploy) with **Cloud Run**. Per guardrails: use **GCP-created domains** (Cloud Run `*.run.app` URLs).

---

## 1. Prerequisites

- A [Google Cloud](https://cloud.google.com) account and a project.
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and logged in:
  ```bash
  gcloud auth login
  gcloud config set project YOUR_PROJECT_ID
  ```

---

## 2. Enable required APIs

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 3. Create an Artifact Registry repository (for Docker images)

```bash
# Replace REGION (e.g. us-central1) and REPO_NAME as needed
gcloud artifacts repositories create docker-repo \
  --repository-format=docker \
  --location=REGION \
  --description="Study Jam Week 2 images"
```

Note the full image path: `REGION-docker.pkg.dev/YOUR_PROJECT_ID/docker-repo/IMAGE_NAME`.

---

## 4. Configure Cloud Build

### 4.1 Grant Cloud Build access to push images

```bash
# Allow Cloud Build to push to Artifact Registry
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role=roles/artifactregistry.writer
```

Find your project number: `gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"`.

### 4.2 Set Cloud Build substitutions

In the Cloud Console or when creating a trigger, set (or override in `cloudbuild.yaml`):

| Variable     | Example / description |
|-------------|------------------------|
| `_API_IMAGE` | `us-central1-docker.pkg.dev/YOUR_PROJECT_ID/docker-repo/api` |
| `_WEB_IMAGE` | `us-central1-docker.pkg.dev/YOUR_PROJECT_ID/docker-repo/web` |
| `_API_URL`   | Full API URL for the frontend (e.g. `https://api-xxx.run.app`) – set **after** first API deploy |
| `_REGION`    | e.g. `us-central1` |

### 4.3 Enable push steps in `cloudbuild.yaml`

Edit `cloudbuild.yaml` and:

1. Uncomment the two **Push** steps (push API and Web images).
2. Set `_REGISTRY` (or use full image names in `_API_IMAGE` / `_WEB_IMAGE` so push uses the same path).

Example if using a single registry prefix:

```yaml
substitutions:
  _REGISTRY: us-central1-docker.pkg.dev/YOUR_PROJECT_ID/docker-repo
  _API_IMAGE: ${_REGISTRY}/api
  _WEB_IMAGE: ${_REGISTRY}/web
  _API_URL: 'https://api-xxxxx-uc.a.run.app'   # Set after first API deploy
```

---

## 5. Run the build (CI)

### Option A: Manual run

From the repo root:

```bash
gcloud builds submit --config=cloudbuild.yaml .
```

### Option B: Trigger on push

1. In **Cloud Console** → **Cloud Build** → **Triggers** → **Create trigger**.
2. Connect your repo (GitHub, Cloud Source Repositories, etc.).
3. Set **Configuration** to “Cloud Build configuration file” and path `cloudbuild.yaml`.
4. Add substitution variables: `_API_IMAGE`, `_WEB_IMAGE`, `_API_URL` (and `_REGISTRY` if used).
5. Save; future pushes will run the build.

---

## 6. Deploy API to Cloud Run (CD)

After the first successful build (so the API image exists):

```bash
# Replace REGION, PROJECT_ID, REPO, and image tag (e.g. SHORT_SHA from build)
gcloud run deploy api \
  --image=REGION-docker.pkg.dev/PROJECT_ID/docker-repo/api:SHORT_SHA \
  --region=REGION \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

- **Database:** For demo, PostgreSQL can stay in a Docker container with public access, or use [Cloud SQL](https://cloud.google.com/sql/docs/postgres). Set `DATABASE_URL` accordingly.
- Note the **Service URL** (e.g. `https://api-xxxxx-uc.a.run.app`) – this is your GCP-created API domain. Use it as `_API_URL` for the web app build.

---

## 7. Deploy Web to Cloud Run (CD)

Build the web image with the API URL so the frontend calls the correct backend:

1. Set `_API_URL` in Cloud Build to your API Cloud Run URL (e.g. `https://api-xxxxx-uc.a.run.app`).
2. Run the build again (or trigger) so the web image is built with that `VITE_API_URL`.
3. Deploy:

```bash
gcloud run deploy web \
  --image=REGION-docker.pkg.dev/PROJECT_ID/docker-repo/web:SHORT_SHA \
  --region=REGION \
  --platform=managed \
  --allow-unauthenticated
```

Cloud Run will assign a URL like `https://web-xxxxx-uc.a.run.app` (GCP-created domain).

---

## 8. Summary checklist

- [ ] GCP project created; `gcloud` configured.
- [ ] APIs enabled: Cloud Build, Cloud Run, Artifact Registry.
- [ ] Artifact Registry repository created; Cloud Build service account has `roles/artifactregistry.writer`.
- [ ] `cloudbuild.yaml` push steps uncommented; `_API_IMAGE`, `_WEB_IMAGE`, `_REGISTRY` (if used) set.
- [ ] First build run (manual or trigger); API image pushed.
- [ ] API deployed to Cloud Run with `DATABASE_URL`; note API URL.
- [ ] Set `_API_URL` to API Cloud Run URL; rebuild so web image has correct backend URL.
- [ ] Web deployed to Cloud Run.
- [ ] Test: open web URL → Register → Login (Access Granted / Access Denied).

---

## 9. Optional: Cloud Build deploys to Cloud Run

To deploy automatically after a successful build, add deploy steps to `cloudbuild.yaml` (after the push steps), or use **Cloud Run** triggers so that new image tags (e.g. `$SHORT_SHA`) trigger a new revision. You can also use **Cloud Deploy** or a separate CD pipeline if you prefer.
