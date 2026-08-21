// Smoke test for dsh-context-length browser half.
// Simulates the DSH module-loader environment in Node and verifies that
// apply() registers the settings.section entry (id=context-length, order 11)
// and that the component renders its skeleton without throwing.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const requireFrom = createRequire(import.meta.url);
const clientPath = fileURLToPath(new URL("../lib/client.js", import.meta.url));
const source = readFileSync(clientPath, "utf8");

// ---- mock browser env ----
globalThis.window = globalThis;
globalThis.document = undefined; // CSS injection is skipped in Node

let loaded = null;
globalThis.window.__ModuleLoader__ = {
  load(arg) {
    loaded = arg;
  }
};

// ---- mock require: react + react/jsx-runtime from a matched react/react-dom pair ----
// The factory's `require("react")` must come from the SAME react copy as the
// react-dom/server used for SSR rendering, otherwise React throws a
// "Objects are not valid as a React child" mismatch. Locate a pair by:
//   1. the DCL_TEST_REACT_ROOT env var (point it at a node_modules dir that
//      contains react and react-dom), or
//   2. the plugin-local node_modules (if react + react-dom are installed for
//      testing).
// Without either, the SSR render check is skipped (everything else still runs).
const reactRoot = process.env.DCL_TEST_REACT_ROOT ?? null;
let reactForTests = null;
if (reactRoot !== null) {
  reactForTests = {
    react: reactRoot + "/react",
    jsxRuntime: reactRoot + "/react/jsx-runtime",
    reactDomServer: reactRoot + "/react-dom/server"
  };
} else {
  try {
    const react = requireFrom.resolve("react");
    const reactDomServer = requireFrom.resolve("react-dom/server");
    const root = react.slice(0, react.indexOf("/react"));
    reactForTests = { react, jsxRuntime: react.slice(0, react.length), reactDomServer };
    void root;
  } catch {
    reactForTests = null;
  }
}
const mockRequire = (spec) => {
  if (reactForTests === null) throw new Error(`react not configured; set DCL_TEST_REACT_ROOT to a node_modules dir with react + react-dom`);
  if (spec === "react") return requireFrom(reactForTests.react);
  if (spec === "react/jsx-runtime") return requireFrom(reactForTests.jsxRuntime);
  throw new Error(`unexpected require: ${spec}`);
};

// ---- evaluate the bundle (factory registration only) ----
// eslint-disable-next-line no-eval
(0, eval)(source);
if (loaded === null) throw new Error("module did not call __ModuleLoader__.load");

// ---- materialize the factory ----
const mod = loaded.factory(mockRequire);
if (mod === null || typeof mod !== "object") throw new Error("factory did not return module.exports");
console.log("module exports:", Object.keys(mod).join(", "));
console.log("NS:", mod.NS);

// ---- mock cordis ctx ----
const registered = [];
const slotInjections = new Map();
const zhDict = {}; // filled by locale.register for the mock t lookup
const mockCtx = {
  effect(fn) {
    fn();
    return () => {};
  },
  locale: {
    register(ns, dicts) {
      Object.assign(zhDict, dicts.zh);
      console.log("locale.register:", ns, "zh keys:", Object.keys(dicts.zh).length, "en keys:", Object.keys(dicts.en).length);
    },
    bind() {
      return (key, params) => {
        const base = zhDict[key] ?? key;
        return params ? base.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? "")) : base;
      };
    }
  },
  get(name) {
    if (name === "connection") return { api: { llm: {}, settings: {}, credentials: {} } };
    return {};
  },
  settingsScope: {
    describe() {
      return {
        ensure: async () => {},
        getSnapshot: () => ({ status: "idle", view: undefined, error: null })
      };
    }
  },
  settingsSchema: {
    getPath: () => undefined,
    hasPath: () => false,
    setPath: () => ({}),
    deletePath: (root) => root,
    nodeAtPath: () => undefined,
    rehydrate: (x) => x,
    validate: () => undefined
  },
  slots: {
    inject(name, fn) {
      slotInjections.set(name, fn);
    },
    register(options, component) {
      registered.push({ options, component });
      return { options, component, dispose: () => {} };
    }
  }
};

// ---- run apply ----
mod.apply(mockCtx);

// ---- test configuredProvidersOf filtering ----
const providers = [
  { provider: "newapi", displayName: "newapi", settingsNs: "llm-pi-ai", settingsPath: ["providers", "newapi"], active: true },
  { provider: "huoshan", displayName: "火山", settingsNs: "llm-pi-ai", settingsPath: ["providers", "huoshan"], active: true },
  { provider: "openai", displayName: "OpenAI", settingsNs: "llm-pi-ai", settingsPath: ["providers", "openai"], active: false },
  { provider: "anthropic", displayName: "Anthropic", settingsNs: "llm-pi-ai", settingsPath: ["providers", "anthropic"], active: false },
  { provider: "modlens", displayName: "modlens", settingsNs: "", settingsPath: [], active: true }
];
const nsMap = new Map([
  ["llm-pi-ai", { ns: "llm-pi-ai", value: { providers: { newapi: { models: [] }, huoshan: { models: [] } } } }]
]);
const filterSchema = { getPath: (value, path) => (path.reduce((acc, key) => (acc == null ? undefined : acc[key]), value)) };
const configured = mod.configuredProvidersOf(providers, nsMap, filterSchema);
const got = configured.map((p) => p.provider).join(",");
console.log("configuredProvidersOf ->", got);
if (got !== "newapi,huoshan") throw new Error(`unexpected configured providers: ${got}`);

// ---- test resolveModelId (auto model selection) ----
const models = [
  { id: "deepseek-v4-flash", contextWindow: 1000000 },
  { id: "glm-5.2" }
];
if (mod.resolveModelId(models, "") !== "deepseek-v4-flash") throw new Error("should auto-pick the first model when none selected");
if (mod.resolveModelId(models, "glm-5.2") !== "glm-5.2") throw new Error("should keep an existing selection");
if (mod.resolveModelId(models, "gone") !== "deepseek-v4-flash") throw new Error("should fall back to the first model for a stale selection");
if (mod.resolveModelId([], "x") !== "") throw new Error("empty model list should clear the selection");
console.log("resolveModelId: auto-select works");

// ---- trigger the settings.section injection and inspect the registration ----
const injectFn = slotInjections.get("settings.section");
if (injectFn === undefined) throw new Error("settings.section slot was not injected");
const reg = injectFn();
if (reg === undefined) throw new Error("slot injection returned nothing");
console.log("registered settings.section options:", JSON.stringify({
  id: reg.options.id,
  order: reg.options.order,
  label: typeof reg.options.label === "function" ? reg.options.label() : reg.options.label
}, null, 2));
console.log("component name:", reg.component.name);

if (reg.options.id !== "context-length") throw new Error("wrong section id");
if (reg.options.order !== 11) throw new Error(`wrong order: ${reg.options.order}`);
if (reg.options.label() !== "上下文长度") throw new Error(`wrong label: ${reg.options.label()}`);

// ---- render the component (SSR, optional) ----
// SSR does not run effects, so this verifies the initial render path (loading
// skeleton) executes without throwing. The data-driven branches are covered by
// the pure-function tests above.
if (reactForTests === null) {
  console.log("DCL_TEST_REACT_ROOT not set and react is not installed locally; skipping SSR render check");
} else {
  const React = requireFrom(reactForTests.react);
  const renderer = requireFrom(reactForTests.reactDomServer);
  const injected = reg.options.inject();
  const api = { llm: { providers: async () => ({ result: { ok: true, value: { providers: [] } } }) }, settings: {}, credentials: {} };
  const describe = {
    ensure: async () => {},
    getSnapshot: () => ({ status: "idle", view: undefined, error: null })
  };
  const schema = mockCtx.settingsSchema;
  const t = mockCtx.locale.bind();
  const el = React.createElement(reg.component, { ...injected, api, schema, describe, t, close: () => {} });
  const html = renderer.renderToString(el);
  console.log("rendered HTML length:", html.length);
  if (html.length === 0) throw new Error("component rendered nothing");
}
console.log("SMOKE TEST PASSED");
