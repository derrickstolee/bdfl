{
    const prefixes = [
        "admiral",
        "bishop",
        "captain",
        "chief",
        "cmdr",
        "col",
        "dean",
        "dr",
        "duchess",
        "duke",
        "elder",
        "honorable",
        "khan",
        "king",
        "lt",
        "madam",
        "marshal",
        "miss",
        "monsignor",
        "mr",
        "mrs",
        "pharaoh",
        "president",
        "professor",
        "queen",
        "rabbi",
        "rev",
        "sir",
        "sultan",
        "venerable",
    ];

    const adjectives = [
        "big",
        "blue",
        "calm",
        "clumsy",
        "deep",
        "dry",
        "famous",
        "flat",
        "funny",
        "green",
        "hollow",
        "jolly",
        "local",
        "long",
        "narrow",
        "new",
        "orange",
        "plain",
        "purple",
        "red",
        "salty",
        "secret",
        "silly",
        "small",
        "spicy",
        "square",
        "yellow",
        "young",
    ];

    const nouns = [
        "agency",
        "aperitif",
        "book",
        "clarinet",
        "cloud",
        "code",
        "context",
        "day",
        "diamond",
        "duck",
        "fact",
        "fiber",
        "fish",
        "gift",
        "goldfish",
        "group",
        "jewel",
        "lasagna",
        "mammoth",
        "money",
        "night",
        "octopus",
        "omelet",
        "person",
        "rocket",
        "saloon",
        "school",
        "streetcar",
        "student",
        "system",
        "teacher",
        "truck",
        "warrior",
    ];

    class Pattern {
        constructor(capsType, separator, words) {
            this.capsType = capsType;
            this.separator = separator;
            this.words = words;
        }

        generateName() {
            let nameParts = [];
            for (let v of this.words) {
                switch(v.toUpperCase()) {
                    case 'P':
                        nameParts.push(getRandomEntry(prefixes));
                        break;
                    case 'A':
                        nameParts.push(getRandomEntry(adjectives));
                        break;
                    case 'N':
                        nameParts.push(getRandomEntry(nouns));
                        break;
                }
            }

            switch(this.capsType) {
                case 'title':
                    nameParts = nameParts.map(word => word.charAt(0).toUpperCase() + word.substring(1));
                    break;
                case 'lower':
                    nameParts = nameParts.map(word => word.toLowerCase());
                    break;
                case 'upper':
                    nameParts = nameParts.map(word => word.toUpperCase());
                    break;
                case 'byword':
                    nameParts = nameParts.map(word => coinflip() ? word.toUpperCase() : word.toLowerCase());
                    break;
                case 'crazy':
                    nameParts = nameParts.map(word => {
                        let outWord = [];
                        for (let char of word) {
                            outWord.push(coinflip() ? char.toUpperCase() : char.toLowerCase())
                        }
                        return outWord.join('');
                    });
                    break;
            }

            return nameParts.join(this.separator);
        }
    }

    const patterns = [
        new Pattern("title", "", "PAN"),
        new Pattern("title", "", "PAAN"),
        new Pattern("title", "", "PANN"),
        new Pattern("title", "", "PAANN"),
        new Pattern("title", "-", "PAN"),
        new Pattern("title", "-", "PAAN"),
        new Pattern("title", "-", "PANN"),
        new Pattern("title", "-", "PAANN"),
        new Pattern("title", "_", "PAN"),
        new Pattern("title", "_", "PAAN"),
        new Pattern("title", "_", "PANN"),
        new Pattern("title", "_", "PAANN"),
        new Pattern("lower", "_", "PAN"),
        new Pattern("lower", "-", "PAN"),
        new Pattern("lower", "_", "AAN"),
        new Pattern("lower", "-", "AAN"),
        new Pattern("lower", "_", "AN"),
        new Pattern("lower", "-", "AN"),
        new Pattern("lower", "_", "ANN"),
        new Pattern("lower", "-", "ANN"),
        new Pattern("upper", "-", "AN"),
        new Pattern("upper", "-", "PAN"),
        new Pattern("byword", "", "AAAN"),
        new Pattern("byword", "", "AAN"),
        new Pattern("byword", "", "AN"),
        new Pattern("byword", "", "PNN"),
        new Pattern("crazy", "", "AAAN"),
        new Pattern("crazy", "", "AAN"),
        new Pattern("crazy", "", "ANN"),
        new Pattern("crazy", "", "NNN")
    ];

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max-min)) + min;
    }

    function coinflip() {
        return (getRandomInt(0, 2) == 0);
    }

    function getRandomEntry(arr) {
        return arr[getRandomInt(0, arr.length)];
    }

    function getRandomName() {
        const pattern = getRandomEntry(patterns);
        return pattern.generateName();
    }

    window.getRandomName = getRandomName;
}