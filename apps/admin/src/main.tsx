import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useAuthStore } from "./stores/auth";
import { AppLayout } from "./components/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/Dashboard";
import { ArticleListPage } from "./pages/ArticleListPage";
import { ArticleEditPage } from "./pages/ArticleEditPage";
import { PagesListPage } from "./pages/PagesListPage";
import { PagesEditPage } from "./pages/PagesEditPage";
import { MediaPage } from "./pages/MediaPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { TagsPage } from "./pages/TagsPage";
import { UsersPage } from "./pages/UsersPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const requireAuth = async () => {
  const status = useAuthStore.getState().status;
  if (status === "unknown") {
    await useAuthStore.getState().bootstrap();
  }
  if (useAuthStore.getState().status !== "authenticated") {
    throw redirect({ to: "/login" });
  }
};

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  beforeLoad: requireAuth,
  component: () => <AppLayout />,
});

const ComingSoon = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-[var(--ink)]">{title}</h1>
    <p className="mt-2 text-sm text-[var(--muted)]">
      Halaman ini akan diisi di tahap berikutnya.
    </p>
  </div>
);

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: DashboardPage,
});

// === ARTICLES ===
const articlesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/articles",
});

const articleListRoute = createRoute({
  getParentRoute: () => articlesRoute,
  path: "/",
  component: ArticleListPage,
});

// === ARTICLES EDITOR (full-screen, bukan anak layoutRoute) ===
const articleNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/articles/new",
  beforeLoad: requireAuth,
  component: ArticleEditPage,
});

const articleEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/articles/$id",
  beforeLoad: requireAuth,
  component: ArticleEditPage,
});

// === PAGES ===
const pagesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/pages",
});

const pageListRoute = createRoute({
  getParentRoute: () => pagesRoute,
  path: "/",
  component: PagesListPage,
});

// === PAGES EDITOR (full-screen, bukan anak layoutRoute) ===
const pageNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pages/new",
  beforeLoad: requireAuth,
  component: PagesEditPage,
});

const pageEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pages/$id",
  beforeLoad: requireAuth,
  component: PagesEditPage,
});

const mediaRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/media",
  component: MediaPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/categories",
  component: CategoriesPage,
});

const tagsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/tags",
  component: TagsPage,
});

const patternsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/patterns",
  component: () => <ComingSoon title="Patterns" />,
});

const siteEditorRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/site-editor",
  component: () => <ComingSoon title="Site Editor" />,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/settings",
  component: () => <ComingSoon title="Settings" />,
});

const usersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/users",
  component: UsersPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  // Editor routes — full-screen, bukan di bawah layoutRoute
  articleNewRoute,
  articleEditRoute,
  pageNewRoute,
  pageEditRoute,
  // Layout admin (sidebar) — untuk semua halaman list & dashboard
  layoutRoute.addChildren([
    dashboardRoute,
    articlesRoute.addChildren([articleListRoute]),
    pagesRoute.addChildren([pageListRoute]),
    mediaRoute,
    categoriesRoute,
    tagsRoute,
    patternsRoute,
    siteEditorRoute,
    settingsRoute,
    usersRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

useAuthStore.getState().bootstrap();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
