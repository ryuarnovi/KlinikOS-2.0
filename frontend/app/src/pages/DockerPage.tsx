"use client";
import { useState } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { dockerCompose, dockerfileBackend } from '@/data/sqlMigrations';
import { Container, Layers, Terminal } from 'lucide-react';

const dockerfileFrontend = `# ===== Multi-stage Build for React Frontend =====

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`;

const nginxConf = `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`;

const commands = `# ===== Quick Start Commands =====

# 1. Start semua service
docker-compose up -d

# 2. Lihat logs
docker-compose logs -f backend

# 3. Masuk ke container DB
docker exec -it klinik-db psql -U postgres -d klinik_erp

# 4. Rebuild setelah perubahan
docker-compose up -d --build

# 5. Stop semua service
docker-compose down

# 6. Reset database (hapus volume)
docker-compose down -v

# 7. Run migration manual
docker exec -it klinik-backend ./server migrate up

# 8. Rollback migration
docker exec -it klinik-backend ./server migrate down`;

export function DockerPage() {
  const [tab, setTab] = useState<'compose' | 'backend' | 'frontend' | 'commands'>('compose');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Docker Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Multi-stage build dan Docker Compose untuk Backend, Frontend, dan Database</p>
      </div>

      {/* Architecture Diagram */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">🐳 Container Architecture</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
              <Container size={24} className="text-white" />
            </div>
            <h4 className="font-bold text-blue-800">klinik-frontend</h4>
            <p className="text-xs text-blue-600 mt-1">React + Vite + Nginx</p>
            <code className="mt-2 block text-xs font-mono text-blue-500">:3000 → :80</code>
          </div>
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
              <Layers size={24} className="text-white" />
            </div>
            <h4 className="font-bold text-emerald-800">klinik-backend</h4>
            <p className="text-xs text-emerald-600 mt-1">Go + Gin Framework</p>
            <code className="mt-2 block text-xs font-mono text-emerald-500">:8080</code>
          </div>
          <div className="rounded-xl border-2 border-violet-300 bg-violet-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h4 className="font-bold text-violet-800">klinik-db</h4>
            <p className="text-xs text-violet-600 mt-1">PostgreSQL 16 Alpine</p>
            <code className="mt-2 block text-xs font-mono text-violet-500">:5432</code>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="rounded bg-slate-100 px-2 py-1">Frontend</span>
          <span>→ proxy /api/ →</span>
          <span className="rounded bg-slate-100 px-2 py-1">Backend</span>
          <span>→ DATABASE_URL →</span>
          <span className="rounded bg-slate-100 px-2 py-1">PostgreSQL</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-0">
        {[
          { id: 'compose' as const, label: 'docker-compose.yml', icon: <Container size={14} /> },
          { id: 'backend' as const, label: 'Dockerfile (Go)', icon: <Layers size={14} /> },
          { id: 'frontend' as const, label: 'Dockerfile (React)', icon: <Container size={14} /> },
          { id: 'commands' as const, label: 'Commands', icon: <Terminal size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'compose' && (
        <CodeBlock code={dockerCompose} language="YAML" title="docker-compose.yml" maxHeight="600px" />
      )}

      {tab === 'backend' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="text-sm font-semibold text-emerald-800 mb-1">🏗️ Multi-stage Build</h3>
            <p className="text-xs text-emerald-700">
              <strong>Stage 1 (Builder):</strong> Compile Go binary dengan <code className="bg-emerald-100 px-1 rounded">CGO_ENABLED=0</code> untuk static binary.
              <br />
              <strong>Stage 2 (Runtime):</strong> Alpine minimal (~5MB) + binary + migrations.
            </p>
          </div>
          <CodeBlock code={dockerfileBackend} language="Dockerfile" title="backend/Dockerfile" maxHeight="500px" />
        </div>
      )}

      {tab === 'frontend' && (
        <div className="space-y-4">
          <CodeBlock code={dockerfileFrontend} language="Dockerfile" title="frontend/Dockerfile" maxHeight="400px" />
          <CodeBlock code={nginxConf} language="Nginx" title="frontend/nginx.conf" maxHeight="300px" />
        </div>
      )}

      {tab === 'commands' && (
        <CodeBlock code={commands} language="bash" title="Docker Commands — Quick Reference" maxHeight="500px" />
      )}
    </div>
  );
}
