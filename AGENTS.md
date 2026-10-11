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

# AGENTS

- URLs are prefixed with a language segment (`/$lang/...`, en|fr|ar); Arabic sets dir=rtl in the `$lang` layout — keeps every page shareable per language.
- Role permissions live only in `src/lib/rbac.ts` (read/write per module); nav and pages derive from it — one source of truth for access.
- All modules render through the generic `$lang.app.$module.tsx` table driven by `src/lib/demo-data.ts` — new modules need only config.
- Current role switching is a client-side demo; real auth/roles must move to Lovable Cloud with a separate user_roles table.
