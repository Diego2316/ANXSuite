const $aniloxList = d.querySelector(".anilox-table"),
      $aniloxListTemplate = d.getElementById("anilox-template").content,
      $aniloxListFragment = d.createDocumentFragment(),
      $listaAnilox = d.querySelector(".lista-anilox"),
      $middle = d.querySelector(".middle"),
      $specificData = d.getElementById("specific-data"),
      $specificType = d.getElementById("specific-type"),
      $specificAngle = d.getElementById("specific-angle"),
      $specificVol = d.getElementById("specific-vol"),
      $specificScreen = d.getElementById("specific-screen"),
      $aniloxQuantity = d.getElementById("anilox-quantity");

const $quote = d.querySelector(".quote"),
      $quoteList = d.querySelector(".quote-list"),
      $quoteTemplate = d.getElementById("quote-template").content,
      $quoteBody = d.querySelector(".quote-body"),
      $addToQuote = d.getElementById("add-to-quote");

const $requestQuote = d.getElementById("request-quote");

const levelCheck = ()=>{
  let level = ss.getItem("level")
  if(level !== "3"){
    alert("No se encuentra autorizado para realizar esta operación");
    window.location.href = "index.html";
  }
}

const getAniloxList = async()=>{
  try {
    let res1 = await fetch('/api/listado', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({mensaje: "getAniloxList"})
    }),
        json1 = await res1.json();
        json1 = json1.result;
    if(!res1.ok) throw{status: res1.status, statusText: res1.statusText};

    json1.forEach(el => {
      $aniloxListTemplate.querySelector(".id").textContent = el.id;
      let $clone = d.importNode($aniloxListTemplate, true);
      $aniloxListFragment.appendChild($clone);
    });
    $aniloxList.querySelector("tbody").appendChild($aniloxListFragment);
    $specificType.textContent = json1[0].type;
    $specificAngle.textContent = `${json1[0].angle}`;
    $specificVol.textContent = `${Math.round(((json1[0].nomvol*volMulti)+Number.EPSILON)*10)/10}`;
    $specificScreen.textContent = `${Math.round(((json1[0].screen*screenMulti)+Number.EPSILON)*10)/10}`;
  } 
  catch (err) {
    console.log(err);
    let errorCode = err.status || "2316",
        errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
    $aniloxList.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
  }
}

const getAniloxData = async(e)=>{
  if(e.target.matches(".id")){
    try {
      for(let i = 0; i < e.target.parentElement.parentElement.children.length; i++){
        e.target.parentElement.parentElement.children[i].children[0].classList.remove("selected");
      }
      e.target.classList.add("selected");
      $aniloxQuantity.value = "";
      let aniloxId = e.target.textContent;
      let res1 = await fetch('api/listado', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: aniloxId, mensaje: "getAniloxData"})
      }),
          json1 = await res1.json();
          json1 = json1.result;
      if(!res1.ok) throw{status: res1.status, statusText: res1.statusText};      
      
      $specificType.textContent = json1[0].type;
      $specificAngle.textContent = `${json1[0].angle}`;
      $specificVol.textContent = `${Math.round(((json1[0].nomvol*volMulti)+Number.EPSILON)*10)/10}`;
      $specificScreen.textContent = `${Math.round(((json1[0].screen*screenMulti)+Number.EPSILON)*10)/10}`;
    } 
    catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $specificData.insertAdjacentHTML("afterend",`<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
        $specificData.nextElementSibling.remove()
      }, 2000);
    }
  }
}

const addAniloxToQuote = (e)=>{
  if (e.target === $addToQuote) {
    if ($aniloxQuantity.value !== "" && $aniloxQuantity.value > 0){
      let cantItems = $quoteBody.childElementCount;
      $quoteTemplate.querySelector(".specific-item-number").textContent = (cantItems + 1);
      $quoteTemplate.querySelector(".specific-item-quantity").textContent = $aniloxQuantity.value;
      $quoteTemplate.querySelector(".specific-item-type").textContent = $specificType.textContent;
      $quoteTemplate.querySelector(".specific-item-angle").textContent = $specificAngle.textContent;
      $quoteTemplate.querySelector(".specific-item-vol").textContent = $specificVol.textContent;
      $quoteTemplate.querySelector(".specific-item-screen").textContent = $specificScreen.textContent;
      $quoteTemplate.querySelector(".volumeUnit").textContent = `(${ls.getItem("volumeUnit")}):`;
      $quoteTemplate.querySelector(".screenUnit").textContent = `(${ls.getItem("screenUnit")}):`;
      let $clone = d.importNode($quoteTemplate, true);
      $quoteBody.appendChild($clone);
      $aniloxQuantity.value = "";
    }
    else {
      $alertContent.textContent = "Por favor ingrese una cantidad válida para agregar a la cotización.";
      $modalAlertBox.style.display = "block";
    }
  }
}

const removeFromQuote = (e)=>{
  if(e.target.matches(".remove-from-quote")){
    e.target.parentElement.parentElement.remove();
    let cantItems = $quoteBody.childElementCount;
    for(let i = 0; i < cantItems; i++){
      $quoteBody.children[i].querySelector(".specific-item-number").textContent = (i + 1);
    }
  }
}

const requestQuote = async(e)=>{
  if(e.target === $requestQuote){
    let cantItems = $quoteBody.childElementCount;
    let mensaje;
    if(cantItems > 0){
      try {
        let req = [];
        if (cantItems == 1) { mensaje = "send quote"}
        for(let i = 0; i < cantItems; i++){
          let item = $quoteBody.children[i];
          let type = item.querySelector(".specific-item-type").textContent,
              nomvol = item.querySelector(".specific-item-vol").textContent,
              screen = item.querySelector(".specific-item-screen").textContent,
              angle = item.querySelector(".specific-item-angle").textContent,
              amount = item.querySelector(".specific-item-quantity").textContent;
          req.push({
            id: i+1,
            type: type,
            nomvol: nomvol,
            screen: screen,
            angle: angle,
            amount: amount,
            mensaje: mensaje
          });
        }
        
        let res1 = await fetch('api/request-quotes', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reqDate: (new Date(Date.now()).toJSON()).slice(0, 10),
            req2: req,
            volUnit: ls.getItem("volumeUnit"),
            screenUnit: ls.getItem("screenUnit")
          })
        });

        if(res1.ok) {
          $alertContent.textContent = "Solicitud registrada exitosamente.";
          $modalAlertBox.style.display = "block";
          setTimeout(()=>{
            $quoteBody.replaceChildren();
          }, 3000);          
        }
        if(!res1.ok) throw{status: res1.status, statusText: res1.statusText};
      } 
      catch (err) {
        console.log(err);
        let errorCode = err.status || "2316",
            errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
            message1 = "Error " + errorCode + ": ",
            message2 = errorStatus;
        $quoteList.insertAdjacentHTML("afterend",`<p><b>${message1}</b>${message2}</p>`);
        setTimeout(()=>{
          $quoteList.nextElementSibling.remove()
        }, 2000);
      }
    }
    else {
      $alertContent.textContent = "Por favor, ingrese items a su solicitud antes de registrarla.";
      $modalAlertBox.style.display = "block";
    }
  }
}

d.addEventListener("DOMContentLoaded", levelCheck);
d.addEventListener("DOMContentLoaded", getAniloxList);
d.addEventListener("click", getAniloxData);
d.addEventListener("click", addAniloxToQuote);
d.addEventListener("click", removeFromQuote);
d.addEventListener("click", requestQuote);