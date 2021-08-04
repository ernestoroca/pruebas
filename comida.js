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
var Relojes = (function(){
    let lista = [];
    setInterval(ciclo,20000);
    function ciclo(){
        let ahora = Date.now();
        let len = lista.length;
        let minutos;
        for(let i=0;i<len;i++){
            let item = lista[i];
            if(item.creciendo){
                minutos = Math.ceil((ahora - item.valor)/(60*1000));
            } else {
                minutos = Math.ceil((item.valor - ahora)/(60*1000));
                if(minutos <= 0){
                    minutos = 0;
                }
            }
            let elemento = document.getElementById(item.id);
            if(elemento){
                elemento.innerHTML = minutos;
                if(!item.creciendo && minutos === 0){
                    lista.splice(i,1);
                    i--;
                    len--;
                }
            } else {
                lista.splice(i,1);
                i--;
                len--;
            }
        }
    }
    return {
        set: function(id,valor,creciendo){
            let len = lista.length;
            for(let i=0;i<len;i++){
                if(lista[i].id === id){
                    lista.splice(i,1);
                    break;
                }
            }
            lista.push({
                id: id,
                valor: valor,
                creciendo: creciendo
            });
        }
    };
}());

var Tiendas = (function(){
    let lista = [];
    let relojes = [];
    lista.push({
        id: "sdfasdfsadfsa",
        tipo: "restaurant",
        nombre: "Oveja Negra",
        
        logo: "",
        direccion: "",
        descripcion: "",
        lat: 0,
        lng: 0,
        calendario: [],
        estado: "cerrado",
    });
    /*
        la tienda no puede ser agregada por el usuario pare evitar que robe nombres
        puede cambiar:
            logo
            direccion
            descripcion
            lat
            lng
            calendario
            estado
    */
    function buscar(id){
        let len = lista.length;
        for(let i=0;i<len;i++){
            if(lista[i].id === id){
                return lista[i];
            }
        }
        return null;
    }
    function setReloj(id,futuro){
        let ahora = Date.now();
        let timer = setTimeout(function(){
            Tiendas.setEstado(id,"abierto");
        },futuro-ahora);
        relojes.push({
            id: id,
            timer: timer
        });
        ahora = null;
    }
    function clearReloj(id){
        let len = relojes.length;
        for(let i=0;i<len;i++){
            if(relojes[i].id === id){
                clearTimeout(relojes[i].timer);
                relojes.splice(i,1);
                break;
            }
        }
    }
    return {
        getUna: function(id){
            let laTienda = buscar(id);
            return laTienda;
        },
        getLista: function(){
            return lista;
        },
        setHorario: function(id,hora,activo){
            let laTienda = buscar(id);
            let pos = laTienda.calendario.indexOf(hora);
            if(pos>=0){
                if(!activo){
                    laTienda.calendario.splice(pos,1);
                }
            } else {
                if(activo){
                    laTienda.calendario.push(hora);
                }
            }
        },
        setEstado: function(id,estado){
            clearReloj(id);
            let laTienda = buscar(id);
            laTienda.estado = estado;
            if(estado.includes("ocupado")){
                let vec = estado.split("-");
                let futuro = parseInt(vec[1],10);
                setReloj(id,futuro);
            }
        },
        setDireccion: function(id,txt){
            let laTienda = buscar(id);
            laTienda.direccion = txt;
        },
        setDescripcion: function(id,txt){
            let laTienda = buscar(id);
            laTienda.descripcion = txt;
        },
        setLatLng: function(id,lat,lng){
            let laTienda = buscar(id);
            laTienda.lat = lat;
            laTienda.lng = lng;
        },
    };
}());

var Clientes = (function(){
    let lista = [];
    function busqueda(tel){
        let l = 0;
        let r = lista.length-1;
        let m,mtel;
        while(l<=r){
            m = Math.floor((l+r)/2);
            mtel = lista[m].tel;
            if(mtel < tel){
                l = m + 1;
            } else if(mtel > tel){
                r = m - 1;
            } else {
                return m;
            }
        }
        return -1;
    }
    function insertar(tel){
        let l = 0;
        let r = lista.length-1;
        let m,mtel;
        while(l<=r){
            m = Math.floor((l+r)/2);
            mtel = lista[m].tel;
            if(mtel < tel){
                l = m + 1;
            } else if(mtel > tel){
                r = m - 1;
            }
        }
        lista.splice(l, 0, {
            tel: tel,
            nroPredido: 1,
            notas: ""
        });
    }
    return {
        get: function(telefono){
            let pos = busqueda(telefono);
            if(pos>=0){
                return lista[pos];
            } else {
                return {
                    nroPedido: 0,
                    notas: ""
                };
            }
        },
        set: function(telefono){
            let
            pos = busqueda(telefono);
            if(pos>=0){
                lista[pos].nroPedido++;
            } else {
                insertar(telefono);
            }
        },
    };
}());

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
        setDone: function(id){
            let len = solicitudes.length;
            for(let i=0;i<len;i++){
                if(solicitudes[i].id === id){
                    if(solicitudes[i].estado === "doing"){
                        solicitudes[i].estado = "done";
                        return true;
                    }
                    return false;
                }
            }
            return false;
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
            datos.etiqueta = Etiquetas.get(),
            datos.estado = "todo";
            datos.tmpsolicitado = Date.now();
            datos.tmpaceptado = 0;
            let cliente = Clientes.get(datos.telefono);
            datos.nroPedido = cliente.nroPedido;
            datos.notaCliente = cliente.notas;
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
        tienda: "sdfasdfsadfsa",
        nombre: "Hamburguesa simple",
        descripcion: "Pan, carne, lechuga, tomate.",
        estado: "activo",
        foto: "https://picsum.photos/200",
        precio: 25,
    });
    lista.push({
        id: "hamburguesa2",
        tienda: "sdfasdfsadfsa",
        nombre: "Hamburguesa con queso",
        descripcion: "Pan, carne, lechuga, tomate, queso.",
        estado: "activo",
        foto: "https://picsum.photos/200",
        precio: 30,
    });
    lista.push({
        id: "lomito1",
        tienda: "sdfasdfsadfsa",
        nombre: "Lomito simple",
        descripcion: "Pan, carne, lechuga, tomate.",
        estado: "activo",
        foto: "https://picsum.photos/200",
        precio: 25,
    });
    lista.push({
        id: "lomito2",
        tienda: "sdfasdfsadfsa",
        nombre: "Lomito con queso",
        descripcion: "Pan, carne, lechuga, tomate, queso.",
        estado: "activo",
        foto: "https://picsum.photos/200",
        precio: 30,
    });
    let tienda;
    return {
        setTienda: function(id){
            tienda = id;
        },
        addItem: function(nombre,descripcion,precio,foto){
            lista.push({
                id: makeid(),
                tienda: tienda,
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
            let res = [];
            let len = lista.length;
            for(let i=0;i<len;i++){
                if(lista[i].tienda === tienda){
                    res.push(lista[i]);
                }
            }
            return res;
        },
        getActivos: function(){
            let len = lista.length;
            let res = [];
            for(let i=0;i<len;i++){
                let item = lista[i];
                if(item.estado === "activo" && item.tienda === tienda){
                    res.push(lista[i]);
                }
            }
            return res;
        },
        getPasivos: function(){
            let len = lista.length;
            let res = [];
            for(let i=0;i<len;i++){
                let item = lista[i];
                if(lista[i].estado !== "activo" && item.tienda === tienda){
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

var Etiquetas = (function(){
    //https://www.flaticon.com/packs/forest-animals
    //https://image.flaticon.com/icons/png/512/113/NNNNNN.png
    let animales = [113269,113266,113280,113279,113287,113271,113272,113268,113277,113283,113273,113289,
        113275,113290,113292,113293,113291,113267,113288,113286,113284,113281,113278,113282,113285,113265,
        113264,113270,113274,113276];
    let colores = ["red","orange","yellow","green","blue","purple"];
    let usados = [];
    let ultimoColor = colores.length-1;
    let ultimoAnimal = 0;
    return {
        get: function(){
            ultimoColor++;
            if(ultimoColor === colores.length){
                ultimoColor = 0;
            }
            let newAnimal;
            let newLabel;
            do{
                do{
                    newAnimal = Math.floor(Math.random()*animales.length);
                }while(newAnimal === ultimoAnimal);
                newLabel = colores[ultimoColor]+"-"+animales[newAnimal];
            }while(usados.indexOf(newLabel)>=0);
            usados.push(newLabel);
            while(usados.length>100){
                usados.shift();
            }
            return newLabel;
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

//-----------------------------------------------------------------

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

//-----------------------------------------------------------------

rutas.mistiendas = function(){
    let lista = Tiendas.getLista();
    let len = lista.length;
    let lasTiendas= "";
    for(let i=0;i<len;i++){
        lasTiendas += `
<div class="col s6 center">
<a href="#misunatienda/${lista[i].id}">
<i class="large material-icons">${lista[i].tipo}</i><br>
${lista[i].nombre}
</a>
</div>
        `;
    }
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
        <i class="large material-icons">add</i><br>
        Agregar Tienda
      </a>
    </div>
  </div>
  <div class="row" id="lista">${lasTiendas}</div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
};

//=================================================================

rutas.misunatienda = function(vecUrl){
    let idTienda = vecUrl[1];
    let laTienda = Tiendas.getUna(idTienda);
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4>${laTienda.nombre}</h4>
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
      Catálogo
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
        <div class="collapsible-body" id="lista-proceso">
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
<div id="modales" class="modal">
  <div class="modal-content">
    <h4>Alerta</h4>
    <p><span id="modales-texto"></span></p>
  </div>
  <div class="modal-footer">
    <a class="modal-close waves-effect waves-green btn-flat">Canelar</a>
    <a id="modal-click" class="modal-close waves-effect waves-green btn-flat">ACEPTAR</a>
  </div>
</div>
    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
    M.Modal.init(document.querySelectorAll('.modal'));
    var instanciaModal = M.Modal.getInstance(document.getElementById("modales"));
    
    Productos.setTienda(idTienda);
    Pedidos.setTienda(idTienda,printSolicitud);
    printListSol();
    printListPen();
    printListDone();
    printListDelivered();
    
    
    function printSolicitud(unaSol){
        let elem = document.getElementById("lista-solicitudes");
        if(!elem){
            return;
        }
        let ahora = Date.now();
        let delta = Math.ceil((ahora - unaSol.tmpsolicitado)/(60*1000));
        let vecEtiqueta = unaSol.etiqueta.split("-");
        let strHtml;
        {strHtml = `
<div class="row">
  <div class="col s9">
    <h4>Tel. ${unaSol.telefono}</h4>
    <p><b>Demora:</b> <span id="reloj-solicitud-${unaSol.id}">${delta}</span> minutos</p>
    <p><b>Nro Visita:</b> ${unaSol.nroPedido}</p>
    <p><b>Nota del Cliente:</b><br> ${unaSol.notaCliente}</p>
    <p><b>Nota del Pedido:</b><br> ${unaSol.nota}</p>
  </div>
  <div class="col s3">
    <img class="responsive-img" src="https://image.flaticon.com/icons/png/512/113/${vecEtiqueta[1]}.png">
  </div>
</div>
        `;}
        Relojes.set("reloj-solicitud-"+unaSol.id,unaSol.tmpsolicitado,true);
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
      <b>Nota:</b><br>${unItem.nota}
    </p>
  </div>
</div>
            `;}
        }
        {strHtml += `
<div class="row">
  <div class="input-field col s12 white">
    <select id="seleccitud-${unaSol.id}">
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
        newDiv.classList.add("row","z-depth-3",vecEtiqueta[0]);
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
        let vecEtiqueta = unaSol.etiqueta.split("-");
        {strHtml = `
<div class="row">
  <div class="col s9">
    <h4>Tel. ${unaSol.telefono}</h4>
    <p><b>Demora:</b> <span id="reloj-pedido-${unaSol.id}">${delta}</span> minutos</p>
    <p><b>Nro Visita:</b> ${unaSol.nroPedido}</p>
    <p><b>Nota del Cliente:</b><br> ${unaSol.notaCliente}</p>
    <p><b>Nota del Pedido:</b><br> ${unaSol.nota}</p>
  </div>
  <div class="col s3">
    <img class="responsive-img" src="https://image.flaticon.com/icons/png/512/113/${vecEtiqueta[1]}.png">
  </div>
</div>
        `;}
        Relojes.set("reloj-pedido-"+unaSol.id,unaSol.tmpsolicitado,true);
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
      <b>Nota:</b>
      ${unItem.nota}
    </p>
  </div>
</div>
            `;}
        }
        {strHtml += `
<div class="row right">
  <div class="col s12">
    <a class="waves-effect waves-light btn white black-text" id="pedido-${unaSol.id}">
      <i class="material-icons right">send</i>Terminado
    </a>
  </div>
</div>
        `;}
        
        let newDiv = document.createElement("div");
        newDiv.classList.add("row","z-depth-3",vecEtiqueta[0]);
        newDiv.id = "pedido-"+unaSol.id;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-proceso").appendChild(newDiv);
    }
    function printHecho(unaSol){
        let ahora = Date.now();
        let delta = Math.ceil((ahora - unaSol.tmpsolicitado)/(60*1000));
        let vecEtiqueta = unaSol.etiqueta.split("-");
        let strHtml;
        {strHtml = `
<div class="row">
  <div class="col s9">
    <h4>Tel. ${unaSol.telefono}</h4>
    <p><b>Demora:</b> <span id="reloj-hecho-${unaSol.id}">${delta}</span> minutos</p>
    <p><b>Nro Visita:</b> ${unaSol.nroPedido}</p>
    <p><b>Nota del Cliente:</b><br> ${unaSol.notaCliente}</p>
    <p><b>Nota del Pedido:</b><br> ${unaSol.nota}</p>
  </div>
  <div class="col s3">
    <img class="responsive-img" src="https://image.flaticon.com/icons/png/512/113/${vecEtiqueta[1]}.png">
  </div>
</div>
        `;}
        Relojes.set("reloj-hecho-"+unaSol.id,unaSol.tmpsolicitado,true);
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
<div class="row right">
  <div class="col s12">
    <a class="waves-effect waves-light btn white black-text" id="hecho-${unaSol.id}">
      <i class="material-icons right">send</i>Entregado
    </a>
  </div>
</div>
        `;}
        let newDiv = document.createElement("div");
        newDiv.classList.add("row","z-depth-3",vecEtiqueta[0]);
        newDiv.id = "done-"+unaSol.id;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-hecho").appendChild(newDiv);
    }
    function printDelivered(unaSol){
        let vecEtiqueta = unaSol.etiqueta.split("-");
        let strHtml;
        {strHtml = `
<div class="row">
  <div class="col s9">
    <h4>Tel. ${unaSol.telefono}</h4>
    <p><b>Nro Visita:</b> ${unaSol.nroPedido}</p>
    <p><b>Nota del Cliente:</b><br> ${unaSol.notaCliente}</p>
    <p><b>Nota del Pedido:</b><br> ${unaSol.nota}</p>
  </div>
  <div class="col s3">
    <img class="responsive-img" src="https://image.flaticon.com/icons/png/512/113/${vecEtiqueta[1]}.png">
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
        newDiv.classList.add("row","z-depth-3",vecEtiqueta[0]);
        newDiv.id = "delivered-"+unaSol.id;
        newDiv.innerHTML = strHtml;
        document.getElementById("lista-delivered").appendChild(newDiv);
    }
    
    function printListSol(){
        document.getElementById("lista-solicitudes").innerHTML = "";
        let solicitudes = Pedidos.getSolicitudes(printListSol);
        let len = solicitudes.length;
        for(let i=0;i<len;i++){
            printSolicitud(solicitudes[i]);
        }
    }
    function printListPen(){
        document.getElementById("lista-proceso").innerHTML = "";
        let solicitudes = Pedidos.getSolDoing();
        let len = solicitudes.length;
        for(let i=0;i<len;i++){
            printPedido(solicitudes[i]);
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

    function seleccionador(evento){
        let elid = evento.target.id;
        elid = elid.replace("seleccitud-","");
        let valor = evento.target.value;
        let res;
        if(valor === "no"){
            document.getElementById("seleccitud-"+elid).value = "";
            M.FormSelect.init(document.querySelectorAll('select'));
            modalParam.tipo = "borrar";
            modalParam.id = elid;
            document.getElementById("modales-texto").innerHTML = "¿Desea eliminar el pedido?";
            instanciaModal.open();
        } else {
            res = Pedidos.setDoing(elid,parseInt(valor,10));
            if(res){
                M.toast({html:"¡Pedido aceptado!"});
                document.getElementById("solicitud-"+elid).remove();
                printListPen();
            }
        }
    }
    
    let modalParam = {
        tipo: "",
        id: "",
    };
    document.getElementById("modal-click").onclick = function(){
        if(modalParam.tipo === "pedido"){
            let res = Pedidos.setDone(modalParam.id);
            if(res){
                document.getElementById("pedido-"+modalParam.id).remove();
                printListDone();
                M.toast({html:"¡Pedido terminado!"});
            }
        } else if(modalParam.tipo === "hecho"){
            let res = Pedidos.setDelivered(modalParam.id);
            if(res){
                document.getElementById("done-"+modalParam.id).remove();
                printListDelivered();
                M.toast({html:"¡Entregado!"});
            }
        } else if(modalParam.tipo === "borrar"){
            let res = Pedidos.delPedido(modalParam.id);
            if(res){
                M.toast({html:"¡Pedido borrado!"});
                document.getElementById("solicitud-"+modalParam.id).remove();
            }
        }
        modalParam.tipo = "";
        modalParam.id = "";
    };
    document.getElementById("lista-proceso").onclick = function(evento){
        let target = evento.target;
        while (target.id === ""){
            target = target.parentNode;
        }
        if(target.id === "lista-proceso"){
            return;
        }
        let vec = target.id.split("-");
        if(vec.length !== 2){
            return;
        }
        
        
        modalParam.tipo = "pedido";
        modalParam.id = vec[1];
        document.getElementById("modales-texto").innerHTML = "¿Pedido terminado?";
        instanciaModal.open();
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
        if(vec.length !== 2){
            return;
        }

        modalParam.tipo = "hecho";
        modalParam.id = vec[1];
        document.getElementById("modales-texto").innerHTML = "¿Pedido entregado?";
        
        var instance = M.Modal.getInstance(document.getElementById("modales"));
        instanciaModal.open();
    };
    
    strHtml = null; laTienda=null;
};

//-----------------------------------------------------------------

rutas.misofertas = function(vecUrl){
    let idTienda = vecUrl[1];
    let laTienda = Tiendas.getUna(idTienda);
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4>${laTienda.nombre}</h4>
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
      Catálogo
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
    
    Productos.setTienda(idTienda);
    printTodos();
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
        M.toast({html: "Se cambió el estado de este producto"});
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
    strHtml = null; laTienda = null;
};

//-----------------------------------------------------------------

rutas.miseditoferta = function(vecUrl){
    let idTienda = vecUrl[1];
    let idProducto = vecUrl[2];
    let laTienda = Tiendas.getUna(idTienda);
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
    <h4>${laTienda.nombre}</h4>
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
    M.updateTextFields();
    
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
    strHtml = null; laTienda= null;
};

//-----------------------------------------------------------------

rutas.misnewproducto = function(vecUrl){
    let idTienda = vecUrl[1];
    let laTienda = Tiendas.getUna(idTienda);
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4>${laTienda.nombre}</h4>
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
    
    Productos.setTienda(idTienda);
    M.updateTextFields();
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
    strHtml = null; laTienda = null;
};

//-----------------------------------------------------------------

rutas.misconfig = function(vecUrl){
    let idTienda = vecUrl[1];
    let laTienda = Tiendas.getUna(idTienda);
    let strHtml;
    {strHtml = `
<div class="row valign-wrapper">
  <div class="col s2 center">
    <a href="#mistiendas" class="btn-floating btn-large waves-effect waves-light red">
      <i class="material-icons">arrow_back</i>
    </a>
  </div>
  <div class="col s10 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <h4>${laTienda.nombre}</h4>
  </div>
</div>
<div class="row">
  <div class="col s4 center" onclick="window.location.href='#misunatienda/${idTienda}'">
    <p>
      Pedidos
    </p>
  </div>
  <div class="col s4 center" onclick="window.location.href='#misofertas/${idTienda}'">
    <p>
      Catálogo
    </p>
  </div>
  <div class="col s4 grey lighten-4 center">
    <p>
      Config
    </p>
  </div>
</div>
<div class="row">
  <div class="col s12 center">
    <h4 id="estado"></h4>
  </div>
</div>
<div class="row">
  <div class="col s12">
    <ul class="collapsible">
      <li>
        <div class="collapsible-header">
          <i class="material-icons">autorenew</i>Cambiar Estado
        </div>
        <div class="collapsible-body">
          <div class="row">
            <div class="input-field col s12">
              <select id="select-estado">
                <option value="" disabled selected>Cambiar estado</option>
                <option value="abierto">Abierto</option>
                <option value="cerrado">Cerrado</option>
                <option value="ocupado-5">Ocupado 5 min</option>
                <option value="ocupado-10">Ocupado 10 min</option>
                <option value="ocupado-20">Ocupado 20 min</option>
                <option value="ocupado-30">Ocupado 30 min</option>
                <option value="ocupado-45">Ocupado 45 min</option>
                <option value="ocupado-60">Ocupado 1 hora</option>
                <option value="ocupado-90">Ocupado 1 hora 30 min</option>
                <option value="ocupado-120">Ocupado 2 horas</option>
              </select>
              <label>Materialize Select</label>
            </div>
          </div>
        </div>
      </li>
      <li>
        <div class="collapsible-header">
          <i class="material-icons">edit_calendar</i>Horarios de atención
        </div>
        <div class="collapsible-body">
          <table>
            <thead>
              <tr>
                <th></th><th>Do</th><th>Lu</th><th>Ma</th><th>Mi</th><th>Ju</th><th>Vi</th><th>Sa</th>
              </tr>
            </thead>
            <tbody id="tabla-horario">
              ${printHorario()}
            </tbody>
          </table>
        </div>
      </li>
      <li>
        <div class="collapsible-header">
          <i class="material-icons">settings</i>Datos Generales
        </div>
        <div class="collapsible-body">
          <div class="row">
            <div class="col s12">
              <div class="row">
                <div class="input-field col s12">
                  <textarea id="descripcion" class="materialize-textarea">${laTienda.descripcion}</textarea>
                  <label for="descripcion">Descripción</label>
                </div>
              </div>
              <div class="row right">
                <div class="col s12">
                  <a class="waves-effect waves-light btn" id="actual-descripcion">
                    <i class="material-icons right">check</i>Actualizar
                  </a>
                </div>
              </div>
              <div class="divider"></div>
              <div class="row">
                <div class="input-field col s12">
                  <input id="direccion" type="text" class="validate" value="${laTienda.direccion}">
                  <label for="direccion">Direccion</label>
                </div>
              </div>
              <div class="row right">
                <div class="col s12">
                  <a class="waves-effect waves-light btn" id="actual-direccion">
                    <i class="material-icons right">check</i>Actualizar
                  </a>
                </div>
              </div>
              <div class="divider"></div>
              <div class="row">
                <div class="input-field col s12">
                  <input id="latlng" type="text" class="validate" value="${laTienda.lat},${laTienda.lng}">
                  <label for="latlng">Ubicación (lat,lng)</label>
                </div>
              </div>
              <div class="row right">
                <div class="col s12">
                  <a class="waves-effect waves-light btn" id="actual-latlng">
                    <i class="material-icons right">check</i>Actualizar
                  </a>
                </div>
              </div>
              <div class="divider"></div>
              <div class="row">
                <div class="col s12">
                  <div class="file-field input-field">
                    <div class="btn">
                      <i class="material-icons">photo_camera</i>
                      <input type="file" id="foto">
                    </div>
                    <div class="file-path-wrapper">
                      <input class="file-path validate" type="text" placeholder="Subir archivo de logo">
                    </div>
                  </div>
                </div>
              </div>
              <div class="row right">
                <div class="col s12">
                  <a class="waves-effect waves-light btn" id="actual-foto">
                    <i class="material-icons right">check</i>Actualizar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</div>

    `;}
    document.getElementById('pantalla').innerHTML = strHtml;
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
    M.FormSelect.init(document.querySelectorAll('select'));
    M.updateTextFields();
    M.textareaAutoResize(document.getElementById("descripcion"));
    
    actualHorario();
    printEstado(laTienda.estado);
    
    document.getElementById("tabla-horario").onclick = function(evento){
        let target = evento.target;
        while (target.id === ""){
            target = target.parentNode;
        }
        if(target.id === "tabla-horario"){
            return;
        }
        let elemento = document.getElementById(target.id);
        if(target.id.includes("dom") || target.id.includes("mar") || target.id.includes("jue") || target.id.includes("sab")){
            if(elemento.classList.contains("orange")){
                elemento.classList.remove("orange");
                elemento.classList.add("grey");
            } else {
                elemento.classList.remove("grey");
                elemento.classList.add("orange");
            }
        } else {
            elemento.classList.toggle("orange");
        }
        Tiendas.setHorario(idTienda,target.id,elemento.classList.contains("orange"));
    };
    document.getElementById("select-estado").onchange = function(){
        let estado = document.getElementById("select-estado").value;
        let nvoEstado;
        if(estado === "abierto" || estado === "cerrado"){
            nvoEstado = estado;
        } else {
            let vec = estado.split("-");
            let minutos = parseInt(vec[1],10);
            let milis = minutos*60*1000;
            milis += Date.now();
            nvoEstado = "ocupado-" + milis;
        }
        Tiendas.setEstado(idTienda,nvoEstado);
        printEstado(nvoEstado);
    };
    document.getElementById("actual-descripcion").onclick = function(){
        let descripcion = document.getElementById("descripcion").value;
        descripcion = descripcion.trim();
        if(descripcion === ""){
            M.toast({html:"Agregue una descripción de su local"});
            return;
        }
        Tiendas.setDescripcion(idTienda,descripcion);
    };
    document.getElementById("actual-direccion").onclick = function(){
        let direccion = document.getElementById("direccion").value;
        direccion = direccion.trim();
        if(direccion === ""){
            M.toast({html:"Agregue la dirección de su local"});
            return;
        }
        Tiendas.setDireccion(idTienda,direccion);
    };
    document.getElementById("actual-latlng").onclick = function(){
        let latlng = document.getElementById("latlng").value;
        let vec = latlng.split(",");
        if(vec.length !== 2){
            M.toast({html:"Formato de ubicación en mapa incorrecto"});
            M.toast({html:"latitud,longitud"});
            return;
        }
        let lat = parseFloat(vec[0],10);
        let lng = parseFloat(vec[1],10);
        Tiendas.setLatLng(idTienda,lat,lng);
    };
    
    
    function printEstado(status){
        let estado;
        if(status === "cerrado"){
            estado= "Cerrado";
        } else if(status === "abierto"){
            estado= "Abierto";
        } else if(status.includes("ocupado-")){
            let vecEstado = status.split("-");
            let tmpFin = parseInt(vecEstado[1],10);
            let ahora = Date.now();
            if(ahora >= tmpFin){
                estado = "Abierto";
            } else {
                let delta = Math.ceil((tmpFin - ahora)/(60*1000));
                estado = `Ocupado: <span id="reloj-estado-tienda">${delta}</span> min`;
            }
            Relojes.set("reloj-estado-tienda",tmpFin,false);
        }
        document.getElementById("estado").innerHTML = estado;
    }
    function printHorario(){
        let strHtml = "";
        for(let i=0;i<24;i++){
            strHtml += `
<tr>
  <td>${i}:00</td>
  <td id="dom-${i}-00" class="grey lighten-3"></td>
  <td id="lun-${i}-00" class="lighten-3"></td>
  <td id="mar-${i}-00" class="grey lighten-3"></td>
  <td id="mie-${i}-00" class="lighten-3"></td>
  <td id="jue-${i}-00" class="grey lighten-3"></td>
  <td id="vie-${i}-00" class="lighten-3"></td>
  <td id="sab-${i}-00" class="grey lighten-3"></td>
</tr>
<tr>
  <td>${i}:30</td>
  <td id="dom-${i}-30" class="grey lighten-3"></td>
  <td id="lun-${i}-30" class="lighten-3"></td>
  <td id="mar-${i}-30" class="grey lighten-3"></td>
  <td id="mie-${i}-30" class="lighten-3"></td>
  <td id="jue-${i}-30" class="grey lighten-3"></td>
  <td id="vie-${i}-30" class="lighten-3"></td>
  <td id="sab-${i}-30" class="grey lighten-3"></td>
</tr>
            `;
        }
        return strHtml;
    }
    function actualHorario(){
        let len = laTienda.calendario.length;
        for(let i=0;i<len;i++){
            let elemento = document.getElementById(laTienda.calendario[i]);
            if(elemento.classList.contains("grey")){
                elemento.classList.remove("grey");
            }
            elemento.classList.add("orange");
        }
    }
    strHtml = null; laTienda = null;
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
    setTimeout(simulador,2*60*1000);
    let laTienda =Tiendas.getUna("sdfasdfsadfsa");
    if(laTienda.estado === "cerrado"){
        M.toast({html: "La tienda no está trabajando"});
        return;
    }
    if(laTienda.estado.includes("ocupado")){
        M.toast({html: "La tienda está ocupada en este momento. Vuelva en pocos minutos."});
        return;
    }
    
    Productos.setTienda(laTienda.id);
    
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
            nota: "nota item"
        });
    }
    
    Pedidos.newPedido({
        telefono: "" + (60000000 + Math.floor(Math.random()*(79999999 - 60000000))),
        nota: "nota pedido",
        items: losItems
    });
}
