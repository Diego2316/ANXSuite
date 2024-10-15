const $clientsTable = d.querySelector(".clients-table"),
      $aniloxTable = d.querySelector(".anilox-table"),
      $reportTable = d.querySelector(".report-table"),
      $clientsTemplate = d.getElementById("clients-template").content,
      $aniloxTemplate = d.getElementById("anilox-template").content,
      $reportTemplate = d.getElementById("report-template").content,
      $clientsFragment = d.createDocumentFragment(),
      $aniloxFragment = d.createDocumentFragment(),
      $reportFragment = d.createDocumentFragment(),
      $listaClientes = d.querySelector(".lista-clientes"),
      $listaAnilox = d.querySelector(".lista-anilox"),
      $listaReportes = d.querySelector(".lista-reportes"),
      $pdf = d.querySelector(".pdf"),
      $aniloxTableBody = d.querySelector(".anilox-table-body"),
      $reportTableBody = d.querySelector(".report-table-body"),
      $reportTitle = d.getElementById("report-title"),
      $searchReportBtn = d.getElementById("search-report-btn"),
      $closeSearchReport = d.getElementById("close-search-report-anilox"),
      $modalSearchReport = d.getElementById("modal-search-report-anilox"),
      $searchReportId = d.getElementById("search-report-id"),
      $searchReport = d.getElementById("search-report");

let aniloxReportClient, aniloxReportId, aniloxReportDate;
let aniloxList = [];

const getClientList = async()=>{
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
    let clientList = [];
    json.forEach(el=>clientList.push(el.name));
    clientList.forEach(el => {
      $clientsTemplate.querySelector(".client").textContent = el.toUpperCase();
      let $clone = d.importNode($clientsTemplate, true);
      $clientsFragment.appendChild($clone);
    });
    $clientsTable.querySelector("tbody").appendChild($clientsFragment);
    $listaClientes.style.display = "flex";
  } catch (err) {
    errorMessage(err);
  }
}

const getAniloxList = async(e)=>{
  if(e.target.matches(".client")){
    for(let i = 0; i < e.target.parentElement.parentElement.children.length; i++){
      e.target.parentElement.parentElement.children[i].children[0].classList.remove("selected");
    }
    e.target.classList.add("selected");
    $aniloxTableBody.innerHTML = "";
    $reportTableBody.innerHTML = "";
    $pdf.style.display = "none";
    $listaReportes.style.display = "none";
    aniloxReportClient = e.target.textContent;
    try {
      let res = await fetch('/api/super-listado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({client: aniloxReportClient, mensaje: "quote"}),
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result;
      json.forEach(el =>{
        $aniloxTemplate.querySelector(".id").textContent = el.id;
        let $clone = d.importNode($aniloxTemplate, true);
        $aniloxFragment.appendChild($clone);
      });
      $aniloxTable.querySelector("tbody").appendChild($aniloxFragment);
      $listaAnilox.style.display = "flex";
    } catch (err) {
      errorMessage(err);
    }
  }
}

const getReportList = async(e)=>{
  if(e.target.matches(".id")){
    for(let i = 0; i < e.target.parentElement.parentElement.children.length; i++){
      e.target.parentElement.parentElement.children[i].children[0].classList.remove("selected");
    }
    e.target.classList.add("selected");
    $reportTableBody.innerHTML = "";
    $pdf.style.display = "none";
    aniloxReportId = e.target.textContent;
    try {
      let res = await fetch('/api/super-history',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: aniloxReportId,
          client: aniloxReportClient,
          mensaje: "report-list",
        }),
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result;
      json.reverse();
      json.forEach(el => {
        $reportTemplate.querySelector(".date").textContent = el.date;
        let $clone = d.importNode($reportTemplate, true);
        $reportFragment.appendChild($clone);
      });
      $reportTable.querySelector("tbody").appendChild($reportFragment);
      $listaReportes.style.display = "flex";
    } catch (err) {
      errorMessage(err);
    }
  }
}

const getReport = async(e)=>{
  if(e.target.matches(".date")){
    for(let i = 0; i < e.target.parentElement.parentElement.children.length; i++){
      e.target.parentElement.parentElement.children[i].children[0].classList.remove("selected");
    }
    e.target.classList.add("selected");
    while($pdf.childElementCount > 1){
      $pdf.removeChild($pdf.lastElementChild);
    }
    aniloxReportDate = e.target.textContent;
    try {
      $reportTitle.textContent = `${aniloxReportId}_${aniloxReportDate}`;
      let viewer = d.createElement("object");
      viewer.setAttribute("type", "application/pdf");
      viewer.setAttribute("id", "report-pdf");
      let res = await fetch('/api/super-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: aniloxReportId,
          client: aniloxReportClient,
          date: aniloxReportDate,
          mensaje: "report",
        }),
      }),
      json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result[0];
      const data = b64toBlob(json.report.slice(28));
      viewer.setAttribute("data", data);
      $pdf.appendChild(viewer);
      $pdf.style.display = "flex";
    } catch (err) {
      errorMessage(err);
    }
  }
}

const searchSpecific = async(e)=>{
  if(e.target === $searchReportBtn){
    $modalSearchReport.style.display = "block";
  }
  if(e.target === $closeSearchReport){
    $modalSearchReport.style.display = "none"
  }
  if(e.target === $searchReport){
    for(let i = 0; i < $aniloxTable.children[0].children.length; i++){
      aniloxList[i] = $aniloxTable.children[0].children[i].children[0].textContent;
    }
    if(aniloxList.includes($searchReportId.value.toUpperCase())){
      aniloxReportId = $searchReportId.value.toUpperCase();
      $modalSearchReport.style.display = "none";
      $searchReportId.value = "";
      for(let i = 0; i < $aniloxTable.children[0].children.length; i++){
        $aniloxTable.children[0].children[i].children[0].classList.remove("selected");
      }
      $aniloxTable.children[0].children[aniloxList.indexOf(aniloxReportId)].children[0].classList.add("selected");
      $reportTableBody.innerHTML = "";
      $pdf.style.display = "none";
      try {
        let res = await fetch('/api/super-history',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: aniloxReportId,
            client: aniloxReportClient,
            mensaje: "report-list",
          }),
        }),
            json = await res.json();
        if(!res.ok) throw{status: res.status, statusText: res.statusText};
        json = json.result;
        json.reverse();
        json.forEach(el =>{
          $reportTemplate.querySelector(".date").textContent = el.date;
          let $clone = d.importNode($reportTemplate, true);
          $reportFragment.appendChild($clone);
        });
        $reportTable.querySelector("tbody").appendChild($reportFragment);
        $listaReportes.style.display = "flex";
        aniloxList = [];
      } catch (err) {
        errorMessage(err);
      }
    }
    else if($searchReportId.value === ""){
      aniloxList = [];
      $modalSearchReport.style.display = "none";
      $searchReportId.value = "";
      $alertContent.textContent = "Debe ingresar un ID para buscar el anilox en su lista.";
      $modalAlertBox.style.display = "block";
    }
    else{
      aniloxList = [];
      $modalSearchReport.style.display = "none";
      $searchReportId.value = "";
      $alertContent.textContent = "No se encontró el ID ingresado en su lista de anilox.";
      $modalAlertBox.style.display = "block";
    }
  }
}

d.addEventListener("DOMContentLoaded", getClientList);
d.addEventListener("click", getAniloxList);
d.addEventListener("click", getReportList);
d.addEventListener("click", getReport);
d.addEventListener("click", searchSpecific);