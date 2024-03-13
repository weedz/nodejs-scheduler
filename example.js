import { msUntilFullHour, msUntilFullMinute, msUntilNextDay, msUntilNextMonth, rescheduleTask, schedule, stopTask } from "./dist/main.js";

console.log("Current date:", new Date().toISOString());

console.log("Until next minute:", msUntilFullMinute(), new Date(Date.now() + msUntilFullMinute()));
console.log("Until next full hour:", msUntilFullHour(), new Date(Date.now() + msUntilFullHour()));
console.log("Until next day:", msUntilNextDay(), new Date(Date.now() + msUntilNextDay()));
console.log("Until next month:", msUntilNextMonth(), new Date(Date.now() + msUntilNextMonth()));

schedule("the thing", async () => {
    console.log(`[${new Date().toISOString()}] The thing`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
}, () => msUntilFullMinute());

schedule("other thing", async () => {
    console.log(`[${new Date().toISOString()}] Other thing`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
}, () => msUntilFullMinute() + 5000);

setTimeout(() => {
    if (stopTask("the thing")) {
        console.log("Stopped task 'the thing', this will not run again");
        setTimeout(() => {
            if (rescheduleTask("the thing")) {
                console.log("Re-scheduled task 'the thing'");
            } else {
                console.log("Failed to restart task 'the thing', this should not happen..");
            }
        }, 140000);
    } else {
        console.log("Failed to stop task 'the thing', this should not happen..");
    }
}, 140000);
