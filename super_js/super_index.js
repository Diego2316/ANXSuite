const $centerTL = d.getElementById("center-top-left"),
      $centerTR = d.getElementById("center-top-right"),
      $centerBL = d.getElementById("center-bottom-left"),
      $centerBR = d.getElementById("center-bottom-right");
const $tableContainers = [$centerTL, $centerTR, $centerBL, $centerBR];

const $tableTL = d.getElementById("table-top-left"),
      $tableTR = d.getElementById("table-top-right"),
      $tableBL = d.getElementById("table-bottom-left"),
      $tableBR = d.getElementById("table-bottom-right");
const $tables = [$tableTL, $tableTR, $tableBL, $tableBR];

const $tableBodyTL = d.getElementById("table-top-left-body"),
      $tableBodyTR = d.getElementById("table-top-right-body"),
      $tableBodyBL = d.getElementById("table-bottom-left-body"),
      $tableBodyBR = d.getElementById("table-bottom-right-body");
const $tableBodies = [$tableBodyTL, $tableBodyTR, $tableBodyBL, $tableBodyBR];

const $name1 = d.getElementById("name-1"),
      $name2 = d.getElementById("name-2"),
      $name3 = d.getElementById("name-3"),
      $name4 = d.getElementById("name-4");
const $names = [$name1, $name2, $name3, $name4];

const $showMore1 = d.getElementById("show-more-1"),
      $showMore2 = d.getElementById("show-more-2"),
      $showMore3 = d.getElementById("show-more-3"),
      $showMore4 = d.getElementById("show-more-4");
const $showMore = [$showMore1, $showMore2, $showMore3, $showMore4];

const $template = d.getElementById("table-template").content,
      $fragment = d.createDocumentFragment();

const $arrowLeft = d.getElementById("arrow-left"),
      $arrowRight = d.getElementById("arrow-right");

let clientList = [], numPages;
let currentPage = 1;
let clientsPerPage = [];

const drawTableContainer = (index, page)=>{
  $names[index].textContent = clientList[((page-1)*4)+index].toUpperCase();
  $showMore[index].dataset.client = clientList[((page-1)*4)+index];
  $tableContainers[index].style.display = "flex";
}

const clearTable = (index)=>{
  $tableContainers[index].style.display = "none";
  $tableBodies[index].innerHTML = "";
  $names[index].textContent = "";
  $showMore[index].dataset.client = "";
}

const drawTable = async(index, json)=>{
  let lim = 4;
  if(json.length < lim){lim = json.length}
  let tableData = Array.from(Array(lim), ()=>({
    code: '',
    next: '',
    estado: '',
  }));
  for (let i = 0; i < lim; i++){
    tableData[i].code = json[i].id;
    tableData[i].next = json[i].next;
    tableData[i].estado = json[i].estado;
  }
  tableData.forEach(el=>{
    $template.querySelector(".code").textContent = el.code;
    $template.querySelector(".next").textContent = el.next;
    if((Date.now() - Date.parse(String(el.next))) >= 0 && (Date.now() - Date.parse(String(el.next))) <= 15778800000){
      $template.querySelector(".next").classList.add("warning");
      $template.querySelector(".next").classList.remove("danger");
    }
    else if((Date.now() - Date.parse(String(el.next))) > 15778800000){
      $template.querySelector(".next").classList.add("danger");
      $template.querySelector(".next").classList.remove("warning");
    }
    else{
      $template.querySelector(".next").classList.remove("danger");
      $template.querySelector(".next").classList.remove("warning");
    }
    let barra = $template.querySelector(".barra");
    barra.style.width = `${el.estado}%`;
    barra.textContent = `${el.estado}%`;
    if(el.estado >= 80 && el.estado <= 100){
      barra.style.backgroundColor = "rgba(170,187,17,0.35)";
    }
    if(el.estado >= 25 && el.estado < 80){
      barra.style.backgroundColor = "rgba(255,186,38,0.35)";
    }
    if(el.estado >= 0 && el.estado < 25){
      barra.style.backgroundColor = "rgba(255,24,24,0.35)";
    }
    let $clone = d.importNode($template, true);
    $fragment.appendChild($clone);
  });
  $tables[index].querySelector("tbody").appendChild($fragment);
}

const initialDraw = async()=>{
  try {
    let res = await fetch("/api/clientes", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      }
    }),
        json = await res.json();
    if(!res.ok) throw{status: res.status, statusText: res.statusText};
    json = json.result;
    json.forEach(el=>clientList.push(el.name));
    numPages = Math.floor(clientList.length/4)+1;
    for(let i = 0; i < numPages - 1; i++) clientsPerPage[i] = 4;
    clientsPerPage.push(clientList.length%4);
    $arrowLeft.style.cursor = "not-allowed";
    if(numPages <= 1) $arrowRight.style.cursor = "not-allowed";
  } catch (err) {
    errorMessage(err);
  }
  for(let i = 0; i < clientsPerPage[currentPage-1]; i++){
    drawTableContainer(i, currentPage);
    try {
      let res = await fetch("/api/super-analysis", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({client: `${clientList[((currentPage-1)*4)+i]}`, mensaje: "list"})
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result;
      drawTable(i, json);
    } catch (err) {
      errorMessage(err);
    }
  }
}

const changePage = async(e)=>{
  if(e.target === $arrowRight){
    if(currentPage < numPages){
      currentPage++;
      $arrowLeft.style.cursor = "pointer"
      for(let i = 0; i < 4; i++){
        clearTable(i);
      }
      for(let i = 0; i < clientsPerPage[currentPage-1]; i++){
        drawTableContainer(i, currentPage);
        try {
          let res = await fetch("/api/super-analysis", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({client: `${clientList[((currentPage-1)*4)+i]}`, mensaje: "list"})
          }),
              json = await res.json();
          if(!res.ok) throw{status: res.status, statusText: res.statusText};
          json = json.result;
          drawTable(i, json);
        } catch (err) {
          errorMessage(err);
        }
      }
    }
    else if(currentPage === numPages){
      $arrowRight.style.cursor = "not-allowed";
    }
  }
  if(e.target === $arrowLeft){
    if(currentPage > 1){
      currentPage--;
      $arrowRight.style.cursor = "pointer"
      for(let i = 0; i < 4; i++){
        clearTable(i);
      }
      for(let i = 0; i < clientsPerPage[currentPage-1]; i++){
        drawTableContainer(i, currentPage);
        try {
          let res = await fetch("/api/super-analysis", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({client: `${clientList[((currentPage-1)*4)+i]}`, mensaje: "list"})
          }),
              json = await res.json();
          if(!res.ok) throw{status: res.status, statusText: res.statusText};
          json = json.result;
          drawTable(i, json);
        } catch (err) {
          errorMessage(err);
        }
      }
    }
    else if(currentPage <= 1){
      $arrowLeft.style.cursor = "not-allowed";
    }
  }
}

const passClientList = (e)=>{
  if(e.target.matches(".show-more")){
    ss.setItem("client-list", e.target.dataset.client);
  }
}

d.addEventListener("DOMContentLoaded", initialDraw);
d.addEventListener("click", changePage);
d.addEventListener("click", passClientList);