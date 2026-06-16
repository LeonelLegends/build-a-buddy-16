import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary shadow-gold"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary shadow-gold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Legends Insurance — Annuities, Life & Employee Benefits" },
      {
        name: "description",
        content:
          "Independent insurance agency offering annuities, IUL, whole & term life, and Section 125 cafeteria plans for businesses with 50+ employees. Bilingual service.",
      },
      { name: "author", content: "Legends Insurance Services" },
      { property: "og:site_name", content: "Legends Insurance Services" },
      { property: "og:title", content: "Legends Insurance — Annuities, Life & Employee Benefits" },
      {
        property: "og:description",
        content:
          "Family-first financial protection — annuities, life insurance, and employee benefit packages. Bilingual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Legends Insurance — Annuities, Life & Employee Benefits" },
      {
        name: "twitter:description",
        content:
          "Family-first financial protection — annuities, life insurance, and employee benefit packages. Bilingual.",
      },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0a14f57e-b44f-471b-9cbf-ae946ec67e11/id-preview-c6ead256--a7893bcb-5c04-4483-b9fc-472b0c371604.lovable.app-1780873847292.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0a14f57e-b44f-471b-9cbf-ae946ec67e11/id-preview-c6ead256--a7893bcb-5c04-4483-b9fc-472b0c371604.lovable.app-1780873847292.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.jpg", type: "image/jpeg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <Chatbot />
        </div>
      </I18nProvider>
    </QueryClientProvider>
  );
}
