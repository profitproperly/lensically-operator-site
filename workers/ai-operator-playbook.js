const spec = `# AI Operator System — Transfer Spec

PURPOSE
Build a ChatGPT-centered operator system that survives chat loss, crashes, worker timeouts, and handoffs. The model does reasoning and execution decisions; durable authority lives outside the chat. The user remains the owner with veto authority. Routine authorized work can proceed without repeated permission checks, but protected or genuinely unapproved actions still keep their boundaries.

REFERENCE NAMES
M-BRAIN = durable control plane and continuity layer.
MCP Controller = fleet/infrastructure governor.
Correct Path = deterministic winning tool-route registry.
Failure Intelligence = losing-path + winning-path prevention ledger.
Work Units = canonical task authority.
Doors / Fleet Presence = instance identity and activity visibility.
M→M = inter-instance message bus.
Command Center = projection of authoritative events and state.

THE GAPS A NORMAL CHATGPT SETUP WILL NOT FIX BY ITSELF
1. Chat history is not durable authority. Persist important state externally.
2. Having tools is not deterministic routing. Preserve known winning invocations and prefer them before search or guessing.
3. A successful retry is not prevention. Save both the losing path and the winning path, repair the gate that allowed recurrence, then replay the triggering scenario.
4. An API success response is not proof of the intended real-world state. Verify the actual postcondition.
5. Scheduled prompts are not autonomous workers. A worker needs identity, wake logic, claim/resume, execution, checkpoint, and stop semantics.
6. Multiple chats are not a coordinated fleet. They need shared task authority, presence, direct messaging, collision rules, idempotency, and handoff semantics.
7. Logs are not enough unless the final state can be reconstructed causally.
8. Tool schema visibility is not execution proof. Source, deployment, runtime, client surface, and durable state can drift.
9. When the model says a capability is not native, treat that as an infrastructure gap when appropriate. Build the missing capability with an MCP, Worker/service, database, scheduler, repo, or controller instead of stopping at the limitation.

AUTHORITY MODEL
User: final business authority and veto.
Operator model: reasoning, planning, tool choices, execution decisions.
M-BRAIN: continuity, behavior bindings, Work Units, route knowledge, prevention knowledge, presence/message metadata.
Domain MCP/runtime: live operational truth for that domain.
MCP Controller: repos, deployments, fleet manifests, standards, parity and infrastructure governance.
Git: source and durable source artifacts.
Scheduler: wake-up mechanism only.
Observability store: causal events and telemetry.

Do not copy fast-changing domain facts into memory and pretend they remain current. Keep live facts canonical in the owning domain runtime. Use M-BRAIN for orientation, continuity, decisions, routes, prevention, and work state.

MINIMUM DURABLE OBJECTS
Work Unit:
- id
- objective
- phase
- plan_fingerprint
- owner/claim
- completed_steps
- current_action
- exact_next_action
- blocker
- verification_required
- mutation_surfaces
- version
- updated_at

Continuation capsule:
- work_unit_id
- current_status
- last_completed
- stop_boundary
- exact_next_action
- blocker_or_approval_boundary
- evidence pointers
- version

Correct Path entry:
- intent
- canonical owner/tool recipient
- exact action
- required arguments
- argument constraints
- prerequisites
- known losing shapes
- expected result
- verification step
- next action

Failure Intelligence entry:
- failure class
- triggering scenario
- losing path
- root boundary that failed
- winning path
- prevention rule
- regression replay/test
- evidence of repair

M→M message:
- sender_instance
- recipient_instance
- message_id/idempotency_key
- trace_id
- work_unit_id
- mutation_surface
- delta/evidence
- requested_action
- response state: ACK, HANDOFF, YIELD, REBASE, MERGE, ABORT

Causal event:
- timestamp
- instance_id
- trace_id
- work_unit_id
- reads
- decision
- tool call
- message
- mutation intent
- collision/retry
- verification
- commit/failure

TURN RESOLUTION ORDER
1. If resuming, read the exact continuation capsule first. Do not begin with broad search.
2. Resolve user intent and the canonical authority for that intent.
3. Resolve the Work Unit and phase.
4. Resolve the known Correct Path before forming tool candidates.
5. Check Failure Intelligence for known losing shapes and prevention rules.
6. Freeze one eligible action and its exact arguments.
7. Execute.
8. If a side effect is uncertain, reconcile current state before retrying.
9. Verify the real postcondition, not merely the command response.
10. Persist any new winning path or novel failure/prevention knowledge.
11. Advance the Work Unit and write a crash-safe checkpoint.
12. Report truthful state: done, active, next, blocker, or committed.

WORK LIFECYCLE
BRAINSTORM -> PLAN -> OPEN -> IN_PROGRESS -> VERIFYING -> COMMITTED

A code edit or API success is not COMMITTED. For consequential work, verify the relevant planes: source, focused regression/build, deployment, live runtime/canary, durable state, client surface, then close.

CORRECT PATH
Once a non-trivial tool invocation works, preserve the exact recipient, arguments, ordering, prerequisites, expected output, and verification. When that intent appears again, the known route should be resolved before guessing, broad search, or alternate tool formation.

FAILURE INTELLIGENCE
Store the losing path and the winning path. If the same failure class recurs, do not classify it as novel. Reopen the class, identify why the prevention gate failed, repair that gate, and replay from the recurrence point. The target is novel failures only.

AUTONOMOUS WORKER LOOP
ON WAKE:
1. Read global and worker RUN/DRAIN/HALT control.
2. Load exact continuation and canonical Work Unit queue.
3. Re-rank eligible work.
4. Claim one Work Unit with versioned ownership.
5. Execute real work, not status narration.
6. Checkpoint after material progress and before any stop boundary.
7. Continue until COMMITTED, truly blocked, drained, or runtime/turn limit is reached.
8. Release or expire the claim cleanly.

Do not put 'wait until later' in the work queue; time belongs to the scheduler. Do not let a worker spend a wake merely summarizing when executable work exists.

MULTI-INSTANCE COORDINATION
Each instance needs a stable ID, presence heartbeat, current Work Unit, current action, and declared mutation surfaces.

Use optimistic concurrency / compare-and-swap where possible:
mutation_id = instance_id + work_unit_id + plan_fingerprint + action_id + trace_id + attempt
read_set = exact surfaces read
write_set = exact surfaces intended to change
base_version = versions observed before mutation
result = COMMIT | MERGE | REBASE | YIELD | ABORT

Disjoint writes may proceed concurrently. Same-surface writes require deterministic merge/rebase/abort rules. Crashed workers must not leave immortal claims. Duplicate messages, duplicate ACKs, delayed ACKs, and uncertain side effects must be idempotent or reconcilable.

OBSERVABILITY
The system should reconstruct: which instance was live, which Work Unit it owned, what it read, what it decided, what tool it called, what message it sent, what mutation it attempted, whether it collided, why it retried, what verified, and why the final state is trusted.

Track at least wall-clock turn time, tool time, calls, failures, last activity, presence/door history, current Work Unit, active mutation surface, and trace ID. The dashboard must project authoritative events/state; do not create a second competing state machine in the UI.

PARITY / PROOF
For critical components verify:
SOURCE = exact code/commit/artifact identity
DEPLOYMENT = exact deployed version
RUNTIME = live canary behavior
CLIENT = expected tool/surface actually exposed
STATE = expected durable checkpoint/route/work data persisted
PARITY = required planes agree

A surfaced schema is not proof the execution path works. Prefer source-exact deployment and independently verified receipts where practical.

BUILD ORDER
1. Durable external state store for Work Units, continuation, routes, failures/wins, presence, messages, and events.
2. Gateway/router that is the turn entry point and resolves intent, authority, continuation, Correct Path, and prevention before tool selection.
3. Controller for repos, deployments, fleet governance, and parity.
4. Correct Path registry with exact invocation contracts.
5. Failure Intelligence with losing/winning paths, prevention, and replay.
6. Capsule-first persistent continuation across chats/crashes.
7. Scheduled workers with RUN/DRAIN/HALT, claim, execute, checkpoint, and release semantics.
8. Fleet presence and M→M messaging with ACK/handoff/yield/rebase/merge semantics.
9. Mutation-surface concurrency with versions/CAS/idempotency/crash recovery.
10. Causal observability and command center.
11. Certification against routing, recurrence, crash, duplicate, collision, handoff, parity, and live-deployment tests.

TESTS THAT ACTUALLY MATTER
- Fresh chat resumes exact next action without broad rediscovery.
- Known tool route is chosen correctly on the first attempt.
- A known losing invocation is prevented before execution.
- An uncertain side effect is reconciled instead of blindly replayed.
- Two workers perform disjoint writes concurrently without false blocking.
- Same-surface collision deterministically merges/rebases/aborts.
- A crashed worker loses its claim safely and another resumes from checkpoint.
- Duplicate message and duplicate ACK are idempotent.
- Delayed ACK does not corrupt ownership.
- Three-way contention cannot silently overwrite state.
- Full causal trace reconstructs final state.
- Source-to-deployment-to-runtime parity is proven.

DO NOT BUILD THESE FAILURE MODES
- One giant prompt pretending to be durable architecture.
- Memory as authority for live operational truth.
- Broad search before reading a known continuation target.
- Blind retries after mutation timeouts.
- Failure logs that omit the winning invocation.
- Workers that only summarize or wait.
- Multiple competing queues/task authorities.
- Concurrency based only on worker names instead of mutation surfaces.
- A dashboard that invents its own truth.
- Calling work complete before live verification.
- Treating 'the AI cannot do this natively' as the end when an external capability can supply the missing function.

BOOTSTRAP INSTRUCTION FOR THE AI BUILDING THIS
Read this specification as the architecture target. Build the smallest working version first, then harden it toward the full system. Do not pretend chat history is durable state. Do not pretend scheduled prompts alone are autonomous workers. Separate model reasoning from durable authority. Use one canonical task system, exact continuation checkpoints, deterministic known tool routes, failure-and-winning-path persistence, verification after side effects, explicit instance identity, message idempotency, mutation-surface concurrency control, causal observability, and source/runtime parity checks. Do not bypass safety or authorization boundaries. Ask only for facts or credentials that genuinely cannot be derived, created, or retrieved through available tools.

SUCCESS CONDITION
A chat can die, browser can crash, worker can time out, internet can drop, or another model instance can take over, and the system still knows the canonical objective, Work Unit, exact next action, correct tool path, known failure prevention, active peers, mutation ownership, evidence, and verification state. That is the difference between a helpful chat and an operator system.
`;

export default {
  async fetch() {
    return new Response(spec, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-ai-readable": "true"
      }
    });
  }
};
