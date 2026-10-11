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
- Real auth and roles live in Lovable Cloud: role assignments are rows in `public.user_roles` only (never on profiles or user-editable metadata), and access checks go through the security-definer `has_role`/`has_any_role`/`is_staff` functions.
- A person's role comes only from their own login row; one shared email may map to several logins via `public.role_logins` (resolved server-side by `resolve_role_login`), so the sign-in form never decides a role and no client-side role switching is allowed.
- The active-agency filter is a per-browser choice applied inside `useRows` for tables listed in `src/lib/agency.ts` — every list respects it without page changes.
