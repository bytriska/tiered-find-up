# @bytriska/priority-find-up

**A priority-aware file discovery utility that respects manifest order over directory depth.**

Unlike libraries like [find-up](https://github.com/sindresorhus/find-up.git) which return the first file encountered while walking up the directory tree, `@bytriska/priority-find-up` prioritizes your manifest order. It ensures that if a higher-priority file exists anywhere in the path up to the root, it will be preferred over a lower-priority file found closer to the current working directory.

## The Difference

Consider this file structure:
```text
/
└── home
    └── user
        ├── high-priority.png
        └── project
            └── src
                ├── low-priority.png
                └── app.js
```

### Standard `find-up` behavior
`find-up` stops at the first match it sees while walking up.
```js
import { findUp } from 'find-up';
// Starts at /src, finds 'low-priority.png' first.
await findUp(['high-priority.png', 'low-priority.png']); 
//=> '/home/user/project/src/low-priority.png'
```

### `@bytriska/priority-find-up` behavior
This library ensures the search respects the order of your array, regardless of depth.
```js
import { resolveOne } from '@bytriska/priority-find-up';

await resolveOne(['high-priority.png', 'low-priority.png']);
//=> { path: '/home/user/high-priority.png', priority: 0, ... }
```

---

## Installation

```bash
npm install @bytriska/priority-find-up
# or
pnpm add @bytriska/priority-find-up
```

---

## API Reference

### `resolveOne(manifest, options?)`
Finds the single highest-priority match based on the manifest order.

*   **manifest**: `string | string[] | string[][]` - An ordered list of candidates.
*   **options**: `ResolveOptions`
    *   `cwd`: Starting directory (default: `process.cwd()`).
    *   `boundaryDir`: Where to stop searching (default: system root).

**Returns**: `Promise<ResolutionEntry | null>`

### `resolveAll(manifest, options?)`
Finds all occurrences of items in the manifest, returned in the order of their priority.

**Returns**: `Promise<ResolutionEntry[]>`

### The `ResolutionEntry` Object
Matches are returned with the following metadata:

| Property | Type | Description |
| :--- | :--- | :--- |
| `path` | `string` | The absolute path to the file/folder. |
| `priority` | `number` | The index position in your manifest (lower is higher priority). |
| `identifier` | `string` | The name of the file that was matched. |
| `distance` | `number` | Levels of directories traversed (0 = current directory). |

## License
MIT
