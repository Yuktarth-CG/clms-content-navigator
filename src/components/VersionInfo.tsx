import { useEffect, useMemo, useState } from "react";
import { ExternalLink, GitCommit, Info, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { versionLog, getCurrentVersion } from "@/data/versionLog";

interface RepoConfig {
  owner: string;
  repo: string;
  branch?: string;
  token?: string; // optional for private repos
}

interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
}

const STORAGE_KEY = "githubRepoConfig";

export const VersionInfo = () => {
  const [open, setOpen] = useState(false);
  const currentVersion = getCurrentVersion();

  const [repoConfig, setRepoConfig] = useState<RepoConfig | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved config on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRepoConfig(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const latestShaShort = useMemo(() => (commits[0]?.sha ? commits[0].sha.slice(0, 7) : null), [commits]);

  // Fetch commits when dialog opens and config exists
  useEffect(() => {
    const fetchCommits = async () => {
      if (!open || !repoConfig?.owner || !repoConfig?.repo) return;
      setLoading(true);
      setError(null);
      try {
        const branch = repoConfig.branch?.trim() || "main";
        const url = `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/commits?sha=${encodeURIComponent(branch)}&per_page=20`;
        const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
        if (repoConfig.token) headers.Authorization = `Bearer ${repoConfig.token}`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status}`);
        }
        const data: GitHubCommit[] = await res.json();
        setCommits(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load commits");
      } finally {
        setLoading(false);
      }
    };
    fetchCommits();
  }, [open, repoConfig?.owner, repoConfig?.repo, repoConfig?.branch, repoConfig?.token]);

  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const cfg: RepoConfig = {
      owner: String(form.get("owner") || "").trim(),
      repo: String(form.get("repo") || "").trim(),
      branch: String(form.get("branch") || "main").trim(),
      token: String(form.get("token") || "").trim() || undefined,
    };
    setRepoConfig(cfg);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch {
      // ignore
    }
    setShowSettings(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="text-xs">
            {latestShaShort ? `${latestShaShort}` : `v${currentVersion}`}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Version History
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-muted-foreground">
            {repoConfig?.owner && repoConfig?.repo ? (
              <span>Repo: {repoConfig.owner}/{repoConfig.repo}{repoConfig.branch ? `@${repoConfig.branch}` : ""}</span>
            ) : (
              <span>Connect a GitHub repo to show commit history</span>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowSettings((s) => !s)} className="gap-2">
            <Settings2 className="h-4 w-4" /> Settings
          </Button>
        </div>

        {showSettings && (
          <form onSubmit={handleSaveConfig} className="grid grid-cols-2 gap-3 border rounded-md p-3">
            <div className="col-span-1">
              <Label htmlFor="owner">Owner</Label>
              <Input id="owner" name="owner" defaultValue={repoConfig?.owner || ""} placeholder="org-or-user" />
            </div>
            <div className="col-span-1">
              <Label htmlFor="repo">Repo</Label>
              <Input id="repo" name="repo" defaultValue={repoConfig?.repo || ""} placeholder="repository" />
            </div>
            <div className="col-span-1">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" name="branch" defaultValue={repoConfig?.branch || "main"} placeholder="main" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="token">Token (optional, needed for private repos)</Label>
              <Input id="token" name="token" defaultValue={repoConfig?.token || ""} placeholder="ghp_***" type="password" />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowSettings(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}

        <Tabs defaultValue={repoConfig?.owner && repoConfig?.repo ? "commits" : "changelog"} className="mt-3">
          <TabsList>
            <TabsTrigger value="commits" disabled={!repoConfig?.owner || !repoConfig?.repo}>Commits</TabsTrigger>
            <TabsTrigger value="changelog">Changelog</TabsTrigger>
          </TabsList>

          <TabsContent value="commits" className="mt-3">
            {!repoConfig?.owner || !repoConfig?.repo ? (
              <div className="text-sm text-muted-foreground">Provide repository details in Settings to view commits.</div>
            ) : loading ? (
              <div className="text-sm text-muted-foreground">Loading commits…</div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : commits.length === 0 ? (
              <div className="text-sm text-muted-foreground">No commits found.</div>
            ) : (
              <ScrollArea className="max-h-[420px] pr-4">
                <div className="space-y-4">
                  {commits.map((c) => {
                    const firstLine = c.commit.message.split("\n")[0];
                    const date = new Date(c.commit.author.date).toLocaleString();
                    const shaShort = c.sha.slice(0, 7);
                    return (
                      <div key={c.sha} className="border-l-2 border-border pl-4 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">
                            <GitCommit className="h-3.5 w-3.5 mr-1" />{shaShort}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{date}</span>
                        </div>
                        <div className="text-sm flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-foreground">{firstLine}</div>
                            {c.author?.login && (
                              <div className="text-xs text-muted-foreground">by {c.author.login} ({c.commit.author.name})</div>
                            )}
                          </div>
                          <a
                            href={c.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-xs text-primary hover:underline"
                            aria-label="View on GitHub"
                          >
                            View <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="changelog" className="mt-3">
            <ScrollArea className="max-h-[420px] pr-4">
              <div className="space-y-4">
                {versionLog.map((entry, index) => (
                  <div key={entry.version} className="border-l-2 border-border pl-4 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>v{entry.version}</Badge>
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {entry.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};