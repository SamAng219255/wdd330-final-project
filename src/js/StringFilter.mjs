const termRegex = /(?:"[^"]+"|\S+)(?: OR (?:"[^"]+"|\S+))*/g;
const orArgRegex = /(?:"[^"]+"|\S+)(?:(?= OR )|$)/g;

export default class StringFilter {
	/*
		Generates Filter settings from a formatted search string.
		Assumes entry value at key is a string.
	*/
	static settingsFromString(str, key) {
		return 	{
			type: "all",
			patterns: [ ...str.matchAll(termRegex) ]
				.map(match => match[0])
				.map(term => {
					if(term[0] == "\"" && term[term.length - 1] == "\"") {
						return {
							type: "includes",
							key,
							substring: term.slice(1, -1),
						};
					}
					else {
						return {
							type: "includes_any",
							key,
							substrings: [ ...term.matchAll(orArgRegex) ]
								.map(match => match[0])
								.map(arg => arg[0] == "\"" && arg[arg.length - 1] == "\"" ? arg.slice(1, -1) : arg),
						};
					}
				}),
		};
	}

	/*
		Generates Filter settings from a formatted search string.
		Assumes entry value at key is an array of objects which contain another key to a string.
	*/
	static settingsFromStringForList(str, key, key2) {
		return 	{
			type: "all",
			patterns: [ ...str.matchAll(termRegex) ]
				.map(match => match[0])
				.map(term => {
					if(term[0] == "\"" && term[term.length - 1] == "\"") {
						return {
							type: "any_element",
							key,
							pattern: {
								type: "includes",
								key: key2,
								substring: term.slice(1, -1),
							},
						};
					}
					else {
						return {
							type: "any_element",
							key,
							pattern: {
								type: "includes_any",
								key: key2,
								substrings: [ ...term.matchAll(orArgRegex) ]
									.map(match => match[0])
									.map(arg => arg[0] == "\"" && arg[arg.length - 1] == "\"" ? arg.slice(1, -1) : arg),
							},
						};
					}
				}),
		};
	}
}
