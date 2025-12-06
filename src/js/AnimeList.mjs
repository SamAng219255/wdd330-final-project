const malClientId = import.meta.env.VITE_MAL_CLIENT_ID;

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
	constructor(target_url, parameters) {
		this.target_url = target_url;
		this.parameters = parameters;
	}

	#data;

	static cache = [];

	async fetch(callback) {
		if(this.#data !== undefined) {
			throw Error("Data already fetched.");
		}

		const cacheSearchRes = AnimeList.cache.find(list => this.equals(list));

		if(cacheSearchRes) {
			if(callback) callback();
			this.#data = cacheSearchRes.data;

			if(callback) return callback(this.data);
			else return this.data;
		}
		else {
			const headers = new Headers();
			headers.set("X-MAL-CLIENT-ID", malClientId);
			const options = {
				headers,
				method: "get",
			};
			const params = new URLSearchParams(this.parameters);
			try {
				const apiRes = await fetch(`${this.target_url}?${params}`, options);
				const apiData = await convertToJson(apiRes);
				this.#data = apiData.data;
				AnimeList.cache.push(this);

				if(callback) return callback(this.data);
				else return this.data;
			}
			catch(err) {
				console.error(
					`Error fetching ${this.target_url} with parameters ${JSON.stringify(this.parameters)}`,
					err,
				);
			}
		}
	}

	display(parentElem, templateElem) {
		this.data.map(datum => datum.node).forEach(entry => {
			const fragment = templateElem.content.cloneNode(true);

			const imgElem = fragment.querySelector(".anime-img");
			const refImg = new Image();
			refImg.src = imgElem.src = entry.main_picture.medium;
			imgElem.alt = entry.title;
			refImg.addEventListener("load", () => {
				imgElem.width = refImg.width;
				imgElem.height = refImg.height;
			});

			const titleElem = fragment.querySelector(".anime-title");
			titleElem.innerText = entry.title;

			const studioElem = fragment.querySelector(".anime-studio");
			studioElem.innerText = entry.studios.map(studio => studio.name).join(", ");

			const descElem = fragment.querySelector(".anime-description");
			descElem.innerText = entry.synopsis;

			parentElem.append(fragment);
		});
	}

	get data() {
		if(this.#data === undefined) {
			throw Error("Data not yet fetched.");
		}

		return this.#data;
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
				)
			);
		}
		else {
			return false;
		}
	}
}
