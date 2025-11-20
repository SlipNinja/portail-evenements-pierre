// Fetch API and returns useable data
async function get_events() {
	const response = await fetch("https://demo.theeventscalendar.com/wp-json/tribe/events/v1/events");
	const data = await response.json();

	return clean_data(data["events"]);
}

// Clean received data
function clean_data(data) {
	const cleaned = [];

	// Handles undefined addresses
	const get_adress = (e) => {
		return e["venue"]["address"] == undefined
			? "At home"
			: `${e["venue"]["address"]}, ${e["venue"]["city"]}`.replace("Aveune", "Avenue");
	};

	// Handles useless <p> tags around description
	const get_desc = (e) => {
		return e["description"].slice(3, -4);
	};

	// Extract date and change format
	const get_date = (e) => {
		let [year, month, day] = e["start_date"].split(" ")[0].split("-");
		return [day, month, year].join("-");
	};

	// Extract hour
	const get_hour = (e) => {
		return e["start_date"].split(" ")[1];
	};

	for (const event of data) {
		const new_event = {
			id: event["id"],
			name: event["title"],
			desc: get_desc(event),
			date: get_date(event),
			hour: get_hour(event),
			adress: get_adress(event),
			url: event["url"],
		};

		cleaned.push(new_event);
	}

	return cleaned;
}

get_events().then((r) => {
	for (const event of r) {
		console.log(event);
	}
});
