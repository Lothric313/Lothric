'use strict';

// All commerce data is illustrative. No checkout, account or email is sent.
const products = [
  {id:'signature',name:'Lothric Signature',category:'Фирменная бижутерия',groups:['signature','necklaces'],material:'Позолота · фирменная надпись',price:12900,image:'wordmark',tag:'SIGNATURE',description:'Тонкая цепочка и объемная надпись Lothric: фирменный росчерк превращается в самостоятельное украшение. Демонстрационная модель бижутерии с золотистым покрытием.'},
  {id:'monogram',name:'Monogram L',category:'Фирменная бижутерия',groups:['signature'],material:'Позолота · монограмма L',price:8900,image:'monogram',tag:'SIGNATURE',description:'Пара серег с пластичной монограммой L, созданной по фирменному знаку дома. Демонстрационная модель бижутерии с золотистым покрытием.'},
  {id:'aurea',name:'Aurea',category:'Ювелирная коллекция',groups:['rings'],material:'Золото 750 · бриллиант',price:248000,image:'ring',tag:'ВНЕ ВРЕМЕНИ',description:'Скульптурное кольцо с камнем изумрудной огранки в оттенке шампанского. Концептуальное изделие: состав, характеристики камня и цена приведены для демонстрации.'},
  {id:'verde',name:'Verde',category:'Ювелирная коллекция',groups:['necklaces'],material:'Золото 750 · изумруд',price:186000,image:'pendant',tag:'ЦВЕТ И СВЕТ',description:'Лаконичное колье с зеленым камнем и тонкой цепочкой. Концептуальное изделие: состав, характеристики камня и цена приведены для демонстрации.'}
];
const reviews = [
  {quote:'Подвеска очень лёгкая, цепочка не путается. Ношу почти каждый день — с белой рубашкой смотрится особенно хорошо.',name:'Анна Миронова',product:'Колье Lothric Signature',rating:5},
  {quote:'Серьги оказались аккуратнее, чем я представляла по фото. Застёжки удобные, за целый день уши не устают. Очень довольна выбором.',name:'София Ковалёва',product:'Серьги Monogram L',rating:5},
  {quote:'Искала кольцо с тёплым оттенком камня. Aurea понравилось сразу: красиво ловит свет, но не выглядит слишком нарядным на каждый день.',name:'Мария Андреева',product:'Кольцо Aurea',rating:5},
  {quote:'Выбрала Verde в подарок сестре. Ей понравился цвет камня и то, что колье можно сочетать с другими цепочками. Теперь присматриваю такое же себе.',name:'Екатерина Белова',product:'Колье Verde',rating:5},
  {quote:'Заказывал подвеску в подарок. Украшение понравилось, выглядит аккуратно. Хотелось бы больше вариантов длины цепочки — в остальном всё отлично.',name:'Александр Лебедев',product:'Колье Lothric Signature',rating:4.5}
];
const $ = (selector, root=document) => root.querySelector(selector);
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const findProduct = id => products.find(p => p.id === id);
const escapeText = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readState(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
let cart = readState('lothric-cart', []);
cart = Array.isArray(cart) ? cart.filter(item=>findProduct(item.id)&&Number.isInteger(item.qty)&&item.qty>0&&item.qty<=99&&typeof item.size==='string') : [];
let currentFilter = 'all';
let activePanel = '';
let activeProduct = null;
let toastTimer;
function saveState() { try { localStorage.setItem('lothric-cart',JSON.stringify(cart)); } catch { /* Storage may be blocked in private browser contexts. */ } updateBadges(); }
function updateBadges() { const count=cart.reduce((n,item)=>n+item.qty,0); $('#cart-count').textContent=count; $('#cart-count').hidden=!count; }
function toast(message) { $('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000); }
function addCart(id,size='Универсальный') { const existing=cart.find(item=>item.id===id&&item.size===size);if(existing){if(existing.qty>=99){toast('Достигнуто максимальное количество');return;}existing.qty++;}else cart.push({id,size,qty:1});saveState();toast('Украшение добавлено в корзину'); }
const panel=$('#panel');
function openPanel(type,id=null) { activePanel=type;activeProduct=id;renderPanel();if(!panel.open)panel.showModal();requestAnimationFrame(()=>{const input=$('#panel-content input');if(input)input.focus();}); }
function closePanel(){panel.close();activePanel='';activeProduct=null;}
function smallItem(p,controls='') {return `<div class="panel-item"><button data-view="${p.id}" aria-label="Посмотреть ${p.name}" style="padding:0"><img src="assets/${p.image}.webp" alt="${p.name}"></button><div><h3>${p.name}</h3><p>${money(p.price)}</p>${controls}</div></div>`;}
function renderPanel(){
  let html='';
  if(activePanel==='search') html='<h2>Найти свое <em>украшение.</em></h2><label class="sr-only" for="search-input">Поиск по названию и материалу</label><input class="panel-search" id="search-input" placeholder="Название, коллекция или материал…" type="search" autocomplete="off"><div id="search-results" class="panel-items"></div>';
  if(activePanel==='cart') {
    html='<h2>Ваша <em>корзина.</em></h2>';
    if(!cart.length) html+='<div class="empty-state"><p>Здесь пока тихо. Найдите украшение со своим характером.</p><button class="button button-dark" data-go-catalog>Смотреть коллекцию ↗</button></div>';
    else { html+=cart.map((item,index)=>{const p=findProduct(item.id);return smallItem(p,`<p>${escapeText(item.size)}</p><div class="item-controls"><div class="quantity"><button data-quantity="${index}" data-step="-1" aria-label="Уменьшить количество ${p.name}">−</button><span>${item.qty}</span><button data-quantity="${index}" data-step="1" aria-label="Увеличить количество ${p.name}">+</button></div><button data-remove="${index}">Удалить</button></div>`);}).join('');html+=`<div class="panel-total"><span>Итого</span><span>${money(cart.reduce((n,item)=>n+findProduct(item.id).price*item.qty,0))}</span></div><button class="button button-dark" data-checkout>Оформить демо-заказ ↗</button><p class="muted">Демонстрационная корзина. Оплата и отправка заказов не подключены.</p>`;}
  }
  if(activePanel==='quick') {
    const p=findProduct(activeProduct);if(!p)return;
    html=`<img class="quick-image" src="assets/${p.image}.webp" alt="${p.name}"><p class="eyebrow">${p.category}</p><h2 style="margin-top:12px;margin-bottom:14px">${p.name}</h2><p>${money(p.price)}</p><p class="quick-description">${p.description}</p>${p.groups.includes('rings')?'<label class="panel-field">Размер кольца<select id="product-size"><option>16</option><option selected>17</option><option>18</option><option>19</option></select></label>':''}<button class="button button-dark" data-add="${p.id}">Добавить в корзину <span>+</span></button><p class="demo-note" style="margin-top:20px">Концептуальное изображение · демонстрационная цена</p>`;
  }
  if(activePanel==='contacts') html='<h2>Всегда <em>рядом.</em></h2><p>+1 444 555 9999<br>hello@lothric.example</p><p class="muted" style="margin-top:20px">Это демонстрационные контакты из макета. Перед запуском сайта замените их на телефон и адрес бренда.</p>';
  if(activePanel==='social') html='<h2>Истории <em>Lothric.</em></h2><p class="muted">Ссылки на социальные сети появятся здесь после подключения реальных страниц бренда. Сейчас это демонстрационный сайт.</p>';
  if(activePanel==='care') html='<h2>Бережное <em>прикосновение.</em></h2><p class="muted">Храните украшения по отдельности в мягких мешочках. Избегайте контакта позолоченной бижутерии с парфюмом и бытовой химией. Протирайте поверхность мягкой сухой тканью.</p><p class="muted" style="margin-top:20px">Точные рекомендации для золота, камней и покрытий добавьте после утверждения материалов реальной коллекции.</p>';
  if(activePanel==='privacy') html='<h2>Ваши <em>данные.</em></h2><p class="muted">Сайт работает локально. Поиск и корзина обрабатываются в браузере. Корзина сохраняется в localStorage на этом устройстве. Внешние аналитические сервисы не используются.</p><button class="button button-outline" data-clear-data>Очистить сохраненные данные</button>';
  if(activePanel==='checkout') html='<h2>Демо-заказ <em>готов.</em></h2><p class="muted">Вы проверили путь покупки. Заказ никуда не отправлен, деньги не списываются. Корзина сохранена для дальнейшего просмотра.</p><button class="button button-dark" data-panel="cart">Вернуться в корзину ↗</button>';
  $('#panel-content').innerHTML=html;
  if(activePanel==='search') renderSearch('');
}
function renderSearch(query) {
  const search=query.trim().toLocaleLowerCase('ru');
  const list=products.filter(p=>`${p.name} ${p.category} ${p.material}`.toLocaleLowerCase('ru').includes(search));
  $('#search-results').innerHTML=list.length?list.map(p=>smallItem(p,`<div class="item-controls"><button data-view="${p.id}">Посмотреть ↗</button></div>`)).join(''):'<p class="muted">Ничего не найдено. Попробуйте «Lothric», «золото» или «изумруд».</p>';
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button,a');if(!button)return;
  if(button.hasAttribute('data-panel'))openPanel(button.dataset.panel);
  if(button.hasAttribute('data-filter')){currentFilter=button.dataset.filter;renderCatalog();}
  if(button.hasAttribute('data-category-link')){currentFilter=button.dataset.categoryLink;renderCatalog();}
  if(button.hasAttribute('data-view')){event.preventDefault();openPanel('quick',button.dataset.view);}
  if(button.hasAttribute('data-add')) {
    const product = findProduct(button.dataset.add);
    if (product.groups.includes('rings') && activePanel !== 'quick') { openPanel('quick', product.id); return; }
    addCart(product.id, product.groups.includes('rings') ? `Размер ${$('#product-size').value}` : 'Универсальный');
  }
  if(button.hasAttribute('data-quantity')){const item=cart[Number(button.dataset.quantity)];item.qty=Math.min(99,item.qty+Number(button.dataset.step));if(item.qty<=0)cart.splice(Number(button.dataset.quantity),1);saveState();renderPanel();}
  if(button.hasAttribute('data-remove')){cart.splice(Number(button.dataset.remove),1);saveState();renderPanel();}
  if(button.hasAttribute('data-checkout'))openPanel('checkout');
  if(button.hasAttribute('data-go-catalog')){closePanel();$('#catalog').scrollIntoView({behavior:'smooth'});}
  if(button.hasAttribute('data-clear-data')){cart=[];saveState();toast('Корзина очищена');}
});
$('#close-panel').addEventListener('click',closePanel);
panel.addEventListener('cancel',()=>{activePanel='';activeProduct=null;});
// Close immediately on Escape, including when a search input has focus.
panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closePanel();}});
panel.addEventListener('click',event=>{const bounds=panel.getBoundingClientRect();if(event.target===panel&&(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom))closePanel();});
$('#panel-content').addEventListener('input',event=>{if(event.target.id==='search-input')renderSearch(event.target.value);});
// Demo form validates locally and retains the draft; it sends no personal data.
$('#contact-form').addEventListener('submit',event=>{
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  $('#contact-status').textContent='Форма заполнена. Это демонстрация: сообщение никуда не отправлено.';
});
function renderReviews() {
  const average=reviews.reduce((sum,review)=>sum+review.rating,0)/reviews.length;
  $('#review-count').textContent='1000+';
  $('#review-average').textContent=average.toFixed(1);
  $('#review-list').innerHTML=reviews.map(review=>`<li class="customer-review"><article><header class="customer-review-heading"><div><h3>${escapeText(review.name)}</h3><p class="customer-review-product">${escapeText(review.product)}</p></div><span class="rating-stars" role="img" aria-label="${review.rating} из 5"><span aria-hidden="true">★★★★★</span><span class="rating-stars-fill" style="width:${review.rating/5*100}%" aria-hidden="true">★★★★★</span></span></header><blockquote class="customer-review-text">${escapeText(review.quote)}</blockquote></article></li>`).join('');
}
renderCatalog();renderReviews();updateBadges();$('#year').textContent=new Date().getFullYear();

// Scroll-driven video: seek in both directions, with eased updates and one
// pending seek at a time. requestAnimationFrame stops when the frame settles.
const video=$('#hero-video');
const hero=$('#home');
const copy=$('#hero-copy');
const progressBar=$('#hero-progress');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileHero=window.matchMedia('(max-width: 899px)');
let progress=0, targetTime=0, frameId=0, videoReady=false, lastVideoFrame=0;
function scheduleFrame(){if(!mobileHero.matches&&!frameId&&!document.hidden)frameId=requestAnimationFrame(updateVideo);}
// No source or poster is assigned on phones, so the hero downloads no video.
function configureHeroMedia() {
  cancelAnimationFrame(frameId);
  frameId=0;
  lastVideoFrame=0;
  videoReady=false;
  video.pause();
  if (mobileHero.matches) {
    video.removeAttribute('src');
    video.removeAttribute('poster');
    video.preload='none';
    video.load();
    $('#video-fallback').hidden=true;
  } else {
    video.dataset.quality='original';
    video.poster='assets/video-start-original.png';
    video.src='assets/lothric-motion.mp4';
    video.preload=reducedMotion.matches?'metadata':'auto';
    video.load();
  }
  updateScroll();
}
function updateVideo(timestamp){
  frameId=0;
  if(!videoReady||reducedMotion.matches||video.seeking||document.hidden)return;
  const elapsed = lastVideoFrame ? Math.min(48, Math.max(8, timestamp - lastVideoFrame)) : 16.7;
  lastVideoFrame = timestamp;
  const delta=targetTime-video.currentTime;
  if (targetTime === 0) { if (video.currentTime !== 0) video.currentTime = 0; return; }
  if(Math.abs(delta)<0.035){if(Math.abs(delta)>0.001)video.currentTime=targetTime;return;}
  // Seeking the same API backward avoids unsupported negative playbackRate.
  // Time-based easing keeps the scrub speed consistent across device frame rates.
  video.currentTime=video.currentTime+delta*(1-Math.exp(-elapsed/60));
}
function updateScroll(){
  // Keep the header transparent until the next section reaches it.
  const header=$('#header');
  header.classList.toggle('scrolled',hero.getBoundingClientRect().bottom<=header.offsetHeight);
  if (mobileHero.matches) {
    progress=0;
    targetTime=0;
    copy.style.opacity='1';
    copy.style.transform='';
    copy.style.pointerEvents='';
    copy.inert=false;
    progressBar.style.transform='scaleX(0)';
    return;
  }
  const distance=Math.max(1,hero.offsetHeight-window.innerHeight);
  progress=Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/distance));
  targetTime=progress*Math.max(0,(Number.isFinite(video.duration)?video.duration:0)-0.045);
  const fade=reducedMotion.matches?1:Math.max(0,1-progress*6);
  copy.style.opacity=fade;
  copy.style.transform=`translateY(${-progress*45}px)`;
  copy.style.pointerEvents=fade<0.1?'none':'';
  copy.inert=fade<0.1;
  progressBar.style.transform=`scaleX(${progress})`;
  scheduleFrame();
}
video.addEventListener('loadeddata',()=>{videoReady=true;video.pause();$('#video-fallback').hidden=true;updateScroll();});
video.addEventListener('seeked',scheduleFrame);
video.addEventListener('error',()=>{if(!mobileHero.matches)$('#video-fallback').hidden=false;});
$('#video-fallback').addEventListener('click',()=>{video.load();video.play().then(()=>video.pause()).catch(()=>toast('Видео недоступно. Проверьте локальный файл.'));});
window.addEventListener('scroll',updateScroll,{passive:true});
window.addEventListener('resize',updateScroll,{passive:true});

document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else updateScroll();});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches&&videoReady)video.currentTime=0;updateScroll();});
mobileHero.addEventListener('change',configureHeroMedia);
configureHeroMedia();
