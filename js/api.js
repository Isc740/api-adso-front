const API_BASE_URL = "https://api-adso-1.somee.com/api";

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg =
            errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
    }
    return response.json();
};

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) throw new Error("Error al cargar los datos");
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
}

async function createItem(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al crear el elemento");
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error creating item in ${endpoint}:`, error);
        throw error;
    }
}

async function updateItem(endpoint, id, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: "PUT",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar el elemento");
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error updating item ${id} in ${endpoint}:`, error);
        console.log(data);
        throw error;
    }
}

async function deleteItem(endpoint, id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: "DELETE",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        if (!response.ok) throw new Error("Error al eliminar el elemento");
        return true;
    } catch (error) {
        console.error(`Error deleting item ${id} from ${endpoint}:`, error);
        throw error;
    }
}

export { fetchData, createItem, updateItem, deleteItem };
