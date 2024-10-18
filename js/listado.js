const $table = d.querySelector(".anilox-table"),
      $template = d.getElementById("anilox-template").content,
      $fragment = d.createDocumentFragment();

const $modalPdf = d.getElementById("modal-pdf"),
      $closeModalPdf = d.getElementById("close-modal-pdf");

const $modalQuoteBox = d.getElementById("modal-quote-box"),
      $modalQuoteBoxBody = d.getElementById("modal-quote-box-body"),
      $closeQuoteBox = d.getElementById("close-quote-box"),
      $sendQuote = d.getElementById("send-quote"),
      $quoteType = d.getElementById("quote-type"),
      $quoteAngle = d.getElementById("quote-angle"),
      $quoteVol = d.getElementById("quote-vol"),
      $quoteScreen = d.getElementById("quote-screen");

// const $modalDeleteBox = d.getElementById("modal-delete-box"),
//       $modalDeleteBody = d.getElementById("modal-delete-body"),
//       $closeDeleteBox = d.getElementById("close-delete-box"),
//       $acceptDelete = d.getElementById("accept-delete"),
//       $deleteId = d.getElementById("delete-id");

let quoteId, quoteType, quoteNomVol, quoteScreen, quoteAngle;
let deleteId;

const getData = (json, id)=>{
  return json.filter(el => el.id === id);
}

const getAll = async ()=>{
  try {
    let res1 = await fetch("api/listado", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      }
    }),
        json1 = await res1.json();
        
    let res2 = await fetch("api/analysis", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      }
    }),
        json2 = await res2.json();
        
    if(!res1.ok) throw{status: res1.status, statusText: res1.statusText};
    if(!res2.ok) throw{status: res2.status, statusText: res2.statusText};
    
    let tableData = Array.from(Array(json2.result.length), ()=>({
      id: '',
      brand: '',
      type: '',
      purchase: '',
      volume: '',
      last: '',
      next: '',
      estado: '',
    }));
    for (i = 0; i < json1.result.length; i++){
      let data = getData(json1.result, json2.result[i].id);
      tableData[i].id = data[0].id;
      tableData[i].brand = data[0].brand;
      tableData[i].type = data[0].type;
      tableData[i].purchase = data[0].purchase;
      tableData[i].volume = Math.round(((data[0].volume*volMulti)+Number.EPSILON)*10)/10;
      tableData[i].last = data[0].last;
      tableData[i].next = json2.result[i].next;
      tableData[i].estado = json2.result[i].estado;
    }
    
    tableData.forEach(el=>{
      $template.querySelector(".id").textContent = el.id;
      $template.querySelector(".brand").textContent = el.brand;
      $template.querySelector(".type").textContent = el.type;
      $template.querySelector(".purchase-date").textContent = el.purchase;
      $template.querySelector(".volume").textContent = el.volume;
      $template.querySelector(".last-date").textContent = el.last;
      $template.querySelector(".next-date").textContent = el.next;
      $template.querySelector(".quote").dataset.id = el.id;
      $template.querySelector(".delete").dataset.id = el.id;
      
      if((Date.now() - Date.parse(String(el.next))) >= 0 && (Date.now() - Date.parse(String(el.next))) <= 15778800000){
        $template.querySelector(".next-date").classList.add("warning");
        $template.querySelector(".next-date").classList.remove("danger");
      }
      else if((Date.now() - Date.parse(String(el.next))) > 15778800000){
        $template.querySelector(".next-date").classList.add("danger");
        $template.querySelector(".next-date").classList.remove("warning");
      }
      else{
        $template.querySelector(".next-date").classList.remove("danger");
        $template.querySelector(".next-date").classList.remove("warning");
      }

      let barra = $template.getElementById("barra");
      barra.style.width = `${el.estado}%`;
      barra.textContent = `${el.estado}%`;

      if(el.estado >= 80 && el.estado <= 100){
        barra.style.backgroundColor = "rgba(170,187,17,0.35)"
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
    $table.querySelector("tbody").appendChild($fragment);

  } catch (err) {
    console.log(err);
    let errorCode = err.status || "2316",
        errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
    $table.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
  }
}

const load = e=>{
  if(e.target.matches(".id")){
    let loadId = e.target.textContent;
    let loadBrand = e.target.nextElementSibling.textContent;
    ss.setItem("aniloxId", loadId);
    ss.setItem("aniloxBrand", loadBrand);
    window.location.href = 'anilox-detail.html';
  }
}

const showModalPdf = async(e)=>{
  if(e.target.matches(".master")){
    try {
      $modalPdf.style.display = "block";
      let id = e.target.parentElement.parentElement.children[0].textContent;
      let viewer = d.createElement("object");
      viewer.setAttribute("type", "application/pdf");
      viewer.setAttribute("id", "master-pdf");
      let res = await fetch("/api/listado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          mensaje: "master",
        })
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result[0];
      const data = b64toBlob(json.master.slice(28));
      viewer.setAttribute("data", data);
      $modalPdf.children[0].children[1].appendChild(viewer);
    } catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $alertContent.textContent = `${message1}: ${message2}`;
      $modalAlertBox.style.display = "block";
    }
  }
  if(e.target === $closeModalPdf){
    $modalPdf.style.display = "none";
    while($modalPdf.children[0].children[1].childElementCount > 0){
      $modalPdf.children[0].children[1].removeChild($modalPdf.children[0].children[1].firstElementChild);
    }
  }
}

const deleteAnilox = async(e)=>{
  if(e.target.matches(".delete")){
    if(ss.getItem("level") !== "3"){
      alert("No se encuentra autorizado para realizar esta operación");
      return;
    }
    let isDelete = confirm(`¿Está seguro que desea eliminar el ánilox de código ${e.target.dataset.id}?`);
    if(isDelete){
      try {
        let deleteID = e.target.dataset.id;
        let res1 = await fetch('api/borrar-anilox', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({deleteID: deleteID})
        });
        if(!res1.ok) throw{status: res1.status, statusText: res1.statusText};
        location.reload();
      } 
      catch (err) {
        console.log(err);
        let errorCode = err.status || "2316",
            errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
            message1 = "Error " + errorCode + ": ",
            message2 = errorStatus;
        $alertContent.textContent = `${message1}: ${message2}`;
        $modalAlertBox.style.display = "block";
      }
    }
  }
}

const quote = async(e) => {
  if (e.target.matches(".quote")) {
    $quoteType.textContent = "";
    $quoteAngle.textContent = "";
    $quoteVol.textContent = "";
    $quoteScreen.textContent = "";
    $modalQuoteBox.style.display = "block";
    try {
      quoteId = e.target.dataset.id;
      let res = await fetch('/api/listado', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: quoteId, mensaje: "quote"})
      }),
          json = await res.json();
      json = json.result;
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      quoteType = json[0].type;
      quoteNomVol = Math.round(((json[0].nomvol*volMulti)+Number.EPSILON)*10)/10;
      quoteScreen = Math.round(((json[0].screen*screenMulti)+Number.EPSILON)*10)/10;
      quoteAngle = json[0].angle;
      $quoteType.textContent = quoteType;
      $quoteAngle.textContent = quoteAngle;
      $quoteVol.textContent = quoteNomVol;
      $quoteScreen.textContent = quoteScreen;
    } 
    catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $modalQuoteBoxBody.insertAdjacentHTML("afterend",`<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
        $modalQuoteBoxBody.nextElementSibling.remove();
      }, 2000);
    }
  }

  if(e.target === $sendQuote){
    try {
      let options = {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          type: quoteType,
          nomvol: quoteNomVol,
          screen: quoteScreen,
          angle: quoteAngle,
          volUnit: ls.getItem('volumeUnit'),
          screenUnit: ls.getItem('screenUnit'),
          reqDate: (new Date(Date.now()).toJSON()).slice(0,10),
          mensaje: "send quote"
        }),
      },
          res1 = await fetch('api/request-quotes', options);          
          if(res1.ok){
            $modalQuoteBox.style.display = "none";
            quoteId = undefined;
            quoteType = undefined;
            quoteNomVol = undefined;
            quoteScreen = undefined;
            quoteAngle = undefined;
            $alertContent.textContent = `Solicitud registrada exitosamente.`;
            $modalAlertBox.style.display = "block";
          }
          if(!res1.ok) throw{status: res1.status, statusText: res1.statusText};
    } 
    catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $modalQuoteBoxBody.insertAdjacentHTML("afterend",`<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
        $modalQuoteBoxBody.nextElementSibling.remove();
      }, 2000);
    }
  }

  if(e.target === $closeQuoteBox){
    $modalQuoteBox.style.display = "none";
    quoteNomVol = undefined;
    quoteType = undefined;
    quoteNomVol = undefined;
    quoteScreen = undefined;
    quoteAngle = undefined;
  }
}

d.addEventListener("DOMContentLoaded",getAll);
d.addEventListener("click", showModalPdf);
d.addEventListener("click",load);
d.addEventListener("click",deleteAnilox);
d.addEventListener("click",quote);