export default class UserTags {
	static tags = {
		star: new Set(),
		watch: new Set(),
		hide: new Set(),
	};

	static addTag(tag, id) {
		const ret = UserTags.tags[tag].add(id);
		UserTags.saveTags();
		return ret;
	}

	static removeTag(tag, id) {
		const ret = UserTags.tags[tag].delete(id);
		UserTags.saveTags();
		return ret;
	}

	static setTag(tag, id, value) {
		if(value)
			return UserTags.addTag(tag, id);
		else
			return UserTags.removeTag(tag, id);
	}

	static checkTag(tag, id) {
		return UserTags.tags[tag].has(id);
	}

	static toJSON() {
		return JSON.stringify(Object.entries(UserTags.tags).map(([ key, tagSet ]) => [ key, [ ...tagSet ] ]));
	}

	static fromJSON(json, save = true) {
		UserTags.tags = Object.fromEntries(JSON.parse(json).map(([ key, tagSet ]) => [ key, new Set(tagSet) ]));
		if(save)
			UserTags.saveTags();
	}

	static init() {
		const fetchedTags = localStorage.getItem("user_tags");
		if(fetchedTags) {
			UserTags.fromJSON(fetchedTags, false);
		}
		else {
			UserTags.saveTags();
		}
	}

	static saveTags() {
		localStorage.setItem("user_tags", UserTags.toJSON());
	}
}
