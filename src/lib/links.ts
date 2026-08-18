/**
 * Every link that leaves this site opens in a new tab. Spread these attributes
 * rather than repeating them, so one anchor cannot drift from the rest.
 */
export const NEW_TAB = { target: "_blank", rel: "noreferrer" } as const;

export const REPOS = {
  github: "https://github.com/CarsonBurke",
  site: "https://github.com/CarsonBurke/carsonburkesite",
  tradingBot: "https://github.com/CarsonBurke/trading_bot_0",
  cleanrl: "https://github.com/CarsonBurke/cleanrl",
  kaggle: "https://www.kaggle.com/competitions",
} as const;
