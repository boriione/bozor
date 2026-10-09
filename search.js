/* ---------------- search.js: qidiruv takliflari + kompyuterdagi "Sevimlilar" tugmasi ----------------
   script.js va profile.js'dan KEYIN yuklanadi. */
try{(function(){
const GROUPS = [
  {cat:"phones", icon:"📱",
   words:["telefon","phone","телефон","смартфон","smartphone","mobil","mobile"],
   brands:["iPhone","Samsung Galaxy","Xiaomi","Redmi","Poco","Huawei","Honor","Oppo","Vivo","Realme","Infinix","Tecno"]},
  {cat:"electronics", icon:"💻",
   words:["noutbuk","laptop","ноутбук","kompyuter","computer","компьютер","planshet","tablet","планшет","televizor","tv","телевизор","quloqchin","naushnik","наушники","headphones"],
   brands:["MacBook","iPad","Lenovo","HP","Asus","Acer","Dell","AirPods","PlayStation","Samsung TV"]},
  {cat:"auto", icon:"🚗",
   words:["avto","avtomobil","mashina","car","авто","машина","автомобиль"],
   brands:["Chevrolet","Cobalt","Nexia","Gentra","Damas","Spark","Malibu","Lacetti","Kia","Hyundai","Toyota","BYD"]},
  {cat:"home", icon:"🛋️",
   words:["uy","mebel","divan","sofa","диван","мебель","furniture","xolodilnik","холодильник","fridge"],
   brands:["Divan","Stol","Shkaf","Krovat","Muzlatkich","Kir yuvish mashinasi","Oshxona jihozlari"]},
  {cat:"clothes", icon:"👕",
   words:["kiyim","kurtka","jacket","куртка","одежда","clothes","clothing","krossovka","sneakers","кроссовки"],
   brands:["Kurtka","Krossovka","Ko'ylak","Shim","Palto","Nike","Adidas","Puma"]},
  {cat:"sport", icon:"⚽",
   words:["sport","velosiped","bike","bicycle","велосипед","спорт","futbol","football"],
   brands:["Velosiped","Futbol to'pi","Gantel","Yugurish yo'lakchasi","Samokat"]},
  {cat:"tools", icon:"🛠️",
   words:["asbob","asboblar","drel","tools","инструмент","инструменты","drill"],
   brands:["Drel","Bolgarka","Perforator","Shurupovert","Kalit to'plami"]},
  {cat:"school", icon:"📚",
   words:["kitob","daftar","ruchka","school","учебник","книга","book","maktab"],
   brands:["Kitob","Daftar","Ryukzak","Kalkulyator","Ruchka"]}
];
// har bir guruh uchun kategoriya nomlari (uz/ru/en) ham qo'shiladi
GROUPS.forEach(g=>{
  const c = CATEGORIES.find(x=>x.id===g.cat);
  const names = c ? Object.values(c.name).flatMap(n=>n.toLowerCase().split(/[\s,]+/)) : [];
  g.all = Array.from(new Set(g.words.concat(names)));
});

const esc = s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const groupsFor = q=>GROUPS.filter(g=>g.all.some(w=>w.startsWith(q) || (w.length>=4 && q.startsWith(w))));

// script.js ichidagi renderGrid shu funksiyani chaqiradi: "telefon" yozilsa telefon kategoriyasidagi e'lonlar ham chiqadi
window.searchMatch = function(p,q){
  if(q.length<3) return false;
  return groupsFor(q).some(g=>g.cat===p.cat);
};

/* ---------------- takliflar ro'yxati ---------------- */
let sug, items=[], active=-1;
function build(q){
  const out=[], seen=new Set();
  const add=(type,text,icon,extra)=>{ const k=type+text.toLowerCase(); if(seen.has(k)) return; seen.add(k); out.push({type,text,icon,extra}); };
  GROUPS.forEach(g=>g.brands.forEach(b=>{
    const bl=b.toLowerCase();
    if(bl!==q && bl.split(" ").some(w=>w.startsWith(q))) add("kw",b,g.icon);
  }));
  groupsFor(q).forEach(g=>g.brands.forEach(b=>{ if(b.toLowerCase()!==q) add("kw",b,g.icon); }));
  const kw=out.slice(0,7);
  const prods=PRODUCTS.filter(p=>p.title[lang].toLowerCase().includes(q)||p.title.uz.toLowerCase().includes(q))
    .slice(0,3).map(p=>({type:"item",text:p.title[lang],icon:"🔎",extra:Math.round(p.price).toLocaleString("ru-RU")}));
  return kw.concat(prods);
}
function place(){
  const box=document.getElementById("searchInput").parentElement.getBoundingClientRect();
  sug.style.left=box.left+"px"; sug.style.top=(box.bottom+6)+"px"; sug.style.width=box.width+"px";
}
function hide(){ if(sug){ sug.classList.add("hidden"); } active=-1; }
function paint(){
  [...sug.querySelectorAll(".sug-item")].forEach((el,i)=>el.classList.toggle("active",i===active));
}
function render(){
  const input=document.getElementById("searchInput");
  const q=input.value.trim().toLowerCase();
  if(q.length<2){ hide(); return; }
  items=build(q);
  if(!items.length){ hide(); return; }
  sug.innerHTML=items.map((it,i)=>`<div class="sug-item" data-i="${i}"><span class="sug-ico">${it.icon}</span><span class="sug-txt">${esc(it.text)}</span>${it.extra?`<span class="sug-extra">${it.extra}</span>`:""}</div>`).join("");
  place(); sug.classList.remove("hidden"); active=-1;
}
function pick(i){
  const it=items[i]; if(!it) return;
  const input=document.getElementById("searchInput");
  input.value=it.text; hide();
  showOnlyFavorites=false; showOnlyMine=false;
  renderGrid();
  document.getElementById("grid").scrollIntoView({behavior:"smooth",block:"start"});
}

sug=document.createElement("div");
sug.id="searchSug"; sug.className="hidden"; document.body.appendChild(sug);
sug.addEventListener("mousedown",e=>{ e.preventDefault(); const el=e.target.closest(".sug-item"); if(el) pick(+el.dataset.i); });

const input=document.getElementById("searchInput");
input.addEventListener("input",render);
input.addEventListener("focus",render);
input.addEventListener("keydown",e=>{
  if(sug.classList.contains("hidden")) return;
  if(e.key==="ArrowDown"){ e.preventDefault(); active=(active+1)%items.length; paint(); }
  else if(e.key==="ArrowUp"){ e.preventDefault(); active=(active-1+items.length)%items.length; paint(); }
  else if(e.key==="Enter" && active>=0){ e.preventDefault(); pick(active); }
  else if(e.key==="Escape"){ hide(); }
});
document.addEventListener("click",e=>{ if(e.target!==input && !sug.contains(e.target)) hide(); });
window.addEventListener("resize",()=>{ if(!sug.classList.contains("hidden")) place(); });

/* ---------------- kompyuter: navbar'dagi "Sevimlilar" tugmasi ---------------- */
function updateFavBtn(){
  const b=document.getElementById("favNavBtn"); if(!b) return;
  document.getElementById("favNavLabel").textContent=t("nav_favorites");
  const c=document.getElementById("favNavCount");
  c.textContent=FAVORITES.length; c.classList.toggle("hidden",!FAVORITES.length);
  b.classList.toggle("fav-on",!!showOnlyFavorites);
}
window.toggleFavView = ()=>{ bottomNavGo(showOnlyFavorites ? "search" : "favorites"); };
const favBtn=document.getElementById("favNavBtn");
if(favBtn) favBtn.addEventListener("click",window.toggleFavView);

const _renderGrid=renderGrid;
renderGrid=function(){ _renderGrid(); updateFavBtn(); };
updateFavBtn();
})();
}catch(err){ console.error("search.js xatosi:", err); }
