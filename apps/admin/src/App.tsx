import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { AppLayout } from './components/AppLayout'

// Halaman sementara
const ComingSoon = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-[var(--ink)]">{title}</h1>
    <p className="mt-2 text-[var(--muted)]">Halaman ini akan diisi di tahap berikutnya.</p>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<ComingSoon title="Dashboard" />} />
        <Route path="articles" element={<ComingSoon title="Articles" />} />
        <Route path="pages" element={<ComingSoon title="Pages" />} />
        <Route path="media" element={<ComingSoon title="Media" />} />
        <Route path="categories" element={<ComingSoon title="Categories" />} />
        <Route path="tags" element={<ComingSoon title="Tags" />} />
        <Route path="patterns" element={<ComingSoon title="Patterns" />} />
        <Route path="site-editor" element={<ComingSoon title="Site Editor" />} />
        <Route path="settings" element={<ComingSoon title="Settings" />} />
        <Route path="users" element={<ComingSoon title="Users" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}