import { component$, isDev } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

import "./global.css";
import "highlight.js/styles/github-dark-dimmed.css";

export default component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <meta charset="utf-8" />
      <title>{head.title}</title>
      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      {!isDev && (
        <link
          rel="manifest"
          href={`${import.meta.env.BASE_URL}manifest.json`}
        />
      )}
      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}
      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}
      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}
      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});
