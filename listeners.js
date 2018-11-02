

class ListenerList
{
    constructor() {
        this.list = [];
    }

    addListener(l) {
        this.list.push(l);
    }

    signal(msg) {
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].signal(msg);
        }
    }
}

class TextMessage {
    constructor(text) {
        this.name = 'text';
        this.text = text;
    }
}