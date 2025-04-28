const API_BASE_URL = "https://api-adso-1.somee.com/api";

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
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function updateItem(endpoint, id, data) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Error al actualizar el elemento");
        return await response.json();
    } catch (error) {
        console.error(error);
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
        console.error(error);
        throw error;
    }
}

export { fetchData, createItem, updateItem, deleteItem };
