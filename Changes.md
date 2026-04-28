# Changes

A summary of all changes made on top of the original baseline, grouped by area.

## Frontend

### Layout (`web/src/App.tsx`)

- Pinned the app to the viewport: outer wrapper is a column flex with `height: 100vh` and `overflow: hidden`, so the page itself never scrolls.
- The header `<Section>` keeps its natural height; the body `<Section>` has `flex: 1` and `minHeight: 0` so the inner scroll regions actually engage.
- Each column `<Box>` is now the scroll container (`height: 100%`, `overflowY: auto`) and the previous `<Card>` wrappers were removed — they were causing the form's internal scrollbar to fall short of the panel's full height.
- Reordered the right-column conditional so the loading state renders ahead of stale simulation data while a new run is in flight.

### Form (`web/src/components/SimulateForm.tsx`)

- **Dynamic agents.** The form now supports an arbitrary number of bodies via a "+ Add Body" button and a per-body `×` remove button. Each body's seven fields are rendered by mapping over a small `FIELDS` config rather than 14 hand-written `FormField`s.
- **New body IDs.** `nextBodyId()` picks the smallest unused `Body{n}` so removing `Body2` and re-adding gives you `Body2` back, not `Body3`.
- **Submit guard.** Submit is disabled when there are zero bodies (in addition to during loading) and shows a `<Spinner/>` while a request is in flight.
- **Text hierarchy refresh.**
  - Removed the "Run a Simulation" heading and its `<Separator/>` — designed for power users who don't need the panel's purpose spelled out.
  - Promoted `Body1`/`Body2` headings from `h3`/`size=3` to `h2`/`size=4`, since the page already owns the `h1`.
  - Wrapped each `FormLabel`'s text in `<Text size="1" color="gray">` so labels recede beneath the section headings.
- **Bug fix — shared mutation.** `handleChange` now does `_.set(_.cloneDeep(prev), name, newValue)`. The previous `{...prev}` was a shallow copy, so `_.set` mutated nested objects (`Body1.position`, etc.) in place — every other reference to that object, including App's submitted snapshot, silently saw the new value.
- **Bug fix — stale closure on submit.** `handleSubmit`'s `useCallback` deps are now `[formData, onSubmitForm]`. Previously `[]`, then `[formData]` — both let the form keep calling a stale `onSubmitForm` whose `formData` closure was `null`, which manifested as an infinite loading spinner on resubmit.

### Viewer (`web/src/components/SimulationViewer.tsx`)

- Removed the "Simulation Data" heading and its `<Separator/>`.
- Added a light border (`1px solid var(--gray-a5)`) and rounded corners (`var(--radius-3)`) to the position and velocity `<Plot>` wrappers so the plot regions are clearly delimited.

### State / data flow (`web/src/App.tsx`, `web/src/hooks/useFetchSimulationData.ts`)

- `onSubmitForm` short-circuits with `_.isEqual(next, formData)` — if the submitted payload is structurally identical to the current state, no setters fire. This prevents an infinite loading state when resubmitting unchanged input, and preserves "don't resimulate if nothing changed."
- The fetch hook continues to drive off `useEffect([formData])`; nothing else needs to change because the guard above ensures the dep only changes when a real refetch is intended.

### Types (`web/src/types/formData.ts`)

- `FormData` is now `Record<string, BodyData>` (was a fixed `{ Body1, Body2 }`).
- `BodyData` is a new exported type holding the `position`/`velocity`/`mass` shape, reused for the dynamic form.

## Backend

### Dynamic agent registry (`app/modsim.py`, `app/simulator.py`)

- **Replaced the static `agents` dict.** It used to hardcode `Body1` and `Body2`; any third body crashed the simulator with `KeyError` at `Simulator.step` because `sim_graph` only knew those two keys.
- **`build_agents(agent_ids)`** now templates the same five state managers (velocity, position, mass, time, timeStep) for every body in the request. The velocity state manager's `consumed` query is built dynamically — each body lists every *other* agent's `position` and `mass` as inputs.
- **`propagate_velocity` is variadic.** Signature is now `(time_step, position, velocity, *others)`, where `others` is a flat alternating sequence `[pos1, mass1, pos2, mass2, ...]`. It sums pairwise gravitational pulls from every other body. The 1-body case (empty `others`) keeps velocity constant naturally — no special case.
- **`Simulator.__init__`** now calls `build_agents(list(init.keys()))` so `sim_graph` always matches the keys actually submitted.

### Physics behavior change worth noting

- In the old model, `Body1`'s velocity state manager was `identity` — `Body1` cruised at constant velocity, only `Body2` felt gravity. With full pairwise N-body, every body now accelerates due to every other body. Existing two-body trajectories will look slightly different than before.

## Type checking

- Resolved a TS narrowing complaint in `SimulateForm.tsx` where `_.get(formData, fieldName) as FormValue` failed because lodash inferred a `BodyData` return type. Cast routes through `unknown` (`as unknown as FormValue`) to make the conversion explicit.
