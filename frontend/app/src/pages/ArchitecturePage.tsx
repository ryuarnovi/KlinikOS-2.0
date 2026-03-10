"use client";
import { useState } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { fileTree, fileCodeMap } from '@/data/golangCode';
import { projectStructure } from '@/data/sqlMigrations';
import {
  Server, Shield, FolderTree, Layers, FileCode, ChevronRight,
  ChevronDown, Package, Database, Cog, BookOpen
} from 'lucide-react';
import { cn } from '@/utils/cn';

const categoryIcons: Record<string, React.ReactNode> = {
  root: <Package size={14} className="text-amber-500" />,
  entrypoint: <Server size={14} className="text-emerald-500" />,
  config: <Cog size={14} className="text-slate-500" />,
  middleware: <Shield size={14} className="text-red-500" />,
  model: <Layers size={14} className="text-blue-500" />,
  repository: <Database size={14} className="text-purple-500" />,
  service: <BookOpen size={14} className="text-green-500" />,
  handler: <FileCode size={14} className="text-orange-500" />,
  database: <Database size={14} className="text-violet-500" />,
};

const categoryColors: Record<string, string> = {
  root: 'bg-amber-50 border-amber-200 text-amber-800',
  entrypoint: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  config: 'bg-slate-50 border-slate-200 text-slate-800',
  middleware: 'bg-red-50 border-red-200 text-red-800',
  model: 'bg-blue-50 border-blue-200 text-blue-800',
  repository: 'bg-purple-50 border-purple-200 text-purple-800',
  service: 'bg-green-50 border-green-200 text-green-800',
  handler: 'bg-orange-50 border-orange-200 text-orange-800',
  database: 'bg-violet-50 border-violet-200 text-violet-800',
};

const categoryLabels: Record<string, string> = {
  root: 'Root',
  entrypoint: 'Entry Point',
  config: 'Config',
  middleware: 'Middleware',
  model: 'Domain Model',
  repository: 'Repository (DAL)',
  service: 'Business Logic',
  handler: 'HTTP Handler',
  database: 'Database / Migration',
};

type ViewMode = 'explorer' | 'structure' | 'layers';

export function ArchitecturePage() {
  const [selectedFile, setSelectedFile] = useState<string>('cmd/main.go');
  const [viewMode, setViewMode] = useState<ViewMode>('explorer');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['entrypoint', 'middleware', 'model', 'repository', 'service', 'handler', 'config', 'root', 'database'])
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Group files by category
  const grouped = fileTree.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {} as Record<string, typeof fileTree>);

  const categoryOrder = ['root', 'entrypoint', 'config', 'middleware', 'model', 'repository', 'service', 'handler', 'database'];

  const selectedCode = fileCodeMap[selectedFile];
  const selectedFileInfo = fileTree.find(f => f.path === selectedFile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Golang Backend — Full Source Code</h1>
        <p className="text-sm text-slate-500 mt-1">
          Clean Architecture dengan Gin Framework • {fileTree.length} file lengkap siap pakai
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-0">
        {[
          { id: 'explorer' as ViewMode, label: 'File Explorer', icon: <FolderTree size={14} /> },
          { id: 'structure' as ViewMode, label: 'Project Structure', icon: <Layers size={14} /> },
          { id: 'layers' as ViewMode, label: 'Architecture Layers', icon: <Server size={14} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setViewMode(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
              viewMode === t.id
                ? 'border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/50'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {viewMode === 'explorer' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* File Tree Sidebar */}
          <div className="lg:col-span-3 xl:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-4">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  📁 klinik-erp/backend/
                </h3>
              </div>
              <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
                {categoryOrder.filter(cat => grouped[cat]).map(cat => (
                  <div key={cat}>
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="flex w-full items-center gap-2 border-b border-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {expandedCategories.has(cat) ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronRight size={12} />
                      )}
                      {categoryIcons[cat]}
                      <span className="uppercase tracking-wider">{categoryLabels[cat]}</span>
                      <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {grouped[cat].length}
                      </span>
                    </button>
                    {expandedCategories.has(cat) && (
                      <div className="bg-slate-50/30">
                        {grouped[cat].map(file => (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file.path)}
                            className={cn(
                              "flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-all border-l-2",
                              selectedFile === file.path
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                                : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            )}
                          >
                            <FileCode size={12} className={cn(
                              selectedFile === file.path ? 'text-emerald-500' : 'text-slate-400'
                            )} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate">{file.path.split('/').pop()}</p>
                              <p className="text-[10px] text-slate-400 truncate">{file.path}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-9 xl:col-span-9 space-y-3">
            {/* File Info Bar */}
            {selectedFileInfo && (
              <div className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3",
                categoryColors[selectedFileInfo.category]
              )}>
                {categoryIcons[selectedFileInfo.category]}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">{selectedFile}</span>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {categoryLabels[selectedFileInfo.category]}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">{selectedFileInfo.description}</p>
                </div>
              </div>
            )}

            {selectedCode && (
              <CodeBlock
                code={selectedCode.code}
                language={selectedCode.language}
                title={selectedFile}
                maxHeight="calc(100vh - 320px)"
              />
            )}
          </div>
        </div>
      )}

      {viewMode === 'structure' && (
        <div className="space-y-6">
          <CodeBlock code={projectStructure} language="text" title="klinik-erp/ — Folder Structure" maxHeight="600px" />

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="text-sm font-semibold text-blue-800 mb-3">📊 Statistik Kode Backend</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total Files', value: fileTree.length, color: 'text-blue-700' },
                { label: 'Models', value: fileTree.filter(f => f.category === 'model').length, color: 'text-indigo-700' },
                { label: 'Repositories', value: fileTree.filter(f => f.category === 'repository').length, color: 'text-purple-700' },
                { label: 'Handlers', value: fileTree.filter(f => f.category === 'handler').length, color: 'text-orange-700' },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-white p-3 text-center shadow-sm">
                  <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'layers' && (
        <div className="space-y-6">
          {/* Architecture Diagram */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-sm font-semibold text-slate-700">🏗️ Clean Architecture — Request Flow</h3>
            
            <div className="flex flex-col items-center gap-4">
              {/* HTTP Request */}
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-8 py-3 text-center">
                <p className="text-xs text-slate-400 font-semibold uppercase">HTTP Request</p>
                <p className="text-sm font-mono text-slate-600">POST /api/medical-records</p>
              </div>

              <div className="text-slate-300">↓</div>

              {/* Middleware */}
              <div className="w-full max-w-2xl rounded-xl border-2 border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-red-600" />
                  <span className="font-bold text-red-800">Middleware Layer</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-red-100 px-2 py-1 text-xs font-mono text-red-700">JWTAuth()</span>
                  <span className="text-xs text-red-400">→</span>
                  <span className="rounded bg-red-100 px-2 py-1 text-xs font-mono text-red-700">AuthorizeRole("Dokter")</span>
                </div>
                <p className="text-xs text-red-600 mt-2">
                  Validasi token JWT → Ekstrak user_id & role → Cek izin akses
                </p>
              </div>

              <div className="text-slate-300">↓</div>

              {/* Handler */}
              <div className="w-full max-w-2xl rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode size={16} className="text-orange-600" />
                  <span className="font-bold text-orange-800">Handler Layer</span>
                  <span className="text-xs text-orange-500">internal/handler/</span>
                </div>
                <p className="text-xs text-orange-700 font-mono">
                  func (h *MedicalRecordHandler) CreateMedicalRecord(c *gin.Context)
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Parse request body → Validasi input → Panggil Service → Return JSON response
                </p>
              </div>

              <div className="text-slate-300">↓</div>

              {/* Service */}
              <div className="w-full max-w-2xl rounded-xl border-2 border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={16} className="text-green-600" />
                  <span className="font-bold text-green-800">Service Layer</span>
                  <span className="text-xs text-green-500">internal/service/</span>
                </div>
                <p className="text-xs text-green-700 font-mono">
                  func (s *MedicalRecordService) Create(doctorID uuid.UUID, req CreateMedicalRecordRequest)
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Business logic → Data isolation per role → Compose domain objects → Panggil Repository
                </p>
              </div>

              <div className="text-slate-300">↓</div>

              {/* Repository */}
              <div className="w-full max-w-2xl rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={16} className="text-purple-600" />
                  <span className="font-bold text-purple-800">Repository Layer</span>
                  <span className="text-xs text-purple-500">internal/repository/</span>
                </div>
                <p className="text-xs text-purple-700 font-mono">
                  func (r *MedicalRecordRepository) Create(m *model.MedicalRecord) error
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  SQL queries → Parameterized statements → Scan results → Return domain objects
                </p>
              </div>

              <div className="text-slate-300">↓</div>

              {/* Database */}
              <div className="rounded-xl border-2 border-violet-300 bg-violet-50 px-8 py-3 text-center">
                <p className="text-xs text-violet-400 font-semibold uppercase">PostgreSQL</p>
                <p className="text-sm font-mono text-violet-600">medical_records table</p>
              </div>
            </div>
          </div>

          {/* Layer Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                layer: 'Handler',
                desc: 'HTTP request parsing, input validation, response formatting. Tidak ada business logic.',
                folder: 'internal/handler/',
                files: fileTree.filter(f => f.category === 'handler'),
                color: 'border-orange-200 bg-orange-50',
                iconColor: 'bg-orange-500',
              },
              {
                layer: 'Service',
                desc: 'Business rules, data isolation, orchestration. Tidak tahu soal HTTP.',
                folder: 'internal/service/',
                files: fileTree.filter(f => f.category === 'service'),
                color: 'border-green-200 bg-green-50',
                iconColor: 'bg-green-500',
              },
              {
                layer: 'Repository',
                desc: 'Data access, SQL queries. Tidak tahu soal business rules.',
                folder: 'internal/repository/',
                files: fileTree.filter(f => f.category === 'repository'),
                color: 'border-purple-200 bg-purple-50',
                iconColor: 'bg-purple-500',
              },
              {
                layer: 'Model',
                desc: 'Domain entities, DTOs, request/response structs. Pure data.',
                folder: 'internal/model/',
                files: fileTree.filter(f => f.category === 'model'),
                color: 'border-blue-200 bg-blue-50',
                iconColor: 'bg-blue-500',
              },
            ].map(l => (
              <div key={l.layer} className={cn("rounded-xl border p-4", l.color)}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-white", l.iconColor)}>
                    <Layers size={16} />
                  </div>
                  <h4 className="font-bold text-slate-800">{l.layer}</h4>
                </div>
                <p className="text-xs text-slate-600 mb-3">{l.desc}</p>
                <div className="space-y-1">
                  {l.files.map(f => (
                    <button
                      key={f.path}
                      onClick={() => { setSelectedFile(f.path); setViewMode('explorer'); }}
                      className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] font-mono text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
                    >
                      <FileCode size={10} />
                      {f.path.split('/').pop()}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] font-mono text-slate-400">{l.folder}</p>
              </div>
            ))}
          </div>

          {/* Dependency Injection Explanation */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">💉 Dependency Injection Pattern</h3>
            <p className="text-xs text-amber-700 mb-3">
              Semua dependency di-inject melalui constructor di <code className="bg-amber-100 px-1 rounded">main.go</code>.
              Ini memudahkan testing (bisa mock repository) dan menjaga separation of concerns.
            </p>
            <div className="rounded-lg bg-white p-3 font-mono text-xs text-slate-700 overflow-x-auto">
              <pre className="whitespace-pre">{`// Dependency injection chain di main.go:
userRepo := repository.NewUserRepository(db)       // DB → Repository
authService := service.NewAuthService(userRepo, ...) // Repository → Service  
authHandler := handler.NewAuthHandler(authService)   // Service → Handler
r.POST("/api/auth/login", authHandler.Login)         // Handler → Router`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
