// Konfigurasi Supabase (Ganti dengan URL & Anon Key project Supabase Anda)
const SUPABASE_URL = 'https://hhpdzobytbirrttqvwka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGR6b2J5dGJpcnJ0dHF2d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDM4MzQsImV4cCI6MjEwMTY3OTgzNH0.WA2ztplgz3zOsUsm4R9m8YBY0naqEBtHC0VNtOKwIYw';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let products = []; // Variabel global penampung data dari Supabase

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');

// Fungsi Utama: Ambil Data dari Supabase
async function fetchProductsFromSupabase() {
    productGrid.innerHTML = `<p style="color: var(--primary-tosca); text-align: center; grid-column: 1/-1;">Memuat data akun...</p>`;
    
    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('id', { ascending: false }); // Urutkan dari yang terbaru

    if (error) {
        productGrid.innerHTML = `<p style="color: #ff3333; text-align: center; grid-column: 1/-1;">Gagal memuat produk dari database.</p>`;
        console.error(error);
        return;
    }

    products = data || [];
    displayProducts(products);
}

// Fungsi Menampilkan Produk ke Grid HTML
function displayProducts(items) {
    productGrid.innerHTML = "";
    if(items.length === 0) {
        productGrid.innerHTML = `<p style="color: var(--primary-tosca); text-align: center; grid-column: 1/-1;">Akun tidak ditemukan...</p>`;
        return;
    }
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Ambil foto pertama dari array images untuk thumbnail di card utama
        let imageUrl = (item.images && item.images.length > 0) ? item.images[0] : '';
        
        // Atur tampilan tombol & badge berdasarkan status
        let buttonHTML = `<a href="detail.html?id=${item.id}" class="btn-buy">Lihat Detail</a>`;
        let badgeHTML = '';

        if (item.status === 'sold') {
            buttonHTML = `<a href="#" class="btn-buy" style="opacity: 0.5; pointer-events: none; border-color: #ff3333; color: #ff3333;">Terjual</a>`;
            badgeHTML = `<span class="badge badge-sold">SOLD</span>`;
        } else if (item.status === 'lelang') {
            buttonHTML = `<a href="detail.html?id=${item.id}" class="btn-buy" style="border-color: #ffcc00; color: #ffcc00;">Ikut Lelang</a>`;
            badgeHTML = `<span class="badge badge-lelang">LELANG</span>`;
        }

        // Format harga ke rupiah jika berupa angka
        let formattedPrice = isNaN(item.price) ? item.price : `Rp ${Number(item.price).toLocaleString('id-ID')}`;

        card.innerHTML = `
            <div class="card-img" style="background: url('${imageUrl}') center/cover no-repeat; position: relative;">
                ${badgeHTML}
                ${!imageUrl ? '<span>NO IMAGE</span>' : ''}
            </div>
            <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-price" style="${item.status === 'lelang' ? 'color: #ffcc00;' : ''}">${formattedPrice}</p>
                ${buttonHTML}
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Fungsi Filter Game lewat Kategori
function filterGame(category, event) {
    resetActiveNav();
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');

    if(category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

// Fungsi Filter lewat Status (Untuk Menu Navbar)
function filterStatus(status, event) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => link.classList.remove('active'));
    if(event) event.target.classList.add('active');

    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-all').classList.add('active');

    if(status === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.status === status);
        displayProducts(filtered);
    }
}

function resetActiveNav() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => link.classList.remove('active'));
    document.getElementById('nav-home').classList.add('active');
}

// Pasang Event Listener ke Tombol Kategori
document.getElementById('btn-all').addEventListener('click', (e) => filterGame('all', e));
document.getElementById('btn-mlbb').addEventListener('click', (e) => filterGame('mlbb', e));
document.getElementById('btn-ff').addEventListener('click', (e) => filterGame('ff', e));
document.getElementById('btn-gt').addEventListener('click', (e) => filterGame('guardian tales', e));

// Pasang Event Listener ke Menu Navbar
document.getElementById('nav-home').addEventListener('click', (e) => { e.preventDefault(); filterStatus('all', e); });
document.getElementById('nav-lelang').addEventListener('click', (e) => { e.preventDefault(); filterStatus('lelang', e); });
document.getElementById('nav-sold').addEventListener('click', (e) => { e.preventDefault(); filterStatus('sold', e); });

// Fitur Pencarian Langsung (Live Search)
searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = products.filter(p => 
        p.title.toLowerCase().includes(keyword) || 
        p.category.toLowerCase().includes(keyword)
    );
    displayProducts(filtered);
});

// Panggil fungsi utama saat halaman dimuat
fetchProductsFromSupabase();