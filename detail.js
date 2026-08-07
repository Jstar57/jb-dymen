// Konfigurasi Supabase (Sesuaikan URL & Anon Key Anda)
const SUPABASE_URL = 'https://hhpdzobytbirrttqvwka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocGR6b2J5dGJpcnJ0dHF2d2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDM4MzQsImV4cCI6MjEwMTY3OTgzNH0.WA2ztplgz3zOsUsm4R9m8YBY0naqEBtHC0VNtOKwIYw';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const urlParams = new URLSearchParams(window.location.search);
const accountId = urlParams.get('id');

async function fetchAccountDetail() {
    const detailContainer = document.getElementById('detailContainer');
    
    if (!accountId) {
        detailContainer.innerHTML = `<p style="color: red; text-align: center;">Akun tidak ditemukan!</p>`;
        return;
    }

    const { data: account, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

    if (error || !account) {
        detailContainer.innerHTML = `<p style="color: red; text-align: center;">Gagal memuat data akun.</p>`;
        return;
    }

    // Anggap foto disimpan dalam bentuk array di database (kolom images: [url1, url2, url3, url4, url5])
    const images = account.images || [];
    let currentSlide = 0;

    let imagesHtml = images.map(img => `<img src="${img}" alt="Preview Akun">`).join('');
    let thumbsHtml = images.map((img, index) => `<img src="${img}" class="${index === 0 ? 'active' : ''}" onclick="changeSlide(${index})" id="thumb-${index}">`).join('');

    detailContainer.innerHTML = `
        <div class="slider-container">
            <div class="slider-images" id="sliderImages" style="transform: translateX(0px);">
                ${imagesHtml}
            </div>
            <button class="slider-btn prev-btn" onclick="moveSlide(-1)">&#10094;</button>
            <button class="slider-btn next-btn" onclick="moveSlide(1)">&#10095;</button>
        </div>
        <div class="thumbnail-container">
            ${thumbsHtml}
        </div>
        <div class="account-info">
            <h1>${account.title}</h1>
            <div class="account-price">Rp ${Number(account.price).toLocaleString('id-ID')}</div>
            <h3>Deskripsi Akun:</h3>
            <p class="account-desc">${account.description}</p>
            <a href="https://wa.me/628123456789?text=Halo%20Admin,%20saya%20tertarik%20membeli%20akun:%20${encodeURIComponent(account.title)}" target="_blank" class="btn-buy-now">BELI SEKARANG</a>
        </div>
    `;

    window.slideCount = images.length;
}

window.moveSlide = function(direction) {
    const sliderImages = document.getElementById('sliderImages');
    if(!sliderImages) return;
    
    // Ambil index saat ini berdasarkan transform
    let currentTransform = sliderImages.style.transform;
    let match = currentTransform.match(/translateX\((-?\d+)px\)/);
    let currentX = match ? parseInt(match[1]) : 0;
    let slideWidth = sliderImages.clientWidth;
    
    let index = Math.abs(currentX / slideWidth);
    index += direction;
    
    if(index < 0) index = window.slideCount - 1;
    if(index >= window.slideCount) index = 0;
    
    updateSliderPosition(index);
}

window.changeSlide = function(index) {
    updateSliderPosition(index);
}

function updateSliderPosition(index) {
    const sliderImages = document.getElementById('sliderImages');
    if(!sliderImages) return;
    let slideWidth = sliderImages.clientWidth;
    sliderImages.style.transform = `translateX(-${index * slideWidth}px)`;
    
    // Update thumbnail aktif
    for(let i = 0; i < window.slideCount; i++) {
        let thumb = document.getElementById(`thumb-${i}`);
        if(thumb) {
            if(i === index) thumb.classList.add('active');
            else thumb.classList.remove('active');
        }
    }
}

fetchAccountDetail();
