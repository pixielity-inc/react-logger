import { useState } from "react";
import { Button } from "@heroui/react";

import { useLogger, useLoggerContext } from "@abdokouta/react-logger";
import DefaultLayout from "@/layouts/default";
import { title, subtitle } from "@/components/primitives";

function ContextDemo() {
  const logger = useLogger();

  // Automatically adds/removes context on mount/unmount
  useLoggerContext({ component: "ContextDemo", page: "advanced" });

  const handleLog = () => {
    logger.info(
      "Log with automatic context — check console for { component, page }",
    );
  };

  return (
    <div className="rounded-xl border border-separator bg-background p-4">
      <p className="text-lg font-semibold mb-3">useLoggerContext Hook</p>
      <p className="text-sm text-muted mb-3">
        This component uses <code>useLoggerContext</code> to automatically
        attach{" "}
        <code>
          {"{"} component: &quot;ContextDemo&quot;, page: &quot;advanced&quot;{" "}
          {"}"}
        </code>{" "}
        to every log.
      </p>
      <Button variant="primary" onPress={handleLog}>
        Log with auto-context
      </Button>
    </div>
  );
}

function ManualContextDemo() {
  const logger = useLogger();
  const [contextKey, setContextKey] = useState("userId");
  const [contextValue, setContextValue] = useState("42");

  const handleAddContext = () => {
    logger.withContext({ [contextKey]: contextValue });
    logger.info("Context added", { added: { [contextKey]: contextValue } });
  };

  const handleClearContext = () => {
    logger.withoutContext();
    logger.info("Context cleared");
  };

  const handleLogWithContext = () => {
    logger.info("Message with shared context — check console");
  };

  return (
    <div className="rounded-xl border border-separator bg-background p-4">
      <p className="text-lg font-semibold mb-3">Manual Context Management</p>
      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 rounded-lg border border-separator bg-surface px-3 py-2 text-sm"
          placeholder="Key"
          value={contextKey}
          onChange={(e) => setContextKey(e.target.value)}
        />
        <input
          className="flex-1 rounded-lg border border-separator bg-surface px-3 py-2 text-sm"
          placeholder="Value"
          value={contextValue}
          onChange={(e) => setContextValue(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="primary" onPress={handleAddContext}>
          withContext()
        </Button>
        <Button variant="outline" onPress={handleClearContext}>
          withoutContext()
        </Button>
        <Button variant="outline" onPress={handleLogWithContext}>
          Log message
        </Button>
      </div>
    </div>
  );
}

function ChannelSwitchDemo() {
  const consoleLogger = useLogger("console");
  const storageLogger = useLogger("storage");
  const errorLogger = useLogger("errors");

  const handleMultiChannel = () => {
    consoleLogger.info("Logged to console channel");
    storageLogger.info("Logged to storage channel");
    errorLogger.error("Logged to errors channel");
  };

  return (
    <div className="rounded-xl border border-separator bg-background p-4">
      <p className="text-lg font-semibold mb-3">Multi-Channel Logging</p>
      <p className="text-sm text-muted mb-3">
        Log to multiple channels simultaneously. Each channel has its own
        transporters.
      </p>
      <Button variant="primary" onPress={handleMultiChannel}>
        Log to console + storage + errors
      </Button>
    </div>
  );
}

export default function AdvancedPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center">
          <span className={title()}>Advanced&nbsp;</span>
          <span className={title({ color: "blue" })}>Patterns&nbsp;</span>
          <div className={subtitle({ class: "mt-4" })}>
            Context management, multi-channel logging, and hooks
          </div>
        </div>

        <div className="w-full max-w-2xl flex flex-col gap-4">
          <ContextDemo />
          <ManualContextDemo />
          <ChannelSwitchDemo />
        </div>
      </section>
    </DefaultLayout>
  );
}
