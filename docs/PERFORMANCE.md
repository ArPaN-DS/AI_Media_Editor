# Performance and resource engineering

The implementation uses resource admission, model lifecycle control, adaptive quality, block-oriented audio processing, fused video soundtrack edits, thread tuning and compact reasoning context. See [the engineering guide](ENGINEERING.md) and [resource diagram](diagrams/resource-governance.svg) for mechanisms and source references.

## What the implementation controls

| Mechanism | Scope | Tradeoff |
|---|---|---|
| Scheduler admission | Governed CPU, encode, GPU and model operations inside one process | Waiting can improve stability while adding queue time |
| Resource reservations | Estimates shared between in-flight governed operations | Estimates are not a hard OS memory limit |
| Single active managed model | Models entering `ModelLifecycleManager` sessions | Lower concurrent resident memory at the cost of loading/serialization |
| Optional model keepalive | Short repeated-operation bursts with sufficient headroom | Faster reuse retains memory briefly |
| Quality ladders / cooldowns | Registered capability variants | Lower tiers can reduce quality to fit resources |
| Learned runtime estimates | Recorded seconds per work unit | Predictions depend on representative prior observations |
| Streaming audio DSP | Suitable loudness, limiting, normalization and EQ paths | Does not cover every processor or neural engine |
| Fused soundtrack edits | Compatible consecutive audio effects on video | Requires compatible plan dependencies |
| Thread defaults / lazy libraries | Numeric and inference runtimes using the tuning helpers | Best settings remain hardware/workload dependent |

A separately hosted reasoning model has its own memory lifecycle. In-process model serialization does not guarantee that only one model exists across the entire machine. Multiple application processes also do not share the scheduler's locks or reservations.

## Benchmark status

Earlier documentation included workstation-specific before/after figures and commands referencing deleted personal test/benchmark files. The current public tree no longer contains the corresponding reproduction harness and inputs. Those figures are not presented here as independently verified performance claims.

The present review performed app smoke checks and targeted privacy checks, not end-to-end model performance measurements. No universal speedup, memory ceiling, minimum hardware guarantee or maximum clip duration is asserted.

## A reproducible benchmark contribution

Use synthetic media whose generation recipe can be published. Keep generated files and raw execution logs out of the repository. Record:

| Category | Required context |
|---|---|
| Version | Git revision, Python/FFmpeg versions and dependency lock or package snapshot |
| Hardware | CPU/core count, system RAM, accelerator/VRAM, drivers and OS |
| Models | Exact model revision/hash, variant, quality tier and download source |
| Input | Generation recipe, duration, sample rate/channels or image/frame dimensions |
| Conditions | Cold vs warm model/cache, concurrency and background workload |
| Time | Queue wait, model load time, processing wall time and total request/job time |
| Memory | Peak RSS/private memory and device allocation, with measurement method |
| Output | Format, dimensions/duration, media validity and an appropriate quality measure |
| Repetitions | Run count, spread and handling of failures/timeouts |

Measure both warm and cold paths when evaluating keepalive. Compare variants under the same hardware and input conditions. Include output quality when reporting faster lower-cost inference. Run contention scenarios before claiming improved behavior under concurrency.

There is currently no versioned `perf/` harness or maintained personal-media regression suite. A future synthetic benchmark harness should be reviewable, avoid private paths in published results and explicitly declare which engines it exercises.
