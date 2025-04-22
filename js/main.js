const tableConfigs = {
    "table-clients": {
        columns: [
            { title: "ID", data: "cliId" },
            { title: "Nombre", data: "cliFirstName" },
            { title: "Apellido", data: "cliLastName" },
            { title: "Dirección", data: "cliDirection" },
        ],
        endpoint: "Clients",
    },
    "table-products": {
        columns: [
            { title: "ID", data: "proId" },
            { title: "Nombre", data: "proName" },
            { title: "Precio", data: "proPrice" },
            { title: "Categoría ID", data: "categoryCatId" },
        ],
        endpoint: "Products",
    },
    "table-orders": {
        columns: [
            { title: "ID", data: "ordId" },
            { title: "Fecha", data: "ordDate" },
            {
                title: "Estado",
                data: "ordStatus",
                render: (data) => (data ? "Activo" : "Inactivo"),
            },
            { title: "Cliente ID", data: "clientCliId" },
        ],
        endpoint: "Orders",
    },
    "table-categories": {
        columns: [
            { title: "ID", data: "catId" },
            { title: "Descripción", data: "catDescription" },
        ],
        endpoint: "Categories",
    },
    "table-orderdetails": {
        columns: [
            { title: "ID", data: "detId" },
            { title: "Cantidad", data: "detAmount" },
            { title: "Producto ID", data: "productProId" },
            { title: "Orden ID", data: "orderOrdId" },
        ],
        endpoint: "OrderDetails",
    },
};

async function loadTable(tableName) {
    const config = tableConfigs[tableName];
    if (!config) return;

    try {
        const data = await fetchData(config.endpoint);
        const table = $("#data-table");

        if ($.fn.DataTable.isDataTable(table)) {
            table.DataTable().destroy();
            table.empty();
        }

        if (table.length === 0) {
            console.error("Tabla no encontrada en el DOM");
            return;
        }

        if (tableName === "table-orderdetails") {
            data.forEach((item) => {
                item.detAmount = item.detAmount || 0;
                item.productProId = item.productProId || "N/A";
                item.orderOrdId = item.orderOrdId || "N/A";
            });
        }

        table.DataTable({
            data: data,
            columns: config.columns,
            responsive: true,
            language: {
                url: "//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json",
            },
            columnDefs: [
                {
                    targets: "_all",
                    defaultContent: "N/A",
                },
            ],
        });
    } catch (error) {
        console.error("Error cargando tabla:", error);
        $("#data-table").html(
            '<tr><td colspan="4" class="text-center text-danger">Error al cargar los datos</td></tr>',
        );
    }
}

function initSidebar() {
    const links = document.querySelectorAll(".nav-link");

    links.forEach((link) => {
        link.addEventListener("click", async (e) => {
            e.preventDefault();

            links.forEach((l) => l.classList.remove("active"));
            const target = e.currentTarget;
            target.classList.add("active");

            document.getElementById("table-title").textContent =
                target.textContent.trim();

            await loadTable(target.dataset.table);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    loadTable("table-clients");
});
