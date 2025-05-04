# 🧬 VitalVault

VitalVault is a modular, secure platform for managing, uploading, and accessing critical data — tailored for use cases such as medical records, secure document vaults, or personal data lockers.

---

## 🚀 Project Structure

This is a monorepo managed with **Lerna** and **pnpm**, using TypeScript, Prisma, and a modular architecture:

```
packages/
├── web        # Frontend (React/Next.js)
├── platform   # Backend API logic (Node.js, Express/Nest)
├── upload     # Microservice for file/media uploads
└── prisma     # Database schema and ORM using Prisma
```

---

## 🌐 Live Demo

- 🔗 **Frontend (Web)**: [https://vital-vault-web.vercel.app](https://vital-vault-web.vercel.app)
- 🔗 **Backend (Platform API)**: [https://vitalvault-platform-b7262b50fe78.herokuapp.com](https://vitalvault-platform-b7262b50fe78.herokuapp.com)
- 🔗 **Upload Service**: [https://vitalvault-upload-ef958af27a98.herokuapp.com](https://vitalvault-upload-ef958af27a98.herokuapp.com)

---

## 🏗️ Architecture

```text
                         ┌────────────────────┐
                         │    Web Frontend    │
                         │   (React/Next.js)  │
                         └────────┬───────────┘
                                  │ REST/GraphQL
                         ┌────────▼─────────┐
                         │   API Gateway    │
                         │  (Backend Logic) │
                         └─────┬────┬───────┘
                               │    │
     ┌────────────────────┐    │    │   ┌─────────────────────┐
     │ Upload Microservice│ <──┘    └──>│ Database via Prisma │
     └────────────────────┘             └─────────────────────┘
```

---

## ✨ Features

- **Distributed and Scalable**: Built using GraphQL, Fastify, and PostgreSQL, containerized via Docker and deployed on Vercel and Render.
- **Encryption in Transit**: All files are encrypted using AES-256.
- **Controlled Sharing**: Share documents securely using signed links.

---

## 📦 Tech Stack

- **Frontend**: React / Next.js
- **Backend**: Node.js, TypeScript, Fastify
- **API Layer**: GraphQL
- **Database**: PostgreSQL (via Prisma ORM)
- **File Uploads**: Local/S3-compatible service
- **Dev Tools**: ESLint, Prettier, Husky, Docker
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (frontend) & Render (backend/services)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (`npm i -g pnpm`)
- Docker (for DB and services)

### Install

Clone the repository:

```bash
git clone https://github.com/aarontravass/Athena.git
```

Install dependencies:

```bash
pnpm i
```

Generate Prisma dist:

```bash
lerna run --scope @athena/prisma generate
```

Run web, server, and upload packages:

```bash
lerna run dev
```


## 🧪 Development & Contributing

### Linting & Formatting

```bash
pnpm lint
pnpm format
```

### Run Only One Package

```bash
cd packages/web
pnpm dev
```

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Open a pull request

---

## 🙌 Credits

This project utilizes the [`admin-dashboard-nextjs-typescript-daisyui-template`](https://github.com/robbins23/admin-dashboard-nextjs-typescript-daisyui-template) created by [robbins23](https://github.com/robbins23).

---

## 📄 License

Licensed under the [MIT License](./LICENSE).
