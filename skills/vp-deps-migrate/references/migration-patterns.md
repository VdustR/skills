# Migration Patterns & Strategies

This file covers **methodology** for building migration plans, with common examples as illustrations. Specific API mappings become outdated; methodology stays relevant.

## API Mapping Methodology

1. **List all source API imports** across codebase (use Grep tool or `rg "from '<source>'" --type ts --type js`)
2. **For each import**, find target equivalent in docs (Context7, migration guides, target library API reference)
3. **Classify each mapping**:
   - ✅ Direct equivalent (same behavior, different import)
   - ⚠️ Different API (requires code changes)
   - ❌ No equivalent (needs custom wrapper or alternative approach)
4. **Prioritize**: most-used APIs first — migrate the 80% before worrying about edge cases
5. **Handle "no equivalent"**: ask user, implement custom wrapper, or document as manual step

## Library Replacement Patterns

### Date Libraries (moment → date-fns / dayjs)

**Key differences**: date-fns uses standalone functions (tree-shakeable), dayjs has a plugin system similar to moment.

| Pattern | moment | date-fns | dayjs |
|---------|--------|----------|-------|
| Format | `moment().format('YYYY-MM-DD')` | `format(new Date(), 'yyyy-MM-dd')` | `dayjs().format('YYYY-MM-DD')` |
| Parse | `moment('2024-01-01')` | `parseISO('2024-01-01')` | `dayjs('2024-01-01')` |
| Add time | `moment().add(1, 'day')` | `addDays(new Date(), 1)` | `dayjs().add(1, 'day')` |
| Diff | `moment(a).diff(b, 'days')` | `differenceInDays(a, b)` | `dayjs(a).diff(b, 'day')` |

**Watch out**: Format token differences (YYYY vs yyyy), mutability (moment mutates, date-fns doesn't).

### Utility Libraries (lodash → es-toolkit)

**Compat layer available**: `es-toolkit/compat` provides lodash-compatible API.

| Strategy | Approach | When to use |
|----------|----------|------------|
| Compat-first | Change `import _ from 'lodash'` → `import _ from 'es-toolkit/compat'` | Large codebase, gradual migration |
| Full replacement | Map each lodash function to es-toolkit native API | Small codebase, clean break |

### HTTP Clients (axios → fetch / ky)

| Pattern | axios | fetch | ky |
|---------|-------|-------|-----|
| GET | `axios.get(url)` | `fetch(url)` | `ky.get(url).json()` |
| POST JSON | `axios.post(url, data)` | `fetch(url, { method: 'POST', body: JSON.stringify(data) })` | `ky.post(url, { json: data }).json()` |
| Interceptors | `axios.interceptors.request.use(fn)` | Custom wrapper function | `ky.extend({ hooks: { beforeRequest: [fn] } })` |
| Error handling | `catch(err) { err.response.status }` | `if (!res.ok) throw` | `catch(err) { err.response.status }` |

**Watch out**: axios auto-parses JSON; fetch requires `.json()`. axios throws on 4xx/5xx; fetch doesn't.

### Bundlers (webpack → vite)

This is primarily a **config migration**, not code migration:
- `webpack.config.js` → `vite.config.ts`
- Loaders → Vite plugins (most have equivalents)
- `require()` / `module.exports` → ESM imports
- Dev server config migration
- Environment variables: `process.env.` → `import.meta.env.`

**Verify by running**: `vite build` and `vite dev` against real source files, not type-checking snippets.

### State Management (redux → zustand / jotai)

| Pattern | redux | zustand | jotai |
|---------|-------|---------|-------|
| Store | `createStore(reducer)` | `create((set) => ...)` | `atom(initialValue)` |
| Read state | `useSelector(fn)` | `useStore(fn)` | `useAtomValue(atom)` |
| Update state | `dispatch(action)` | `set({ ... })` | `useSetAtom(atom)` |
| Middleware | `applyMiddleware(...)` | `create(devtools(persist(...)))` | Built-in utilities |

## API Pattern Migration

### React 19 — forwardRef Removal

| Deprecated | Replacement |
|-----------|-------------|
| `React.forwardRef((props, ref) => ...)` | `function Component({ ref, ...props })` |
| `React.forwardRef<HTMLDivElement, Props>((props, ref) => ...)` | `function Component({ ref, ...props }: Props & { ref?: React.Ref<HTMLDivElement> })` |

**Codemod**: Check for `npx react-codemod` transforms.

### React 19 — use() Hook

| Old Pattern | New Pattern |
|------------|-------------|
| `useContext(MyContext)` | `use(MyContext)` |
| `useEffect(() => { fetch().then(setData) }, [])` | `const data = use(fetchPromise)` (with Suspense) |

### Vue 3 — Options API to Composition API

| Options API | Composition API |
|------------|-----------------|
| `data() { return { x: 1 } }` | `const x = ref(1)` |
| `computed: { y() { ... } }` | `const y = computed(() => ...)` |
| `methods: { doThing() { ... } }` | `function doThing() { ... }` |
| `watch: { x(val) { ... } }` | `watch(x, (val) => { ... })` |
| `mounted() { ... }` | `onMounted(() => { ... })` |

## Compat Layer Strategy

When a compat layer is available:

1. **Phase 1**: Swap import paths only (e.g., `lodash` → `es-toolkit/compat`)
2. **Verify**: Run tests — everything should still pass
3. **Phase 2** (optional, later): Migrate from compat to native API incrementally
4. **Benefit**: Immediate bundle size improvement with zero behavior change risk

| Library | Compat Package | Import Change |
|---------|---------------|---------------|
| lodash | es-toolkit/compat | `from 'lodash'` → `from 'es-toolkit/compat'` |
| moment | dayjs (partial) | Plugin-based compat for common APIs |

## Common Pitfalls

| Pitfall | Description | Mitigation |
|---------|-------------|-----------|
| Behavioral differences | Same API name, different behavior (e.g., deep vs shallow clone) | Test with edge cases |
| Async vs sync | Target library may be async where source was sync | Check all call sites |
| Import style | Default vs named exports, tree-shaking differences | Verify bundle size |
| Type differences | TypeScript types may differ in strictness | Run type check early |
| Side effects | Some libraries have import side effects that new ones don't | Check for implicit dependencies |
| CSS/style imports | Style-related deps may need different import patterns | Check `.css`, `.scss` imports |
