/**
* export @typedef Task
* @prop {number} name
* @prop {() => unknown | Promise<unknown>} fn
* @prop {number} timeout
* @prop {() => number} getNextExecutionTime
*/

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

/**
 * @param {Task} task
 */
async function runTask(task) {
    try {
        await task.fn();
    } catch (_err) {
        // TODO: propagate this to a caller/handler somewhere?
        // uncaught error in task
    }
    // Make sure we don't restart a stopped task
    if (task.timeout) {
        task.timeout = setTimeout(runTask, task.getNextExecutionTime(), task);
    }
}

/** @type {Map<string, Task>} */
const tasks = new Map();

/**
 * @param {string} name
 * @param {Task["fn"]} fn
 * @param {() => number} [period=() => 1000]
 */
export function schedule(name, fn, period = () => 1000) {
    /** @type {Task} */
    const task = {
        name,
        fn,
        timeout: 0,
        getNextExecutionTime: period,
    };
    task.timeout = setTimeout(runTask, task.getNextExecutionTime(), task);
    tasks.set(name, task);
}

/**
 * @param {string} name
 */
export function stopTask(name) {
    const task = tasks.get(name);
    if (task) {
        clearTimeout(task.timeout);
        task.timeout = 0;
        return true;
    }
    return false;
}
/**
 * @param {string} name
 * @param {null|number} [offset=null]
 * @param {number} [period=0]
 */
export function rescheduleTask(name, period = null, offset = 0) {
    const task = tasks.get(name);
    if (task) {
        if (period !== null) {
            task.period = period;
        }
        clearTimeout(task.timeout);
        task.timeout = setTimeout(runTask, task.period + offset, task);
        return true;
    }
    return false;
}
