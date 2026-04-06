import { useState } from "react";
import { Button } from "@heroui/react";

import { useLogger } from "@abdokouta/react-logger";
import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";

const CHANNELS = [
  "console",
  "storage",
  "combined",
  "errors",
  "audit",
  "silent",
];

export default function LoggerPage() {
  const [selectedChannel, setSelectedChannel] = useState("console");
  const [logs, setLogs] = useState<string[]>([]);
  const logger = useLogger(selectedChannel);

  const addLog = (level: string, message: string) => {
    setLogs((prev) =>
      [
        `[${level.toUpperCase()}] [${selectedChannel}] ${message}`,
        ...prev,
      ].slice(0, 20),
    );
  };

  const handleDebug = () => {
    logger.debug("Debug message from UI", {
      channel: selectedChannel,
      timestamp: Date.now(),
    });
    addLog("debug", "Debug message from UI");
  };

  const handleInfo = () => {
    logger.info("Info message from UI", {
      channel: selectedChannel,
      action: "user-click",
    });
    addLog("info", "Info message from UI");
  };

  const handleWarn = () => {
    logger.warn("Warning message from UI", {
      channel: selectedChannel,
      severity: "medium",
    });
    addLog("warn", "Warning message from UI");
  };

  const handleError = () => {
    logger.error("Error message from UI", {
      channel: selectedChannel,
      code: "ERR_DEMO",
    });
    addLog("error", "Error message from UI");
  };

  const handleFatal = () => {
    logger.fatal("Fatal message from UI", {
      channel: selectedChannel,
      critical: true,
    });
    addLog("fatal", "Fatal message from UI");
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center">
          <span className={title()}>Logger&nbsp;</span>
          <span className={title({ color: "blue" })}>Demo&nbsp;</span>
          <div className={subtitle({ class: "mt-4" })}>
            Test all log levels and switch between channels
          </div>
        </div>

        <div className="w-full max-w-2xl flex flex-col gap-4">
          {/* Channel Selection */}
          <div className="rounded-xl border border-separator bg-background p-4">
            <p className="text-lg font-semibold mb-3">Channel Selection</p>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <Button
                  key={ch}
                  variant={selectedChannel === ch ? "primary" : "outline"}
                  onPress={() => setSelectedChannel(ch)}
                >
                  {ch}
                </Button>
              ))}
            </div>
          </div>

          {/* Log Methods */}
          <div className="rounded-xl border border-separator bg-background p-4">
            <p className="text-lg font-semibold mb-3">Log Methods</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onPress={handleDebug}>
                debug()
              </Button>
              <Button variant="primary" onPress={handleInfo}>
                info()
              </Button>
              <Button variant="outline" onPress={handleWarn}>
                warn()
              </Button>
              <Button variant="danger" onPress={handleError}>
                error()
              </Button>
              <Button variant="outline" onPress={handleFatal}>
                fatal()
              </Button>
            </div>
          </div>

          {/* Log Output */}
          <div className="rounded-xl border border-separator bg-background p-4">
            <p className="text-lg font-semibold mb-3">Log Output</p>
            <p className="text-sm text-muted mb-2">
              Check your browser console for actual output. Recent actions:
            </p>
            <div className="rounded-lg bg-surface p-3 font-mono text-xs max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted">
                  No logs yet. Click a button above.
                </p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="py-0.5">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
