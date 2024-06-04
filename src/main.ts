export interface Task<T = unknown> {
    name: string;
    fn: () => T | Promise<T>;
    timeout: undefined | NodeJS.Timeout;
    getNextExecutionTime: () => number;
    lastExecutionTime: number;
    errorHandler?: (err: unknown) => unknown;
    successHandler?: (result: T) => unknown;
}

async function runTask(task: Task) {
    task.lastExecutionTime = Date.now();
    try {
        const result = await task.fn();
        task.successHandler?.(result);
    } catch (err) {
        task.errorHandler?.(err);
    }
    // Make sure we don't restart a stopped task
    if (task.timeout) {
        task.timeout = setTimeout(runTask, task.getNextExecutionTime(), task);
    }
}

const tasks: Map<string, Task> = new Map();

export function allTasks() {
    return tasks.values();
}

interface ScheduleOpts {
    errorHandler?: Task["errorHandler"];
    successHandler?: Task["successHandler"];
}
export function schedule(name: string, fn: () => number, period: Task["getNextExecutionTime"] = () => 1000, opts: ScheduleOpts = {}) {
    const task: Task = {
        name,
        fn,
        timeout: undefined,
        getNextExecutionTime: period,
        lastExecutionTime: 0,
        errorHandler: opts.errorHandler,
        successHandler: opts.successHandler,
    };
    task.timeout = setTimeout(runTask, task.getNextExecutionTime(), task);
    tasks.set(name, task);
}

export function stopTask(name: string) {
    const task = tasks.get(name);
    if (!task) {
        return false;
    }
    clearTimeout(task.timeout);
    task.timeout = undefined;
    return true;
}

export function rescheduleTask(name: string, period?: Task["getNextExecutionTime"]) {
    const task = tasks.get(name);
    if (!task) {
        return false;
    }
    if (period) {
        task.getNextExecutionTime = period;
    }
    clearTimeout(task.timeout);

    task.timeout = setTimeout(runTask, task.getNextExecutionTime(), task);
    return true;
}

export * from "./lib.js";
