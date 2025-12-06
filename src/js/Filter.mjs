function depthGet(obj, key) {
	if(key.includes(".")) {
		return key.split(".").reduce((curObj, keyPart) => curObj?.[keyPart], obj);
	}
	else {
		return obj[key];
	}
}

function compare(a, b) {
	if(isNaN(a) || isNaN(b)) {
		return a.toString().localeCompare(b.toString());
	}
	else {
		return Math.sign(parseFloat(a) - parseFloat(b));
	}
}

function makePattern(name, constructorFunc, executeFunc) {
	Pattern.Patterns[name] = class extends Pattern {
		constructor(data) {
			super({ type: name });
			constructorFunc.call(this, data);
		}

		execute(entry) {
			return executeFunc.call(this, entry);
		}
	};
}

class Pattern {
	constructor(data) {
		if(!data.type)
			throw new Error("Pattern requires attribute 'type'");
		if(!(data.type in Pattern.Patterns))
			throw new Error(`Unknown type '${data.type}'\nMust be one of ${Object.keys(Pattern.Patterns).join(", ")}`);

		this.type = data.type;

		if(new.target === Pattern)
			return new Pattern.Patterns[data.type](data);
	}

	static Patterns = {};

	static lookupPatternKey(cls) {
		return Object.keys(Pattern.Patterns).find(key => Pattern.Patterns[key] === cls);
	}
}

makePattern(
	"is",
	({ key, value }) => {
		this.key = key;
		this.value = value;
	},
	entry => {
		return depthGet(entry, this.key) === this.value;
	},
);
makePattern(
	"list",
	({ key, vales }) => {
		this.key = key;
		this.vales = vales;
	},
	entry => {
		return this.values.indexOf(depthGet(entry, this.key)) > -1;
	},
);
makePattern(
	"regex",
	({ key, pattern }) => {
		this.key = key;
		this.pattern = pattern;
	},
	entry => {
		return depthGet(entry, this.key).toString().match(this.pattern);
	},
);
makePattern(
	"not",
	({ pattern }) => {
		this.pattern = pattern instanceof Pattern ? pattern : new Pattern(pattern);
	},
	entry => {
		return !this.pattern.execute(entry);
	},
);
makePattern(
	"any",
	({ patterns }) => {
		this.patterns = patterns.map(pattern => pattern instanceof Pattern ? pattern : new Pattern(pattern));
	},
	entry => {
		return this.patterns.some(pattern => pattern.execute(entry));
	},
);
makePattern(
	"all",
	({ patterns }) => {
		this.patterns = patterns.map(pattern => pattern instanceof Pattern ? pattern : new Pattern(pattern));
	},
	entry => {
		return this.patterns.every(pattern => pattern.execute(entry));
	},
);

export default class Filter {
	constructor({ sortOrder = [], rules = [] }) {
		this.sortOrder = sortOrder;
		this.rules = rules.map(rule => rule instanceof Pattern ? rule : new Pattern(rule));
	}

	#compare = (entry1, entry2) => {
		let priority = 1 << this.sortOrder.length;
		return this.sortOrder.reduce((ret, [ col, dir ]) => ret + ((priority >>= 1) * (dir == "desc" ? -1 : +1) * compare(depthGet(entry1, col), depthGet(entry2, col))), 0);
	};

	sort(list) {
		return list.sort(this.#compare.bind(this));
	}

	static Pattern = Pattern;

	#filterMatch(entry) {
		return this.rules.every(rule => rule.execute(entry));
	}

	filter(list) {
		return list.filter(this.#filterMatch.bind(this));
	}

	execute(list) {
		return this.sort(this.filter(list));
	}
}
