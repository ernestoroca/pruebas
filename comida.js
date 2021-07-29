"use strict";
/* globals M, firebase*/
window.onload = function(){
    var elem = document.getElementById("slide-left");
    M.Sidenav.init(elem, {
  	    edge:'left',
    });
    elem.onclick = function(){
        let elem = document.getElementById("slide-left");
        M.Sidenav.getInstance(elem).close();
    };
    document.getElementById("menu-izq").onclick = function(){
        let elem = document.getElementById("slide-left");
        M.Sidenav.getInstance(elem).open();
    };
    
    simulador();
    window.location.href="#menu";
    rutas.menu();
};
window.onhashchange = function(){
    var url = decodeURI(window.location.hash);
    var vecUrl = url.split('/');
    if (vecUrl.length===0 || (vecUrl.length===1 && vecUrl[0]==="")){
        window.location.href="#login";
    } else {
        rutas[vecUrl[0].replace("#","")](vecUrl);
    }
};

//=================================================================

function getMisTiendas(){
    return Promise.resolve([{
        id: "sdfasdfsadfsa",
        tipo: "restaurant",
        nombre: "Oveja Negra",
        logo: "",
        direccion: "",
        descripcion: "",
        latlon: "",
    }]);
}


var Pedidos = (function(){
    let idTienda;
    let solicitudes = [];
    let callback = null;
    return {
        setTienda: function(id,cb){
            idTienda = id;
            callback = cb;
        },
        getSolicitudes: function(){
            let len = solicitudes.length;
            let res = [];
            for(let i=0;i<len;i++){
                if(solicitudes[i].estado === "todo"){
                    res.push(solicitudes[i]);
                }
            }
            res.sort((a,b) => {
                return (a.tmpsolicitado > b.tmpsolicitado)?+1:-1;
            });
            return res;
        },
        getSolDoing: function(){
            let len = solicitudes.length;
            let res = [];
            for(let i=0;i<len;i++){
                if(solicitudes[i].estado === "doing"){
                    res.push(solicitudes[i]);
                }
            }
            res.sort((a,b) => {
                return (a.tmpsolicitado > b.tmpsolicitado)?+1:-1;
            });
            return res;
        },
        getItemDoing: function(){
            let len = solicitudes.length;
            let res = [];
            for(let i=0;i<len;i++){
                let unaSolicitud = solicitudes[i];
                if(unaSolicitud.estado === "doing"){
                    let lenItems = unaSolicitud.items.length;
                    for(let j=0;j<lenItems;j++){
                        let unItem = unaSolicitud.items[j];
                        for(let k=0;k<unItem.faltan;k++){
                            res.push({
                                telefono: unaSolicitud.telefono,
                                idpedido: unaSolicitud.id,
                                tmpsolicitado: unaSolicitud.tmpsolicitado,
                                iditem: unItem.iditem,
                            });
                        }
                    }
                }
            }
            return res;
        },
        getDones: function(){
            let len = solicitudes.length;
            let res = [];
            for(let i=0;i<len;i++){
                if(solicitudes[i].estado === "done"){
                    res.push(solicitudes[i]);
                }
            }
            res.sort((a,b) => {
                return (a.tmpsolicitado > b.tmpsolicitado)?+1:-1;
            });
            return res;
        },
        getDelivered: function(){
            let len = solicitudes.length;
            let res = [];
            for(let i=0;i<len;i++){
                if(solicitudes[i].estado === "delivered"){
                    res.push(solicitudes[i]);
                }
            }
            res.sort((a,b) => {
                return (a.tmpsolicitado > b.tmpsolicitado)?+1:-1;
            });
            return res;
        },
        getUna: function(id){
            let len = solicitudes.length;
            for(let i=0;i<len;i++){
                if(solicitudes[i].id === id){
                    return solicitudes[i];
                }
            }
        },
        
        setDoing: function(id,demora){
            let len = solicitudes.length;
            for(let i=0;i<len;i++){
                if(solicitudes[i].id === id){
                    if(solicitudes[i].estado === "todo"){
                        solicitudes[i].estado = "doing";
                        return true;
                    }
                    return false;
                }
            }
            return false;
        },
        setDoneOne: function(idSol,idItem){
            let res = "error";
            let len = solicitudes.length;
            for(let i=0;i<len;i++){
                if(solicitudes[i].id === idSol){
                    let acumulador = 0;
                    let laSolicitud = solicitudes[i];
                    let losItems = laSolicitud.items;
                    let lenItems = losItems.length;
                    for(let j=0;j<lenItems;j++){
                        if(losItems[j].iditem === idItem){
                            if(losItems[j].faltan > 0){
                                losItems[j].faltan--;
                                res = "ok";
                            }
                        }
                        acumulador += losItems[j].faltan;
                    }
                    if(acumulador === 0){
                        res = "done";
                        laSolicitud.estado = "done";
                    }
                    break;
                }
            }
            return res;
        },
        setDelivered: function(id){
            let len = solicitudes.length;
            for(let i=0;i<len;i++){
                if(solicitudes[i].id === id){
                    if(solicitudes[i].estado === "done"){
                        solicitudes[i].estado = "delivered";
                        return true;
                    }
                    return false;
                }
            }
            return false;
        },
        
        newPedido: function(datos){
            datos.id = makeid();
            datos.estado = "todo";
            datos.tmpsolicitado = Date.now();
            datos.tmpaceptado = 0;
            solicitudes.push(datos);
            if(callback){
                callback(datos);
            }
            M.toast({html:"Hay un nuevo pedido"});
        },
        delPedido: function(id){
            let len = solicitudes.length;
            for(let i=0;i<len;i++){
                if(solicitudes[i].id === id){
                    solicitudes[i].estado = "discarted";
                    return true;
                }
            }
            return false;
        },
    };
}());

var Productos = (function(){
    let lista = [];
    lista.push({
        id: "hamburguesa1",
        nombre: "Hamburguesa simple",
        descripcion: "Pan, carne, lechuga, tomate.",
        estado: "activo",
        foto: "https://picsum.photos/200",
        precio: 25,
    });
    lista.push({
        id: "hamburguesa2",
        nombre: "Hamburguesa con queso",
        descripcion: "Pan, carne, lechuga, tomate, queso.",
        estado: "activo",
        foto: "https://picsum.photos/200",
        precio: 30,
    });
    lista.push({
        id: "lomito1",
        nombre: "Lomito simple",
        descripcion: "Pan, carne, lechuga, tomate.",
        estado: "activo",
        foto: "https://picsum.photos/200",
        precio: 25,
    });
    lista.push({
        id: "lomito2",
        nombre: "Lomito con queso",
        descripcion: "Pan, carne, lechuga, tomate, queso.",
        estado: "activo",
        foto: "https://picsum.photos/200",
        precio: 30,
    });
    return {
        addItem: function(nombre,descripcion,precio,foto){
            lista.push({
                id: makeid(),
                nombre: nombre,
                descripcion: descripcion,
                estado: "pasivo",
                foto: foto,
                precio: precio,
            });
        },
        getItem: function(id){
            let len = lista.length;
            for(let i=0;i<len;i++){
                if(lista[i].id === id){
                    return lista[i];
                }
            }
        },
        getTodos: function(){
            return lista;
        },
        getActivos: function(){
            let len = lista.length;
            let res = [];
            for(let i=0;i<len;i++){
                if(lista[i].estado === "activo"){
                    res.push(lista[i]);
                }
            }
            return res;
        },
        getPasivos: function(){
            let len = lista.length;
            let res = [];
            for(let i=0;i<len;i++){
                if(lista[i].estado !== "activo"){
                    res.push(lista[i]);
                }
            }
            return res;
        },
        setEstado: function(id,estado){
            let len = lista.length;
            for(let i=0;i<len;i++){
                if(lista[i].id === id){
                    lista[i].estado = estado;
                    break;
                }
            }
        },
        resetItem: function(id,nombre,descripcion,precio,foto){
            let len = lista.length;
            for(let i=0;i<len;i++){
                if(lista[i].id === id){
                    let elItem = lista[i];
                    elItem.nombre = nombre;
                    elItem.descripcion = descripcion;
                    elItem.precio = precio;
                    elItem.foto = foto;
                    break;
                }
            }
        }
    };
}());

var rutas = [];
rutas.menu = function(){
    var strHtml;
    {strHtml = `
  <div class="row">
    <div class="col s12">
      <h4>Marketplace</h4>
    </div>
  </div>
  <div class="row">
    <div class="col s6 offset-s6 center">
      <a href="#mistiendas">
        <i class="large material-icons">login</i><br>
        Mis locales
      </a>
    </div>
  </div>
  <div class="row">
    <div class="col s6 center">
      <a href="#comidas">
        <i class="large material-icons">lunch_dining</i><br>
        Restaurantes
      </a>
    </div>
  </div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    strHtml = null;
};
rutas.comidas = function(){
    var strHtml;
    {strHtml = `
  <div class="row">
    <div class="col s12">
      <h4>Restaurantes</h4>
    </div>
  </div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    strHtml = null;
};
rutas.mistiendas = function(){
    var strHtml;
    {strHtml = `
  <div class="row">
    <div class="col s12 center">
      <h4>Marketplace</h4>
    </div>
  </div>
  <div class="row">
    <div class="col s6 center">
      <a href="#menu">
        <i class="large material-icons">logout</i><br>
        Marketplace
      </a>
    </div>
    <div class="col s6 center">
      <a href="#misagregar">
        <i class="large material-icons">miscellaneous_services</i><br>
        Gestionar Tiendas
      </a>
    </div>
  </div>
  <div class="row" id="lista"></div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    strHtml = null;
    getMisTiendas().then(lista => {
        let len = lista.length;
        let strHtml = "";
        for(let i=0;i<len;i++){
            strHtml += `
<div class="col s6 center">
  <a href="#misunatienda/${lista[i].id}">
    <i class="large material-icons">${lista[i].tipo}</i><br>
    ${lista[i].nombre}
  </a>
</div>
            `;
        }
        document.getElementById('lista').innerHTML = strHtml;
    });
};

//=================================================================

rutas.misunatienda = function(vecUrl){
    let idTienda = vecUrl[1];
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4 id="nombre-local"></h4>
  </div>
</div>
<div class="row">
  <div class="col s4 grey lighten-4 center">
    <p>
      Pedidos
    </p>
  </div>
  <div class="col s4 center" onclick="window.location.href='#misofertas/${idTienda}'">
    <p>
      Ofertas
    </p>
  </div>
  <div class="col s4 center" onclick="window.location.href='#misconfig/${idTienda}'">
    <p>
      Config
    </p>
  </div>
</div>
<div class="row">
  <div class="col s12">
    <ul class="collapsible">
      <li>
        <div class="collapsible-header">
          <i class="material-icons">notifications</i>Solicitudes
        </div>
        <div class="collapsible-body" id="lista-solicitudes">
        </div>
      </li>
      <li>
        <div class="collapsible-header">
          <i class="material-icons">construction</i>Solicitudes en proceso
        </div>
        <div class="collapsible-body" id="lista-sol-proceso">
        </div>
      </li>
      <li>
        <div class="collapsible-header">
          <i class="material-icons">construction</i>Items en proceso
        </div>
        <div class="collapsible-body">
          <div class="row">
            <div class="col s12">
              <div class="switch">
                <label>
                  Producto
                  <input type="checkbox" id="ordenar-items">
                  <span class="lever"></span>
                  Hora
                </label>
              </div>
            </div>
          </div>
          <div id="lista-item-proceso"></div>
        </div>
      </li>
      <li>
        <div class="collapsible-header">
          <i class="material-icons">done</i>Hecho
        </div>
        <div class="collapsible-body" id="lista-hecho">
        </div>
      </li>
      <li>
        <div class="collapsible-header">
          <i class="material-icons">delivery_dining</i>Entregado
        </div>
        <div class="collapsible-body" id="lista-delivered">
        </div>
      </li>
    </ul>
  </div>
</div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
    strHtml = null;
    getMisTiendas().then(lista => {
        let len = lista.length;
        for(let i=0;i<len;i++){
            if(lista[i].id === idTienda){
                document.getElementById('nombre-local').innerHTML = lista[i].nombre;
                break;
            }
        }
        Pedidos.setTienda(idTienda,printSolicitud);
        printListSol();
        printListSolPen();
        printListItemPen();
        printListDone();
        printListDelivered();
    });
    function printSolicitud(unaSol){
        let elem = document.getElementById("lista-solicitudes");
        if(!elem){
            return;
        }
        let ahora = Date.now();
        let delta = Math.ceil((ahora - unaSol.tmpsolicitado)/(60*1000));
        let strHtml;
        {strHtml = `
<div class="row">
  <div class="col s12">
    <h4>Tel. ${unaSol.telefono}</h4>
    <p><b>Demora:</b> ${delta} minutos</p>
  </div>
</div>
        `;}
        let len = unaSol.items.length;
        for(let i=0;i<len;i++){
            let unItem = unaSol.items[i];
            let unProducto = Productos.getItem(unItem.iditem);
            {strHtml += `
<div class="row">
  <div class="col s5">
    <img class="responsive-img" src="${unProducto.foto}">
  </div>
  <div class="col s7">
    <p class="center">
      <b>${unProducto.nombre}</b>
    </p>
    <p>
      <b>Pedidos:</b> ${unItem.cantidad}
    </p>
    <p>
      <b>Faltantes:</b> ${unItem.faltan}
    </p>
  </div>
</div>
            `;}
        }
        {strHtml += `
<div class="row">
  <div class="input-field col s12">
    <select id="solicitud-${unaSol.id}">
      <option value="" disabled selected>Tiempo de entrega</option>
      <option value="5">5 minutos</option>
      <option value="10">10 minutos</option>
      <option value="15">15 minutos</option>
      <option value="20">20 minutos</option>
      <option value="25">25 minutos</option>
      <option value="30">30 minutos</option>
      <option value="xx" disbled>---</option>
      <option value="no">Rechazar pedido</option>
    </select>
  </div>
</div>
        `;}
        let newDiv = document.createElement("div");
        newDiv.classList.add("row","blue");
        newDiv.id = "solicitud-"+unaSol.id;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-solicitudes").appendChild(newDiv);
        M.FormSelect.init(document.querySelectorAll('select'));
        document.getElementById('solicitud-'+unaSol.id).onchange = seleccionador;
    }
    function printPedido(unaSol){
        let ahora = Date.now();
        let delta = Math.ceil((ahora - unaSol.tmpsolicitado)/(60*1000));
        let strHtml;
        {strHtml = `
<div class="row">
  <div class="col s12">
    <h4>Tel. ${unaSol.telefono}</h4>
    <p><b>Demora:</b> ${delta} minutos</p>
  </div>
</div>
        `;}
        let len = unaSol.items.length;
        for(let i=0;i<len;i++){
            let unItem = unaSol.items[i];
            let unProducto = Productos.getItem(unItem.iditem);
            {strHtml += `
<div class="row">
  <div class="col s5">
    <img class="responsive-img" src="${unProducto.foto}">
  </div>
  <div class="col s7">
    <p class="center">
      <b>${unProducto.nombre}</b>
    </p>
    <p>
      <b>Pedidos:</b> ${unItem.cantidad}
    </p>
    <p>
      <b>Faltantes:</b> ${unItem.faltan}
    </p>
    <p>
      <a id="pedido-${unaSol.id}-${unItem.iditem}" class="waves-effect waves-teal btn-flat white">
        <i class="material-icons right">done</i>Hecho
      </a>
    </p>
  </div>
</div>
            `;}
        }
        let newDiv = document.createElement("div");
        newDiv.classList.add("row","blue");
        newDiv.id = "pedido-"+unaSol.id;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-sol-proceso").appendChild(newDiv);
    }
    function reprintPedido(unaSol){
        let elemento = document.getElementById("pedido-"+unaSol.id);
        if(!elemento){
            return;
        }
        let ahora = Date.now();
        let delta = Math.ceil((ahora - unaSol.tmpsolicitado)/(60*1000));
        let strHtml;
        {strHtml = `
<div class="row">
  <div class="col s12">
    <h4>Tel. ${unaSol.telefono}</h4>
    <p><b>Demora:</b> ${delta} minutos</p>
  </div>
</div>
        `;}
        let len = unaSol.items.length;
        for(let i=0;i<len;i++){
            let unItem = unaSol.items[i];
            let unProducto = Productos.getItem(unItem.iditem);
            {strHtml += `
<div class="row">
  <div class="col s5">
    <img class="responsive-img" src="${unProducto.foto}">
  </div>
  <div class="col s7">
    <p class="center">
      <b>${unProducto.nombre}</b>
    </p>
    <p>
      <b>Pedidos:</b> ${unItem.cantidad}
    </p>
    <p>
      <b>Faltantes:</b> ${unItem.faltan}
    </p>
    <p>
      <a id="pedido-${unaSol.id}-${unItem.iditem}" class="waves-effect waves-teal btn-flat white">
        <i class="material-icons right">done</i>Hecho
      </a>
    </p>
  </div>
</div>
            `;}
        }
        elemento.innerHTML = strHtml;
    }
    function printHecho(unaSol){
        let ahora = Date.now();
        let delta = Math.ceil((ahora - unaSol.tmpsolicitado)/(60*1000));
        let strHtml;
        {strHtml = `
<div class="row">
  <div class="col s12">
    <h4>Tel. ${unaSol.telefono}</h4>
    <p><b>Demora:</b> ${delta} minutos</p>
  </div>
</div>
        `;}
        let len = unaSol.items.length;
        for(let i=0;i<len;i++){
            let unItem = unaSol.items[i];
            let unProducto = Productos.getItem(unItem.iditem);
            {strHtml += `
<div class="row">
  <div class="col s5">
    <img class="responsive-img" src="${unProducto.foto}">
  </div>
  <div class="col s7">
    <p class="center">
      <b>${unProducto.nombre}</b>
    </p>
    <p>
      <b>Pedidos:</b> ${unItem.cantidad}
    </p>
  </div>
</div>
            `;}
        }
        {strHtml += `
<div class="row">
  <div class="col s12">
    <a id="done-click-${unaSol.id}" class="waves-effect waves-teal btn-flat white">
        <i class="material-icons right">done</i>Enviado
      </a>
  </div>
</div>
        `}
        let newDiv = document.createElement("div");
        newDiv.classList.add("row","blue");
        newDiv.id = "done-item-"+unaSol.id;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-hecho").appendChild(newDiv);
    }
    function printDelivered(unaSol){
        let strHtml;
        {strHtml = `
<div class="row">
  <div class="col s12">
    <h4>Tel. ${unaSol.telefono}</h4>
  </div>
</div>
        `;}
        let len = unaSol.items.length;
        for(let i=0;i<len;i++){
            let unItem = unaSol.items[i];
            let unProducto = Productos.getItem(unItem.iditem);
            {strHtml += `
<div class="row">
  <div class="col s5">
    <img class="responsive-img" src="${unProducto.foto}">
  </div>
  <div class="col s7">
    <p class="center">
      <b>${unProducto.nombre}</b>
    </p>
    <p>
      <b>Pedidos:</b> ${unItem.cantidad}
    </p>
  </div>
</div>
            `;}
        }
        let newDiv = document.createElement("div");
        newDiv.classList.add("row","blue");
        newDiv.id = "delivered-"+unaSol.id;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-delivered").appendChild(newDiv);
    }
    
    function printItem(unItem,i){
        let ahora = Date.now();
        let delta = Math.ceil((ahora - unItem.tmpsolicitado)/(60*1000));
        let unProducto = Productos.getItem(unItem.iditem);
        let strHtml;
        {strHtml = `
  <div class="col s5">
    <img class="responsive-img" src="${unProducto.foto}">
  </div>
  <div class="col s7">
    <p>
      <b>${unProducto.nombre}</b>
    </p>
    <p>
      <b>Tel. ${unItem.telefono}</b>
    </p>
    <p>
      <b>Demora:</b> ${delta} minutos
    </p>
    <p>
      <a id="clickitem-${unItem.idpedido}-${unItem.iditem}-${i}" class="waves-effect waves-teal btn-flat white">
        <i class="material-icons right">done</i>Hecho
      </a>
    </p>
  </div>
        `;}
        let newDiv = document.createElement("div");
        newDiv.classList.add("row","blue");
        newDiv.id = "unitem-"+unItem.idpedido+"-"+unItem.iditem+"-"+i;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-item-proceso").appendChild(newDiv);
    }

    function printListSol(){
        document.getElementById("lista-solicitudes").innerHTML = "";
        let solicitudes = Pedidos.getSolicitudes(printListSol);
        let len = solicitudes.length;
        for(let i=0;i<len;i++){
            printSolicitud(solicitudes[i]);
        }
    }
    function printListSolPen(){
        document.getElementById("lista-sol-proceso").innerHTML = "";
        let solicitudes = Pedidos.getSolDoing();
        let len = solicitudes.length;
        for(let i=0;i<len;i++){
            printPedido(solicitudes[i]);
        }
    }
    function printListItemPen(){
        document.getElementById("lista-item-proceso").innerHTML = "";
        let losItems = Pedidos.getItemDoing();
        let ordenado = document.getElementById('ordenar-items').checked;
        if(!ordenado){
            losItems.sort((a,b)=>{
                if(a.iditem > b.iditem){
                    return +1;
                } else if(a.iditem < b.iditem){
                    return -1;
                } else {
                    return (a.tmpsolicitado > b.tmpsolicitado)?+1:-1;
                }
            });
        } else {
            losItems.sort((a,b)=>{
                if(a.tmpsolicitado > b.tmpsolicitado){
                    return +1;
                } else if(a.tmpsolicitado < b.tmpsolicitado){
                    return -1;
                } else {
                    return (a.iditem > b.iditem)?+1:-1;
                }
            });
        }
        let len = losItems.length;
        for(let i=0;i<len;i++){
            printItem(losItems[i],i);
        }
    }
    function printListDone(){
        document.getElementById("lista-hecho").innerHTML = "";
        let solicitudes = Pedidos.getDones();
        let len = solicitudes.length;
        for(let i=0;i<len;i++){
            printHecho(solicitudes[i]);
        }
    }
    function printListDelivered(){
        document.getElementById("lista-delivered").innerHTML = "";
        let solicitudes = Pedidos.getDelivered();
        let len = solicitudes.length;
        for(let i=0;i<len;i++){
            printDelivered(solicitudes[i]);
        }
    }

    let bloqueado = false;
    function desbloquear(){
        bloqueado = false;
    }
    function seleccionador(evento){
        let elid = evento.target.id;
        elid = elid.replace("solicitud-","");
        let valor = evento.target.value;
        let res;
        if(valor === "no"){
            res = Pedidos.delPedido(elid);
             M.toast({html:"¡Pedido borrado!"});
        } else {
            res = Pedidos.setDoing(elid,parseInt(valor,10));
            if(res){
                M.toast({html:"¡Pedido aceptado!"});
                printListSolPen();
                printListItemPen();
            }
        }
        if(res){
            document.getElementById("solicitud-"+elid).remove();
        }
    }
    document.getElementById("lista-sol-proceso").onclick = function(evento){
        let target = evento.target;
        while (target.id === ""){
            target = target.parentNode;
        }
        if(target.id === "lista-sol-proceso"){
            return;
        }
        let vec = target.id.split("-");
        if(vec.length !== 3){
            return;
        }
        
        if(bloqueado){
            return;
        }
        bloqueado = true;
        setTimeout(desbloquear,2000);
        
        let res = Pedidos.setDoneOne(vec[1],vec[2]);
        if(res === "done"){
            document.getElementById("pedido-"+vec[1]).remove();
            printListDone();
            printListItemPen();
            M.toast({html:"¡Hecho!"});
            M.toast({html:"¡Pedido terminado!"});
        } else if(res === "ok"){
            reprintPedido(Pedidos.getUna(vec[1]));
            printListItemPen();
            M.toast({html:"¡Hecho!"});
        }
    };
    document.getElementById("lista-item-proceso").onclick = function(evento){
        let target = evento.target;
        while (target.id === ""){
            target = target.parentNode;
        }
        if(target.id === "lista-item-proceso"){
            return;
        }
        let vec = target.id.split("-");
        if(vec.length !== 4){
            return;
        }
        if(vec[0] !== "clickitem"){
            return;
        }
        
        if(bloqueado){
            return;
        }
        bloqueado = true;
        setTimeout(desbloquear,2000);
        
        let res = Pedidos.setDoneOne(vec[1],vec[2]);
        if(res === "done"){
            document.getElementById("unitem-"+vec[1]+"-"+vec[2]+"-"+vec[3]).remove();
            printListDone();
            printListSolPen();
            M.toast({html:"¡Hecho!"});
            M.toast({html:"¡Pedido terminado!"});
        } else if(res === "ok"){
            document.getElementById("unitem-"+vec[1]+"-"+vec[2]+"-"+vec[3]).remove();
            printListSolPen();
            M.toast({html:"¡Hecho!"});
        }
    };
    document.getElementById("lista-hecho").onclick = function(evento){
        let target = evento.target;
        while (target.id === ""){
            target = target.parentNode;
        }
        if(target.id === "lista-hecho"){
            return;
        }
        let vec = target.id.split("-");
        if(vec.length !== 3){
            return;
        }
        if(vec[1] !== "click"){
            return;
        }
        
        if(bloqueado){
            return;
        }
        bloqueado = true;
        setTimeout(desbloquear,2000);
        
        let res = Pedidos.setDelivered(vec[2]);
        if(res){
            document.getElementById("done-item-"+vec[2]).remove();
            printListDelivered();
            M.toast({html:"¡Entregado!"});
        }
    };
    document.getElementById("ordenar-items").onchange = printListItemPen;
};

//-----------------------------------------------------------------

rutas.misofertas = function(vecUrl){
    let idTienda = vecUrl[1];
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4 id="nombre-local"></h4>
  </div>
</div>
<div class="row">
  <div class="col s4 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <p>
      Pedidos
    </p>
  </div>
  <div class="col s4 grey lighten-4 center">
    <p>
      Ofertas
    </p>
  </div>
  <div class="col s4 center" onclick="window.location.href='#misconfig/${idTienda}'">
    <p>
      Config
    </p>
  </div>
</div>
<div class="row">
  <div class="col s12">
    <a href="#misnewproducto/${idTienda}" class="btn-floating btn-large waves-effect waves-light right red">
      <i class="material-icons">add</i>
    </a>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <select id="selector">
      <option value="todos">Todos</option>
      <option value="activo">Activos</option>
      <option value="pasivo">Deshabilitados</option>
    </select>
  </div>
</div>
<div id="lista-productos">
</div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    M.FormSelect.init(document.querySelectorAll('select'));
    strHtml = null;
    getMisTiendas().then(lista => {
        let len = lista.length;
        for(let i=0;i<len;i++){
            if(lista[i].id === idTienda){
                document.getElementById('nombre-local').innerHTML = lista[i].nombre;
                break;
            }
        }
        printTodos();
    });
    function printProducto(unProducto){
        let strHtml;
        {strHtml = `
  <div class="col s5">
    <img class="responsive-img" src="${unProducto.foto}">
  </div>
  <div class="col s7">
    <p class="center">
      <b>${unProducto.nombre}</b>
    </p>
    <p>
      ${unProducto.descripcion}
    </p>
    <p>
      <div class="switch">
        <label class="white-text">
          Deshabilitado
          <input type="checkbox" id="estado-${unProducto.id}">
          <span class="lever"></span>
          Activo
        </label>
      </div>
    </p>
    <p>
      <a href="#miseditoferta/${idTienda}/${unProducto.id}" class="btn-floating waves-effect waves-light red right">
        <i class="material-icons">edit</i>
      </a>
    </p>
  </div>
        `;}
        let newDiv = document.createElement("div");
        newDiv.classList.add("row","blue");
        newDiv.id = "unproducto-"+unProducto.id;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-productos").appendChild(newDiv);
        document.getElementById("estado-"+unProducto.id).checked = (unProducto.estado === "activo");
        document.getElementById("estado-"+unProducto.id).onchange = cambiarEstado;
    }
    function printTodos(){
        document.getElementById('lista-productos').innerHTML = "";
        let listaProductos = Productos.getTodos();
        let len = listaProductos.length;
        for(let i=0;i<len;i++){
            printProducto(listaProductos[i]);
        }
    }
    function printActivos(){
        document.getElementById('lista-productos').innerHTML = "";
        let listaProductos = Productos.getActivos();
        let len = listaProductos.length;
        for(let i=0;i<len;i++){
            printProducto(listaProductos[i]);
        }
    }
    function printPasivos(){
        document.getElementById('lista-productos').innerHTML = "";
        let listaProductos = Productos.getPasivos();
        let len = listaProductos.length;
        for(let i=0;i<len;i++){
            printProducto(listaProductos[i]);
        }
    }
    function cambiarEstado(evento){
        let elid = evento.target.id;
        elid = elid.replace("estado-","");
        
        let valor = evento.target.checked?"activo":"pasivo";
        Productos.setEstado(elid,valor);
        
        let mostrando = document.getElementById('selector').value;
        if(mostrando !== "todos"){
            document.getElementById('unproducto-'+elid).remove();
        }
    }
    document.getElementById('selector').onchange = function(){
        let val = document.getElementById('selector').value;
        switch(val){
            case "todos":
                printTodos();
                break;
            case "activo":
                printActivos();
                break;
            case "pasivo":
                printPasivos();
                break;
        }
    };
};


//-----------------------------------------------------------------

rutas.miseditoferta = function(vecUrl){
    let idTienda = vecUrl[1];
    let idProducto = vecUrl[2];
    let unProducto = Productos.getItem(idProducto);
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4 id="nombre-local"></h4>
  </div>
</div>
<div class="row">
  <div class="col s12">
    <img class="responsive-img" src="${unProducto.foto}">
  </div>
</div>
<div class="row">
  <div class="col s12">
    <div class="file-field input-field">
      <div class="btn teal accent-3">
        <i class="material-icons black-text">photo_camera</i>
        <input type="file" id="foto">
      </div>
      <div class="file-path-wrapper">
        <input class="file-path validate" type="text">
      </div>
    </div>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <input id="nombre" type="text" class="validate" value="${unProducto.nombre}">
    <label for="nombre">Nombre</label>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <textarea id="descripcion" class="materialize-textarea">${unProducto.descripcion}</textarea>
    <label for="descripcion">Descripción</label>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <input id="precio" type="number" class="validate" value="${unProducto.precio}">
    <label for="precio">Precio</label>
  </div>
</div>
<div class="row">
  <div class="col s12">
    <a class="waves-effect waves-light btn" id="enviar">
      <i class="material-icons right">send</i>Actualizar
    </a>
  </div>
</div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    strHtml = null;
    M.updateTextFields();
    getMisTiendas().then(lista => {
        let len = lista.length;
        for(let i=0;i<len;i++){
            if(lista[i].id === idTienda){
                document.getElementById('nombre-local').innerHTML = lista[i].nombre;
                break;
            }
        }
    });
    document.getElementById("enviar").onclick = function(){
        let nombre = document.getElementById("nombre").value;
        let descripcion = document.getElementById("descripcion").value;
        let precio = document.getElementById("precio").value;
        let foto = "https://picsum.photos/200";
        
        nombre = nombre.trim();
        descripcion = descripcion.trim();
        precio = precio.trim();
        
        if(nombre === ""){
            M.toast({html: "Agregue un nombre"});
            return;
        }
        if(descripcion === ""){
            M.toast({html: "Agregue una descripción"});
            return;
        }
        if(precio === ""){
            M.toast({html: "Agregue un precio"});
            return;
        }
        Productos.resetItem(idProducto,nombre,descripcion,parseInt(precio,10),foto);
        M.toast({
            html: "Se cambiaron los datos",
            completeCallback: function(){
                window.location.href = "#misofertas";
            }
        });
    };
};

//-----------------------------------------------------------------

rutas.misnewproducto = function(vecUrl){
    let idTienda = vecUrl[1];
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4 id="nombre-local"></h4>
  </div>
</div>
<div class="row">
  <div class="col s12">
    <div class="file-field input-field">
      <div class="btn teal accent-3">
        <i class="material-icons black-text">photo_camera</i>
        <input type="file" id="foto">
      </div>
      <div class="file-path-wrapper">
        <input class="file-path validate" type="text">
      </div>
    </div>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <input id="nombre" type="text" class="validate">
    <label for="nombre">Nombre</label>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <textarea id="descripcion" class="materialize-textarea"></textarea>
    <label for="descripcion">Descripción</label>
  </div>
</div>
<div class="row">
  <div class="input-field col s12">
    <input id="precio" type="number" class="validate">
    <label for="precio">Precio</label>
  </div>
</div>
<div class="row">
  <div class="col s12">
    <a class="waves-effect waves-light btn" id="enviar">
      <i class="material-icons right">send</i>Agregar
    </a>
  </div>
</div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    strHtml = null;
    M.updateTextFields();
    getMisTiendas().then(lista => {
        let len = lista.length;
        for(let i=0;i<len;i++){
            if(lista[i].id === idTienda){
                document.getElementById('nombre-local').innerHTML = lista[i].nombre;
                break;
            }
        }
    });
    document.getElementById("enviar").onclick = function(){
        let nombre = document.getElementById("nombre").value;
        let descripcion = document.getElementById("descripcion").value;
        let precio = document.getElementById("precio").value;
        let foto = "https://picsum.photos/200";
        
        nombre = nombre.trim();
        descripcion = descripcion.trim();
        precio = precio.trim();
        
        if(nombre === ""){
            M.toast({html: "Agregue un nombre"});
            return;
        }
        if(descripcion === ""){
            M.toast({html: "Agregue una descripción"});
            return;
        }
        if(precio === ""){
            M.toast({html: "Agregue un precio"});
            return;
        }
        
        Productos.addItem(nombre,descripcion,parseInt(precio,10),foto);
        M.toast({
            html: "Se agregó el item",
            completeCallback: function(){
                window.location.href = "#misofertas/"+idTienda;
            }
        });
    };
};

//-----------------------------------------------------------------

rutas.misconfig = function(vecUrl){
    let idTienda = vecUrl[1];
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4 id="nombre-local"></h4>
  </div>
</div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    strHtml = null;
    getMisTiendas().then(lista => {
        let len = lista.length;
        for(let i=0;i<len;i++){
            if(lista[i].id === idTienda){
                document.getElementById('nombre-local').innerHTML = lista[i].nombre;
                break;
            }
        }
    });
    
};

//=================================================================
//=================================================================

function makeid(){
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i=0; i<32; i++) {
        result += characters.charAt(Math.floor(Math.random() * 62));
    }
    return result;
}

function simulador(){
    let listaProductos = Productos.getActivos();
    let lenProductos = listaProductos.length;
    let ran = Math.random();
    let nroItems;
    if(ran<0.4){
        nroItems = 1;
    } else if(ran<0.7){
        nroItems = 2;
    } else if(ran<0.9){
        nroItems = 3;
    } else {
        nroItems = 4;
    }

    let itemPedido = [];
    let losItems = [];
    for(let i=0;i<nroItems;i++){
        let nroPedidos = Math.ceil(Math.random()+Math.random()+Math.random());
        let prueba;
        do{
            prueba = Math.floor(Math.random()*lenProductos);
        }while(itemPedido.indexOf(prueba)>=0);
        
        itemPedido.push(prueba);
        let elProducto =
        losItems.push({
            iditem: listaProductos[prueba].id,
            cantidad: nroPedidos,
            faltan: nroPedidos,
        });
    }
    
    Pedidos.newPedido({
        telefono: "" + (60000000 + Math.floor(Math.random()*(79999999 - 60000000))),
        nota: "xxx",
        items: losItems
    });
    
    setTimeout(simulador,60*1000);
}
