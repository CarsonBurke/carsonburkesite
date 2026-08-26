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
      "Prices reach the model as 6,000 percentage deltas per ticker, embedded in 240 patches and read by a three layer grouped query attention trunk with rotary positions and four query heads to one key value head.",
      "Alongside the prices I cross attend in ten FRED series, countdowns to the next jobs, CPI, FOMC and GDP releases, and earnings figures down to EPS surprise. One function builds the observation for both training and live inference, so the two paths cannot drift.",
      "FRED dates a release without timing it. Each one stays hidden until the following NYSE open, which keeps a number the market had not seen out of the observation.",
      "The action is a target portfolio weight, drawn from a Beta distribution on 0 to 1, with cash taking the rest. Buying, selling and holding are what rebalancing toward that weight looks like, and the book is long only.",
      "Actor and critic share the whole trunk and separate only at the readout, where two learned queries pool the patch embeddings into one vector each. Only the critic learns for the first 100 episodes, which warms up its 255 bin value distribution against a policy that is not moving.",
      "The genetic algorithm strategies came first and are still in the repository. Their 96 symbol universe splits 4/1/1 into train, validation and test, and the numbers I report for them come from the test split. The RL agent scored higher, so I stopped extending them.",
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
      "One 1.57M parameter model plays an entire Screeps colony, trained with behavioural cloning and then reinforcement learning.",
    tags: ["PyTorch", "PPO", "ViT", "Transformers"],
    stats: [
      { label: "Actor and critic params", value: "1.57M and 1.49M" },
      { label: "Parallel games", value: "12" },
      { label: "Env steps per second", value: "876" },
    ],
    details: [
      "Actions are goals rather than keystrokes, such as harvest that source, transfer to that structure, or claim that controller. A deterministic executor handles pathfinding and traffic, which saved me a lot of training time and parameters.",
      "Candidate masks come from the engine's own validators, so an illegal action is a bug to fix rather than noise to learn around. Out of 344,078 actions I recorded, 2 were illegal.",
      "I have the critic predict a 409 bin HL-Gauss distribution over signed log returns, because a scalar head has to fit an empty room and a mature colony with one regression.",
      "Rollouts start from states drawn out of a 20,000 tick timeline, stratified by event. Two runs matched on checkpoint, seed and optimizer, differing only in their start states, scored 82.7 against 20.0 under greedy evaluation.",
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
      "A fork of CleanRL that I use as a lab. It holds about 25 research families that explore different optimization concepts like lejepa, latent prediction, successor features, better exploration, and in general testing and modifying solutions from papers I find compelling.",
    tags: ["PyTorch", "PPO", "TD7", "MuJoCo"],
    stats: [
      { label: "Research families", value: "~25" },
      { label: "Standard run", value: "8M steps" },
    ],
    details: [
      "IDBD never actually fired. Its step size meta learning sat at the initial 0.05 for all 8M steps, so everything filed under it was really per parameter SGD plus per head gradient clipping, which a plain SGD control then reproduced at 500k. The version I got to act scored 2,212 against 3,712.",
      "The best variant so far is a state dependent noise head on TD7, at 17,122 against the baseline's 16,043 by 1M steps, and never behind at a checkpoint. Its entropy term stays in the actor loss, because moving it into the backup cost 14 to 15% on the Gaussian and Beta policies alike.",
      "Bounded Beta noise was level with the Gaussian baseline at 200k and ahead at 300k, then fell behind and stayed there. Both single change fixes for the late game deficit regressed, so I closed the line and recorded the gap as unexplained.",
      "I killed an HL-Gauss critic on TD7 at 65k steps, 5,885 against 8,086. Right sizing the support made it slightly worse, which falsified my support geometry explanation. The 51 bin version never learned at all, its minimum climbing to meet its maximum once bin width passed the action value gaps.",
      "Across fourteen transformer trunk variants, a token MLP with Peri-LN, Xavier initialisation on the trunk and a clean embedding path reached 4,843.9 plus or minus 66.0 at 6.5M steps, against 3,962.8 plus or minus 158.5 at 8M for pre-norm alone. Xavier on the heads scored -141.4.",
      "A ridge probe closed a planned direction before I ran it. The JEPA latent explained about 25 fewer points of value variance than the raw trunk features at every checkpoint, and deleting the encoder scored 9,953 against 10,071 for the best variant that kept it.",
      "I audited one of my own families and found its best result about 14 times below this repository's frontier. That voided the value judgments in its ledger, though the mechanism contrasts still hold. The audit is in the ledger too.",
    ],
    caveat:
      "Single seed runs on HalfCheetah-v4, averaged over the last 20 or 30 episodes depending on the ledger. The plus or minus figures are 95% confidence intervals on the within run episode mean rather than seed variance, so these are engineering ablations rather than benchmark claims.",
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
      "I rebuilt the settings popup upstream. One long scrolling page became a COSMIC style overview with a page per sensor, and a tab bar for the sensors that report more than one reading.",
      "Icons and text labels are set per sensor instead of by one global toggle, and the numeric readout is now called a value, so it no longer shares a name with the label beside it.",
      "Panel content order is configurable, up and down a row at a time, including the bounds fix for pressing up on the first item. That used to underflow.",
      "A sensor the machine does not have drops out of the reorder list instead of sitting there dead. That covers CPU temperature in a virtual machine, or a GPU the backend cannot read.",
      "I added a minimum temperature for ring charts, so the fill runs from 30 degrees up to the chip's critical temperature instead of leaving the bottom third unused.",
      "I did the Flatpak packaging too, including the application id Flathub requires and the install and post install steps for getting the applet onto a panel.",
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
