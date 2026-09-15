"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useResumeStore } from "@/lib/store/resumeStore";
import { useTheme } from "next-themes";
import {
  Mail,
  Briefcase,
  MessageSquare,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  LayoutGrid,
  Database,
  Key,
  Bug,
  RefreshCw,
  Download,
  ArrowUpCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { WhatsNewDialog } from "@/components/WhatsNewDialog";
import { getAllCoverLetters, getAllResumes } from "@/lib/db/database";
import {
  hasUnseenWhatsNew,
  latestWhatsNewId,
  markWhatsNewSeen,
  readSeenWhatsNew,
} from "@/lib/whatsNew";
import { useUIStore } from "@/lib/store/uiStore";
import { isElectron } from "@/lib/platform";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

function NavItem({
  icon,
  label,
  active,
  href,
  onClick,
  collapsed,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  /** Small unread dot, announced to screen readers as "new". */
  badge?: boolean;
  /** Route links render as <Link>; items without a route render as <button>. */
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  collapsed?: boolean;
}) {
  const className = cn(
    "relative w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer group text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    active
      ? "text-background"
      : "text-muted-foreground hover:text-foreground hover:bg-accent",
    collapsed ? "justify-center" : "justify-between",
  );
  const inner = (
    <>
      {active && (
        <motion.div
          layoutId="nav-active-pill"
          className="absolute inset-0 bg-foreground rounded-lg"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <div
        className={cn(
          "relative flex items-center gap-2.5 z-10",
          collapsed && "gap-0",
        )}
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
      {badge && (
        <span
          aria-hidden
          className={cn(
            "z-10 w-2 h-2 rounded-full bg-sky-500",
            collapsed && "absolute top-1.5 right-3",
          )}
        />
      )}
    </>
  );
  const ariaLabel = collapsed || badge ? `${label}${badge ? " (new)" : ""}` : undefined;

  const content = href ? (
    <Link
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {inner}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
    >
      {inner}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={content} />
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

const THEME_OPTIONS = [
  { value: "light", label: "Light Mode", icon: Sun },
  { value: "system", label: "System Theme", icon: Monitor },
  { value: "dark", label: "Dark Mode", icon: Moon },
] as const;

const NARROW_QUERY = "(max-width: 767px)";

const noopSubscribe = () => () => {};

function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia?.(NARROW_QUERY);
  if (!mq) return () => {};
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function Sidebar() {
  const pathname = usePathname();
  const editingResume = useResumeStore((s) => s.resume);
  const { theme, setTheme } = useTheme();
  // next-themes only knows the theme in the browser. Until hydration finishes,
  // render no theme as selected so the markup matches the server HTML.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [whatsNewUnread, setWhatsNewUnread] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [isMac, setIsMac] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const isNarrow = useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia?.(NARROW_QUERY).matches ?? false,
    () => false,
  );
  // The user's own collapse choice, remembered only for the context it was made
  // in (see `collapsed` below).
  const [manualCollapse, setManualCollapse] = useState<{
    value: boolean;
    auto: boolean;
  } | null>(null);
  // Nav target clicked but not yet rendered, so the highlight moves immediately.
  const [pendingNav, setPendingNav] = useState<{
    href: string;
    from: string | null;
  } | null>(null);

  const globalDebugMode = useUIStore((s) => s.globalDebugMode);
  const setGlobalDebugMode = useUIStore((s) => s.setGlobalDebugMode);
  const updateStatus = useUIStore((s) => s.updateStatus);
  const updateProgress = useUIStore((s) => s.updateProgress);
  const updateVersion = useUIStore((s) => s.updateVersion);
  const updateError = useUIStore((s) => s.updateError);

  useEffect(() => {
    if (window.electron) {
      window.electron.getApiKey().then((key) => setApiKey(key || ""));
      if (typeof window.electron.getDebugMode === "function") {
        window.electron
          .getDebugMode()
          .then((enabled) => setGlobalDebugMode(enabled));
      }
      if (typeof window.electron.getAppVersion === "function") {
        window.electron.getAppVersion().then((v) => setAppVersion(v));
      }
      setIsMac(window.electron.platform === "darwin");
      setIsWin(window.electron.platform === "win32");
    }
  }, [setGlobalDebugMode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seen = readSeenWhatsNew();
      if (seen === latestWhatsNewId()) return;
      let hasData = false;
      if (seen === null) {
        try {
          const [resumes, letters] = await Promise.all([getAllResumes(), getAllCoverLetters()]);
          hasData = resumes.length + letters.length > 0;
        } catch {
          // No vault yet (desktop) or storage blocked: treat as a new user.
        }
        // A brand-new user has nothing to catch up on; start them at the latest notes.
        if (!hasData) {
          markWhatsNewSeen();
          return;
        }
      }
      if (!cancelled) setWhatsNewUnread(hasUnseenWhatsNew(seen, hasData));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function openWhatsNew() {
    setWhatsNewOpen(true);
    setWhatsNewUnread(false);
    markWhatsNewSeen();
  }

  async function saveSettings() {
    if (window.electron) {
      await window.electron.setApiKey(apiKey);
      if (typeof window.electron.setDebugMode === "function") {
        await window.electron.setDebugMode(globalDebugMode);
      }
    }
    setSettingsOpen(false);
  }

  async function handleCheckUpdates() {
    if (
      window.electron &&
      typeof window.electron.checkForUpdates === "function"
    ) {
      try {
        await window.electron.checkForUpdates();
      } catch {
        toast.error("Failed to check for updates");
      }
    }
  }

  async function handleRestartAndInstall() {
    if (
      window.electron &&
      typeof window.electron.restartAndInstall === "function"
    ) {
      await window.electron.restartAndInstall();
    }
  }

  // trailingSlash is on, so the dashboard is "/builder/" — compare without it,
  // or the Resumes tab never matches. The editor route (/builder/new?id=…)
  // serves both resumes and cover letters; highlight whichever is open.
  const path = pathname?.replace(/\/+$/, "") || "/";
  const inEditor = /^\/builder\/(?!cover-letter|jobs|interview-prep)[^/]+$/.test(path);
  // The store can still hold the previously edited document for a frame, and is
  // empty while the new one loads; only trust it once it matches the URL's id.
  const editorId =
    inEditor && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id") ?? path.split("/").pop()
      : null;
  const editingKind =
    editingResume && editingResume.id === editorId
      ? editingResume.kind === "coverLetter" ? "coverLetter" : "resume"
      : null;
  const isResumes = path === "/builder" || editingKind === "resume";
  const isCover = path.startsWith("/builder/cover-letter") || editingKind === "coverLetter";
  const isJobs = path.startsWith("/builder/jobs");
  const isInterview = path.startsWith("/builder/interview-prep");

  // Collapse automatically on narrow windows and in the editor, which needs the
  // width. A manual toggle wins until that automatic state changes.
  const autoCollapsed = isNarrow || inEditor;
  const collapsed =
    manualCollapse && manualCollapse.auto === autoCollapsed
      ? manualCollapse.value
      : autoCollapsed;
  const setCollapsed = (value: boolean) =>
    setManualCollapse({ value, auto: autoCollapsed });

  const pendingHref = pendingNav?.from === pathname ? pendingNav.href : null;
  const isActive = (href: string, routeActive: boolean) =>
    pendingHref ? pendingHref === href : routeActive;
  const navigate = (href: string, routeActive: boolean) => (e: React.MouseEvent) => {
    // Let modified clicks (new tab/window) through without moving the highlight.
    if (routeActive || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    setPendingNav({ href, from: pathname });
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        data-testid="main-sidebar"
        className="border-r border-border flex flex-col shrink-0 bg-sidebar relative z-30"
      >
        <div
          className={cn(
            "border-b border-border drag flex flex-col transition-all duration-300",
            collapsed ? (isMac ? "h-20" : "h-11") : "h-11",
          )}
        >
          {/* Top row: traffic lights on Mac, or just spacing */}
          <div
            className={cn(
              "h-11 flex items-center justify-between px-3 shrink-0",
              isMac && "pl-[72px]",
              collapsed && !isMac && "justify-center px-0",
            )}
          >
            {!collapsed && (
              <Link
                href="/builder"
                className="no-drag flex items-center gap-2 min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <Logo />
                <span className="font-bold text-sm tracking-tight truncate">
                  DoomSSH
                </span>
              </Link>
            )}

            {/* Toggle button - only show in top row if not collapsed OR not Mac */}
            {(!collapsed || !isMac) && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => setCollapsed(!collapsed)}
                      aria-label={
                        collapsed ? "Expand Sidebar" : "Collapse Sidebar"
                      }
                      className="no-drag p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      {collapsed ? (
                        <ChevronRight size={16} />
                      ) : (
                        <ChevronLeft size={16} />
                      )}
                    </button>
                  }
                />
                <TooltipContent side="right">
                  {collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Bottom row: only for collapsed Mac to prevent overlap with traffic lights */}
          {collapsed && isMac && (
            <div className="flex-1 flex items-center justify-center pb-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => setCollapsed(!collapsed)}
                      aria-label="Expand Sidebar"
                      className="no-drag p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  }
                />
                <TooltipContent side="right">Expand Sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { href: "/builder", label: "Resumes", icon: LayoutGrid, routeActive: isResumes },
            { href: "/builder/cover-letter", label: "Cover Letter", icon: Mail, routeActive: isCover },
            { href: "/builder/jobs", label: "Job Tracker", icon: Briefcase, routeActive: isJobs },
            { href: "/builder/interview-prep", label: "Interview Prep", icon: MessageSquare, routeActive: isInterview },
          ].map(({ href, label, icon: Icon, routeActive }) => (
            <NavItem
              key={href}
              icon={<Icon size={18} />}
              label={label}
              href={href}
              active={isActive(href, routeActive)}
              onClick={navigate(href, routeActive)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-4">
          <div className="space-y-1">
          <NavItem
            icon={<Sparkles size={18} />}
            label="What's New"
            onClick={openWhatsNew}
            badge={whatsNewUnread}
            collapsed={collapsed}
          />
          <NavItem
            icon={<SettingsIcon size={18} />}
            label="Settings"
            onClick={() => setSettingsOpen(true)}
            collapsed={collapsed}
          />
          </div>

          <div
            className={cn(
              "flex w-full items-center justify-center bg-accent/50 rounded-lg p-1",
              collapsed && "flex-col",
            )}
          >
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const selected = hydrated && theme === value;
              const button = (
                <button
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-label={label}
                  aria-pressed={selected}
                  className={cn(
                    "w-full flex items-center justify-center py-1.5 rounded-md transition-all",
                    selected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon size={14} />
                </button>
              );
              return (
                <Tooltip key={value}>
                  <TooltipTrigger render={button} />
                  <TooltipContent side={collapsed ? "right" : "top"}>
                    {label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {!collapsed && (
            <div className="bg-accent/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Database size={12} className="text-muted-foreground" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Local Only
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                All data is stored locally on this device.
              </p>
            </div>
          )}
        </div>
      </motion.aside>

      <WhatsNewDialog open={whatsNewOpen} onOpenChange={setWhatsNewOpen} />

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              {isElectron()
                ? "Configure your preferences and API keys. These are stored securely on your device."
                : "Preferences for this browser."}
            </DialogDescription>
          </DialogHeader>
          {/* Updates, AI and debugging need the desktop app; the browser build gets a storage note. */}
          {!isElectron() && (
            <div className="grid gap-2 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Database size={12} />
                Storage
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your resumes, cover letters and job applications are saved in
                this browser only. Clearing this sites data deletes them, export
                anything you want to keep.
              </p>
            </div>
          )}
          {isElectron() && (
            <div className="grid gap-4 py-4">
              <div className="space-y-3 p-3 rounded-xl bg-accent/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <ArrowUpCircle size={12} />
                      Software Update
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Current Version: v{appVersion || "0.0.0"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] font-bold uppercase tracking-widest gap-1.5"
                    onClick={handleCheckUpdates}
                    disabled={
                      updateStatus === "checking" ||
                      updateStatus === "downloading"
                    }
                  >
                    <RefreshCw
                      size={12}
                      className={cn(
                        updateStatus === "checking" && "animate-spin",
                      )}
                    />
                    {updateStatus === "checking"
                      ? "Checking..."
                      : "Check for Updates"}
                  </Button>
                </div>

                {updateStatus === "available" && (
                  <div className="flex items-center gap-2 text-[10px] text-primary font-bold animate-pulse">
                    <Download size={12} />
                    New update v{updateVersion} is available and downloading...
                  </div>
                )}
                {updateStatus === "downloading" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Download size={12} /> Downloading Update
                      </span>
                      <span>{Math.round(updateProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${updateProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {updateStatus === "downloaded" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400 font-bold">
                      <ArrowUpCircle size={12} />
                      Update v{updateVersion} is ready to install!
                    </div>
                    <Button
                      className="w-full h-8 text-[10px] font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white border-0"
                      onClick={handleRestartAndInstall}
                    >
                      Restart & Install Now
                    </Button>
                  </div>
                )}
                {updateStatus === "not-available" && (
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Your software is up to date.
                  </p>
                )}
                {updateStatus === "error" && updateError && globalDebugMode && (
                  <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/30">
                    <p className="text-[10px] font-bold text-destructive mb-1">
                      Update Failed
                    </p>
                    <pre className="text-[9px] text-destructive/80 whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
                      {updateError}
                    </pre>
                  </div>
                )}
              </div>

              <Separator className="my-1" />

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key size={14} />
                  Anthropic API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-ant-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Required for AI features like bullet improvement and summary
                  generation.
                </p>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bug-mode" className="flex items-center gap-2">
                    <Bug size={14} />
                    Bug Mode
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Enable persistent error notifications for debugging.
                  </p>
                </div>
                <Switch
                  id="bug-mode"
                  checked={globalDebugMode}
                  onCheckedChange={setGlobalDebugMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isElectron() ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSettingsOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={saveSettings}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setSettingsOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
