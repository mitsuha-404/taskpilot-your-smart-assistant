<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep TaskPilot domain types and scoring in a browser-safe reusable module; this makes rules independently testable.
- Share tasks, members, and scoring weights through a React context hydrated from localStorage; the requested offline MVP needs no backend and avoids SSR hydration mismatches.
- Keep Tasks at `/`, Team at `/team`, and Workload at `/workload` with a shared workspace shell; each view must be directly linkable.
- Express workspace styling through semantic global design tokens and reusable CSS classes; keep presentation consistent across tables and editors.
