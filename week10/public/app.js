import { sendRequest, rupiah, angka, errorMessage } from "./api.js";

const $ = (id) => document.getElementById(id);
const state = { items: [], editing: null, deleting: null };
const form = $("barangForm");

function cell(text, className = "") {
  const td = document.createElement("td");
  td.textContent = text; td.className = className;
  return td;
}

function toast(message) {
  const item = document.createElement("div");
  item.className = "toast"; item.textContent = message;
  $("toasts").append(item);
  setTimeout(() => item.remove(), 3500);
}

async function api(method, path, body) {
  const response = await sendRequest(method, path, body);
  if (!response.ok) throw new Error(errorMessage(response));
  return response.payload;
}

function render() {
  const query = $("search").value.trim().toLocaleLowerCase("id-ID");
  const category = $("categoryFilter").value;
  const visible = state.items.filter((item) =>
    (!category || item.kategori === category) &&
    `${item.nama} ${item.kode}`.toLocaleLowerCase("id-ID").includes(query));
  const tbody = $("barangTable");
  tbody.replaceChildren();
  for (const item of visible) {
    const row = document.createElement("tr");
    const product = document.createElement("td");
    const name = document.createElement("span");
    name.className = "product-name"; name.textContent = item.nama;
    const code = document.createElement("span");
    code.className = "code"; code.textContent = item.kode;
    product.append(name, code);
    const stock = cell(angka(item.stok), "number");
    if (item.stok <= 5) {
      const label = document.createElement("span");
      label.className = `stock-label${item.stok === 0 ? " out" : ""}`;
      label.textContent = item.stok === 0 ? "Habis" : "Menipis";
      stock.append(label);
    }
    const actions = document.createElement("td"); actions.className = "row-actions";
    for (const [label, handler] of [["Edit", () => openForm(item)], ["Hapus", () => openDelete(item)]]) {
      const button = document.createElement("button");
      button.type = "button"; button.textContent = label;
      button.className = `text-button${label === "Hapus" ? " delete" : ""}`;
      button.setAttribute("aria-label", `${label} ${item.nama}`);
      button.addEventListener("click", handler); actions.append(button);
    }
    row.append(product, cell(item.kategori, "category"), stock, cell(rupiah(item.harga), "number"), actions);
    tbody.append(row);
  }
  $("emptyState").hidden = visible.length > 0;
  $("emptyTitle").textContent = state.items.length ? "Barang tidak ditemukan." : "Belum ada barang.";
  $("emptyAddButton").hidden = state.items.length > 0;
  $("tableCount").textContent = `${visible.length} dari ${state.items.length} barang`;
}

async function loadItems() {
  $("refreshButton").disabled = true;
  try {
    const result = await api("GET", "/api/barang");
    state.items = result.data;
    for (const key of ["totalBarang", "totalStok"]) $(key).textContent = angka(result.meta[key]);
    $("totalNilai").textContent = rupiah(result.meta.totalNilai);
    $("loadError").hidden = true;
    render();
    return true;
  } catch (error) {
    $("loadError").textContent = `${error.message} Klik Muat ulang untuk mencoba lagi.`;
    $("loadError").hidden = false;
    $("tableCount").textContent = "Gagal memuat data";
    return false;
  } finally { $("refreshButton").disabled = false; }
}

function openForm(item = null) {
  state.editing = item?.kode || null;
  form.reset(); $("formError").hidden = true;
  $("formTitle").textContent = item ? "Edit barang" : "Tambah barang";
  for (const key of ["kode", "nama", "kategori", "stok", "harga"]) $(key).value = item ? item[key] : "";
  $("kode").readOnly = Boolean(item);
  $("barangDialog").showModal();
  (item ? $("nama") : $("kode")).focus();
}

function openDelete(item) {
  state.deleting = item.kode;
  $("deleteName").textContent = `${item.nama} (${item.kode})`;
  $("deleteError").hidden = true;
  $("deleteDialog").showModal();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault(); $("saveButton").disabled = true; $("formError").hidden = true;
  try {
    const body = { kode: $("kode").value.trim().toUpperCase(), nama: $("nama").value.trim(),
      kategori: $("kategori").value, stok: Number($("stok").value), harga: Number($("harga").value) };
    const result = await api(state.editing ? "PUT" : "POST", state.editing ? `/api/barang/${encodeURIComponent(state.editing)}` : "/api/barang", body);
    $("barangDialog").close();
    await loadItems(); toast(result.message);
  } catch (error) { $("formError").textContent = error.message; $("formError").hidden = false; }
  finally { $("saveButton").disabled = false; }
});

$("deleteForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("confirmDelete").disabled = true;
  try {
    const result = await api("DELETE", `/api/barang/${encodeURIComponent(state.deleting)}`);
    $("deleteDialog").close(); await loadItems(); toast(result.message);
  } catch (error) { $("deleteError").textContent = error.message; $("deleteError").hidden = false; }
  finally { $("confirmDelete").disabled = false; }
});

document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => $(button.dataset.close).close()));
$("addButton").addEventListener("click", () => openForm());
$("emptyAddButton").addEventListener("click", () => openForm());
$("refreshButton").addEventListener("click", loadItems);
$("search").addEventListener("input", render);
$("categoryFilter").addEventListener("change", render);
loadItems();
