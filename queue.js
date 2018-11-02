
var eventQueue = [];

function registerEventQueue(ctx, logfn) {
    ctx.time.addEvent({
        delay: 10,
        callback: function () {
            var curTime = new Date().getTime();
            for (var i = 0; i < eventQueue.length; i++) {
                var thing = eventQueue[i];

                if (thing.timeToRun <= curTime) {
                    thing.event();
                    thing.reschedule();
                }
            }

            registerEventQueue(ctx, logfn);
        },
        callbackScope: ctx
    });
}