---
title: Reinforcement learning in Screeps
date: 2026-08-17
summary: Behavioural cloning from my old bot, then PPO against the real engine. The policy learns to harvest and haul well, and it stops building.
tags: RL, PPO, Screeps, PyTorch
code: https://github.com/CarsonBurke/xxscreeps/tree/main/samples/rl
video: https://youtu.be/rFsW3197xaY
discussion: https://www.reddit.com/r/screeps/comments/1vrb5o8/screeps_reinforcement_learning/
---

I haven't been playing the game for a while, doing other programming things like machine
learning instead. I've learned a lot, especially from Kaggle challenges, and decided to try
my hand at machine learning in Screeps. The code is in the
[`samples/rl` directory of my xxscreeps fork](https://github.com/CarsonBurke/xxscreeps/tree/main/samples/rl).

First I pretrain the model on
[The International](https://github.com/The-International-Screeps-Bot/The-International-Open-Source),
my hand-written bot, with behavioural cloning, so it tries to copy what the bot does using a
set of data I collected while running it. It can perform all kinds of actions, but it isn't
efficient or directional.

Then I do reinforcement learning on it. I reward it for harvesting and upgrading, and I
expect the rest to be emergent, which sort of happens. It gets good at harvesting and
upgrading, it runs stationary harvesters and hauling well, and it also learns to stop
building. The rollouts are too short for it to see the benefits of building. I'm happy with
the results given my budget.

```youtube
rFsW3197xaY :: The reinforced policy at 1.3M steps, recorded in the Screeps client.
```

```gallery
screeps-bc-building.webp :: Cloned from the teacher. About 33 creeps, construction sites scattered across the room rather than clustered into a base, and still RCL2 after 40,000 ticks.
screeps-ppo-economy.webp :: After PPO. About 30 creeps, both sources harvested, a hauling lane to the controller, RCL3 in 7,600 ticks, and no construction sites at all.
```

## Solution Details

To get more technical, the model has 1.5M parameters. A ViT reads patches of room
tiles (4 rooms max) covering terrain, sources and the controller, and an entity transformer reads the
entities, covering creeps, spawns and towers. Each entity gets a head that outputs its
action.
[AlphaStar](https://www.nature.com/articles/s41586-019-1724-z) was part of the inspiration,
though I figured autoregressive actioning and temporal recursion would be too expensive for
the benefit, so I skipped them.

Then there is a separate critic with 1.5M parameters, where I take a
[VAPO](https://arxiv.org/html/2504.05118v3) style approach and make the critic Monte-Carlo,
so it gets signal from the whole rollout for itself and for the actor's advantages. It hurts
learning speed a bit, and it lets the model learn from returns that arrive much later.

```pipeline
xxscreeps world | real engine | 50x50 rooms
Observation | 201 KB per tick | masks included
Actor | 1.57M params | masked per-entity heads
Executor | pathfinding | traffic | engine intents
```

Actions are generally goals, such as harvest that source (and move if necessary), transfer to that
structure, or claim that controller. The executor takes one move towards or action on
the goal each tick, and the policy re-picks its goal every tick. The network is saved from difficult intricacies such as pathfinding, which saved me a lot of training time and params, and is a lot like tool calls with LLMs.

## Training and Rollouts

[xxscreeps](https://github.com/laverdet/xxscreeps) lets me do fast parallel rollouts. I think
I did 12 games at once for 512 steps, and each one took under a couple of seconds. If I used
the normal Screeps engine it would have taken days to train. The speed partly avoids the
large scale parallelism that Ben Bartlett had to use in
[Overmind-RL](https://github.com/bencbartlett/Overmind-RL/tree/master).

An important part of this setup is that runs start from initial states from a 20,000-tick timeline. This allows the model to see diverse states without having to play them start to finish each time. Runs went for 1.25 million steps, or about 2 hours wall-clock.

![Two PPO runs sharing a cloned checkpoint, seed, optimizer and code fingerprint, differing only in start states](screeps-training-curves.webp "Same checkpoint, same seed, same optimizer, same code. The only difference is where episodes start.")

The two runs above are matched on checkpoint, seed, optimizer and code, and both stop at
update 204 and global step 1,259,520. The only difference is where their episodes start.
Held-out evaluation on fresh worlds that neither run trained on, summed over five scenarios,
agrees with the curves.

| | Reservoir | Tick-zero only |
|---|---:|---:|
| Score per tick | 82.7 | 20.0 |
| Controller progress rate | 27.2 | 0.1 |
| Remote-room harvesting | 32,228 | 0 |
| Remote energy delivered home | 311 | 0 |
| Room claims | 2 | 0 |

## Performance and Development

A 512-tick update across 12 environments, followed by 12 optimizer steps, takes about 16
seconds on one RTX 5090. I got a lot of performance uplift from compiling (including cuda graphs), batching syncs, fusing kernels, and cleaning up AI slop. Opus/Fable 5 and GPT 5.6 were immense help with this project, and they are great at writing kernels and pipelines, but have a horrible sense for strategy (designing the model and how it should learn) and do not have a good intuition for where performance is going. My own code review as well as detailed profiling as instrumental to get things cleaned up and well optimized.

One caveat applies to every number and clip above. They all predate the current objective
and the move to a single teacher. Back then cloning learned from my hand-written planner as
well as The International, and now the planner is only a baseline to beat. A rerun from the
real teacher alone is in progress.

## Limitations and Future Work

There were a lot of compromises to get it training fast on my single RTX 5090. With a bigger
budget I would have done longer rollouts to let it build and explore more game features. It
should be able to claim, colonize and expand too. Notably, horizon investments like construction would likely become prevelant. I suspect this is a project for someone with more compute than me.

Thanks to [Ben](https://github.com/bencbartlett/Overmind-RL/tree/master) for the inspiration.
