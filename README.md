# nodejs-scheduler

[![npm](https://img.shields.io/npm/v/@weedzcokie/scheduler?style=flat-square)](https://www.npmjs.com/package/@weedzcokie/scheduler)

## Example

More examples in <https://github.com/weedz/nodejs-scheduler/blob/master/example.js>

```ts
import schedule, { msUntilFullMinute } from "@weedzcokie/scheduler";

schedule("task", () => {
    console.log("Hello, world!");
}, msUntilFullMinute);
```
