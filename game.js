var strs = {
    commit: "Commit",
    release: "Release",
    merge: "Merge"
}

var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
        preload: preload,
        create: create
    },
    physics: {
        default: 'arcade',
        arcade: {
             gravity: { y: 100 }
         }
     },
};

var game = new Phaser.Game(config);

function preload() {
}

function create() {
    state.logText = this.add.text(10, 10, '', { font: '14px Consolas', fill: '#CCC' });
    logMessage("Welcome!");

    var index = 0;
    basePos = [10, 10 + 50 + 200 * index];

    var commitGraph = new CommitGraph(this, 600, window.innerWidth - 700, window.innerHeight);
    var maintainer = new Maintainer(commitGraph);

    commitGraph.commitButton = this.add
        .text(1000, 10, strs.commit,
            { fill: '#CCC', fontFamily: 'Consolas', fontSize: 32, stroke: '#CCC', strokeThickness: 2 })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', function () { maintainer.Commit(); });
    commitGraph.mergeButton = this.add
        .text(1250, 10, strs.merge,
            { fill: '#CCC', fontFamily: 'Consolas', fontSize: 32, stroke: '#CCC', strokeThickness: 2 })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', function () { commitGraph.mergeButton.setTint(0x555555); maintainer.MergeContributor(); });
    commitGraph.releaseButton = this.add
        .text(1500, 10, strs.release,
            { fill: '#CCC', fontFamily: 'Consolas', fontSize: 32, stroke: '#CCC', strokeThickness: 2 })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', function () { commitGraph.releaseButton.setTint(0x555555); maintainer.Release(); });

    commitGraph.mergeButton.setTint(0x555555);
    commitGraph.releaseButton.setTint(0x555555);

    registerEventQueue(this, logMessage);
    eventQueue.push(commitGraph);
}
