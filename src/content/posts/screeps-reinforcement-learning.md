---
title: Reinforcement learning in Screeps
date: 2026-08-17
summary: Behavioural cloning from my old bot, then PPO against the real engine. It gets very good at harvesting and hauling, and quietly stops building.
tags: RL, PPO, Screeps, PyTorch
code: https://github.com/CarsonBurke/xxscreeps/tree/main/samples/rl
discussion: https://www.reddit.com/r/screeps/comments/1vrb5o8/screeps_reinforcement_learning/
---

I haven't been playing the game for a while, doing other programming things like machine
learning instead. I've learned a lot, especially from Kaggle challenges, and decided to try
my hand at machine learning in Screeps.

First, I pretrain the model on my bot — behavioural cloning, so it just tries to copy what
the bot does using a bunch of data I collected running it. It can perform all kinds of
actions but isn't very efficient or directional.

Then I do reinforcement learning on it. I reward it for harvesting and upgrading and expect
the rest to be emergent, which sort of happens. It gets really good at harvesting and
upgrading, does stationary harvesters and hauling really well, but also learns to stop
building eventually. The rollouts are too short that it doesn't end up seeing the benefits
of building. Regardless, I'm happy with the results given my budget.

```gallery
screeps-bc-building.webp :: Cloned from the teacher: about 33 creeps, construction sites scattered across the room instead of clustered into a base, still RCL2 after 40,000 ticks.
screeps-ppo-economy.webp :: After PPO: about 30 creeps, both sources saturated, a hauling lane to the controller, RCL3 in 7,600 ticks — and not a single construction site.
```

## What's in the model

To get more technical, it's a ~1.5M parameter model with a ViT over patches of room tiles
(terrain, sources, controller) and an entity transformer for the entities (creeps, spawns,
towers), each getting a head that outputs actions for the entity. Inspired somewhat by
AlphaStar, though I figured autoregressive actioning and temporal recursion would be too
expensive for marginal benefit, so I skipped them.

Then a separate 1.5M parameter critic, where I take a VAPO-style approach of making the
critic Monte-Carlo so it can get signal from the whole rollout for itself and also for the
actor's advantages. It hurts learning speed a bit, but makes it so the model can learn from
very far out returns.

```pipeline
xxscreeps world · real engine · 50x50 rooms
Observation · 201 KB per tick · masks included
Actor · 1.57M params · masked per-entity heads
Executor · pathfinding · traffic · engine intents
```

An action is a goal rather than a keystroke: harvest that source, transfer to that
structure, claim that controller. The executor takes one navigation or work step toward it
each tick, and the policy re-picks its goal every tick, so it can abandon a route halfway.
That keeps the network out of the business of rediscovering pathfinding, which a search
does better anyway.

The other half of that is legality. A transfer is legal until the target fills, a tile
until something occupies it, so the candidate masks come from the engine's own validators
and an illegal action becomes a defect to report rather than noise to learn around. Two of
them in a recorded 344,078.

## Where the training signal comes from

xxscreeps allows me to do really fast parallel rollouts. I think I did 12 games at once for
512 steps, each taking under a couple of seconds. If I used the normal Screeps engine it
would have taken days to train. This partly avoids the immense parallelism that Ben had to
do in his approach.

The thing that mattered most, though, wasn't throughput. Twelve environments that all start
at tick zero advance in lockstep, so every update draws from the same narrow band of a
20,000-tick timeline, and anything that only matters later — remote hauling, for instance —
stops appearing and gets unlearned.

![Two PPO runs sharing a cloned checkpoint, seed, optimizer and code fingerprint, differing only in start states](screeps-training-curves.webp "Same checkpoint, same seed, same optimizer, same code. The only difference is where episodes start.")

Both runs stop at update 204 and global step 1,259,520. The tick-zero-only run falls to 8
creeps by update 60 and settles near a score of 4; the reservoir run holds 27 to 35 creeps
and climbs past 15. Held-out evaluation on fresh 20,000-tick worlds agrees:

| | Reservoir | Tick-zero only |
|---|---:|---:|
| Score per tick | 82.7 | 20.0 |
| Controller progress rate | 27.2 | 0.1 |
| Remote-room harvesting | 32,228 | 0 |
| Remote energy delivered home | 311 | 0 |
| Room claims | 2 | 0 |

So PPO now draws start states from an event-stratified reservoir: half the fleet on
untouched full lifecycles, the rest resumed from snapshots of recent runs, successful and
failed, plus a small teacher lane to bridge phases the policy can't reach yet. Snapshots
are stratified by event rather than sampled periodically, because periodic sampling just
overrepresents long plateaus. Evaluation never uses snapshots — a policy scored from
restored states is never made to reach them.

## What it costs

A 512-tick update across 12 environments, followed by 12 optimizer steps, takes about 16
seconds on one RTX 5090, and 7.7 of those seconds are collection. Collection is thousands
of tiny launch-bound calls, one per simulated tick at batch 12, so CUDA-graphing the
per-tick forward and leaving the minibatch path eager took it from about 531 to about 876
environment steps per second. The capture pool for the minibatch path wanted roughly
28.5 GB and didn't fit, which is exactly why that half stays eager.

Scores on ten fresh 20,000-tick worlds that neither training nor teacher collection ever
touched, decoded greedily, measuring `harvested_energy + controller_progress` per tick:

| Scenario | Score/tick |
|---|---:|
| `empty`, one spawn in a bare room | 17.1 |
| `seed_creep`, one seeded worker | 18.5 |
| `seed_claimer`, plus 2 room claims | 17.4 |
| `seed_full`, an inherited mature colony | 13.1 |
| `seed_outpost`, a neutral outpost | 16.6 |

## What I'd do with a bigger budget

There were a lot of compromises to get it training fast on my single RTX 5090. If I had a
bigger budget I would have done longer rollouts to allow it to build and explore more game
features. It should be able to claim, colonize and expand too. Maybe a project for someone
with more resources than me.

Construction is the honest open problem. Under greedy decoding the reinforced policy places
no sites at all, while the cloned policy built 18,582 energy of them over a 40,000-tick
sampled run and stayed at RCL2 for its trouble. Those runs discounted at `gamma = 0.995`, a
200-tick effective horizon against an extension that repays over thousands — but delayed
payoff can't be the whole story, since a creep body repays over roughly 1,500 ticks and
spawning survived just fine. The current 2,000-tick window tests that directly.

Thanks to Ben for the inspiration.
