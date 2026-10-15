import { ActionLink } from "@/components/portal/ui/Action";
import { Eyebrow, Panel } from "@/components/portal/ui/Panel";
import PageHeader from "@/components/portal/ui/PageHeader";
import { Badge } from "@/components/portal/ui/Status";
import Icon from "@/components/shared/ui/Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Viewer } from "@/lib/auth/dal";
import { fill } from "@/lib/format";
import { formatDate, formatTime } from "@/lib/portal/format";
import { localePath, routes } from "@/lib/routes";
import AdsManager from "./AdsManager";
import MenuManager from "./MenuManager";
import { AuditPanel, BusinessPanel, PublishingPanel } from "./SettingsPanels";

/**
 * Menu & Ads. The superadmin owns everything here; a manager only reaches this page with an
 * active content grant, and each section follows the permissions of that grant.
 */
export default function ContentWorkspace({
  lang,
  viewer,
  dict,
}: {
  lang: Locale;
  viewer: Viewer;
  dict: Pick<Dictionary, "portal" | "staff">;
}) {
  const t = dict.staff.content;
  const admin = viewer.role === "superadmin";
  const can = (permission: Viewer["permissions"][number]) => viewer.permissions.includes(permission);
  const grant = viewer.contentGrant;
  const scoped = { id: viewer.id, name: viewer.name, permissions: viewer.permissions };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <PageHeader
          title={admin ? t.titleAdmin : t.titleManager}
          subtitle={admin ? t.subtitleAdmin : fill(t.subtitleManager, { name: viewer.name })}
          action={<Badge>{admin ? t.badgeAdmin : t.badgeManager}</Badge>}
        />

        {admin && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-soft px-5 py-4">
            <div className="max-w-3xl text-[0.8125rem] text-accent">
              <p className="font-semibold">{t.ownership.title}</p>
              <p className="mt-1 leading-relaxed">{t.ownership.text}</p>
            </div>
            <ActionLink href={localePath(lang, routes.adminManagers)} variant="strong">
              {t.ownership.cta} <Icon name="arrowRight" className="h-4 w-4" />
            </ActionLink>
          </div>
        )}

        {!admin && grant && (
          <Panel title={t.grant.title} subtitle={fill(t.grant.subtitle, { name: viewer.name })}>
            <div className="grid gap-6 md:grid-cols-[18rem_minmax(0,1fr)]">
              <div className="space-y-2 text-[0.8125rem]">
                <Eyebrow>{t.grant.grantedBy}</Eyebrow>
                <p className="font-semibold">{fill(t.grant.grantor, { name: grant.grantedBy })}</p>
                {viewer.assignment && <p>{fill(t.grant.role, { assignment: dict.portal.assignment[viewer.assignment] })}</p>}
                <p>
                  {grant.expiresAt
                    ? fill(t.grant.expiry, { date: `${formatDate(grant.expiresAt)}, ${formatTime(grant.expiresAt)}` })
                    : t.grant.noExpiry}
                </p>
                <p className="text-[0.6875rem] text-muted-foreground">{t.grant.timezone}</p>
              </div>
              <div className="text-[0.8125rem]">
                <Eyebrow>{t.grant.allowed}</Eyebrow>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {grant.scopes.map((scope) => (
                    <li key={scope}>
                      <Badge>
                        <Icon name="check" className="h-3 w-3" strokeWidth={2.5} /> {t.grant.scopes[scope]}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 leading-relaxed">{t.grant.scope}</p>
                <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted-foreground">{t.grant.excluded}</p>
              </div>
            </div>
          </Panel>
        )}
      </div>

      {can("menu:edit") && <MenuManager lang={lang} viewer={scoped} dict={dict} />}
      {can("ads:manage") && <AdsManager lang={lang} viewer={scoped} dict={dict} />}

      {admin && (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <BusinessPanel lang={lang} dict={dict} />
            <PublishingPanel lang={lang} dict={dict} />
          </div>
          <AuditPanel lang={lang} dict={dict} />
        </div>
      )}
    </div>
  );
}
