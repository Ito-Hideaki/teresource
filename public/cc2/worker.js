import init, { run_as_js, push_frontend_message, bonk } from "./cold_clear_2.js";

(async () => {
    await init();
    run_as_js();
})();

onmessage = e => {
    push_frontend_message(e.data);
};