export interface Task {
    name: string;
    fn: () => unknown | Promise<unknown>;
    timeout: undefined | NodeJS.Timeout;
    getNextExecutionTime: () => number;
    errorHandler?: (err: unknown) => unknown;
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
    try {
        await task.fn();
    } catch (err) {
        task.errorHandler?.(err);
    }
    // Make sure we don't restart a stopped task
    if (task.timeout) {
        task.timeout = setTimeout(runTask, task.getNextExecutionTime(), task);
    }
}

const tasks: Map<string, Task> = new Map();

export function schedule(name: string, fn: () => number, period = () => 1000, errorHandler?: Task["errorHandler"]) {
    const task: Task = {
        name,
        fn,
        timeout: undefined,
        getNextExecutionTime: period,
        errorHandler,
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
