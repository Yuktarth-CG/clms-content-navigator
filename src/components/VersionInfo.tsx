import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { versionLog, getCurrentVersion } from "@/data/versionLog";

export const VersionInfo = () => {
  const [open, setOpen] = useState(false);
  const currentVersion = getCurrentVersion();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="text-xs">v{currentVersion}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Version History
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {versionLog.map((entry, index) => (
              <div key={entry.version} className="border-l-2 border-border pl-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    v{entry.version}
                  </Badge>
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
      </DialogContent>
    </Dialog>
  );
};