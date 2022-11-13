
function matrixFunction(a) {
  return function (b) {
    var c = b[0],
      d = b[1],
      e = b[2];
    return [
      (c * a.R[0]) / 100 + (d * a.R[1]) / 100 + (e * a.R[2]) / 100,
      (c * a.G[0]) / 100 + (d * a.G[1]) / 100 + (e * a.G[2]) / 100,
      (c * a.B[0]) / 100 + (d * a.B[1]) / 100 + (e * a.B[2]) / 100,
    ];
  };
}

function clearImageCache() {
  (imageCache = {}), (urlCache = {});
}

function getFilteredImage(a, b, c) {
  if ((console.log("getFilteredImage"), b in imageCache))
    c(imageCache[b], urlCache[b]);
  else if ("hcirnNormal" === b || "simplNormal" === b)
    (imageCache[b] = a), (urlCache[b] = "#"), c(a, "#");
  else {
    createFilteredImage(a, b, function (a, d) {
      (imageCache[b] = a), (urlCache[b] = d), c(a, d);
    });
  }
}

function createFilteredImage(a, b, c) {
  console.log("createFilteredImage");
  var d = getFilterFunction(b),
    e = document.createElement("canvas"),
    f = a.naturalWidth,
    g = a.naturalHeight;
  e.setAttribute("width", f), e.setAttribute("height", g);
  var h = e.getContext("2d");
  h.drawImage(a, 0, 0);
  var i = h.getImageData(0, 0, f, g),
    j = Math.max(Math.floor(i.data.length / 5), 1),
    k = 0;
  setTimeout(function a() {
    for (var b = Math.min(k + j, i.data.length); k < b; k += 4) {
      var f = [i.data[k], i.data[k + 1], i.data[k + 2]];
      (filteredRGB = d(f)),
        (i.data[k] = filteredRGB[0]),
        (i.data[k + 1] = filteredRGB[1]),
        (i.data[k + 2] = filteredRGB[2]);
    }
    if ((NProgress.set(0.2 + 0.8 * (k / i.data.length)), k < i.data.length))
      setTimeout(a, 0);
    else {
      h.putImageData(i, 0, 0);
      var g = e.toDataURL();
      console.log(g);
      var l = new Image();
      (l.onload = function () {
        c(this, g);
      }),
        (l.src = g);
    }
  }, 0);
}

function getFilterFunction(a) {
  var b;
  if ("hcirn" === a.substring(0, 5)) b = fBlind;
  else {
    if ("simpl" !== a.substring(0, 5)) throw "Invalid Filter Type!";
    b = colorMatrixFilterFunctions;
  }
  if (((a = a.substring(5)), a in b)) return b[a];
  throw "Library does not support Filter Type: " + a;
}


function filterOrImageChanged() {
  var a = document.querySelector(
    'input[name = "colorblindType"]:checked'
  ).value,
    b = "hcirn" + a;
  currentImage
    ? ((document.getElementById("container").style.background = "none"),
      (document.getElementById("lens-no").disabled = !1),
      (document.getElementById("lens-normal").disabled = !1),
      (document.getElementById("lens-inverse").disabled = !1),
      (document.getElementById("imageLink").style.display =
        "Normal" === a ? "none" : "inline"),
      (loadingIndicator.style.display = "inline"),
      NProgress.set(0.2),
      setTimeout(function () {
        getFilteredImage(currentImage, b, function (a, b) {
          (document.getElementById("imageLink").href = b),
            panZoomImage.displayImage(a),
            NProgress.done(),
            (loadingIndicator.style.display = "none");
        });
      }, 0))
    : (document.getElementById("container").style.backgroundImage =
      "url('img/crayons-" + a + ".jpg')");
}


function lensChanged() {
  var a = document.querySelector('input[name = "lens"]:checked').value;
  if ("No" === a) panZoomImage.lens = 0;
  else if ("Normal" === a) panZoomImage.lens = 1;
  else {
    if ("Inverse" !== a) throw "Illegal Lens Type";
    panZoomImage.lens = 2;
  }
  panZoomImage.redraw();
}


function readFile(a) {
  if (FileReader && a && a.length) {
    if (1 !== a.length) return void alert("Can only show one file at a time");
    if (!a[0].type.match("image.*"))
      return void alert("Was not an image file. :(");
    NProgress.set(0);
    var b = new FileReader();
    (b.onload = function () {
      var a = new Image();
      (a.onload = function () {
        (currentImage = this),
          panZoomImage.setHiddenLensImage(currentImage),
          clearImageCache(),
          filterOrImageChanged(),
          panZoomImage.initialZoom(currentImage);
      }),
        (a.src = b.result);
    }),
      b.readAsDataURL(a[0]);
  } else alert("Your Browser does not support the required Features.");
}

function blindMK(a, b) {
  var d = 0.312713,
    e = 0.329016,
    f = 0.358271,
    g = a[2],
    h = a[1],
    i = a[0],
    j = powGammaLookup[i],
    k = powGammaLookup[h],
    l = powGammaLookup[g],
    m = 0.430574 * j + 0.34155 * k + 0.178325 * l,
    n = 0.222015 * j + 0.706655 * k + 0.07133 * l,
    o = 0.020183 * j + 0.129553 * k + 0.93918 * l,
    p = m + n + o,
    q = 0,
    r = 0;
  0 != p && ((q = m / p), (r = n / p));
  var u,
    s = (d * n) / e,
    t = (f * n) / e,
    v = 0;
  u =
    q < rBlind[b].cpu
      ? (rBlind[b].cpv - r) / (rBlind[b].cpu - q)
      : (r - rBlind[b].cpv) / (q - rBlind[b].cpu);
  var w = r - q * u,
    x = (rBlind[b].ayi - w) / (u - rBlind[b].am),
    y = u * x + w,
    z = (x * n) / y,
    A = n,
    B = ((1 - (x + y)) * n) / y,
    C = 3.063218 * z - 1.393325 * A - 0.475802 * B,
    D = -0.969243 * z + 1.875966 * A + 0.041555 * B,
    E = 0.067871 * z - 0.228834 * A + 1.069251 * B,
    F = s - z,
    G = t - B;
  (dr = 3.063218 * F - 1.393325 * v - 0.475802 * G),
    (dg = -0.969243 * F + 1.875966 * v + 0.041555 * G),
    (db = 0.067871 * F - 0.228834 * v + 1.069251 * G);
  var H = dr ? ((C < 0 ? 0 : 1) - C) / dr : 0,
    I = dg ? ((D < 0 ? 0 : 1) - D) / dg : 0,
    J = db ? ((E < 0 ? 0 : 1) - E) / db : 0,
    K = Math.max(
      H > 1 || H < 0 ? 0 : H,
      I > 1 || I < 0 ? 0 : I,
      J > 1 || J < 0 ? 0 : J
    );
  return (
    (C += K * dr),
    (D += K * dg),
    (E += K * db),
    [inversePow(C), inversePow(D), inversePow(E)]
  );
}


function inversePow(a) {
  return 255 * (a <= 0 ? 0 : a >= 1 ? 1 : Math.pow(a, 1 / 2.2));
}

var ColorMatrixMatrixes = {
//metric for each type of color blind (dichromcy)
//that simulate what each type what sees
  Normal: {
    R: [ 100,    0    ,  0     ],
    G: [ 0  ,   100   ,  0     ],
    B: [ 0  ,    0    ,  100   ]
  },

  Protanopia: {
    R: [ 0.0 , 2.02344,-2.52581],
    G: [ 0.0 ,   1.0  ,  0.0   ],
    B: [ 0.0 ,   0.0  ,  1.0   ],
  },

  Deuteranopia: {
    R: [ 62.5,  37.5  ,   0    ],
    G: [ 70  ,  30    ,   0    ],
    B: [ 0   ,  30    ,   70   ]
  },

  Tritanopia: {
    R: [ 95  ,    5   ,   0    ],
    G: [ 0   ,  43.333,  56.667],
    B: [ 0   , 47.5   ,  52.5  ]
  },
},

  colorMatrixFilterFunctions = {};
for (var t in ColorMatrixMatrixes)
  ColorMatrixMatrixes.hasOwnProperty(t) &&
    (colorMatrixFilterFunctions[t] = matrixFunction(ColorMatrixMatrixes[t]));
var imageCache = {},
  urlCache = {},
  loadingIndicator = document.getElementById("loadingIndicator");
NProgress.configure({ parent: "#progressBar" }),
  (function () {
    var b,
      a = document.querySelectorAll('input[name = "colorblindType"]');
    for (b = 0; b < a.length; b++) a[b].onclick = filterOrImageChanged;
    for (
      a = document.querySelectorAll('input[name = "lens"]'), b = 0;
      b < a.length;
      b++
    )
      a[b].onclick = lensChanged;
  })();


var fileInput = document.getElementById("fileInput"),
  currentImage;

fileInput.onchange = function (a) {
  var b = a.target || window.event.srcElement,
    c = b.files;
  readFile(c);
};

var canvasDiv = document.getElementById("canvasDiv");
canvasDiv.addEventListener(
  "drop",
  function (a) {
    a.stopPropagation(), a.preventDefault(), readFile(a.dataTransfer.files);
  },
  !1
),
  canvasDiv.addEventListener(
    "dragover",
    function (a) {
      a.stopPropagation(),
        a.preventDefault(),
        (a.dataTransfer.dropEffect = "copy");
    },
    !1
  ),
  canvasDiv.addEventListener("dragleave", function (a) { }, !1),
  (document.onpaste = function (a) {
    for (
      var b = (a.clipboardData || a.originalEvent.clipboardData).items,
      c = null,
      d = 0;
      d < b.length;
      d++
    )
      0 === b[d].type.indexOf("image") && (c = b[d].getAsFile());
    null !== c && readFile([c]);
  });
var rBlind = {
  protan: { cpu: 0.735, cpv: 0.265, am: 1.273463, ayi: -0.073894 },
  deutan: { cpu: 1.14, cpv: -0.14, am: 0.968437, ayi: 0.003331 },
  tritan: { cpu: 0.171, cpv: -0.003, am: 0.062921, ayi: 0.292119 },
},
  fBlind = {
    Normal: function (a) {
      return a;
    },
    Protanopia: function (a) {
      return blindMK(a, "protan");
    },

    Deuteranopia: function (a) {
      return blindMK(a, "deutan");
    },

    Tritanopia: function (a) {
      return blindMK(a, "tritan");
    },

  };
(powGammaLookup = Array(256)),
  (function () {
    var a;
    for (a = 0; a < 256; a++) powGammaLookup[a] = Math.pow(a / 255, 2.2);
  })(),
  (panZoomImage = {
    canvas: document.getElementById("outCanvas"),
    lastX: 0,
    lastY: 0,
    translateX: 0,
    translateY: 0,
    scale: 1,
    dragged: !1,
    lens: 0,
  }),
  (panZoomImage.displayImage = function (b) {
    (this.ctx = this.canvas.getContext("2d")),
      (this.currentImage = b),
      this.onresize(),
      this.redraw();
  }),
  (panZoomImage.resetView = function () {
    this.currentImage &&
      ((this.translateX = 0),
        (this.translateY = 0),
        (this.scale = 1),
        this.onresize(),
        this.currentImage.width > this.currentImage.height
          ? (this.scale = this.canvas.width / this.currentImage.width)
          : ((this.scale = this.canvas.height / this.currentImage.height),
            (this.translateX =
              (this.canvas.width - this.scale * this.currentImage.width) / 2)),
        this.redraw());
  }),
  (panZoomImage.initialZoom = function (b) {
    (this.ctx = this.canvas.getContext("2d")),
      (this.currentImage = b),
      this.resetView();
  }),
  (panZoomImage.setHiddenLensImage = function (b) {
    (this.hiddenLensImage = b), this.redraw();
  }),
  (panZoomImage.onresize = function () {
    (this.canvas.style.width = "100%"),
      (this.canvas.style.height = "100%"),
      (this.canvas.width = this.canvas.offsetWidth),
      (this.canvas.height = this.canvas.offsetHeight),
      this.redraw();
  }),
  window.addEventListener(
    "resize",
    function () {
      panZoomImage.onresize();
    },
    !1
  ),
  window.addEventListener(
    "load",
    function () {
      panZoomImage.onresize();
    },
    !1
  ),
  (panZoomImage.getFullImage = function () {
    return 0 === this.lens || 1 === this.lens
      ? this.currentImage
      : this.hiddenLensImage;
  }),
  (panZoomImage.getLensImage = function () {
    return 2 === this.lens ? this.currentImage : this.hiddenLensImage;
  }),
  (panZoomImage.clearImage = function () {
    this.currentImage &&
      this.ctx.clearRect(
        this.translateX,
        this.translateY,
        this.scale * this.currentImage.width,
        this.scale * this.currentImage.height
      );
  }),
  (panZoomImage.drawImageAndLens = function () {
    if (this.currentImage) {
      var c = (this.getLensImage(), this.getFullImage());
      this.ctx.drawImage(
        c,
        0,
        0,
        this.currentImage.width,
        this.currentImage.height,
        this.translateX,
        this.translateY,
        this.currentImage.width * this.scale,
        this.currentImage.height * this.scale
      ),
        (1 !== this.lens && 2 !== this.lens) || this.drawLens();
    }
  }),
  (panZoomImage.clearLens = function () {
    this.currentImage &&
      this.ctx.drawImage(
        this.getFullImage(),
        (this.lastX - this.translateX - 50) / this.scale,
        (this.lastY - this.translateY - 50) / this.scale,
        100 / this.scale,
        100 / this.scale,
        this.lastX - 50,
        this.lastY - 50,
        100,
        100
      );
  }),
  (panZoomImage.drawLens = function () {
    this.currentImage &&
      0 !== this.lens &&
      (this.ctx.save(),
        this.ctx.beginPath(),
        this.ctx.arc(this.lastX, this.lastY, 50, 0, 2 * Math.PI),
        this.ctx.clip(),
        this.ctx.drawImage(
          this.getLensImage(),
          (this.lastX - this.translateX - 50) / this.scale,
          (this.lastY - this.translateY - 50) / this.scale,
          100 / this.scale,
          100 / this.scale,
          this.lastX - 50,
          this.lastY - 50,
          100,
          100
        ),
        this.ctx.restore());
  }),
  (panZoomImage.redraw = function () {
    this.currentImage &&
      (this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height),
        this.drawImageAndLens());
  }),

  panZoomImage.canvas.addEventListener(
    "mousedown",
    function (a) {
      (document.body.style.mozUserSelect =
        document.body.style.webkitUserSelect =
        document.body.style.userSelect =
        "none"),
        (panZoomImage.lastX =
          a.offsetX || a.pageX - panZoomImage.canvas.offsetLeft),
        (panZoomImage.lastY =
          a.offsetY || a.pageY - panZoomImage.canvas.offsetTop),
        (panZoomImage.dragStart = {
          x: panZoomImage.lastX,
          y: panZoomImage.lastY,
        }),
        (panZoomImage.dragged = !1);
    },
    !1
  ),

  panZoomImage.canvas.addEventListener(
    "mousemove",
    function (a) {
      var b = a.offsetX || a.pageX - panZoomImage.canvas.offsetLeft,
        c = a.offsetY || a.pageY - panZoomImage.canvas.offsetTop;
      (panZoomImage.dragged = !0),
        panZoomImage.dragStart
          ? (panZoomImage.clearImage(),
            (panZoomImage.translateX += b - panZoomImage.lastX),
            (panZoomImage.translateY += c - panZoomImage.lastY),
            panZoomImage.drawImageAndLens())
          : panZoomImage.clearLens(),
        (panZoomImage.lastX = b),
        (panZoomImage.lastY = c),
        panZoomImage.dragStart || panZoomImage.drawLens();
    },
    !1
  ),
  (panZoomImage.zoom = function (a) {
    if (this.currentImage) {
      this.clearImage();
      var b = this.scale;
      (this.scale *= Math.pow(1.1, a)),
        (this.translateX +=
          (this.translateX - this.lastX) * (this.scale / b - 1)),
        (this.translateY +=
          (this.translateY - this.lastY) * (this.scale / b - 1)),
        this.drawImageAndLens();
    }
  }),
  panZoomImage.canvas.addEventListener(
    "mouseup",
    function (a) {
      (panZoomImage.dragStart = null),
        panZoomImage.dragged || panZoomImage.zoom(a.shiftKey ? -1 : 1);
    },
    !1
  );
var handleScroll = function (a) {
  var b = a.wheelDelta ? a.wheelDelta / 40 : a.detail ? -a.detail : 0;
  return b && panZoomImage.zoom(b), a.preventDefault() && !1;
};
panZoomImage.canvas.addEventListener("DOMMouseScroll", handleScroll, !1),
  panZoomImage.canvas.addEventListener("mousewheel", handleScroll, !1);
