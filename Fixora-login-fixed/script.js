const KEY="fixora_bookings_v2";
let bookings=JSON.parse(localStorage.getItem(KEY)||"[]");
let service="AC & Cooling";
const prices={"AC & Cooling":"₹399–₹699","Electrical":"₹299–₹799","Plumbing":"₹349–₹899","Cleaning":"₹499–₹1,299","Appliances":"₹399–₹999","Painting":"₹1,499+","Carpentry":"₹499–₹1,499","Other":"₹399+"};
const professionals={"AC & Cooling":"Ramesh Kumar","Electrical":"Sneha M.","Plumbing":"Arjun Kumar","Cleaning":"Fixora Cleaning Pro","Appliances":"Fixora Appliance Pro","Painting":"Fixora Painting Pro","Carpentry":"Fixora Carpentry Pro","Other":"Fixora General Pro"};

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function save(){localStorage.setItem(KEY,JSON.stringify(bookings));render();}
function openModal(x){
 let m=document.getElementById("modal");
 if(!m){document.body.insertAdjacentHTML("beforeend",'<div id="modal" class="modal"><div class="modalBox"><button class="close" onclick="closeModal()">×</button><div id="modalContent"></div></div></div>');m=document.getElementById("modal");}
 document.getElementById("modalContent").innerHTML=x;m.classList.add("show");
}
function closeModal(){document.getElementById("modal").classList.remove("show");}
function openAuth(){
 openModal(`<h2>Welcome to Fixora</h2><p>Login to manage your Fixora bookings on this device.</p>
 <div class="form"><label>NAME</label><input id="loginName" placeholder="Your name">
 <label>EMAIL</label><input id="loginEmail" type="email" placeholder="you@example.com">
 <button class="btn" onclick="login()">Continue →</button></div>`);
}
function login(){
 const name=document.getElementById("loginName").value.trim();
 const email=document.getElementById("loginEmail").value.trim();
 if(!name||!email){alert("Please enter your name and email.");return;}
 localStorage.setItem("fixora_user",JSON.stringify({name,email}));
 closeModal(); updateAuth();
}
function logout(){localStorage.removeItem("fixora_user");updateAuth();}
function updateAuth(){
 const actions=document.querySelector(".actions"); if(!actions)return;
 const u=JSON.parse(localStorage.getItem("fixora_user")||"null");
 actions.innerHTML=u?`<span style="color:#9da6b7;font-size:11px">Hi, ${esc(u.name)}</span><button class="textBtn" onclick="logout()">Logout</button><button class="btn small" onclick="openBooking()">Book a Service ↗</button>`:
 `<button class="textBtn" onclick="openAuth()">Login</button><button class="btn small" onclick="openBooking()">Book a Service ↗</button>`;
}
function openBooking(s="AC & Cooling"){
 service=s;
 const choices=Object.keys(prices).map(x=>`<button class="choice ${x===service?"active":""}" onclick="chooseService('${x}')">${x}</button>`).join("");
 openModal(`<h2>Book a service</h2><p>Choose your service, preferred time and address.</p>
 <div class="choiceGrid">${choices}</div>
 <div class="form"><label>PROFESSIONAL</label><select id="pro"><option>${esc(professionals[service])}</option><option>Any verified professional</option></select>
 <label>DATE</label><input id="date" type="date" min="${new Date().toISOString().slice(0,10)}">
 <label>TIME</label><select id="time"><option>9:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>4:00 PM</option><option>6:30 PM</option></select>
 <label>ADDRESS</label><textarea id="address" placeholder="House no, street, city"></textarea>
 <label>PROBLEM</label><textarea id="problem" placeholder="Describe the issue"></textarea>
 <button class="btn" onclick="confirmBooking()">Confirm Booking →</button></div>`);
}
function chooseService(s){openBooking(s);}
function confirmBooking(){
 if(!localStorage.getItem("fixora_user")){closeModal();openAuth();return;}
 const date=document.getElementById("date").value,address=document.getElementById("address").value.trim();
 if(!date||!address){alert("Please select a date and enter your address.");return;}
 const b={id:"FX"+Date.now().toString().slice(-7),service,pro:document.getElementById("pro").value,date,time:document.getElementById("time").value,address,problem:document.getElementById("problem").value,status:"Confirmed",estimate:prices[service]};
 bookings.unshift(b);save();
 openModal(`<div class="success"><div class="big">✓</div><h2>Booking confirmed!</h2><p><b>${b.id}</b> · ${esc(b.service)} · ${esc(b.date)} at ${esc(b.time)}</p><button class="btn" onclick="closeModal();document.getElementById('dashboard').scrollIntoView({behavior:'smooth'})">View My Booking →</button></div>`);
}
function render(){
 const box=document.getElementById("bookingList");if(!box)return;
 box.innerHTML=bookings.length?bookings.map((x,i)=>`<article class="booking"><div><h3>${esc(x.service)}</h3><p>${esc(x.problem||"Home service request")}</p></div><div><small>${esc(x.date)} · ${esc(x.time)}</small><p>${esc(x.pro)}</p></div><div><span class="status">${esc(x.status)}</span><p>${esc(x.estimate)}</p></div><button onclick="advance(${i})">${x.status==="Completed"?"Completed":"Update"}</button></article>`).join(""):'<div style="padding:40px;text-align:center;color:#687386;border:1px dashed #ffffff14;border-radius:16px">No bookings yet. Click New Booking to get started.</div>';
}
function advance(i){const states=["Confirmed","Professional assigned","On the way","Service started","Completed"],n=states.indexOf(bookings[i].status);bookings[i].status=states[Math.min(n+1,4)];save();}
function askAssistant(){
 const input=document.getElementById("problemInput"),text=input?.value.trim();if(!text)return;
 const box=document.querySelector(".chat");let s="Other";
 if(/ac|air.?condition|cool/i.test(text))s="AC & Cooling";else if(/leak|tap|pipe|water/i.test(text))s="Plumbing";else if(/electric|fan|switch|light|wire/i.test(text))s="Electrical";else if(/clean|bathroom|kitchen/i.test(text))s="Cleaning";else if(/fridge|washing|ro|appliance/i.test(text))s="Appliances";
 const old=box.querySelector(".chatInput");old?.remove();
 box.insertAdjacentHTML("beforeend",`<div class="msg user">${esc(text)}</div><div class="msg bot"><b>Likely service: ${s}</b><br>Estimated range: ${prices[s]}<br><br><button class="btn small" onclick="openBooking('${s}')">Book this service →</button></div><div class="chatInput"><input id="problemInput" placeholder="Describe another problem..."><button onclick="askAssistant()">→</button></div>`);
}
document.addEventListener("DOMContentLoaded",()=>{
 const modal=document.getElementById("modal");
 modal?.addEventListener("click",e=>{if(e.target===modal)closeModal();});
 updateAuth();render();
});
