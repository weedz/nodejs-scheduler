import { msUntilFullHour, msUntilNextDay, schedule, stopTask } from "./main.js";

console.log("Current date:", new Date().toISOString());

console.log("Until next full hour:", msUntilFullHour());
console.log("Until next day:", msUntilNextDay());

schedule("the thing", async () => {
    console.log(`[${new Date().toISOString()}] The thing`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
}, 60000);

schedule("other thing", async () => {
    console.log(`[${new Date().toISOString()}] Other thing`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
}, 60000, 5000);

setTimeout(() => {
    if (stopTask("the thing")) {
        console.log("Stopped task 'the thing', this will not run again");
    }
}, 140000);
