export const msInHour = 3600000;
export const msInDay = 86400000;

export function msUntilFullMinute() {
    const date = new Date();
    date.setUTCMinutes(date.getUTCMinutes() + 1, 0, 0);

    return date.getTime() - Date.now();
}
export function msUntilFullHour() {
    const date = new Date();
    date.setUTCHours(date.getUTCHours() + 1, 0, 0, 0);

    return date.getTime() - Date.now();
}
export function msUntilNextDay() {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 1);
    date.setUTCHours(0, 0, 0, 0);

    return date.getTime() - Date.now();
}
export function msUntilNextMonth() {
    const date = new Date();
    date.setUTCMonth(date.getUTCMonth() + 1);
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime() - Date.now();
}

