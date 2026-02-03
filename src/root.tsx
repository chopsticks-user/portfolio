import { $, component$, useOnDocument } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";

import "./global.css";
import "highlight.js/styles/github-dark-dimmed.css";
import RouterHead from "~/router-head";

export default component$(() => {
  useOnDocument(
    "qinit",
    $(() => {
      inject({ mode: "production" });
      injectSpeedInsights({});
    })
  );

  return (
    <QwikCityProvider>
      <head>
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
