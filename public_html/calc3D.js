// uebernehme die vorliegende Instanz von calc3D oder erstelle eine neue
var calc3D = calc3D || {
    // Deklaration der benoetigten Objekteigenschaften
    leinwand: null,
    wuerfel: [],
    welt:null,
    worldmatrix:[],
    camera: {
        near:-600,
        far:600,
        fieldOfView:90,
        fPlusNOverFN:function(){
            return (calc3D.camera.far + calc3D.camera.near)/(calc3D.camera.far*calc3D.camera.near);
        },
        twofOverFMinusN: function(){
            return (calc3D.camera.far * calc3D.camera.near)/(calc3D.camera.far-calc3D.camera.near);
        },
        zoom:100,
        h: function(){
            return 1/Math.tan(calc3D.camera.fieldOfView/2.0);
        },
        w: function () {
            return window.innerWidth/window.innerHeight;
        },
        P:{ x:0,y:0,z:0},
        U: { x:1,y:0,z:0},
        V: { x:0,y:0,z:1},
        W: { x:0,y:1,z:0},
    },
    mausposition: {
        x: window.innerWidth/2,
        y: window.innerHeight/2
    },
    /**
     * Funktion um calc3D zu initialisieren
     * @param {string} _leinwandID
     */
    init: function (_leinwandID) {
        //initialisieren der Objekteigenschaften
        this.leinwand = typeof _leinwandID === "string" ?
            document.getElementById(_leinwandID) :
            document.getElementById("dddleinwand");
        //Einstellen der Leinwand;
        this.leinwand.setAttribute("width", window.innerWidth - 15);
        this.leinwand.setAttribute("height", window.innerHeight - 15);

        //this.welt = new calc3D.Sphere(calc3D.Punkt(0,60,-60),30,30);
        //this.worldmatrix.push(this.welt);
        var atomkern = new calc3D.Punkt(0,0,0);
        var elektronenRadius = 5;
        var elektronenAnzahl = 1;
        var radZ=0;
        this.worldmatrix[0] = new calc3D.Sphere(atomkern, 10, 8);
        for(var i = 1; i<= elektronenAnzahl; i++) {
            radZ += Math.PI/elektronenAnzahl;
            var x, y, z;
            x = atomkern.x + 4*elektronenRadius * Math.cos(radZ);
            y = atomkern.y + elektronenRadius*4 * Math.sin(radZ);
            z = atomkern.z;
            this.worldmatrix[i] = new calc3D.Sphere(calc3D.Punkt(x, y, z),elektronenRadius, 8);
        }
        //this.worldmatrix.push(new calc3D.Wuerfel(calc3D.Punkt(-100,2,-50),50))
        //this.wuerfel.push(new calc3D.Wuerfel({ x:10, y: 10, z:10}, 60));

        document.body.addEventListener("keydown",function(event){
            var taste = event.keyCode;

            console.log(taste);
            console.log(calc3D.camera);
            switch (taste){
                case 104:
                    calc3D.welt.MAXPOINTSPERRING--;
                    calc3D.welt.initSphere();
                    break;
                case 33:
                    calc3D.camera.zoom/=2;
                    break;
                case 34:
                    calc3D.camera.zoom *=2;
                    break;
                case 96:
                    //calc3D.camera.P.z-=10;
                    calc3D.dreheumZ(calc3D.welt,-1);
                    break;
                case 97:
                    //calc3D.camera.P.z+=10;
                    calc3D.dreheumZ(calc3D.welt,1);
                    break;
                case 38:
                    //calc3D.camera.P.y+=10;
                    calc3D.dreheumX(calc3D.welt,1);
                    break;
                case 40:
                    calc3D.dreheumX(calc3D.welt,-1);
                    //calc3D.camera.P.y-=10;
                    break;
                case 39:
                    calc3D.dreheumY(calc3D.welt,1);
                    //calc3D.camera.P.x+=10;
                    break;
                case 37:
                    calc3D.dreheumY(calc3D.welt,-1);
                    //calc3D.camera.P.x-=10;
                    break;
                case 107:
                    calc3D.dreheumY(calc3D.welt,1)
                    calc3D.camera.far += 5;
                    break;
                case 109:
                    calc3D.dreheumY(calc3D.welt,-1)
                    calc3D.camera.far -= 5;
                    break;
                case 105:
                    calc3D.camera.near += 5;
                    break;
                case 102:
                    calc3D.camera.near -= 5;
                    break;
                default:break;
            }
            calc3D.Loginfo();

        },false);
        document.body.addEventListener("mousemove", function (event) {
            event.stopPropagation();
            var dx = calc3D.mausposition.x - event.screenX;
            var dy = calc3D.mausposition.y - event.screenY;
            calc3D.mausposition.x = event.screenX;
            calc3D.mausposition.y = event.screenY;

        });
        this.druckePfade();
        //this.autoupdate(10000);
        this.autorotationum(5,atomkern);
    },
    Loginfo: function(){
        document.getElementById('cameraInfo').innerHTML = "P:" + calc3D.camera.P.toSource() +"</br>"+
            "far: " + calc3D.camera.far + "</br>" +
            "near: " + calc3D.camera.near+ "</br>" +
            "FOV: " + calc3D.camera.fieldOfView + "</br>" +
            "Zoom: " + calc3D.camera.zoom;
        ;
    },
    /**
     * Repraesentation Punktes im
     * dreidimensionalen Raum
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    Punkt: function (x, y, z) {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
        this.z = parseFloat(z);
        this.w = 1;
        return this;
    },
    /**
     * Repraesentation Punktes im
     * zweidimensionalen Raum
     * @param {number} x
     * @param {number} y
     */
    Punkt2D: function (x, y) {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
        return this;
    },

    Sphere : function(P,radius,MAXPOINTSPERRING){
        this.MAXPOINTSPERRING = typeof MAXPOINTSPERRING === "undefined"?100:MAXPOINTSPERRING;
        this.radius = typeof radius === "undefined"?10000:radius;
        this.mittelpunkt = typeof P === "undefined"? {x:0.1,y:0.1,z:0.1}: P;
        this.punkte = Array();
        this.pfade = [];
        this.faces = [];
        this.initSphere = function(){
            var alpha, beta;
            alpha = beta = 0;
            for(var alpha = 0;  alpha < 2*Math.PI;   alpha+=(2*Math.PI/this.MAXPOINTSPERRING)){
                for(var beta = 0;   beta < 2*Math.PI;   beta+=(2*Math.PI/this.MAXPOINTSPERRING)){
                    var x = this.radius * Math.sin(alpha)*Math.cos(beta)+this.mittelpunkt.x;
                    var z = this.radius * Math.sin(alpha)*Math.sin(beta)+this.mittelpunkt.y;
                    var y = this.radius * Math.cos(alpha)+this.mittelpunkt.z;
                    this.punkte.push(new calc3D.Punkt( x,y,z));
                    console.log("init: ",new calc3D.Punkt( x,y,z));
                }
            }
            this.initFaces();
        };
        this.initFaces = function () {
            for(var i = 0; i< (this.MAXPOINTSPERRING-1)*this.MAXPOINTSPERRING; i++)
            {
                if((i % (this.MAXPOINTSPERRING - 1) === 0) && (i > 0)){
                    this.faces[i] = [
                        this.punkte[i],
                        this.punkte[i + this.MAXPOINTSPERRING],
                        this.punkte[i + 1],
                        this.punkte[i - this.MAXPOINTSPERRING +1],
                        this.punkte[i],
                    ];
                }else {
                    this.faces[i] = [
                        this.punkte[i],
                        this.punkte[i + this.MAXPOINTSPERRING],
                        this.punkte[i + this.MAXPOINTSPERRING + 1],
                        this.punkte[i + 1],
                        this.punkte[i],
                    ];
                }
                console.log("{i}{Face}",i,this.faces[i]);
            }
            this.initPfade();
        };
        this.initPfade = function () {
            var dx = (window.innerWidth / 2);
            var dy = (window.innerHeight / 2);
            for (var i = 0; i < this.faces.length; i++) {
                var pfad = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                pfad.addEventListener("click", function (e) {
                    this.setAttribute("fill", "rgba(5, 190, 255, 0.2)");
                });
                this.pfade[i] =pfad;
            }
        },
        this.initSphere();
        return this;
    },
    /**
     * "Klasse" um viele Wuerfel erstellen zu koennen
     * M ist Mittelpunkt des Wuerfels
     * @param {calc3D.Punkt} _M
     * @param {number} _a
     * @param {string} _farbe
     */
    Wuerfel: function (_M, _a, _farbe) {
        this.index = calc3D.wuerfel.length;
        this.mittelpunkt = (_M === undefined || _M === null) ?
            new calc3D.Punkt(0, -1, 0) : _M;
        this.a = (_a === undefined || _a === null) ?
            100 : _a;
        this.farbe = (_farbe === undefined || _farbe === null) ?
            "rgba(255,255,255,0.1)" : _farbe;//"rgba(5, 190, 255, 0.8)"
        this.pfade = [];

        var d = this.a / 2;
        // initialisierung der acht Punkte
        // Die Koordinaten eines Wuerfels werden
        // ausgehend von seinem Mittelpubkt und der Seite a bestimmt
        this.punkte = [
            new calc3D.Punkt(this.mittelpunkt.x - d,
                this.mittelpunkt.y - d,
                this.mittelpunkt.z + d ),//P1 links vorne oben
            new calc3D.Punkt(this.mittelpunkt.x - d,
                this.mittelpunkt.y - d,
                this.mittelpunkt.z - d),//P2
            new calc3D.Punkt(this.mittelpunkt.x + d,
                this.mittelpunkt.y - d,
                this.mittelpunkt.z - d),//P3
            new calc3D.Punkt(this.mittelpunkt.x + d,
                this.mittelpunkt.y - d,
                this.mittelpunkt.z + d),//P4
            new calc3D.Punkt(this.mittelpunkt.x + d,
                this.mittelpunkt.y + d,
                this.mittelpunkt.z + d),//P5
            new calc3D.Punkt(this.mittelpunkt.x + d,
                this.mittelpunkt.y + d,
                this.mittelpunkt.z - d),//P6
            new calc3D.Punkt(
                this.mittelpunkt.x - d,
                this.mittelpunkt.y + d,
                this.mittelpunkt.z - d),//P7
            new calc3D.Punkt(this.mittelpunkt.x - d,
                this.mittelpunkt.y + d,
                this.mittelpunkt.z + d)//P8
        ];
        // faces stellen die zu zeichnenden Seiten des Wuerfels dar. Es werden sechs Seiten,
        // definiert durch vier Punkte, erstellt. Hier werden nur Referenzen, keine Werte zugewiesen!
        // ansonsten muesste man diese Faces bei Punktaenderung jedesmal mit aendern
        this.faces = [
            [this.punkte[0], this.punkte[1], this.punkte[2], this.punkte[3]], // vorne
            [this.punkte[3], this.punkte[2], this.punkte[5], this.punkte[4]], // hinten
            [this.punkte[4], this.punkte[5], this.punkte[6], this.punkte[7]], // oben
            [this.punkte[7], this.punkte[6], this.punkte[1], this.punkte[0]], // unten
            [this.punkte[7], this.punkte[0], this.punkte[3], this.punkte[4]], // links
            [this.punkte[1], this.punkte[6], this.punkte[5], this.punkte[2]]  // rechts
        ];

        this.initPfade = function () {
            var dx = (window.innerWidth / 2);
            var dy = (window.innerHeight / 2);
            for (var i = 0, n_faces = this.faces.length; i < n_faces; ++i) {
                var face = this.faces[i];
                var pfad = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                pfad.addEventListener("click", function (e) {
                    this.setAttribute("fill", "rgba(5, 190, 255, 0.2)");
                });
                this.pfade.push(pfad);
            }
        },
        this.initPfade(this);
        return this;
    },


    /**
     * rotiert den Wuerfel um die X- Achse
     * @param {number} wx Winkel in Grad
     */
    dreheumX : function (modellMatrix,wx) {
        var radX = wx * (Math.PI / 180);
        for (var i = 0, max = modellMatrix.punkte.length; i < max; i++) {
            var x, y, z;
            x = modellMatrix.punkte[i].x;
            y = ((Math.cos(radX) * (modellMatrix.punkte[i].y - modellMatrix.mittelpunkt.y)) -
                (Math.sin(radX) * (modellMatrix.punkte[i].z - modellMatrix.mittelpunkt.z))) +
                modellMatrix.mittelpunkt.y;
            z = ((Math.sin(radX) * (modellMatrix.punkte[i].y - modellMatrix.mittelpunkt.y)) +
                (Math.cos(radX) * (modellMatrix.punkte[i].z - modellMatrix.mittelpunkt.z))) +
                modellMatrix.mittelpunkt.z;
            modellMatrix.punkte[i].x = parseFloat(x);
            modellMatrix.punkte[i].y = parseFloat(y);
            modellMatrix.punkte[i].z = parseFloat(z);
        }
    },
    dreheumXumPunkt : function (modellMatrix,wx,punkt) {
        var radX = wx * (Math.PI / 180);
        for (var i = 0, max = modellMatrix.punkte.length; i < max; i++) {
            var x, y, z;
            x = modellMatrix.punkte[i].x;
            y = ((Math.cos(radX) * (modellMatrix.punkte[i].y -modellMatrix.mittelpunkt.y- punkt.y)) -
                (Math.sin(radX) * (modellMatrix.punkte[i].z - modellMatrix.mittelpunkt.z-punkt.z))) +
                punkt.y;
            z = ((Math.sin(radX) * (modellMatrix.punkte[i].y - modellMatrix.mittelpunkt.y-punkt.y)) +
                (Math.cos(radX) * (modellMatrix.punkte[i].z - modellMatrix.mittelpunkt.z-punkt.z))) +
                punkt.z;
            modellMatrix.punkte[i].x = parseFloat(x);
            modellMatrix.punkte[i].y = parseFloat(y);
            modellMatrix.punkte[i].z = parseFloat(z);
        }
    },
    /**
     * rotiert den W�rfel um die Y- Achse
     * @param {number} wy Winkel in Grad
     */
    dreheumY : function (modellMatrix,wy) {
        var radY = wy * (Math.PI / 180);
        for (var i = 0, max = modellMatrix.punkte.length; i < max; i++) {
            var x, y, z;
            x = (Math.cos(radY) * (modellMatrix.punkte[i].x - modellMatrix.mittelpunkt.x)) +
                (Math.sin(radY) * (modellMatrix.punkte[i].z - modellMatrix.mittelpunkt.z)) +
                modellMatrix.mittelpunkt.x;
            y = modellMatrix.punkte[i].y;
            z = (-Math.sin(radY) * (modellMatrix.punkte[i].x - modellMatrix.mittelpunkt.x)) +
                (Math.cos(radY) * (modellMatrix.punkte[i].z - modellMatrix.mittelpunkt.z)) +
                modellMatrix.mittelpunkt.z;
            modellMatrix.punkte[i].x = parseFloat(x);
            modellMatrix.punkte[i].y = parseFloat(y);
            modellMatrix.punkte[i].z = parseFloat(z);
        }
    },
    dreheumYumPunkt : function (modellMatrix,wy,Punkt) {
        var radY = wy * (Math.PI / 180);
        for (var i = 0, max = modellMatrix.punkte.length; i < max; i++) {
            var x, y, z;
            x = (Math.cos(radY) * (modellMatrix.punkte[i].x - Punkt.x)) +
                (Math.sin(radY) * (modellMatrix.punkte[i].z - Punkt.z)) +
                Punkt.x;
            y = modellMatrix.punkte[i].y;
            z = (-Math.sin(radY) * (modellMatrix.punkte[i].x - Punkt.x)) +
                (Math.cos(radY) * (modellMatrix.punkte[i].z - Punkt.z)) +
                Punkt.z;
            modellMatrix.punkte[i].x = parseFloat(x);
            modellMatrix.punkte[i].y = parseFloat(y);
            modellMatrix.punkte[i].z = parseFloat(z);
        }
    },
    /**
     * rotiert den W�rfel um die Z- Achse
     * @param {number} wz Winkel in Grad
     */
    dreheumZ : function (modellMatrix,wz ) {

        var radZ = wz * (Math.PI / 180);
        for (var i = 0, max = modellMatrix.punkte.length; i < max; i++) {
            var x, y, z;
            x = (Math.cos(radZ) * (modellMatrix.punkte[i].x - modellMatrix.mittelpunkt.x)) -
                (Math.sin(radZ) * (modellMatrix.punkte[i].y - modellMatrix.mittelpunkt.y)) +
                modellMatrix.mittelpunkt.x;
            y = (Math.sin(radZ) * (modellMatrix.punkte[i].x - modellMatrix.mittelpunkt.x)) +
                (Math.cos(radZ) * (modellMatrix.punkte[i].y - modellMatrix.mittelpunkt.y)) +
                modellMatrix.mittelpunkt.y;
            z = modellMatrix.punkte[i].z;
            modellMatrix.punkte[i].x = parseFloat(x);
            modellMatrix.punkte[i].y = parseFloat(y);
            modellMatrix.punkte[i].z = parseFloat(z);
        }
    },
    dreheumZumPunkt : function (modellMatrix,wz,Punkt) {

        var radZ = wz * (Math.PI / 180);
        for (var i = 0, max = modellMatrix.punkte.length; i < max; i++) {
            var x, y, z;
            x = (Math.cos(radZ) * (modellMatrix.punkte[i].x - Punkt.x)) -
                (Math.sin(radZ) * (modellMatrix.punkte[i].y - Punkt.y)) +
                Punkt.x;
            y = (Math.sin(radZ) * (modellMatrix.punkte[i].x - Punkt.x)) +
                (Math.cos(radZ) * (modellMatrix.punkte[i].y - Punkt.y)) +
                Punkt.y;
            z = modellMatrix.punkte[i].z;
            modellMatrix.punkte[i].x = parseFloat(x);
            modellMatrix.punkte[i].y = parseFloat(y);
            modellMatrix.punkte[i].z = parseFloat(z);
        }
    },
    /**
     * Projeziert einen Punkt von R3 in R2
     * @param {Punkt} P
     */
    project: function (P) {
        if(P == undefined){
            console.log("point to project: ", P.toSource())
        }
        var x=(P.x * calc3D.camera.h() + calc3D.camera.P.x) * calc3D.camera.zoom;
        var y=(P.y * calc3D.camera.h() + calc3D.camera.P.y)* calc3D.camera.zoom;
        var z=(P.z * (calc3D.camera.far / (calc3D.camera.near - calc3D.camera.far))) + (calc3D.camera.near * calc3D.camera.far/(calc3D.camera.near-calc3D.camera.far))+ calc3D.camera.P.z;
        var pt = new calc3D.Punkt2D(x/z, y/z);

        return pt;
    },
    refreshPfade: function(){
        for(var i = 0; i<calc3D.worldmatrix.length;i++){
            calc3D.updatePfade(calc3D.worldmatrix[i]);
        }
    },
    updatePfade : function (modellMatrix,fill_farbe, stroke_farbe) {
        fill_farbe = fill_farbe === undefined ?
            this.farbe : fill_farbe;

        stroke_farbe = stroke_farbe === undefined ?
            "rgba(125,125,125,0.5)" : stroke_farbe;

        var dx = (window.innerWidth / 2);
        var dy = (window.innerHeight / 2);
        for (var i = 0; i < modellMatrix.pfade.length; ++i) {
            var face = modellMatrix.faces[i];
            modellMatrix.pfade[i].setAttribute("fill", fill_farbe);
            modellMatrix.pfade[i].setAttribute("stroke", stroke_farbe);
            var P = calc3D.project(face[0]);
            var pfadstr = "M " + (P.x + dx) + " " + (-P.y + dy) + " ";
            for (var k = 1; k < face.length; k++) {
                if(face[k] !== undefined){
                    P = calc3D.project(face[k]);
                }
                else{
                    console.log(face)
                }
                pfadstr += "L " + (P.x + dx) + " " + (-P.y + dy) + " ";
            }
            modellMatrix.pfade[i].setAttribute("d", pfadstr + " Z");
        }
    },
    druckePfade: function () {
        for (var i = 0, max = calc3D.worldmatrix.length; i < max; i++) {
            var model = calc3D.worldmatrix[i];
            for (var j = 0; j < model.pfade.length; j++) {
                this.leinwand.appendChild(model.pfade[j]);
            }
        }
    },
    // Schalter f�r autorotation
    _autorotation: false,
    /**
     * Rotiert alle wuerfel an allen Achsen
     */
    autorotation:function(intervall) {
        calc3D._autorotation = true;
        var stop = setInterval(function () {
            for (var i = 0, n_wuerfel = calc3D.worldmatrix.length; i < n_wuerfel; i++) {
                calc3D.dreheumX(calc3D.worldmatrix[i],5);
                calc3D.dreheumY(calc3D.worldmatrix[i],5);
                calc3D.dreheumZ(calc3D.worldmatrix[i],5);
            }
            calc3D.refreshPfade();
            if (calc3D._autorotation === false)
                clearInterval(stop);
        },intervall);
    },
    autorotationum:function(intervall,punkt) {
        calc3D._autorotation = true;
        var stop = setInterval(function () {
            for (var i = 0, n_wuerfel = calc3D.worldmatrix.length; i < n_wuerfel; i++) {
                var zufall = Math.floor(Math.random() * Math.floor(4));
                switch (zufall){
                    case 0:
                        calc3D.dreheumXumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        calc3D.dreheumYumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        calc3D.dreheumZumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        break;
                    case 1:
                        calc3D.dreheumYumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        calc3D.dreheumXumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        calc3D.dreheumZumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        break;
                    case 2:
                        calc3D.dreheumYumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        calc3D.dreheumZumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        calc3D.dreheumXumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        break;
                    default:
                        calc3D.dreheumZumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        calc3D.dreheumYumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        calc3D.dreheumXumPunkt(calc3D.worldmatrix[i],zufall,punkt);
                        break;
                }
            }
            calc3D.refreshPfade();
            if (calc3D._autorotation === false)
                clearInterval(stop);
        },intervall);
    },
    _autoupdate:false,
    autoupdate: function (intervall) {
        calc3D._autoupdate = true;
        var stop = setInterval(function () {
            this.refreshPfade();
            if (calc3D._autoupdate === false)
                clearInterval(stop);
        }, intervall);
    }
};
