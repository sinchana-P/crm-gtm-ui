import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CONSENT_CATALOG,
  DURATION_POLICIES,
} from "@/lib/mock-data/consent-policy";

export function ConsentDurationPolicy() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Duration &amp; refresh policy</CardTitle>
        <CardDescription>
          Consent has no single legal expiry — these are the refresh windows the console enforces.
          A record past its window is flagged for re-permission, not silently used.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead className="whitespace-nowrap">Window</TableHead>
                <TableHead>Behaviour</TableHead>
                <TableHead className="text-right whitespace-nowrap">Applies to</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DURATION_POLICIES.map((policy) => {
                const applies = CONSENT_CATALOG.filter(
                  (d) => d.durationKey === policy.key,
                ).length;
                return (
                  <TableRow key={policy.key}>
                    <TableCell className="align-top">
                      <p className="font-medium">{policy.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{policy.note}</p>
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap font-mono text-xs tabular-nums">
                      {policy.refreshMonths === 0 ? "—" : `${policy.refreshMonths} mo`}
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge
                        variant="outline"
                        className={
                          policy.expires
                            ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                            : policy.refreshMonths === 0
                              ? "text-muted-foreground"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }
                      >
                        {policy.expires
                          ? "Expires"
                          : policy.refreshMonths === 0
                            ? "Persists"
                            : "Refresh"}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top text-right tabular-nums">
                      {applies} {applies === 1 ? "consent" : "consents"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
