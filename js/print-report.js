const $aniloxTable = d.querySelector(".anilox-table"),
      $reportTable = d.querySelector(".report-table"),
      $aniloxTemplate = d.getElementById("anilox-template").content,
      $reportTemplate = d.getElementById("report-template").content,
      $aniloxFragment = d.createDocumentFragment(),
      $reportFragment = d.createDocumentFragment(),
      $listaAnilox = d.querySelector(".lista-anilox"),
      $listaReportes = d.querySelector(".lista-reportes"),
      $pdf = d.querySelector(".pdf"),
      $reportTableBody = d.querySelector(".report-table-body"),
      $reportTitle = d.getElementById("report-title"),
      $searchReportBtn = d.getElementById("search-report-btn"),
      $closeSearchReport = d.getElementById("close-search-report-anilox"),
      $modalSearchReport = d.getElementById("modal-search-report-anilox"),
      $searchReportId = d.getElementById("search-report-id"),
      $searchReport = d.getElementById("search-report");

let aniloxReportId, aniloxReportDate;
let aniloxList = [];

const getAniloxList = async ()=>{
  try {
    let res = await fetch("/api/listado", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      }
    }),
        json = await res.json();
        json = json.result;

    if(!res.ok) throw{status: res.status, statusText: res.statusText};
    
    $listaAnilox.style.display = "flex";
    json.forEach(el => {
      $aniloxTemplate.querySelector(".id").textContent = el.id;
      let $clone = d.importNode($aniloxTemplate, true);
      $aniloxFragment.appendChild($clone);
    });
    $aniloxTable.querySelector("tbody").appendChild($aniloxFragment);
  } catch (err) {
    console.log(err);
    let errorCode = err.status || "2316",
        errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
    $aniloxTable.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
  }
}

const getReportList = async(e)=>{
  if(e.target.matches(".id")){
    try {
      for(let i = 0; i < e.target.parentElement.parentElement.children.length; i++){
        e.target.parentElement.parentElement.children[i].children[0].classList.remove("selected");
      }
      e.target.classList.add("selected");
      $reportTableBody.innerHTML = "";
      $listaReportes.style.display = "flex";
      aniloxReportId = e.target.textContent;
      let res = await fetch('/api/anilox-history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({aniloxReportId: aniloxReportId})
      }),
          json = await res.json();
          json = json.result;

      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json.reverse();

      json.forEach(el =>{
        $reportTemplate.querySelector(".date").textContent = el.date;
        let $clone = d.importNode($reportTemplate, true);
        $reportFragment.appendChild($clone);
      });
      $reportTable.querySelector("tbody").appendChild($reportFragment);
    } catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $reportTable.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
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
      let res = await fetch('/api/anilox-history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aniloxReportId: aniloxReportId })
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result;
      json.forEach(el => {
        if(el.date === aniloxReportDate){
          const data = b64toBlob(el.report.slice(28));
          viewer.setAttribute("data", data);
          $pdf.appendChild(viewer);
          $pdf.style.display = "flex";
        }
      });
    } catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
         message1 = "Error " + errorCode,
         message2 = errorStatus;
      $alertContent.textContent = `${message1}: ${message2}`;
      $modalAlertBox.style.display = "block";
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
      try {
        for(let i = 0; i < $aniloxTable.children[0].children.length; i++){
          $aniloxTable.children[0].children[i].children[0].classList.remove("selected");
        }
        $aniloxTable.children[0].children[aniloxList.indexOf(aniloxReportId)].children[0].classList.add("selected");
        $reportTableBody.innerHTML = "";
        $listaReportes.style.display = "block";
        let res = await fetch('/api/anilox-history', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ aniloxReportId: aniloxReportId })
        }),
            json = await res.json();
            json = json.result;
  
        if(!res.ok) throw{status: res.status, statusText: res.statusText};
  
        json.reverse();
  
        json.forEach(el =>{
          $reportTemplate.querySelector(".date").textContent = el.date;
          let $clone = d.importNode($reportTemplate, true);
          $reportFragment.appendChild($clone);
        });
        $reportTable.querySelector("tbody").appendChild($reportFragment);
      } catch (err) {
        let errorCode = err.status || "2316",
            errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
            message1 = "Error " + errorCode + ": ",
            message2 = errorStatus;
        $reportTable.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
      }
    }
    else if($searchReportId.value === ""){
      $modalSearchReport.style.display = "none";
      $searchReportId.value = "";
      $alertContent.textContent = "Debe ingresar un ID para buscar el anilox en su lista.";
      $modalAlertBox.style.display = "block";
    }
    else{
      $modalSearchReport.style.display = "none";
      $searchReportId.value = "";
      $alertContent.textContent = "No se encontró el ID ingresado en su lista de anilox.";
      $modalAlertBox.style.display = "block";
    }
  }
}

const levelCheck = ()=>{
  let level = ss.getItem("level")
  if(level === "1"){
    alert("No se encuentra autorizado para realizar esta operación");
    window.location.href = "index.html";
  }
}

d.addEventListener("DOMContentLoaded",levelCheck);
d.addEventListener("DOMContentLoaded",getAniloxList);
d.addEventListener("click", getReportList);
d.addEventListener("click", getReport);
d.addEventListener("click", searchSpecific);