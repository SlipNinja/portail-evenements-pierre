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
		return e["venue"]["adress"] == undefined ? "At home" : `${e["venue"]["adress"]} ${e["venue"]["city"]}`;
	};

	// Handles useless <p> tags around description
	const get_desc = (e) => {
		return e["description"].slice(3, -4);
	};

	for (const event of data) {
		const new_event = {
			id: event["id"],
			name: event["title"],
			desc: get_desc(event),
			date: event["start_date"],
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
