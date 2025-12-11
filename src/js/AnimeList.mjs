import DetailsModal from "./DetailsModal.mjs";

async function convertToJson(res) {
	if(res.ok) {
		const resStr = await res.text();
		try {
			return JSON.parse(resStr);
		}
		catch {
			console.log("Response Value: ", resStr);
			throw new Error("Malformed Response");
		}
	}
	else {
		console.log("Response: ", res);
		throw new Error("Bad Response");
	}
}

export default class AnimeList {
	constructor(target_url, parameters, deep_filter) {
		this.target_url = target_url;
		this.parameters = parameters;
		this.deep_filter = deep_filter;
		this.filters = [];
	}

	#data_arr;

	#filtered_data;

	#filters = [];

	static cache = [];

	async fetch(callback) {
		if(this.#data !== undefined) {
			throw Error("Data already fetched.");
		}

		const cacheSearchRes = AnimeList.cache.find(list => this.equals(list));

		if(cacheSearchRes) {
			this.#data = cacheSearchRes.data;

			if(callback) {
				try {
					callback(this);
				}
				catch(err) {
					console.error(err);
				}
			}
		}
		else {
			const params = new URLSearchParams(this.parameters);
			try {
				const apiRes = await fetch(`${this.target_url}?${params}`);
				const apiData = await convertToJson(apiRes);
				this.#data = this.deep_filter ? this.deep_filter.execute(apiData.data) : apiData.data;
				AnimeList.cache.push(this);
			}
			catch(err) {
				console.error(
					`Error fetching ${this.target_url} with parameters ${JSON.stringify(this.parameters)}`,
					err,
				);
				return;
			}
			finally {
				if(callback) {
					try {
						callback(this);
					}
					catch(err) {
						console.error(err);
					}
				}
			}
		}
	}

	display(parentElem, templateElem) {
		this.data.map(datum => datum.node).forEach(entry => {
			const displayModal = () => DetailsModal.Draw(entry);

			const fragment = templateElem.content.cloneNode(true);

			const imgElem = fragment.querySelector(".anime-img");
			imgElem.addEventListener("load", () => {
				imgElem.width = imgElem.naturalWidth;
				imgElem.height = imgElem.naturalHeight;
			});
			imgElem.src = entry.main_picture.medium;
			imgElem.alt = entry.title;
			imgElem.addEventListener("click", displayModal);

			const titleElem = fragment.querySelector(".anime-title");
			titleElem.innerText = entry.title;
			titleElem.addEventListener("click", displayModal);

			if(entry.alternative_titles?.en) {
				const titleEnElem = fragment.querySelector(".anime-title-en");
				titleEnElem.innerText = entry.alternative_titles.en;
			}
			else if(entry.alternative_titles?.synonyms?.length) {
				const titleEnElem = fragment.querySelector(".anime-title-en");
				titleEnElem.innerText = entry.alternative_titles.synonyms[0];
			}

			const studioElem = fragment.querySelector(".anime-studio");
			studioElem.innerText = entry.studios.map(studio => studio.name).join(", ");

			const descElem = fragment.querySelector(".anime-description");
			descElem.innerText = entry.synopsis;

			parentElem.append(fragment);
		});
	}

	add_filter(filter) {
		this.#filters.push(filter);

		if(this.#data !== undefined)
			this.#filtered_data = filter.execute(this.data);

		return this.data;
	}

	get data() {
		if(this.#filtered_data === undefined) {
			throw Error("Data not yet fetched.");
		}

		return this.#filtered_data;
	}

	get dataSet() {
		return this.#filtered_data !== undefined;
	}

	get data_full() {
		if(this.#data === undefined) {
			throw Error("Data not yet fetched.");
		}

		return this.#data;
	}

	get #data() {
		return this.#data_arr;
	}

	set #data(new_val) {
		this.#data_arr = new_val;
		this.#filtered_data = this.filters.reduce((data, filter) => filter.execute(data), this.data_full);
	}

	get filters() {
		return this.#filters;
	}

	set filters(new_vals) {
		this.#filters = new_vals;
		if(this.#data !== undefined)
			this.#filtered_data = this.filters.reduce((data, filter) => filter.execute(data), this.data_full);
	}

	equals(list2) {
		return AnimeList.areEqual(this, list2);
	}

	static areEqual(list1, list2) {
		if(list1.target_url == list2.target_url) {
			return (
				Object.entries(list1.parameters).every(
					([ key, val ]) => list2.parameters[key] == val,
				) &&
				Object.entries(list2.parameters).every(
					([ key, val ]) => list1.parameters[key] == val,
				) &&
				list1.deep_filter === list2.deep_filter
			);
		}
		else {
			return false;
		}
	}
}
