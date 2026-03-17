const SHEET_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vRtlqew4y-ItcDKx2kA6Ua1RDh-2PlT6XmY4yCKDeCBuzUlruW27SE_nXEWUF62la36h0tZFa8ln63r/pub?output=csv";

fetch(SHEET_URL)
.then(r=>r.text())
.then(data=>{

const rows=data.split("\n").slice(1);

const visits=rows.map(r=>{
const c=r.split(",");
return{
date:c[0],
society:c[1],
shift:c[2],
status:c[3]
}
});

function format(d){
return d.toISOString().split("T")[0];
}

const today=new Date();
const yesterday=new Date();
const tomorrow=new Date();

yesterday.setDate(today.getDate()-1);
tomorrow.setDate(today.getDate()+1);

function getVisit(date){
return visits.find(v=>v.date==date);
}

function countVisits(society){
return visits.filter(v=>v.society==society).length;
}

function lastVisitDays(society,currentDate){

const filtered=visits
.filter(v=>v.society==society && v.date<currentDate)
.sort((a,b)=>new Date(b.date)-new Date(a.date));

if(filtered.length==0) return "First visit";

const last=new Date(filtered[0].date);
const cur=new Date(currentDate);

return Math.floor((cur-last)/(1000*60*60*24));
}

function render(id,label,date){

const v=getVisit(date);

if(!v){
document.getElementById(id).innerHTML=`<b>${label}</b><br>No visit`;
return;
}

let stats="";

if(v.status=="Field"){

stats=`
<div class="stat">
Total Visits: ${countVisits(v.society)}<br>
Days Since Last Visit: ${lastVisitDays(v.society,v.date)}
</div>
`;
}

document.getElementById(id).innerHTML=`
<h3>${label}</h3>
<b>${v.society}</b><br>
Shift: ${v.shift}<br>
Status: <span class="badge ${v.status.toLowerCase()}">${v.status}</span>
${stats}
`;
}

if(document.getElementById("today")){

render("yesterday","Yesterday",format(yesterday));
render("today","Today",format(today));
render("tomorrow","Tomorrow",format(tomorrow));

}

if(document.querySelector("#table")){

const body=document.querySelector("#table tbody");

visits.forEach(v=>{

const tr=document.createElement("tr");

tr.innerHTML=`
<td>${v.date}</td>
<td>${v.society}</td>
<td>${v.shift}</td>
<td>${v.status}</td>
`;

body.appendChild(tr);

}
function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText =
    "Last updated: " + now.toLocaleTimeString();
}
               
});
