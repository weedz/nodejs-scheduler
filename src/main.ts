export interface Task<T = unknown> {
    name: string;
    fn: () => T | Promise<T>;
    timeout: undefined | NodeJS.Timeout;
    getNextExecutionTime: () => number;
    lastExecutionTime: number;
    errorHandler?: (err: unknown) => unknown;
    successHandler?: (result: T) => unknown;
}

export const msInHour = 3600000;
export const msInDay = 86400000;

export function msUntilFullMinute() {
    const date = new Date(Date.now() + 60000);
    date.setUTCSeconds(0, 0);

    return date.getTime() - Date.now();
}
export function msUntilFullHour() {
    const date = new Date(Date.now() + msInHour);
    date.setUTCMinutes(0, 0, 0);

    return date.getTime() - Date.now();
}
export function msUntilNextDay() {
    const date = new Date(Date.now() + msInDay);
    date.setUTCHours(0, 0, 0, 0);

    return date.getTime() - Date.now();
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

interface ScheduleOpts {
    errorHandler?: Task["errorHandler"];
    successHandler?: Task["successHandler"];
}

export function allTasks() {
    return tasks.values();
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
