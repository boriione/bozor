/* ---------------- profile.js: profil bo'limining barcha sahifalari ----------------
   script.js'dan KEYIN yuklanadi. Ma'lumotlar localStorage'da (foydalanuvchi ID bo'yicha) saqlanadi. */
try{(function(){
const PD_KEY = "bozor_pdata_v1";
const T = (u,r,e)=>({uz:u,ru:r,en:e}[lang]);
const esc = s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = n=>Math.round(n).toLocaleString("ru-RU");
const when = ts=>new Date(ts).toLocaleString(lang==="ru"?"ru-RU":lang==="en"?"en-GB":"uz-UZ",{dateStyle:"short",timeStyle:"short"});
const allPD = ()=>{ try{ return JSON.parse(localStorage.getItem(PD_KEY))||{}; }catch(e){ return {}; } };
const pd = ()=>Object.assign({balance:0,bonus:0,posts:0,tx:[],inbox:[],phone:"",city:"",bio:""}, allPD()[currentUser.id]||{});
const savePD = d=>{ const a=allPD(); a[currentUser.id]=d; try{ localStorage.setItem(PD_KEY,JSON.stringify(a)); }catch(e){} };
const addTx = (d,k,v,amount)=>{ d.tx.unshift({t:Date.now(),k,v,amount}); d.tx=d.tx.slice(0,50); };
const addMsg = (d,k,v)=>{ d.inbox.unshift({t:Date.now(),k,v,read:false}); d.inbox=d.inbox.slice(0,50); };

const card = "bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4";
const btn  = "w-full bg-[var(--accent)] text-[var(--accent-ink)] rounded-lg py-3.5 font-extrabold text-base cursor-pointer border-none";
const btn2 = "w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg py-3 font-bold text-base cursor-pointer";
const inp  = "w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] rounded-lg px-4 py-3 text-base outline-none";
const lbl  = "block text-xs font-bold text-[var(--text-muted)] mb-1.5 mt-3 uppercase tracking-wide";
const empty = (icon,txt)=>`<div class="text-center py-12 text-[var(--text-muted)]"><span class="text-3xl block mb-2">${icon}</span>${txt}</div>`;
const shell = (title,body)=>`<div class="pps-head"><button type="button" class="pps-back" onclick="ppBack()" aria-label="Back">‹</button><h2 class="font-display font-bold text-base">${title}</h2></div><div class="p-4 pb-24">${body}</div>`;
const val = id=>document.getElementById(id).value;

const BUNDLES = [
  {id:"start", n:5,  p:30000,  name:["Start","Старт","Start"]},
  {id:"pro",   n:20, p:100000, name:["Pro","Про","Pro"]},
  {id:"biz",   n:50, p:200000, name:["Biznes","Бизнес","Business"]},
];
const bName = b=>b.name[["uz","ru","en"].indexOf(lang)];

const S = {
edit(){
  const d=pd();
  return shell(T("Profilni tahrirlash","Редактировать профиль","Edit profile"),
  `<div class="${card}">
    <label class="${lbl}" style="margin-top:0">${T("Ism","Имя","Name")}</label><input id="peName" class="${inp}" value="${esc(currentUser.name)}">
    <label class="${lbl}">${T("Telefon raqami","Номер телефона","Phone number")}</label><input id="pePhone" type="tel" class="${inp}" placeholder="+998 90 123 45 67" value="${esc(d.phone)}">
    <label class="${lbl}">${T("Shahar","Город","City")}</label>
    <select id="peCity" class="${inp}"><option value="">—</option>${LOCATIONS.map(l=>`<option value="${l.id}"${d.city===l.id?" selected":""}>${l.name[lang]}</option>`).join("")}</select>
    <label class="${lbl}">${T("O'zingiz haqingizda","О себе","About you")}</label><textarea id="peBio" maxlength="200" class="${inp} min-h-[80px] resize-y">${esc(d.bio)}</textarea>
    <button type="button" class="${btn} mt-4" onclick="ppSaveProfile()">${T("Saqlash","Сохранить","Save changes")}</button>
  </div>`);
},
wallet(){
  const d=pd();
  return shell(T("Hamyon","Кошелёк","Wallet"),
  `<div class="${card} mb-3"><div class="text-xs text-[var(--text-muted)]">${T("Balans","Баланс","Balance")}</div>
    <div class="font-display text-3xl font-bold mt-1">${fmt(d.balance)} <span class="text-base">${T("so'm","сум","UZS")}</span></div>
    <div class="text-xs text-[var(--accent-2)] font-bold mt-1">${T("Bonus","Бонусы","Bonus")}: ${fmt(d.bonus)}</div></div>
  <div class="${card}"><div class="font-bold mb-2">${T("Hamyonni to'ldirish","Пополнить кошелёк","Top up wallet")}</div>
    <div class="flex flex-wrap gap-2 mb-2">${[50000,100000,200000,500000].map(a=>`<button type="button" class="px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-sm font-bold cursor-pointer" onclick="document.getElementById('ppAmt').value=${a}">${fmt(a)}</button>`).join("")}</div>
    <input id="ppAmt" type="number" min="1000" placeholder="${T("Summa (so'm)","Сумма (сум)","Amount (UZS)")}" class="${inp}">
    <button type="button" class="${btn} mt-3" onclick="ppTopup()">${T("To'ldirish","Пополнить","Top up")}</button>
    <p class="text-xs text-[var(--text-muted)] mt-2">${T("Demo rejim: haqiqiy to'lov tizimi ulanmagan.","Демо-режим: платёжная система не подключена.","Demo mode: no real payment gateway is connected.")}</p></div>
  <button type="button" class="${btn2} mt-3" onclick="ppOpen('history')">${T("To'lovlar tarixi","История платежей","Payment history")}</button>`);
},
history(){
  const d=pd();
  const name = x=> x.k==="topup" ? T("Hamyon to'ldirildi","Пополнение кошелька","Wallet top-up") : T(`"${x.v}" to'plami`,`Пакет «${x.v}»`,`"${x.v}" bundle`);
  const rows = d.tx.map(x=>`<div class="${card} flex items-center justify-between gap-3 mb-2"><div><div class="font-bold text-sm">${esc(name(x))}</div><div class="text-xs text-[var(--text-muted)]">${when(x.t)}</div></div><div class="font-extrabold ${x.amount>0?"text-[var(--accent)]":"text-[var(--danger)]"}">${x.amount>0?"+":"−"}${fmt(Math.abs(x.amount))}</div></div>`).join("");
  return shell(T("To'lovlar tarixi","История платежей","Payment history"), rows || empty("🧾",T("Hali to'lovlar yo'q","Платежей пока нет","No payments yet")));
},
bundles(){
  const d=pd();
  return shell(T("To'plam sotib olish","Купить пакет","Buy a bundle"),
  `<div class="${card} mb-3 flex justify-between text-sm"><span>${T("Hamyon","Кошелёк","Wallet")}: <b>${fmt(d.balance)}</b></span><span>${T("Paketdagi e'lonlar","Объявлений в пакете","Listings left")}: <b>${d.posts}</b></span></div>`+
  BUNDLES.map(b=>`<div class="${card} mb-3"><div class="flex justify-between items-baseline"><div class="font-display font-bold text-lg">${bName(b)}</div><div class="font-extrabold">${fmt(b.p)} ${T("so'm","сум","UZS")}</div></div>
    <div class="text-sm text-[var(--text-muted)] my-2">${T(`${b.n} ta e'lon joylash · ${fmt(b.p*0.05)} bonus`,`${b.n} объявлений · ${fmt(b.p*0.05)} бонусов`,`${b.n} listings · ${fmt(b.p*0.05)} bonus`)}</div>
    <button type="button" class="${btn}" onclick="ppBuy('${b.id}')">${T("Sotib olish","Купить","Buy")}</button></div>`).join(""));
},
inbox(){
  const d=pd();
  const text = m=>({
    welcome:[T("BOZOR'ga xush kelibsiz!","Добро пожаловать в BOZOR!","Welcome to BOZOR!"),T("Birinchi e'loningizni joylang va xaridorlarni toping.","Разместите первое объявление и найдите покупателей.","Post your first listing and find buyers.")],
    topup:[T("Hamyon to'ldirildi","Кошелёк пополнен","Wallet topped up"),`+${fmt(m.v)} ${T("so'm","сум","UZS")}`],
    bundle:[T("To'plam xarid qilindi","Пакет куплен","Bundle purchased"),T(`"${m.v}" to'plami faollashtirildi.`,`Пакет «${m.v}» активирован.`,`The "${m.v}" bundle is active.`)]
  }[m.k]);
  const html = d.inbox.map(m=>{const [h,b]=text(m);return `<div class="${card} mb-2 ${m.read?"":"border-[var(--accent)]"}"><div class="flex justify-between gap-2"><div class="font-bold text-sm">${esc(h)}</div><div class="text-xs text-[var(--text-muted)] whitespace-nowrap">${when(m.t)}</div></div><div class="text-sm text-[var(--text-muted)] mt-1">${esc(b)}</div></div>`;}).join("");
  d.inbox.forEach(m=>m.read=true); savePD(d);
  return shell(T("Quti","Входящие","Inbox"), html || empty("📭",T("Xabarlar yo'q","Сообщений нет","No messages")));
},
chats(){
  const p=lastOpenedProduct;
  const body = (p && p.phone)
    ? `<div class="${card}"><div class="text-xs text-[var(--text-muted)] mb-1">${T("Oxirgi ko'rilgan e'lon","Последнее просмотренное объявление","Last viewed listing")}</div><div class="font-bold">${esc(p.title[lang])}</div><div class="text-sm text-[var(--text-muted)] mb-3">${esc(p.phone)}</div>
       <a class="${btn} flex items-center justify-center mb-2" target="_blank" rel="noopener" href="https://wa.me/${p.phone.replace(/\D/g,"")}">WhatsApp</a>
       <a class="${btn2} flex items-center justify-center" href="tel:${p.phone.replace(/\s+/g,"")}">${T("Qo'ng'iroq qilish","Позвонить","Call")}</a></div>`
    : empty("💬",T("Suhbat boshlash uchun e'lonni oching va «Bog'lanish»ni bosing.","Откройте объявление и нажмите «Связаться».","Open a listing and tap Contact to start a chat."));
  return shell(T("Aktiv suhbatlar","Активные чаты","Active chats"), body);
},
settings(){
  const lb=(c,n)=>`<button type="button" onclick="setLang('${c}')" class="flex-1 rounded-lg py-2.5 font-extrabold text-sm cursor-pointer border border-[var(--border)] ${lang===c?"bg-[var(--accent)] text-[var(--accent-ink)]":"bg-[var(--surface-2)] text-[var(--text)]"}">${n}</button>`;
  return shell(T("Sozlamalar","Настройки","Settings"),
  `<div class="${card} mb-3"><div class="font-bold mb-2">${T("Til","Язык","Language")}</div><div class="flex gap-2">${lb("uz","O'zbekcha")}${lb("ru","Русский")}${lb("en","English")}</div>
    <button type="button" class="${btn2} mt-3" onclick="toggleTheme()">🌗 ${T("Mavzuni almashtirish","Сменить тему","Switch theme")}</button></div>
  <div class="${card} mb-3"><div class="font-bold">${T("Parolni o'zgartirish","Сменить пароль","Change password")}</div>
    <label class="${lbl}">${T("Joriy parol","Текущий пароль","Current password")}</label><input id="spOld" type="password" class="${inp}">
    <label class="${lbl}">${T("Yangi parol (kamida 4 belgi)","Новый пароль (мин. 4 символа)","New password (min. 4 characters)")}</label><input id="spNew" type="password" class="${inp}">
    <button type="button" class="${btn} mt-3" onclick="ppChangePass()">${T("Parolni saqlash","Сохранить пароль","Save password")}</button></div>
  <div class="${card}"><div class="font-bold text-[var(--danger)] mb-1">${T("Hisobni o'chirish","Удалить аккаунт","Delete account")}</div>
    <p class="text-sm text-[var(--text-muted)] mb-3">${T("Hisobingiz, hamyoningiz va barcha e'lonlaringiz o'chiriladi. Buni qaytarib bo'lmaydi.","Аккаунт, кошелёк и все ваши объявления будут удалены. Это нельзя отменить.","Your account, wallet and all your listings will be deleted. This can't be undone.")}</p>
    <button type="button" class="w-full bg-transparent border border-[var(--danger)] text-[var(--danger)] rounded-lg py-3 font-bold cursor-pointer" onclick="ppDeleteAccount()">${T("Hisobni o'chirish","Удалить аккаунт","Delete account")}</button></div>`);
},
help(){
  const q=[
    [T("E'lonni qanday joylayman?","Как разместить объявление?","How do I post a listing?"),T("Pastdagi «Sotish» tugmasini bosing, ma'lumotlarni to'ldiring va «Joylash»ni bosing.","Нажмите «Продать», заполните данные и нажмите «Разместить».","Tap Sell, fill in the details and press Post.")],
    [T("E'lonni qanday o'chiraman?","Как удалить объявление?","How do I delete a listing?"),T("Profil → «Barcha e'lonlaringiz» orqali e'lonni oching va «E'lonni o'chirish»ni bosing.","Профиль → «Все ваши объявления», откройте объявление и нажмите «Удалить».","Profile → All your listings, open the listing and press Delete.")],
    [T("Hamyonni qanday to'ldiraman?","Как пополнить кошелёк?","How do I top up my wallet?"),T("Profil → «Sizning hamyoningiz» bo'limida summani tanlang va «To'ldirish»ni bosing.","Профиль → «Ваш кошелёк», выберите сумму и нажмите «Пополнить».","Profile → Your wallet, choose an amount and press Top up.")],
    [T("Sotuvchi bilan qanday bog'lanaman?","Как связаться с продавцом?","How do I contact a seller?"),T("E'lonni oching va «Bog'lanish»ni bosing — telefon qo'ng'irog'i ochiladi.","Откройте объявление и нажмите «Связаться» — откроется звонок.","Open the listing and tap Contact to start a call.")],
    [T("Parolimni unutdim","Я забыл пароль","I forgot my password"),T("Hozircha parolni faqat hisobga kirgan holda Sozlamalar orqali o'zgartirish mumkin.","Пока пароль можно сменить только в Настройках после входа.","For now the password can only be changed in Settings while logged in.")]
  ];
  return shell(T("Yordam","Помощь","Help"), q.map(([a,b])=>`<details><summary>${a}</summary><p class="text-sm text-[var(--text-muted)] mt-2">${b}</p></details>`).join(""));
},
terms(){
  const s=[
    [T("1. E'lonlar","1. Объявления","1. Listings"),T("Faqat qonuniy tovarlar e'lon qilinadi. E'lon mazmuni uchun sotuvchi javobgar.","Разрешены только законные товары. За содержание объявления отвечает продавец.","Only lawful goods may be listed. The seller is responsible for a listing's content.")],
    [T("2. Xavfsizlik","2. Безопасность","2. Safety"),T("Mahsulotni ko'rmasdan oldin oldindan to'lov qilmang. Uchrashuvni jamoat joyida o'tkazing.","Не платите заранее, не увидев товар. Встречайтесь в общественных местах.","Don't prepay before seeing the item. Meet in public places.")],
    [T("3. Taqiqlanganlar","3. Запрещено","3. Prohibited"),T("Yolg'on e'lonlar, spam va boshqa foydalanuvchilarni aldash taqiqlanadi.","Ложные объявления, спам и обман пользователей запрещены.","Fake listings, spam and deceiving other users are not allowed.")],
    [T("4. Hisob","4. Аккаунт","4. Account"),T("Parolingizni sir saqlang. Qoidalarni buzgan hisoblar cheklanishi mumkin.","Храните пароль в тайне. Аккаунты, нарушающие правила, могут быть ограничены.","Keep your password private. Accounts that break the rules may be restricted.")]
  ];
  return shell(T("Shartlar va qoidalar","Условия использования","Terms & conditions"), s.map(([h,b])=>`<div class="${card} mb-2"><div class="font-bold mb-1">${h}</div><div class="text-sm text-[var(--text-muted)]">${b}</div></div>`).join(""));
},
agreement(){
  const s=[
    T("Ro'yxatdan o'tish orqali siz BOZOR qoidalariga rozilik bildirasiz.","Регистрируясь, вы соглашаетесь с правилами BOZOR.","By registering you agree to the BOZOR rules."),
    T("Siz kiritgan ma'lumotlar (ism, telefon, e'lonlar) xizmatni ishlatish uchun saqlanadi. Telefon raqamingiz e'londa ko'rinadi.","Введённые вами данные (имя, телефон, объявления) хранятся для работы сервиса. Номер телефона виден в объявлении.","The data you enter (name, phone, listings) is stored to run the service. Your phone number is visible on your listings."),
    T("Siz hisobingizni istalgan vaqtda Sozlamalar orqali o'chira olasiz.","Вы можете удалить аккаунт в любой момент в Настройках.","You can delete your account at any time in Settings.")
  ];
  return shell(T("Foydalanuvchi bilan kelishuvi","Пользовательское соглашение","User agreement"), s.map(x=>`<p class="${card} mb-2 text-sm text-[var(--text-muted)]">${x}</p>`).join(""));
},
about(){
  return shell(T("Ilova haqida","О приложении","About the app"),
  `<div class="${card} text-center"><div class="w-14 h-14 mx-auto rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] flex items-center justify-center font-extrabold text-2xl font-display">B</div>
    <div class="font-display font-bold text-xl mt-3">BOZOR</div><div class="text-xs text-[var(--text-muted)] mb-3">v1.0</div>
    <p class="text-sm text-[var(--text-muted)]">${T("Odamlar o'z mahsulotlarini sotadigan va sotib oladigan joy. Toshkentdan Andijongacha — minglab e'lonlar bir joyda.","Место, где люди продают и покупают товары. От Ташкента до Андижана — тысячи объявлений в одном месте.","A place where people sell and buy things. From Tashkent to Andijan — thousands of listings in one place.")}</p></div>`);
}
};

/* ---------------- navigatsiya ---------------- */
let cur = null;
const subEl = ()=>document.getElementById("ppSub");
function show(k, keepScroll){
  const el=subEl(), y=el.scrollTop;
  cur=k; el.innerHTML=S[k](); el.classList.remove("hidden");
  el.scrollTop = keepScroll ? y : 0;
}
window.ppOpen = k=>{ if(currentUser && S[k]) show(k); };
window.ppBack = ()=>{ subEl().classList.add("hidden"); cur=null; renderProfilePage(); };

/* ---------------- amallar ---------------- */
window.editProfileName = ()=>window.ppOpen("edit");

window.ppSaveProfile = ()=>{
  const name=val("peName").trim();
  if(!name){ showToast(t("err_name")); return; }
  const users=loadUsers();
  if(name.toLowerCase()!==currentUser.name.toLowerCase() && users.some(u=>u.name.toLowerCase()===name.toLowerCase())){
    showToast(T("Bu ism band","Это имя занято","This name is taken")); return;
  }
  if(name!==currentUser.name){
    const idx=users.findIndex(u=>u.id===currentUser.id);
    if(idx!==-1){ users[idx].name=name; saveUsers(users); }
    PRODUCTS.forEach(p=>{ if(p.ownerName===currentUser.name) p.ownerName=name; });
    saveState();
    currentUser.name=name;
    try{ localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser)); }catch(e){}
    renderAuthBtn();
  }
  const d=pd(); d.phone=val("pePhone").trim(); d.city=val("peCity"); d.bio=val("peBio").trim(); savePD(d);
  showToast(T("Saqlandi","Сохранено","Saved"));
  window.ppBack();
};

window.ppTopup = ()=>{
  const amt=parseInt(val("ppAmt"),10);
  if(!(amt>=1000)){ showToast(T("Kamida 1 000 so'm kiriting","Введите минимум 1 000 сум","Enter at least 1,000 UZS")); return; }
  const d=pd(); d.balance+=amt; addTx(d,"topup",null,amt); addMsg(d,"topup",amt); savePD(d);
  show("wallet"); showToast(T("Hamyon to'ldirildi","Кошелёк пополнен","Wallet topped up"));
};

window.ppBuy = id=>{
  const b=BUNDLES.find(x=>x.id===id), d=pd();
  if(d.balance<b.p){
    showToast(T("Hamyonda mablag' yetarli emas","Недостаточно средств","Not enough balance")); show("wallet"); return;
  }
  d.balance-=b.p; d.bonus+=b.p*0.05; d.posts+=b.n;
  addTx(d,"bundle",bName(b),-b.p); addMsg(d,"bundle",bName(b)); savePD(d);
  show("bundles"); showToast(T("To'plam sotib olindi","Пакет куплен","Bundle purchased"));
};

window.ppChangePass = ()=>{
  const oldP=val("spOld"), newP=val("spNew");
  const users=loadUsers(), u=users.find(x=>x.id===currentUser.id);
  if(!u || u.password!==oldP){ showToast(T("Joriy parol noto'g'ri","Текущий пароль неверный","Current password is wrong")); return; }
  if(newP.length<4){ showToast(T("Yangi parol juda qisqa","Новый пароль слишком короткий","New password is too short")); return; }
  u.password=newP; saveUsers(users);
  show("settings"); showToast(T("Parol o'zgartirildi","Пароль изменён","Password changed"));
};

window.ppDeleteAccount = ()=>{
  if(!window.confirm(T("Hisob va barcha e'lonlaringiz o'chiriladi. Davom etasizmi?","Аккаунт и все ваши объявления будут удалены. Продолжить?","Your account and all your listings will be deleted. Continue?"))) return;
  const me=currentUser;
  saveUsers(loadUsers().filter(u=>u.id!==me.id));
  const a=allPD(); delete a[me.id]; try{ localStorage.setItem(PD_KEY,JSON.stringify(a)); }catch(e){}
  PRODUCTS = PRODUCTS.filter(p=>p.ownerName!==me.name);
  saveState();
  subEl().classList.add("hidden"); cur=null;
  logoutUser();
  renderGrid();
};

/* ---------------- mavjud funksiyalarni kengaytirish ---------------- */
const _renderProfilePage = renderProfilePage;
renderProfilePage = function(){
  _renderProfilePage();
  if(!currentUser) return;
  const d=pd();
  if(!d.init){ d.init=1; addMsg(d,"welcome"); savePD(d); }
  const b=document.querySelectorAll("#profilePage .pp-hero-inner .mt-4 b");
  if(b[0]) b[0].innerHTML=`${fmt(d.balance)} ${T("so'm","сум","UZS")}`;
  if(b[1]) b[1].textContent=`${fmt(d.bonus)} ${T("bonus","бонусов","bonus")}`;
  const c=document.getElementById("ppInboxCount"), unread=d.inbox.filter(m=>!m.read).length;
  if(c){ c.textContent=unread; c.classList.toggle("hidden",!unread); }
};

const _setLang = setLang;
setLang = function(l){
  _setLang(l);
  if(cur && currentUser && !subEl().classList.contains("hidden")) show(cur,true);
};

// Profil sahifasi yopilganda (yoki chiqishda) ichki sahifa ham yopilsin
const _closeProfilePage = closeProfilePage;
closeProfilePage = function(){ _closeProfilePage(); const el=subEl(); if(el){ el.classList.add("hidden"); cur=null; } };
})();
}catch(err){ console.error("profile.js xatosi:", err); }