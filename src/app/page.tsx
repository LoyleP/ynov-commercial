import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { fr } from "@/messages/fr";

export default function HomePage() {
  return (
    <>
      <header className="border-b">
        <div className="page-width mx-auto flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-10">
          <span className="font-semibold">{fr.app.name}</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="page-width mx-auto w-full flex-1 space-y-4 px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-semibold">{fr.home.title}</h1>
        <p className="text-muted-foreground text-sm">{fr.home.intro}</p>
        <EmptyState icon={Inbox} title={fr.home.emptyTitle} body={fr.home.emptyBody} />
      </main>
    </>
  );
}
