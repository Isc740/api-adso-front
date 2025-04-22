const API_BASE_URL = "http://localhost:5000/api";

async function fetchData(endpoint) {
	try {
		const response = await fetch(`${API_BASE_URL}/${endpoint}`);
		if (!response.ok) throw new Error("Error al cargar los datos");
		return await response.json();
	} catch (error) {
		console.error(error);
		return [];
	}
}
