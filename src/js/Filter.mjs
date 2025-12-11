function depthGet(obj, key) {
	if(!key) {
		return obj;
	}
	else if(key.includes(".")) {
		return key.split(".").reduce((curObj, keyPart) => curObj?.[keyPart], obj);
	}
	else {
		return obj[key];
	}
}

function compare(a, b) {
	if(isNaN(a) || isNaN(b)) {
		return a?.toString()?.localeCompare(b?.toString());
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
	function({ key, value }) {
		this.key = key;
		this.value = value;
	},
	function(entry) {
		if(typeof this.value == "string")
			return depthGet(entry, this.key)?.toLowerCase() === this.value.toLowerCase();
		else
			return depthGet(entry, this.key) === this.value;
	},
);
makePattern(
	"list",
	function({ key, values }) {
		this.key = key;
		this.values = values;
	},
	function(entry) {
		const value = depthGet(entry, this.key);
		return this.values
			.map(value_item => value_item?.toLowerCase ? value_item.toLowerCase() : value_item)
			.indexOf(value?.toLowerCase ? value.toLowerCase() : value) > -1;
	},
);
makePattern(
	"regex",
	function({ key, pattern }) {
		this.key = key;
		this.pattern = pattern;
	},
	function(entry) {
		return depthGet(entry, this.key).toString().match(this.pattern);
	},
);
makePattern(
	"not",
	function({ pattern }) {
		this.pattern = pattern instanceof Pattern ? pattern : new Pattern(pattern);
	},
	function(entry) {
		return !this.pattern.execute(entry);
	},
);
makePattern(
	"any",
	function({ patterns }) {
		this.patterns = patterns.map(pattern => pattern instanceof Pattern ? pattern : new Pattern(pattern));
	},
	function(entry) {
		return !this.patterns || this.patterns.some(pattern => pattern.execute(entry));
	},
);
makePattern(
	"all",
	function({ patterns }) {
		this.patterns = patterns.map(pattern => pattern instanceof Pattern ? pattern : new Pattern(pattern));
	},
	function(entry) {
		return !this.patterns || this.patterns.every(pattern => pattern.execute(entry));
	},
);
makePattern(
	"any_element",
	function({ key, pattern }) {
		this.key = key;
		this.pattern = pattern instanceof Pattern ? pattern : new Pattern(pattern);
	},
	function(entry) {
		return depthGet(entry, this.key)?.some(entry_item => this.pattern.execute(entry_item));
	},
);
makePattern(
	"all_elements",
	function({ key, pattern }) {
		this.key = key;
		this.pattern = pattern instanceof Pattern ? pattern : new Pattern(pattern);
	},
	function(entry) {
		return depthGet(entry, this.key)?.every(entry_item => this.pattern.execute(entry_item));
	},
);
makePattern(
	"range",
	function({ key, min, max, above, below }) {
		this.key = key;
		this.checks = [];
		if(min !== undefined)   this.checks.push(val => val >= min);
		if(max !== undefined)   this.checks.push(val => val <= max);
		if(above !== undefined) this.checks.push(val => val > above);
		if(below !== undefined) this.checks.push(val => val < below);
	},
	function(entry) {
		const value = depthGet(entry, this.key);
		return this.checks.every(check => check(value));
	},
);
makePattern(
	"includes",
	function({ key, substring }) {
		this.key = key;
		this.substring = substring;
	},
	function(entry) {
		const value = depthGet(entry, this.key);
		return value?.includes && value.toLowerCase().includes(this.substring.toLowerCase());
	},
);
makePattern(
	"includes_any",
	function({ key, substrings }) {
		this.key = key;
		this.substrings = substrings;
	},
	function(entry) {
		const value = depthGet(entry, this.key);
		if(value)
			return !this.substrings || this.substrings
				.some(substring => value.includes && value.toLowerCase().includes(substring.toLowerCase()));
		else
			return false;
	},
);

export default class Filter {
	constructor(option1, option2) {
		if(option2) {
			this.rules = (Array.isArray(option1) ? option1 : [ option1 ]).map(rule => rule instanceof Pattern ? rule : new Pattern(rule));
			this.sortOrder = Array.isArray(option2) ? option2 : [ option2 ];
		}
		else if(option1 instanceof Pattern || option1.type in Pattern.Patterns) {
			this.sortOrder = [];
			this.rules = (Array.isArray(option1) ? option1 : [ option1 ]).map(rule => rule instanceof Pattern ? rule : new Pattern(rule));
		}
		else if(option1.constructor === Array) {
			this.rules = [];
			this.sortOrder = Array.isArray(option1) ? option1 : [ option1 ];
		}
		else if(option1.sortOrder || option1.rules || option1.rule) {
			const { rules, rule, sortOrder } = option1;
			if(rules)
				this.rules = rules.map(rules_elem => rules_elem instanceof Pattern ? rules_elem : new Pattern(rules_elem));
			else if(rule)
				this.rules = [ rule instanceof Pattern ? rule : new Pattern(rule) ];
			else
				this.rules = [];
			this.sortOrder = sortOrder ? (Array.isArray(sortOrder) ? sortOrder : [ sortOrder ]) : [];
		}
		else {
			this.rules = [];
			this.sortOrder = [];
		}
	}

	#compare = function(entry1, entry2) {
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
