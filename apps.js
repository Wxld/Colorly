//Global selections and variable
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
let initialColors;
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const popup = document.querySelector(".copy-container");
const sliderContainers = document.querySelectorAll(".sliders");
let savedPalettes = [];

//add event listeners
generateBtn.addEventListener("click", randomColors);

lockButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    colorDivs[index].classList.toggle("locked");
    button.classList.toggle("closed");
    if (button.classList.contains("closed")) {
      //change to closed lock
      button.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
      //change back to open clock
      button.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
  });
});

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

//Functions

//Generating Hex Color
function generateHex() {
  /*
    const letters = "0123456789ABCDEF";
    let color = "#";
    for(let i=0; i<6; i++){
        color += letters[ Math.floor( Math.random() * 16 ) ];
    }
    return color;
    */
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    //How to get hex value from object

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    checkTextContrast(randomColor, hexText);

    //Slider initial
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");

    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  //Reset Inputs
  resetInputs();
  //check for button contrast
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
}

function colorizeSliders(color, hue, brightness, saturation) {
  //scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  //scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //scale hue

  //update sliders
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;

  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance >= 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  const color = chroma(bgColor)
    .set("hsl.h", hue.value)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value);

  colorDivs[index].style.backgroundColor = color;

  colorizeSliders(color, hue, brightness, saturation);
  //console.log(bgColor);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  //const colorText =
  textHex.innerText = color;
  checkTextContrast(color, textHex);
  //console.log(icons);
  for (i of icons) {
    checkTextContrast(color, i);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = hueValue;
    } else if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = satValue;
    } else if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = brightValue;
    }
  });
}

function copyToClipboard(hex) {
  //copying the text
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  //popup
  const popupBox = popup.children[0];
  console.log(popupBox);
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

//implement save to palette and LOCAL STORAGE
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

//event Listener
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function savePalette() {
  const name = saveInput.value;
  saveInput.value = "";
  if (name.length == 0) {
    alert("Name cannot be empty");
  } else {
    const colors = [];
    currentHexes.forEach((hex) => {
      colors.push(hex.innerText);
    });
    //Generate object

    let paletteNr;
    const paletteObjects=JSON.parse(localStorage.getItem("palettes"));
    if(paletteObjects){
        paletteNr=paletteObjects.length;
    }else{
        paletteNr = savedPalettes.length;
    }

    const paletteObj = { name, colors, nr: paletteNr };

    savedPalettes.push(paletteObj);
    //Save to local storage
    saveToLocal(paletteObj);

    closePalette();

    //generate the palette to the library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");

    const title = document.createElement("h4");
    title.innerText = paletteObj.name;

    const preview = document.createElement("div");
    preview.classList.add("small-preview");

    paletteObj.colors.forEach((smallColor) => {
      const smallDiv = document.createElement("div");
      smallDiv.style.backgroundColor = smallColor;
      preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";

    //Attach event on the btn
    paletteBtn.addEventListener("click", (e) => {
      closeLibrary();
      const paletteIndex = e.target.classList[1];
      initialColors = [];
      savedPalettes[paletteIndex].colors.forEach((color, index) => {
        initialColors.push(color);
        colorDivs[index].style.backgroundColor = color;
        const text = colorDivs[index].children[0];
        checkTextContrast(color, text);
        updateTextUI(index);
      });
      resetInputs();
    });

    //Append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
  }
}

function saveToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function closePalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}

function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
    if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
        //creating copy 
        savedPalettes=[...paletteObjects];
        paletteObjects.forEach((paletteObj) => {
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");

            const title = document.createElement("h4");
            title.innerText = paletteObj.name;

            const preview = document.createElement("div");
            preview.classList.add("small-preview");

            paletteObj.colors.forEach((smallColor) => {
                const smallDiv = document.createElement("div");
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });
            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";

        //Attach event on the btn
            paletteBtn.addEventListener("click", (e) => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateTextUI(index);
                });
                resetInputs();
            });

            //Append to library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
    }
}
getLocal();
randomColors();
