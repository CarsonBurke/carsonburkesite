import screepsEconomy from "../assets/media/screeps-ppo-economy.webp";
import tradingAssets from "../assets/media/tb-6-ticker-assets-benchmarked.webp";
import tradingBuySell from "../assets/media/tb-msft-buy-sell.webp";

export type Project = {
  id: string;
  name: string;
  kicker: string;
  summary: string;
  tags: string[];
  stats: { label: string; value: string }[];
  details: string[];
  caveat?: string;
  links: { label: string; href: string; external?: boolean }[];
  media?: { src: string; alt: string; caption: string }[];
};

export const PROJECTS: Project[] = [
  {
    id: "trading-bot",
    name: "Trading bot 0",
    kicker: "Rust · PPO · IBKR",
    summary:
      "A PPO agent that sizes positions across a portfolio from historical IBKR bars. Rust the whole way down, including the TUI I use to start runs and read them.",
    tags: ["Rust", "tch-rs", "PPO", "Ratatui"],
    stats: [
      { label: "Parameters", value: "1.8M" },
      { label: "Tickers at once", value: "6" },
      { label: "vs index, episode 51", value: "+11.79%" },
      { label: "VRAM", value: "~12 GB" },
    ],
    details: [
      "Timesnet-style convolutions over percentage price deltas, then a grouped-query temporal attention stack with a streamed prefix/suffix cache so a long history is not re-encoded every step.",
      "One continuous action per ticker in [-1, 1]. Buy, sell, hold and direction are consequences of position sizing rather than a separate discrete head.",
      "Actor and critic share the convolutional features and split into their own fully-connected paths, so fitting the value function cannot drag the policy trunk around.",
      "The project started as programmatic strategies tuned by a genetic algorithm. Those are still in the repo, and the RL agent beat them by enough that I stopped maintaining them.",
    ],
    caveat: "Backtests on historical bars, not live money.",
    links: [
      {
        label: "Repository",
        href: "https://github.com/CarsonBurke/trading_bot_0",
        external: true,
      },
    ],
    media: [
      {
        src: tradingAssets,
        alt: "Terminal UI plotting held assets, cash and total portfolio value against a benchmark index",
        caption:
          "Six tickers in the training TUI: assets red, cash green, total blue, benchmark index yellow.",
      },
      {
        src: tradingBuySell,
        alt: "Terminal UI marking buy and sell decisions along a price series",
        caption:
          "Buys and sells the agent placed on a randomly chosen active stretch of MSFT.",
      },
    ],
  },
  {
    id: "redact",
    name: "Redact",
    kicker: "Day job · Electron · TypeScript",
    summary:
      "Redact deletes what you have already posted — across more than 35 platforms — with the scanning and deleting done on your own machine instead of on somebody's server.",
    tags: ["TypeScript", "React", "Electron", "Rust", "Playwright"],
    stats: [
      { label: "Users, per redact.dev", value: "1M+" },
      { label: "Supported services", value: "35+" },
      { label: "Desktop targets", value: "Win · macOS · Linux" },
    ],
    details: [
      "I work on the desktop client: the shared component library the app is assembled from, the data-broker dashboards and sortable tables, the local archive search surfaces, and the selects and date pickers everything else depends on.",
      "Also per-platform deletion engines, and the fixture generators that stand up realistic accounts to test them — you cannot verify a Messenger cleanup without a Messenger account full of junk to clean up.",
      "And the service pages and FAQs on the marketing site, generated from the same platform definitions the app itself uses, so the list cannot drift.",
      "A recurring constraint: stay debuggable without ever putting a user's content or credentials into a log line.",
    ],
    links: [{ label: "redact.dev", href: "https://redact.dev", external: true }],
  },
  {
    id: "screeps-rl",
    name: "Screeps RL",
    kicker: "PyTorch · PPO · behavioural cloning",
    summary:
      "One 1.57M-parameter policy plays an entire Screeps colony: every creep, spawn and tower gets an action on every simulator tick. Cloned from my old bot, then trained with PPO against the real engine.",
    tags: ["PyTorch", "PPO", "ViT", "Transformers"],
    stats: [
      { label: "Actor / critic", value: "1.57M / 1.49M" },
      { label: "Held-out score per tick", value: "82.7" },
      { label: "Parallel worlds", value: "12" },
      { label: "Env steps/s, compiled", value: "876" },
    ],
    details: [
      "Actions are goals, not keystrokes: harvest that source, transfer to that structure, claim that controller. A deterministic executor handles pathfinding and traffic, so the network never spends capacity rediscovering what a search does better.",
      "Legality is part of the action definition. Candidate masks come from the engine's own validators, so an illegal action is a defect rather than noise — 2 of them in a recorded 344,078.",
      "The critic predicts a 409-bin HL-Gauss distribution over signed-log returns instead of a scalar, because an empty room and a mature colony are not the same regression problem.",
      "Start states come from an event-stratified reservoir. Two runs matched on checkpoint, seed and optimizer and differing only in start states scored 82.7 against 20.0 per tick on held-out worlds.",
      "CUDA-graphing only the per-tick forward, and leaving the minibatch path eager, moved collection from about 531 to about 876 environment steps per second on one RTX 5090.",
    ],
    links: [
      { label: "Read the write-up", href: "/writing/screeps-reinforcement-learning" },
      {
        label: "Code",
        href: "https://github.com/CarsonBurke/xxscreeps/tree/main/samples/rl",
        external: true,
      },
    ],
    media: [
      {
        src: screepsEconomy,
        alt: "Screeps room with the reinforced policy saturating both energy sources and hauling to the controller",
        caption:
          "The reinforced policy: about 30 creeps, both sources saturated, a hauling lane to the controller.",
      },
    ],
  },
  {
    id: "cleanrl",
    name: "CleanRL experiments",
    kicker: "Ablations · falsification",
    summary:
      "A fork of CleanRL used as a lab. About 25 named research families, each a directory of single-file variants with a ledger and a kill rule written down before the runs start.",
    tags: ["PyTorch", "PPO", "TD7", "MuJoCo"],
    stats: [
      { label: "Research families", value: "~25" },
      { label: "Commits in the fork", value: "1,123" },
      { label: "Steps per run", value: "8M" },
    ],
    details: [
      "Best result so far: state-dependent Beta exploration noise on TD7, 17,122 against 16,043 at 1M steps. Both follow-up fixes regressed, so the line is closed rather than quietly retried.",
      "An HL-Gauss critic on TD7 cost 30% — 5,885 against 8,086. Right-sizing the support made it slightly worse, which falsified my own explanation and replaced it with a better one.",
      "Fourteen transformer-trunk variants: token-MLP plus Peri-LN plus Xavier on the trunk reached 4,843.9 ±66.0, against 3,962.8 ±158.5 for pre-norm alone. Xavier on the heads, borrowed from language-model practice, lost 141 points.",
      "A cheap ridge probe retired a whole planned direction: the JEPA latent explained about 25 fewer points of value variance than the raw trunk features at every checkpoint, and deleting the encoder entirely matched the best version that kept it.",
      "I also audited one of my own families and found its best result roughly 14x below my own frontier, which invalidated every comparison inside its ledger. That is written down too.",
    ],
    caveat:
      "Single seed, HalfCheetah-v4, scored on the last 20 episodes. Engineering ablations, not benchmark claims.",
    links: [
      { label: "Fork", href: "https://github.com/CarsonBurke/cleanrl", external: true },
      {
        label: "Ablation ledger",
        href: "https://github.com/CarsonBurke/cleanrl/blob/master/idbd/ABLATIONS.md",
        external: true,
      },
    ],
  },
  {
    id: "minimon-applet",
    name: "minimon-applet",
    kicker: "COSMIC · Rust · iced",
    summary:
      "A COSMIC panel applet showing CPU, memory, network, disk and GPU. I contribute upstream, mostly on the question of what actually earns space in your panel.",
    tags: ["Rust", "iced", "COSMIC", "Flatpak"],
    stats: [
      { label: "Upstream stars", value: "118" },
      { label: "Language", value: "Rust" },
    ],
    details: [
      "Configurable content order, so panel items sit where you put them instead of where the code happened to build them.",
      "Conditional display for temperature and GPU readouts: set a floor, and the item stays out of the panel until it matters.",
      "Ring-chart fill percentage, a higher refresh-rate ceiling, and a fix for the index underflow that reordering could trigger.",
      "Flatpak packaging plus the post-install steps, because an applet nobody can add to their panel is not shipped.",
    ],
    links: [
      {
        label: "My fork",
        href: "https://github.com/CarsonBurke/minimon-applet",
        external: true,
      },
      {
        label: "Upstream",
        href: "https://github.com/cosmic-utils/minimon-applet",
        external: true,
      },
    ],
  },
];

export type SmallProject = {
  name: string;
  note: string;
  href: string;
};

export const SMALLER_THINGS: SmallProject[] = [
  {
    name: "The International",
    note: "The open-source Screeps bot I used to play with. It is now the teacher the RL policy is cloned from.",
    href: "https://github.com/The-International-Screeps-Bot/The-International-Open-Source",
  },
  {
    name: "mlqueue",
    note: "A machine-wide queue that admits ML jobs by how many can share the GPU. Every run above goes through it.",
    href: "https://github.com/CarsonBurke/mlqueue",
  },
  {
    name: "cTasks",
    note: "A task and process viewer for Linux, written with iced.",
    href: "https://github.com/CarsonBurke/cTasks",
  },
  {
    name: "screeps-arena-videoizer",
    note: "Patches the Screeps Arena client so replays can be recorded headlessly and batched into video.",
    href: "https://github.com/CarsonBurke/screeps-arena-videoizer",
  },
  {
    name: "tts",
    note: "A cross-platform speech CLI, so long runs can tell me what happened without me watching.",
    href: "https://github.com/CarsonBurke/tts",
  },
];
