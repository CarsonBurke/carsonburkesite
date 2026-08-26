import { media, type Media } from "../lib/media.ts";

export type Project = {
  id: string;
  name: string;
  kicker: string;
  summary: string;
  tags: string[];
  stats?: { label: string; value: string }[];
  details: string[];
  caveat?: string;
  links: { label: string; href: string; external?: boolean }[];
  media?: (Media & { alt: string; caption: string })[];
};

export const PROJECTS: Project[] = [
  {
    id: "trading-bot",
    name: "Trading bot 0",
    kicker: "Rust, PPO, IBKR, tch-rs",
    summary:
      "A variety of trading solutions including genetic algorithm parametric models, pretraining models, and reinforcement learning, trained on historical bars from the Interactive Brokers API. It is written in Rust, including the terminal interface dashboard.",
    tags: ["Rust", "tch-rs", "PPO", "Ratatui"],
    stats: [
      { label: "Parameters", value: "1.8M" },
      { label: "Tickers at once", value: "6" },
      { label: "Best benchmarked episode", value: "+11.8% vs index" },
    ],
    details: [
      "A transformer reads 6,000 steps of price history per ticker alongside macro and fundamental context, and PPO trains it to hold a target portfolio weight. Buying, selling and holding all fall out of rebalancing toward that weight.",
      "The whole stack is Rust, from the Interactive Brokers ingest through the tch-rs training loop to the terminal dashboard I watch runs in.",
      "Anything with a release date is joined point in time, so the agent never sees a macro figure before the market did. Lookahead is the easiest way to make a backtest look better than the strategy is.",
      "The repository also holds the programmatic strategies that came first, tuned over 600 generations by a genetic algorithm and scored on held out symbols. The RL agent went further, so that is where the work went.",
    ],
    caveat:
      "The index is an equal weight buy and hold of the same tickers over the same episode. Backtests on historical bars, not live money.",
    links: [
      {
        label: "Repository",
        href: "https://github.com/CarsonBurke/trading_bot_0",
        external: true,
      },
    ],
    media: [
      {
        ...media("tb-6-ticker-assets-benchmarked.webp"),
        alt: "Terminal interface plotting held assets, cash and total portfolio value against a benchmark index",
        caption:
          "Six tickers in the training interface. Assets are red, cash is green, the total is blue and the benchmark index is yellow.",
      },
      {
        ...media("tb-msft-buy-sell.webp"),
        alt: "Terminal interface marking buy and sell decisions along a price series",
        caption: "Buys and sells the agent placed on an active stretch of MSFT.",
      },
    ],
  },
  {
    id: "screeps-rl",
    name: "Screeps RL",
    kicker: "PyTorch, PPO, behavioural cloning",
    summary:
      "One 1.57M parameter model plays an entire Screeps colony, trained with behavioural cloning and then reinforcement learning.",
    tags: ["PyTorch", "PPO", "ViT", "Transformers"],
    stats: [
      { label: "Actor and critic params", value: "1.57M and 1.49M" },
      { label: "Parallel games", value: "12" },
      { label: "Env steps per second", value: "876" },
    ],
    details: [
      "Behavioural cloning from my hand written bot first, then PPO against the real game engine. The reward only covers harvesting and upgrading, and the rest is meant to be emergent.",
      "Actions are goals rather than keystrokes, such as harvest that source or claim that controller, and a deterministic executor handles pathfinding and traffic. It works a lot like tool calls with an LLM, and it saved a lot of training time and parameters.",
      "Twelve games run in parallel on xxscreeps instead of the official engine, and each starts from a state sampled across a 20,000 tick timeline rather than always from tick zero. Sampled starts were worth 82.7 against 20.0 in a greedy evaluation.",
      "The reinforced policy harvests both sources, runs a hauling lane to the controller, and reaches RCL3 in 7,600 ticks, where the cloned policy was still at RCL2 after 40,000.",
    ],
    links: [
      { label: "Read the write-up", href: "/writing/screeps-reinforcement-learning" },
      {
        label: "Code",
        href: "https://github.com/CarsonBurke/xxscreeps/tree/main/samples/rl",
        external: true,
      },
      {
        label: "Video",
        href: "https://youtu.be/rFsW3197xaY",
        external: true,
      },
    ],
    media: [
      {
        ...media("screeps-ppo-economy.webp"),
        alt: "Screeps room with the reinforced policy harvesting both energy sources and hauling to the controller",
        caption:
          "The reinforced policy running about 30 creeps, with both sources harvested and a hauling lane to the controller.",
      },
    ],
  },
  {
    id: "cleanrl",
    name: "CleanRL experiments",
    kicker: "PyTorch, ablations",
    summary:
      "A fork of CleanRL that I use as a lab. It holds about 25 research families that explore different optimization concepts like lejepa, latent prediction, successor features, better exploration, and in general testing and modifying solutions from papers I find compelling.",
    tags: ["PyTorch", "PPO", "TD7", "MuJoCo"],
    stats: [
      { label: "Research families", value: "~25" },
      { label: "Standard run", value: "8M steps" },
    ],
    details: [
      "Ideas out of papers I find compelling, reimplemented on one standard harness so their results are comparable. Each family gets an append only ledger, and every run is registered with a prediction and a kill bar before it starts.",
      "The strongest result so far is a state dependent noise head on TD7, at 17,122 against the baseline's 16,043 by 1M steps and never behind at a checkpoint.",
      "On the architecture side, a token MLP trunk with Peri-LN and a clean embedding path reached 4,843.9 against 3,962.8 for pre-norm alone, across fourteen variants.",
      "Runs go through a machine wide queue I wrote that admits them by how many can share the GPU, which is what keeps one card busy across this many experiments.",
    ],
    caveat:
      "Single seed runs on HalfCheetah-v4, scored on the last 20 or 30 episodes depending on the ledger, so these are engineering ablations rather than benchmark claims.",
    links: [
      { label: "Fork", href: "https://github.com/CarsonBurke/cleanrl", external: true },
      {
        label: "Ablation ledger",
        href: "https://github.com/CarsonBurke/cleanrl/blob/master/cleanrl/idbd/ABLATIONS.md",
        external: true,
      },
    ],
    media: [
      {
        ...media("cleanrl-ablations.webp"),
        alt: "Episodic return curves for many HalfCheetah runs drawn on one dark chart",
        caption:
          "Episodic return for 115 of the HalfCheetah-v4 ablation runs in the fork, averaged into 25,000 step bins. The band along the bottom is runs that never learned.",
      },
    ],
  },
  {
    id: "minimon-applet",
    name: "minimon-applet",
    kicker: "COSMIC, Rust, iced",
    summary:
      "A COSMIC panel applet that shows CPU, memory, network, disk and GPU usage which I contribute to upstream.",
    tags: ["Rust", "iced", "COSMIC", "Flatpak"],
    stats: [
      { label: "Merged upstream PRs", value: "20" },
      { label: "Upstream stars", value: "119" },
    ],
    details: [
      "My largest piece of it is the settings redesign, where one long scrolling page became a COSMIC style overview with a page per sensor.",
      "Most of the rest is per sensor configuration in place of global toggles, covering icon and label visibility, panel content order, and a temperature floor for the ring charts.",
      "I did the Flatpak packaging as well, including the application id Flathub requires and the install steps that go with it.",
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
    media: [
      {
        ...media("minimon-applet.webp"),
        alt: "COSMIC panel showing CPU, memory, network, disk and GPU readouts, with the applet popover open below them",
        caption:
          "The panel readouts and the expanded popover, from the upstream README.",
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
    note: "An open source Screeps bot, written by hand. It is also the teacher for my Screeps RL.",
    href: "https://github.com/The-International-Screeps-Bot/The-International-Open-Source",
  },
  {
    name: "mlqueue",
    note: "A machine wide queue for ML jobs, which admits runs by how many can share the GPU.",
    href: "https://github.com/CarsonBurke/mlqueue",
  },
  {
    name: "cTasks",
    note: "A task and process viewer for Linux, written with iced.",
    href: "https://github.com/CarsonBurke/cTasks",
  },
  {
    name: "screeps-arena-videoizer",
    note: "A patched Screeps Arena client that records replays headlessly and batches them into video.",
    href: "https://github.com/CarsonBurke/screeps-arena-videoizer",
  },
  {
    name: "tts",
    note: "A cross platform text to speech CLI, which I use for reading out status updates.",
    href: "https://github.com/CarsonBurke/tts",
  },
  {
    name: "tensorwatch",
    note: "A TensorBoard multiplexer and job queue UI.",
    href: "https://github.com/CarsonBurke/tensorwatch",
  },
];
