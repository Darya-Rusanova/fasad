// 1. ФУНКЦИОНАЛ ШАПКИ ПРИ СКРОЛЛЕ
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 2. БУРГЕР-МЕНЮ ДЛЯ МОБИЛЬНЫХ
const burgerBtn = document.getElementById('burgerBtn');
const nav = document.querySelector('.nav');

if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        nav.classList.toggle('active');
        
        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
}

// 3. ЗАКРЫВАЕМ МЕНЮ ПРИ КЛИКЕ НА ССЫЛКУ
document.querySelectorAll('.nav__list a').forEach(link => {
    link.addEventListener('click', () => {
        burgerBtn?.classList.remove('active');
        nav?.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// 4. ПЛАВНЫЙ СКРОЛЛ К ЯКОРЯМ
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// === КАЛЬКУЛЯТОР ===
const PANEL_PRICE = 1200;      // цена одной панели
const PANEL_AREA = 0.5;        // площадь одной панели (м²)

// Элементы DOM
const areaSlider = document.getElementById('areaSlider');
const areaInput = document.getElementById('areaInput');
const totalPriceEl = document.getElementById('totalPrice');
const detailArea = document.getElementById('detailArea');
const detailPanels = document.getElementById('detailPanels');

// Функция расчёта
function calculateCost(area) {
    area = Math.round(area * 10) / 10;
    const panelsCount = Math.ceil(area / PANEL_AREA);
    const totalCost = panelsCount * PANEL_PRICE;
    
    return { area, panels: panelsCount, total: totalCost };
}

// Функция обновления всего интерфейса
function updateCalculator(value) {
    // Ограничиваем значение
    let area = Math.min(1000, Math.max(1, value));
    area = Math.round(area);
    
    const result = calculateCost(area);
    
    // Обновляем все элементы
    if (areaSlider) areaSlider.value = area;
    if (areaInput) areaInput.value = area;
    if (totalPriceEl) totalPriceEl.textContent = result.total.toLocaleString('ru-RU') + ' ₽';
    if (detailArea) detailArea.textContent = result.area;
    if (detailPanels) detailPanels.textContent = result.panels;
    
    // Анимация
    if (totalPriceEl) {
        totalPriceEl.style.transform = 'scale(1.05)';
        setTimeout(() => {
            totalPriceEl.style.transform = 'scale(1)';
        }, 200);
    }
}

// Обработчики (с проверкой на существование элементов)
if (areaSlider) {
    areaSlider.addEventListener('input', (e) => {
        updateCalculator(parseInt(e.target.value));
    });
}

if (areaInput) {
    areaInput.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        if (isNaN(value)) value = 1;
        updateCalculator(value);
    });
    
    areaInput.addEventListener('blur', (e) => {
        let value = parseInt(e.target.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 1000) value = 1000;
        updateCalculator(value);
    });
}

// Кнопка "Получить точный расчёт"
const getQuoteBtn = document.querySelector('.result-card__btn');
if (getQuoteBtn) {
    getQuoteBtn.addEventListener('click', () => {
        const area = parseInt(areaSlider?.value || 10);
        const result = calculateCost(area);
        
    });
}

// === ГАЛЕРЕЯ-КАРУСЕЛЬ (ПОЛНОСТЬЮ РАБОЧАЯ ВЕРСИЯ) ===

let galleryData = [];
let currentIndex = 0;
let cardsPerView = 1;
let totalCards = 0;
let autoSlideInterval = null;

// Загружаем данные из JSON
async function loadGallery() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        galleryData = data.gallery || [];
        renderGallery();
        initSlider();
        //startAutoSlide(); // Автопрокрутка (опционально)
    } catch (error) {
        console.error('Ошибка загрузки галереи:', error);
    }
}

// Рендер карточек галереи
function renderGallery() {
    const track = document.getElementById('sliderTrack');
    if (!track) return;
    
    track.innerHTML = galleryData.map(item => `
        <div class="gallery-card" data-id="${item.id}">
            <div class="gallery-card__image">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
            </div>
            <div class="gallery-card__content">
                <h3 class="gallery-card__title">${item.title}</h3>
                <p class="gallery-card__description">${item.description}</p>
               
            </div>
        </div>
    `).join('');
}

// Определяем сколько карточек показывать
function getCardsPerView() {
    if (window.innerWidth <= 576) return 1;      // Телефоны
    if (window.innerWidth <= 992) return 2;      // Планшеты
    return 3;                                     // Компьютеры
}

// Обновляем ширину карточек
function updateCardWidth() {
    const container = document.querySelector('.slider-container');
    const cards = document.querySelectorAll('.gallery-card');
    if (!container || !cards.length) return;
    
    const gap = window.innerWidth <= 576 ? 15 : 30;
    cardsPerView = getCardsPerView();
    let cardWidth;
    
    if (cardsPerView === 1) {
        cardWidth = container.clientWidth - 20;
    } else if (cardsPerView === 2) {
        cardWidth = (container.clientWidth - gap) / 2;
    } else {
        cardWidth = (container.clientWidth - gap * 2) / 3;
    }
    
    cards.forEach(card => {
        card.style.flex = `0 0 ${cardWidth}px`;
    });
    
    return cardWidth;
}

// Перемещение к слайду
function moveToSlide(index, smooth = true) {
    const cards = document.querySelectorAll('.gallery-card');
    totalCards = cards.length;
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;
    
    currentIndex = index;
    const cardWidth = updateCardWidth();
    const gap = window.innerWidth <= 576 ? 15 : 30;
    const offset = -currentIndex * (cardWidth + gap);
    
    const track = document.getElementById('sliderTrack');
    if (track) {
        if (!smooth) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.4s ease-in-out';
        }
        track.style.transform = `translateX(${offset}px)`;
        
        setTimeout(() => {
            if (track) track.style.transition = 'transform 0.4s ease-in-out';
        }, 50);
    }
    
    updateDots();
}

// Обновляем точки-индикаторы
function updateDots() {
    const dots = document.querySelectorAll('.dot');
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    const activeIndex = Math.min(currentIndex, maxIndex);
    
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
    });
}

// Создаём точки
function createDots() {
    const container = document.getElementById('sliderDots');
    if (!container) return;
    
    container.innerHTML = '';
    const dotsCount = Math.max(1, totalCards - cardsPerView + 1);
    
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
            stopAutoSlide();
            currentIndex = i;
            moveToSlide(currentIndex, true);
            startAutoSlide();
        });
        container.appendChild(dot);
    }
}

// === ПОДДЕРЖКА СВАЙПОВ НА ТЕЛЕФОНАХ ===
let startX = 0;
let isDragging = false;

function addSwipeSupport() {
    const track = document.getElementById('sliderTrack');
    if (!track) return;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
       // stopAutoSlide();
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;
        const swipeThreshold = 50;
        
        if (Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                // Свайп вправо — предыдущий слайд
                currentIndex--;
                const maxIndex = Math.max(0, totalCards - cardsPerView);
                if (currentIndex < 0) currentIndex = maxIndex;
            } else {
                // Свайп влево — следующий слайд
                currentIndex++;
                const maxIndex = Math.max(0, totalCards - cardsPerView);
                if (currentIndex > maxIndex) currentIndex = 0;
            }
            moveToSlide(currentIndex, true);
        }
        //startAutoSlide();
    });
}


// === КНОПКИ НАВИГАЦИИ ===
// === КНОПКИ НАВИГАЦИИ (ИСПРАВЛЕННЫЕ) ===
function initButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Удаляем старые обработчики, если были
    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            //stopAutoSlide();
            currentIndex--;
            const maxIndex = Math.max(0, totalCards - cardsPerView);
            if (currentIndex < 0) currentIndex = maxIndex;
            moveToSlide(currentIndex, true);
            //startAutoSlide();
        };
    }
    
    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            //stopAutoSlide();
            currentIndex++;
            const maxIndex = Math.max(0, totalCards - cardsPerView);
            if (currentIndex > maxIndex) currentIndex = 0;
            moveToSlide(currentIndex, true);
            //startAutoSlide();
        };
    }
}

// === ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА ===
function initSlider() {
    if (document.querySelectorAll('.gallery-card').length === 0) return;
    
    cardsPerView = getCardsPerView();
    totalCards = document.querySelectorAll('.gallery-card').length;
    
    updateCardWidth();
    createDots();
    moveToSlide(0, false);
    initButtons();
    addSwipeSupport();
}

// === АДАПТАЦИЯ ПРИ ПОВОРОТЕ ЭКРАНА ===
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        cardsPerView = getCardsPerView();
        updateCardWidth();
        createDots();
        moveToSlide(currentIndex, false);
    }, 200);
});

// ИНИЦИАЛИЗАЦИЯ
updateCalculator(10);
loadGallery();