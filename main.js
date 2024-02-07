/**
* export @typedef Task
* @prop {number} name
* @prop {number} period
* @prop {() => unknown | Promise<unknown>} fn
* @prop {number} timeout
*/

export const msInHour = 3600000;
export const msInDay = 86400000;

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
    const start = Date.now();
    await task.fn();
    const timeDrift = Date.now() - start;
    // Make sure we don't restart a stopped task
    if (task.timeout) {
        task.timeout = setTimeout(() => runTask(task), task.period - timeDrift);
    }
}

/** @type {Map<string, Task>} */
const tasks = new Map();

/**
 * @param {string} name
 * @param {Task["fn"]} fn
 * @param {number} period
 * @param {number} [offset=0]
 */
export function schedule(name, fn, period, offset = 0) {
    const task = {
        name,
        fn,
        period,
        timeout: 0,
    };
    task.timeout = setTimeout(() => runTask(task), task.period + offset);
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
        task.timeout = setTimeout(() => runTask(task), task.period + offset);
        return true;
    }
    return false;
}
