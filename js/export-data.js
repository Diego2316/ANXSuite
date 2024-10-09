const $filter = d.getElementById("export-filter"),
      $exportRender = d.querySelector(".export-render"),
      $exportSubmit = d.getElementById("export-submit"),
      $form = d.querySelector(".export-data");

let exportFilter = null;

const enableExport = ()=>{
  $exportSubmit.disabled = false;
  $exportSubmit.style.backgroundColor  = "#009bd3";
  $exportSubmit.style.color = "#fff";
  $exportSubmit.style.cursor = "pointer";
}

const change = e=>{
  if(e.target === $filter){
    if(e.target.value === "by-id"){
      $exportRender.innerHTML = `
      <div class="search-filter">
        <label for="search-by-id" id="search-label">Código:</label>
        <input type="text" name="search" id="search-by-id" placeholder="Ingrese el código" required>
      </div>
      <div class="dates-filter">
        <div class="date-start">
          <label for="date-start">Fecha inicial:</label>
          <input type="date" name="start" id="date-start" required>
        </div>
        <div class="date-finish">
          <label for="date-finish">Fecha final:</label>
          <input type="date" name="finish" id="date-finish" required>
        </div>
      </div>`;
      enableExport();
      exportFilter = 1;
    }
    else if(e.target.value === "by-brand"){
      $exportRender.innerHTML = `
      <div class="search-filter">
        <label for="search-by-brand" id="search-label">Fabricante:</label>
        <input type="text" name="search" id="search-by-brand" placeholder="Ingrese el fabricante" required>
      </div>
      <div class="dates-filter">
        <div class="date-start">
          <label for="date-start">Fecha inicial:</label>
          <input type="date" name="start" id="date-start" required>
        </div>
        <div class="date-finish">
          <label for="date-finish">Fecha final:</label>
          <input type="date" name="finish" id="date-finish" required>
        </div>
      </div>`;
      enableExport();
      exportFilter = 2;
    }
    else if(e.target.value === "by-purchase"){
      $exportRender.innerHTML = `
      <div class="search-filter">
        <label for="search-by-purchase" id="search-label">Fecha de compra:</label>
        <input type="date" name="search" id="search-by-purchase" required>
      </div>`;
      enableExport();
      exportFilter = 3;
    }
    else {
      $exportRender.innerHTML = "";
      $exportSubmit.disabled = true;
      $exportSubmit.style.color  = "#134371";
      $exportSubmit.style.backgroundColor = "#dce1eb";
      $exportSubmit.style.cursor = "not-allowed";
      exportFilter = null;
    }
  }
}

const submit = async(e)=>{
  if(e.target === $form){
    e.preventDefault();
    if(exportFilter === null){
      alert("Selección un filtro del menú desplegable para realizar la exportación");
      return;
    }
    let start, finish;
    if(exportFilter === 1 || exportFilter === 2){
      start = e.target.start.value;
      finish = e.target.finish.value;
      if(Date.parse(finish) <= Date.parse(start)){
        alert("La fecha final de la exportación no puede ser anterior o igual a la fecha inicial");
        return;
      }
    }
    
    let search = e.target.search.value.toUpperCase();
    try {
      let res = await fetch("api/listado", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
      }),
          json = await res.json();
      
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      
      let foundFlag;

      if(exportFilter === 1){
        json.result.forEach(el=>{
          if(el.id === search){
            foundFlag = 1;
          }
        });
        if(foundFlag === 1){
          exportByID(search, start, finish);
        }
        if(foundFlag !== 1){
          alert("No se encontro ánilox con el código ingresado en su base de datos");
          return;
        }
      }
      if(exportFilter === 2){
        json.result.forEach(el=>{
          if(el.brand.toUpperCase() === search){
            foundFlag = 1;
          }
        });
        if(foundFlag === 1){
          exportByBrand(search, start, finish);
        }
        if(foundFlag !== 1){
          alert("No se encontro ánilox del fabricante ingresado en su base de datos");
          return;
        }
      }
      if(exportFilter === 3){
        json.result.forEach(el=>{
          if(Date.parse(el.purchase) === Date.parse(search)){
            foundFlag = 1;
          }
        });
        if(foundFlag === 1){
          exportByPurchase(search);
        }
        if(foundFlag !== 1){
          alert("No se encontro ánilox comprados en la fecha ingresada en su base de datos");
          return;
        }
      }
    } catch (err) {
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $form.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
        $form.nextElementSibling.remove()
      }, 2000);
    }
  }
}

const exportByID = (id, start, finish)=>{
  alert(`Se exportará los datos del ánilox ${id} entre las fechas ${start} - ${finish}`);
}

const exportByBrand = (brand, start, finish)=>{
  alert(`Se exportarán los datos de los ánilox del fabricante ${brand} entre las fechas ${start} - ${finish}`);
}

const exportByPurchase = (purchase)=>{
  alert(`Se exportarán los datos de los ánilox comprados en la fecha ${purchase}`);
}

const levelCheck = ()=>{
  let level = ss.getItem("level")
  if(level === "1"){
    alert("No se encuentra autorizado para realizar esta operación");
    window.location.href = "index.html";
  }
}

d.addEventListener("DOMContentLoaded",levelCheck);
d.addEventListener("change", change);
d.addEventListener("submit",submit);