import { createFileRoute } from "@tanstack/react-router";
import { TasksPage } from "@/components/tasks-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Tasks — TaskPilot" },
    { name: "description", content: "Prioritise tasks and coordinate your team with explainable scoring and recommendations." },
    { property: "og:title", content: "Tasks — TaskPilot" },
    { property: "og:description", content: "Prioritise tasks and coordinate your team with explainable scoring and recommendations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: TasksPage,
});
