# ucm-computing

 # Kubernetes Migration Plan For ucm-computing

  ## Summary

  Move to Kubernetes by splitting the system into two runtime classes:

  1. A stateless web/API layer for auth, upload orchestration, job creation, and status APIs.
  2. An isolated execution layer for model training, implemented as queued worker pods or Kubernetes Jobs.

  Do not keep user training inside the main FastAPI pods. Your current backend at backend/app/api.py and backend/app/
  testsubprocess.py runs uploaded code, creates virtualenvs, installs dependencies, and writes to local disk. That model is
  incompatible with safe multi-user Kubernetes scaling.

  You should dockerize your application services. You should not require each user upload to be fully dockerized if you adopt the
  constrained training contract selected here. Instead, provide a platform-managed runner image that executes user code inside a
  fixed interface.

  ## Implementation Changes

  ### 1. Service split

  - Keep one FastAPI service as the public API gateway/application backend.
  - Remove direct training execution from request handlers such as /jsonPythonFile.
  - Change upload endpoints so they:
      1. validate request metadata,
      2. store uploaded files in object storage,
      3. create a job record in a real database,
      4. enqueue or launch a training run,
      5. return a job_id immediately.
  - Add job status/result endpoints and optionally WebSocket or SSE streaming for logs.

  ### 2. Container/runtime model

  - Build one Docker image for the FastAPI backend.
  - Build one Docker image for the frontend or serve static frontend assets behind NGINX/CDN.
  - Build one runner image for training jobs.
  - The runner image should contain:
      - Python
      - PyTorch and base ML dependencies
      - the platform’s execution wrapper
      - a writable workspace path
  - User uploads should be copied into the runner workspace at job start.
  - With the constrained contract, require users to provide:
      - a main entry file
      - a metadata/config file
      - optional dependency file only if you decide to allow limited extra packages
  - Prefer banning arbitrary pip install during execution in v1. If extra packages are needed, support an allowlisted dependency
    layer or a small set of prebuilt runner variants.

  ### 3. Persistence and infrastructure

  - Replace SQLite at backend/app/sql_py.py with Postgres.
  - Replace local UPLOAD_DIR storage with object storage such as S3 or MinIO.
  - Store:
      - uploaded code bundles
      - job artifacts
      - trained model outputs
      - logs or log pointers
  - Keep API pods stateless; no per-user state on pod filesystem.
  - Use Kubernetes Secrets for credentials and ConfigMaps for non-secret config.
  - Put an Ingress in front of the API and frontend.
  - Use separate node pools if you expect GPU training later.

  ### 4. Kubernetes workload design

  - Deploy FastAPI as a Deployment with multiple replicas behind a Service.
  - Deploy frontend separately as a Deployment or static site service.
  - Launch training as Kubernetes Job objects, not long-running API subprocesses.
  - If execution volume will grow, add a queue first:
      - API writes job request to DB/queue
      - worker service consumes jobs and creates/executes runner work
  - Set per-job CPU/memory/GPU limits and timeouts.
  - Add network policies and pod security restrictions around runner pods.
  - Treat runner pods as untrusted-code sandboxes:
      - non-root user
      - read-only root filesystem where possible
      - no host mounts
      - restricted egress if feasible
      - isolated service account with minimal RBAC

  ### 5. Application/API contract changes

  Public/backend interface changes:

  - POST /jsonPythonFile becomes a job submission API that returns { job_id, status } instead of starting work inline.
  - Add GET /jobs/{job_id} for state and metadata.
  - Add GET /jobs/{job_id}/logs or WebSocket/SSE log streaming.
  - Add GET /jobs/{job_id}/artifacts for trained model download links.
  - Frontend API URLs in frontend/src/Home/backend.ts and frontend/src/Signin/backend.js should move from hardcoded localhost to
    environment-based config.

  ## Test Plan

      - runner image executes a sample constrained training project
      - auth works against Postgres
      - upload creates a job record
      - invalid metadata is rejected
      - job status transitions are correct
  - Integration tests:
      - upload sample model code
      - API stores files in object storage
      - worker/job executes successfully
      - model artifact is written to storage
      - frontend can fetch job status and result
  - Multi-user scenarios:
      - concurrent uploads from multiple users
      - one failed training job does not affect others
      - API remains responsive while jobs run
  - Failure cases:
      - runner timeout
      - bad dependency/config input
      - pod crash/retry
      - object storage unavailable
      - database unavailable

  ## Assumptions And Defaults

  - Target environment: managed Kubernetes in the cloud.
  - User workload model: constrained training contract, not arbitrary unrestricted Python projects.
  - Main FastAPI service: yes, but only for request handling/orchestration, not for running user training code.
  - Dockerization: required for backend, frontend, and training runner images.
  - User-submitted code: uploaded as files/artifacts, not as user-built Docker images in v1.
  - Database: Postgres replaces SQLite.
  - Storage: S3/MinIO-style object storage replaces local backend/train directories.
  - Execution model: asynchronous jobs with status polling or streaming, not synchronous request/response training.
