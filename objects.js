
var state = {
    log: [],
    logText: null
};

function logMessage(msg) {
    state.log.unshift(msg);
    state.logText.setText(state.log);

    if (state.log.length > 200) {
        state.log.pop();
    }
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

class CommitGraph {
    constructor(game, x, w, h) {
        this.game = game;
        this.commitGraphics = game.add.graphics({
            lineStyle: { width: 1, color: 0xaaaaaa },
            fillStyle: { color:0xffffff }
        });
        this.x = x;
        this.w = w;
        this.h = h;
        this.commitList = [];
        this.commitWindow = [];
        this.contributors = [];
        this.lieutenants = [];
        this.releases = [];
        this.contributorRate = 0;
        this.timeToRun = null;
        this.cg = null;
        this.offset = 0;
        this.griddim = 30;
        this.r = 5;
    }

    AddCommit(commit) {
        this.commitList.push(commit);
        this.commitWindow.push(commit);
        this.Render(commit);
    }

    Draw(commit) {
        if (this.h / this.griddim < commit.position[1] - this.offset) {
            return;
        }

        var x = this.x + this.w / 2 + 2 * commit.position[0] * this.griddim;
        var y = this.h - (commit.position[1] - this.offset) * this.griddim;

        var circle  = new Phaser.Geom.Circle(x, y, this.r);
        this.commitGraphics.fillCircleShape(circle);
    }

    Release(tag) {
        if (this.h / this.griddim < tag.commit.position[1] - this.offset) {
            return;
        }

        var x = this.x + this.w / 2 + 2 * tag.commit.position[0] * this.griddim;
        var y = this.h - (tag.commit.position[1] - this.offset) * this.griddim;

        var tx = this.x + this.griddim;
        var ty = y;

        var line = new Phaser.Geom.Line(x,y,tx,ty);
        this.commitGraphics.strokeLineShape(line);
        if (tag.minor == 0) {
            this.commitGraphics.fillStyle(0x5555ff);
        } else {
            this.commitGraphics.fillStyle(0xff5555);
        }
        var sq  = new Phaser.Geom.Rectangle(tx - this.griddim / 3, ty - this.griddim / 2, this.griddim, this.griddim);
        this.commitGraphics.fillRectShape(sq);
        this.commitGraphics.fillStyle(0xffffff);

        this.Draw(tag.commit);
    }

    Render(commit) {
        var x = this.x + this.w / 2 + 2 * commit.position[0] * this.griddim;
        var y = this.h - (commit.position[1] - this.offset) * this.griddim;

        if (x < this.x + this.griddim || x > this.x + this.w - this.griddim) {
            this.griddim *= 0.8;
            this.r *= 0.8;

            if (this.r < 3) {
                this.r = 3;
            }

            x = this.x + this.w / 2 + 2 * commit.position[0] * this.griddim;
            this.rerender();
            return;
        }

        for (var i = 0; i < commit.parents.length; i++ ) {
            var p = commit.parents[i];
            var px = this.x + this.w / 2 + 2 * p.position[0] * this.griddim;
            var py = this.h - (p.position[1] - this.offset) * this.griddim;

            if (px == x) {
                var line = new Phaser.Geom.Line(x,y,px,py);
                this.commitGraphics.strokeLineShape(line);
                continue;
            }

            var my1 = y + this.griddim / 2;
            var my2 = py - this.griddim / 2;
            var mx1 = x - this.griddim / 2;
            var mx2 = px + this.griddim / 2;
            if (px > x) {
                mx1 = x + this.griddim / 2;
                mx2 = px - this.griddim / 2;
            }

            var line1 = new Phaser.Geom.Line(x,y,mx1,my1);
            var line2 = new Phaser.Geom.Line(mx1,my1,mx2,my1);
            var line3 = new Phaser.Geom.Line(mx1,my1,mx2,my1);
            var line4 = new Phaser.Geom.Line(mx2,my1,mx2,my2);
            var line5 = new Phaser.Geom.Line(mx2,my2,px,py);
            this.commitGraphics.strokeLineShape(line1);
            this.commitGraphics.strokeLineShape(line2);
            this.commitGraphics.strokeLineShape(line3);
            this.commitGraphics.strokeLineShape(line4);
            this.commitGraphics.strokeLineShape(line5);
        }

        for (var i = 0; i < commit.parents.length; i++) {
            this.Draw(commit.parents[i]);
        }
        this.Draw(commit);
    }

    rerender() {
        this.commitGraphics.clear();

        for (var i = 0; i < this.commitWindow.length; i++) {
            this.Render(this.commitWindow[i]);
        }
        for (var i = 0; i < this.releases.length; i++) {
            this.Release(this.releases[i]);
        }
    }

    event() {
        // Re-render everything!
        var maxGen = 0;

        for (var i = 0; i < this.commitWindow.length; i++) {
            if (this.commitWindow[i].generation > maxGen) {
                maxGen = this.commitWindow[i].generation;
            }
        }

        if ((maxGen - this.offset) * this.griddim + 100 > this.h) {
            this.offset += this.h / (2 * this.griddim);

            var newWindow = [];
            for (var i = 0; i < this.commitWindow.length; i++) {
                var newY = this.h - (this.commitWindow[i].position[1] - this.offset) * this.griddim;

                if (newY >= 0) {
                    newWindow.push(this.commitWindow[i]);
                }
            }

            this.commitWindow = newWindow;

            this.rerender();
        }
    }

    reschedule() {
        this.timeToRun = new Date().getTime() + 100.0;
    }
}

class Commit {
    constructor() {
        this.parents = [];
        this.position = [0,0];
        this.oid = pad(Math.floor(0xffffffff * Math.random()).toString(16), 8);
        this.generation = 1;
    }

    ComputeGeneration() {
        for (var i = 0; i < this.parents.length; i++) {
            if (this.parents[i].generation >= this.generation) {
                this.generation = this.parents[i].generation + 1;
            }
        }
    }
}

var numContributorLogs = 0;

class Contributor {
    constructor(name, graph) {
        this.name = name;
        this.position = [0,0];
        this.graph = graph;
        this.head = null;
        this.frequency = 0.2;
        this.numUnmerged = 0;
        this.unmergedSingleParentCommits = 0;
        this.lastTimeToRun = new Date().getTime();
        this.timeToRun = new Date().getTime();
        this.lieutenant = null;
        graph.contributors.push(this);
        this.lastTimeToRun = new Date().getTime();
    }

    CheckRelease()
    {
    }

    Commit() {
        var commit = new Commit();

        numContributorLogs += 1;

        if (this.head != null) {
            commit.parents.push(this.head);
            commit.generation = this.head.generation + 1;
            commit.position[0] = this.position[0];
            commit.position[1] = commit.generation;

            if (numContributorLogs < 1000) {
                logMessage(this.name + " committed " + commit.oid + "->" + this.head.oid);
            }
        } else {
            if (numContributorLogs < 1000) {
                logMessage(this.name + " committed " + commit.oid);
            }
            commit.generation = 1;
            commit.position[0] = this.position[0];
            commit.position[1] = commit.generation;
        }

        this.head = commit;
        this.graph.AddCommit(commit);
        this.numUnmerged += 1;
        this.unmergedSingleParentCommits  += 1;

        if (this.lieutenant != null) {
            this.lieutenant.CheckMerge();
        }

        this.CheckRelease();
    }

    event() {
        if (this.unmergedSingleParentCommits > 0
            && this.lieutenant.head.generation > this.head.generation + 20) {
            this.MergeCommit(this.lieutenant.head);

            if (numContributorLogs < 1000) {
                logMessage(this.name + " merged " + this.lieutenant.name + "'s head into their topic");
            }

            this.unmergedSingleParentCommits = 0;
        } else {
            this.Commit();
        }
        this.lastTimeToRun = new Date().getTime();
    }

    reschedule() {
        if (this.frequency > 0) {
            this.timeToRun = this.lastTimeToRun + (500.0 + (2 + Math.random())) / this.frequency;
        }
    }

    wasMerged() {
        this.numUnmerged = 0;
        var oldFrequency = this.frequency;
        this.frequency *= 1.5;

        if (this.frequency >= 0.8) {
            this.frequency = 0.8;
        }
        if (this.frequency > oldFrequency) {
            logMessage(this.name + " is encouraged to contribute more!");
        }
        this.reschedule();
    }

    MergeCommit(target) {
        var m = new Commit();
        m.parents.push(this.head);
        m.parents.push(target);

        m.ComputeGeneration();
        m.position[0] = this.position[0];
        m.position[1] = m.generation;

        this.head = m;
        this.graph.AddCommit(m);

        if (this.lieutenant != null) {
            this.lieutenant.CheckMerge();
        }
    }
}

class Lieutenant extends Contributor {
    constructor(name, graph) {
        super(name,graph);

        this.mergeFrequency = 0.25;
        graph.lieutenants.push(this);
        this.contributors = [];
    }

    event() {
        if (this.contributors.length > 0)
        {
            this.MergeContributor();
        }
        else
        {
            this.Commit();
        }
    }

    MergeContributor() {
        if (this.contributors.length > 0)
        {
            var maxUnmerged = 0;
            var maxI = -1;
            for (var i = 0; i < this.contributors.length; i++) {
                if (this.contributors[i].numUnmerged > maxUnmerged) {
                    maxUnmerged = this.contributors[i].numUnmerged;
                    maxI = i;
                }
            }

            if (maxI >= 0) {
                var c = this.contributors[maxI];
                this.MergeCommit(c.head);
                this.numUnmerged += 1 + c.numUnmerged;
                logMessage(this.name + " merged " + c.head.oid + ". Thanks for the " + c.numUnmerged + " commit(s), " + c.name + "!");
                this.contributors[maxI].wasMerged();
                this.CheckRelease();
            }

            this.CheckMerge();
        }
    }
}

class ContributorGenerator {
    constructor(lieutenant, graph) {
        this.lieutenant = lieutenant;
        this.graph = graph;
        this.lastTimeToRun = new Date().getTime() - 10000.0;
        this.timeToRun = new Date().getTime() + 1000.0;
    }

    event() {
        var c = new Contributor("Contributor" + this.graph.contributors.length, this.graph);
        c.head = this.lieutenant.head;
        logMessage(c.name + " joined the effort at commmit " + c.head.oid);
        c.position[0] = this.getXPos(this.lieutenant.contributors.length);
        c.lieutenant = this.lieutenant;
        this.lieutenant.contributors.push(c);
        eventQueue.push(c);
        this.lastTimeToRun = new Date().getTime();
    }

    reschedule() {
        var frequency = 0.05 * Math.pow(1.08, this.graph.releases.length);

        if (frequency > 0.33) {
            frequency = 0.33;
        }

        this.timeToRun = Math.floor(this.lastTimeToRun + (500.0 + (2 + Math.random())) / frequency);
    }

    getXPos(i) {
        var width = 200;

        if (i % 2 == 0) {
            return - ((i + 4) / 2);
        } else {
            return ((i + 3) / 2);
        }
    }
}

class Tag {
    constructor(commit, major, minor) {
        this.commit = commit;
        this.major = major;
        this.minor = minor;
    }

}

class Maintainer extends Lieutenant {
    constructor(graph)
    {
        super("Maintainer", graph);
        this.frequency = 0;
        this.major = 0;
        this.minor = 0;
    }

    CheckMerge() {
        for (var i = 0; i < this.contributors.length; i++) {
            if (this.contributors[i].numUnmerged > 0) {
                this.graph.mergeButton.clearTint();
            }
        }
    }

    CommitsToNextRelease() {
        var numReleases = this.graph.releases.length;
        return Math.ceil(7 * Math.pow(1.33, numReleases + 1));
    }

    CanRelease() {
        return this.CommitsToNextRelease() <= this.numUnmerged;
    }

    CheckRelease() {
        if (this.CanRelease()) {
            var major = this.major;
            var minor = this.minor + 1;

            if (minor >= 10)
            {
                major += 1;
                minor = 0;
            }

            this.graph.releaseButton.setText("Release " + major + "." + minor);
            this.graph.releaseButton.clearTint();
        }
    }

    Release() {
        if (!this.CanRelease())
        {
            logMessage("We need " + this.CommitsToNextRelease() + " commits for another release! (Currently " + this.numUnmerged + ")");
            return;
        }

        this.minor += 1;

        if (this.minor >= 10)
        {
            this.minor = 0;
            this.major += 1;
        }

        logMessage(this.name + " released version " + this.major + "." + this.minor + " at commit " + this.head.oid + " containing " + this.numUnmerged + " commits!");
        var t = new Tag(this.head, this.major, this.minor);
        this.graph.releases.push(t);
        this.graph.Release(t);

        if (this.graph.cg == null)
        {
            this.graph.cg = new ContributorGenerator(this, this.graph);
            eventQueue.push(this.graph.cg);
        } else {
            this.graph.cg.reschedule();
        }
    }
}
