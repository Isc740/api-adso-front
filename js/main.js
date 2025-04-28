import { fetchData, createItem, updateItem, deleteItem } from "./api.js";

const actionColumnConfig = {
    render: function (data, type, row) {
        const config = tableConfigs[currentTable];
        if (!config) return "";
        const id = config.getId(row);
        return `
            <div class="btn-group" role="group">
                <button class="btn btn-sm btn-warning edit-btn" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    },
};

const tableConfigs = {
    "table-clients": {
        columns: [
            { title: "ID", data: "cliId" },
            { title: "Nombre", data: "cliFirstName" },
            { title: "Apellido", data: "cliLastName" },
            { title: "Dirección", data: "cliDirection" },
            { ...actionColumnConfig, title: "Acciones" },
        ],
        endpoint: "Clients",
        title: "Clientes",
        fields: [
            {
                name: "cliFirstName",
                label: "Nombre",
                type: "text",
                required: true,
            },
            {
                name: "cliLastName",
                label: "Apellido",
                type: "text",
                required: true,
            },
            {
                name: "cliDirection",
                label: "Dirección",
                type: "text",
                required: true,
            },
        ],
        getId: (row) => row.cliId,
    },
    "table-products": {
        columns: [
            { title: "ID", data: "proId" },
            { title: "Nombre", data: "proName" },
            { title: "Precio", data: "proPrice" },
            { title: "Categoría ID", data: "categoryCatId" },
            { ...actionColumnConfig, title: "Acciones" },
        ],
        endpoint: "Products",
        title: "Productos",
        fields: [
            { name: "proName", label: "Nombre", type: "text", required: true },
            {
                name: "proPrice",
                label: "Precio",
                type: "number",
                required: true,
            },
            {
                name: "categoryCatId",
                label: "Categoría ID",
                type: "number",
                required: true,
            },
        ],
        getId: (row) => row.proId,
    },
    "table-orders": {
        columns: [
            { title: "ID", data: "ordId" },
            { title: "Fecha", data: "ordDate", render: formatDate },
            {
                title: "Estado",
                data: "ordStatus",
                render: (data) => (data ? "Activo" : "Inactivo"),
            },
            { title: "Cliente ID", data: "clientCliID" },
            { ...actionColumnConfig, title: "Acciones" },
        ],
        endpoint: "Orders",
        title: "Órdenes",
        fields: [
            {
                name: "ordDate",
                label: "Fecha",
                type: "datetime-local",
                required: true,
            },
            { name: "ordStatus", label: "Estado", type: "checkbox" },
            {
                name: "clientCliId",
                label: "Cliente ID",
                type: "number",
                required: true,
            },
        ],
        getId: (row) => row.ordId,
    },
    "table-categories": {
        columns: [
            { title: "ID", data: "catId" },
            { title: "Descripción", data: "catDescription" },
            { ...actionColumnConfig, title: "Acciones" },
        ],
        endpoint: "Categories",
        title: "Categorías",
        fields: [
            {
                name: "catDescription",
                label: "Descripción",
                type: "text",
                required: true,
            },
        ],
        getId: (row) => row.catId,
    },
    "table-orderdetails": {
        columns: [
            { title: "ID", data: "detId" },
            { title: "Cantidad", data: "detAmount" },
            { title: "Producto ID", data: "productProId" },
            { title: "Orden ID", data: "orderOrdId" },
            { ...actionColumnConfig, title: "Acciones" },
        ],
        endpoint: "OrderDetails",
        title: "Detalles de Órdenes",
        fields: [
            {
                name: "detAmount",
                label: "Cantidad",
                type: "number",
                required: true,
            },
            {
                name: "productProId",
                label: "Producto ID",
                type: "number",
                required: true,
            },
            {
                name: "orderOrdId",
                label: "Orden ID",
                type: "number",
                required: true,
            },
        ],
        getId: (row) => row.detId,
        preProcess: (data) =>
            data.map((item) => ({
                ...item,
                detAmount: item.detAmount || 0,
                productProId: item.productProId || "N/A",
                orderOrdId: item.orderOrdId || "N/A",
            })),
    },
};

function formatDate(date) {
    return new Date(date).toLocaleString();
}

let currentTable = "";
let currentItemId = null;
const modal = createModal();

function createModal() {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "crudModal";
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content bg-dark text-white">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">Nuevo Elemento</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="modalBody"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="saveBtn">Guardar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return new bootstrap.Modal(modal);
}

function showModal(tableName, itemId = null) {
    const config = tableConfigs[tableName];
    if (!config) {
        console.error("Configuración no encontrada para la tabla:", tableName);
        return;
    }

    currentTable = tableName;
    currentItemId = itemId;

    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    modalTitle.textContent = itemId
        ? `Editar ${config.title}`
        : `Nuevo ${config.title}`;
    modalBody.innerHTML = generateForm(config.fields);

    if (itemId) {
        loadExistingData(config);
    }

    if (!modal) {
        modal = createModal();
    }
    modal.show();
}

function generateForm(fields) {
    return fields
        .map(
            (field) => `
        <div class="mb-3">
            <label for="${field.name}" class="form-label">${field.label}</label>
            ${generateInputField(field)}
        </div>
    `,
        )
        .join("");
}

function generateInputField(field) {
    if (field.type === "checkbox") {
        return `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="${field.name}">
                <label class="form-check-label" for="${field.name}">Activo</label>
            </div>
        `;
    }
    return `
        <input type="${field.type}" class="form-control bg-secondary text-white" id="${field.name}" 
            ${field.required ? "required" : ""}>
    `;
}

async function loadExistingData(config) {
    try {
        const data = await fetchData(`${config.endpoint}/${currentItemId}`);
        config.fields.forEach((field) => {
            const input = document.getElementById(field.name);
            if (input) {
                if (field.type === "checkbox") {
                    input.checked = data[field.name];
                } else {
                    input.value = data[field.name] || "";
                }
            }
        });
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}

async function saveItem() {
    const config = tableConfigs[currentTable];
    const formData = {};
    let isValid = true;

    config.fields.forEach((field) => {
        const input = document.getElementById(field.name);
        if (!input) return;

        if (
            field.required &&
            !input.value.trim() &&
            input.type !== "checkbox"
        ) {
            isValid = false;
            input.classList.add("is-invalid");
        } else {
            formData[field.name] =
                field.type === "checkbox" ? input.checked : input.value;
            input.classList.remove("is-invalid");
        }
    });

    if (!isValid) {
        alert("Por favor complete todos los campos requeridos");
        return;
    }

    try {
        if (currentItemId) {
            await updateItem(config.endpoint, currentItemId, formData);
        } else {
            await createItem(config.endpoint, formData);
        }
        modal.hide();
        await loadTable(currentTable);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

function initDataTable(tableElement, config, data) {
    if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().destroy();
    }

    tableElement.empty();

    return tableElement.DataTable({
        data: config.preProcess ? config.preProcess(data) : data,
        columns: config.columns,
        responsive: true,
        language: {
            url: "//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json",
        },
        columnDefs: [{ targets: "_all", defaultContent: "N/A" }],
    });
}

async function loadTable(tableName) {
    const config = tableConfigs[tableName];
    if (!config) return;

    try {
        const data = await fetchData(config.endpoint);
        const tableElement = $("#data-table");

        if (tableElement.length === 0) {
            console.error("Tabla no encontrada en el DOM");
            return;
        }

        document.getElementById("table-title").textContent = config.title;
        await initDataTable(tableElement, config, data);
    } catch (error) {
        console.error("Error cargando tabla:", error);
        $("#data-table").html(
            '<tr><td colspan="4" class="text-center text-danger">Error al cargar los datos</td></tr>',
        );
    }
}

function handleSidebarClick(event) {
    event.preventDefault();
    const target = event.currentTarget;

    document
        .querySelectorAll(".nav-link")
        .forEach((link) => link.classList.remove("active"));

    target.classList.add("active");
    currentTable = target.dataset.table;
    loadTable(currentTable);
}

function initSidebar() {
    document
        .querySelectorAll(".nav-link")
        .forEach((link) => link.addEventListener("click", handleSidebarClick));
}

function setupEventListeners() {
    const createBtn = document.getElementById("create-btn");
    if (createBtn) {
        createBtn.addEventListener("click", () => {
            if (currentTable) {
                showModal(currentTable);
            }
        });
    }

    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", saveItem);
    }

    document.addEventListener("click", async (e) => {
        if (!currentTable) return;

        const config = tableConfigs[currentTable];
        if (!config) return;

        if (e.target.closest(".edit-btn")) {
            const btn = e.target.closest(".edit-btn");
            const id = btn.dataset.id;
            showModal(currentTable, id);
        }

        if (e.target.closest(".delete-btn")) {
            if (confirm("¿Estás seguro de eliminar este elemento?")) {
                const btn = e.target.closest(".delete-btn");
                const id = btn.dataset.id;
                try {
                    await deleteItem(config.endpoint, id);
                    await loadTable(currentTable);
                } catch (error) {
                    alert(`Error al eliminar: ${error.message}`);
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (!tableConfigs[currentTable]) {
        currentTable = Object.keys(tableConfigs)[0] || "";
    }

    initSidebar();
    setupEventListeners();
    loadTable("table-clients");
});
