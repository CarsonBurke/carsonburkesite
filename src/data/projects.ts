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
    kicker: "Rust, PPO, IBKR",
    summary:
      "A PPO agent that sizes positions across a portfolio of tickers, trained on historical bars from the Interactive Brokers API. It is written in Rust, including the terminal interface I use to start runs and read the results.",
    tags: ["Rust", "tch-rs", "PPO", "Ratatui"],
    stats: [
      { label: "Parameters", value: "1.8M" },
      { label: "Tickers at once", value: "6" },
      { label: "Best benchmarked episode", value: "+11.8% vs index" },
    ],
    details: [
      "The observation encoder runs Timesnet style convolutions over percentage price deltas, then a grouped query attention stack with a streamed cache, so a long history is not re-encoded on every step.",
      "The action is one continuous value per ticker between -1 and 1. Buying, selling and holding are results of the position size rather than separate outputs.",
      "The actor and critic share the convolutional features and then split into their own fully connected paths, so fitting the value function does not move the policy trunk.",
      "The repository also holds the earlier programmatic strategies, with parameters tuned by a genetic algorithm. The RL agent scored higher, so I stopped extending them.",
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
      "One policy with 1.57M parameters plays an entire Screeps colony, giving every creep, spawn and tower an action on every simulator tick. I cloned it from my old bot, then trained it with PPO against the real game engine.",
    tags: ["PyTorch", "PPO", "ViT", "Transformers"],
    stats: [
      { label: "Actor and critic", value: "1.57M and 1.49M" },
      { label: "Parallel worlds", value: "12" },
      { label: "Env steps per second", value: "876" },
    ],
    details: [
      "Actions are goals rather than keystrokes, such as harvest that source, transfer to that structure, or claim that controller. A deterministic executor handles pathfinding and traffic, so the network does not spend capacity on a problem a search already solves.",
      "Legality is part of the action definition. Candidate masks come from the engine's own validators, so an illegal action is a defect to report rather than noise to learn around. There were 2 in a recorded 344,078.",
      "The critic predicts a 409 bin HL-Gauss distribution over signed log returns instead of a single number, because an empty room and a mature colony are not the same regression problem.",
      "Start states come from an event stratified reservoir. Two runs matched on checkpoint, seed and optimizer, and differing only in start states, scored 82.7 against 20.0 summed over five held out scenarios.",
      "CUDA graphing only the per tick forward pass, and leaving the minibatch path eager, moved collection from about 531 to about 876 environment steps per second on one RTX 5090.",
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
      "A fork of CleanRL that I use as a lab. It holds about 25 research families, and each one is a directory of single file variants with a ledger and a kill rule written before the runs start.",
    tags: ["PyTorch", "PPO", "TD7", "MuJoCo"],
    stats: [
      { label: "Research families", value: "~25" },
      { label: "Standard run", value: "8M steps" },
    ],
    details: [
      "The best result so far is a state dependent noise head on TD7, with entropy confined to the actor loss. It scored 17,122 against 16,043 at 1M steps, and led the baseline at every checkpoint.",
      "Bounded Beta noise was the more interesting hypothesis and lost anyway. Both single change fixes for its late game deficit regressed, so I closed the line and recorded that the Gaussian advantage is still unexplained.",
      "An HL-Gauss critic on TD7 cost 30% more compute and was killed at 65k steps, scoring 5,885 against 8,086. Right sizing the support made it slightly worse, which falsified my support geometry explanation.",
      "Across fourteen transformer trunk variants, a token MLP with Peri-LN and Xavier initialisation on the trunk reached 4,843.9 with a range of 66.0, against 3,962.8 with a range of 158.5 for pre-norm alone. Xavier on the heads scored -141.4.",
      "A ridge probe closed a planned direction early. The JEPA latent explained about 25 fewer points of value variance than the raw trunk features at every checkpoint, and removing the encoder matched the best version that kept it.",
      "I audited one of my own families and found its best result about 14 times below my own frontier, which invalidated the comparisons inside its ledger. The audit is in the ledger too.",
    ],
    caveat:
      "Single seed runs on HalfCheetah-v4, averaged over the last 20 or 30 episodes depending on the ledger. The ranges are within run episode intervals rather than seed variance, so these are engineering ablations rather than benchmark claims.",
    links: [
      { label: "Fork", href: "https://github.com/CarsonBurke/cleanrl", external: true },
      {
        label: "Ablation ledger",
        href: "https://github.com/CarsonBurke/cleanrl/blob/master/cleanrl/idbd/ABLATIONS.md",
        external: true,
      },
    ],
  },
  {
    id: "minimon-applet",
    name: "minimon-applet",
    kicker: "COSMIC, Rust, iced",
    summary:
      "A COSMIC panel applet that shows CPU, memory, network, disk and GPU usage. I contribute upstream, mostly on which readouts earn space in a panel.",
    tags: ["Rust", "iced", "COSMIC", "Flatpak"],
    stats: [{ label: "Upstream stars", value: "118" }],
    details: [
      "Configurable content order, so panel items appear where you put them.",
      "Conditional display for temperature and GPU readouts. You set a floor, and the item stays hidden below it.",
      "Ring chart fill percentage, a higher refresh rate ceiling, and a fix for the index underflow that reordering could trigger.",
      "Flatpak packaging and the post install steps needed to add the applet to a panel.",
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
    note: "An open source Screeps bot, written by hand. It is the teacher for the Screeps RL policy.",
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
    note: "A cross platform speech CLI that reads out status updates from long runs.",
    href: "https://github.com/CarsonBurke/tts",
  },
  {
    name: "tensorwatch",
    note: "A supervisor and single window dashboard for long lived TensorBoard instances.",
    href: "https://github.com/CarsonBurke/tensorwatch",
  },
];
