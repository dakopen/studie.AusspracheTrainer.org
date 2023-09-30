// source: https://jarode.fr/libraries/percentage (slightly modified)
function jarodeItemsInit(parameters = {}) {

    let pourcentItems = document.querySelectorAll(".jarode-items-percent");

    let style;

    if (document.querySelectorAll('style')[0]) {
        style = document.querySelectorAll('style')[0];
    } else {
        style = document.createElement("style");
        document.querySelector('head').appendChild(style);
    }

    let keyFrames;

    if (pourcentItems.length) {

        for (let i=0; i < pourcentItems.length; i++) {

            createPourcentBox(pourcentItems[i] , parameters );

            let number =  pourcentItems[i].dataset.number;
            let dashoffsetCircle =  circleDashoffset(pourcentItems[i]);
            let dashoffsetNumber =  dashoffsetCircle - ((dashoffsetCircle/100)*number);

            pourcentItems[i].dataset.index = ""+i;

            let  keyFrame ='\
@keyframes A_DYNAMIC_NAME_ONE { to {stroke-dashoffset: A_DYNAMIC_VALUE_ONE;}}\n\
@keyframes A_DYNAMIC_NAME_TWO { to {stroke-dashoffset: A_DYNAMIC_VALUE_TWO;}}\n';

            keyFrame = keyFrame.replace(/A_DYNAMIC_NAME_ONE/g, "circle" + i );
            keyFrame = keyFrame.replace(/A_DYNAMIC_VALUE_ONE/g, ""+dashoffsetNumber );
            keyFrame = keyFrame.replace(/A_DYNAMIC_NAME_TWO/g, "circleReverse" + i );
            keyFrame = keyFrame.replace(/A_DYNAMIC_VALUE_TWO/g, circleDashoffset(pourcentItems[i]) );

            keyFrames += keyFrame;

            let animationDuration = pourcentItems[i].dataset.duration ?  pourcentItems[i].dataset.duration : parameters.duration ? parameters.duration : 1 ;

            if (Number.isInteger(Number(number))) {
                animateValue(pourcentItems[i].children[0].children[0].children[1].children[0], 0, Number(number), Number(animationDuration+"000"));
            }

            pourcentItems[i].children[0].children[0].children[0].children[1].style.animation = 'circle'+i+' '+animationDuration+'s forwards';
            pourcentItems[i].dataset.onAnimate = "off"

        }

        keyFrames = keyFrames.replace(/undefined/g, "" );
        style.innerHTML += keyFrames;

    }
    addInfoToolboxesToIcons(); // function in dashboard.js
}

document.addEventListener('scroll', function () {
    let pourcentItems = document.querySelectorAll(".jarode-items-percent");
    for (let i=0; i < pourcentItems.length; i++) {
        elementInViewport(pourcentItems[i])
    }
}, {
    passive: true
});

function createPourcentBox(el , parameters = {} ){

    el.style.display = "flex";

    let divBox = document.createElement("div");

    divBox.classList.add("box");
    divBox.style.margin = el.dataset.boxMargin ? el.dataset.boxMargin : parameters.boxMargin ? parameters.boxMargin : "1rem 1rem auto 1rem";
    divBox.style.padding = el.dataset.boxPadding ? el.dataset.boxPadding : parameters.boxPadding ? parameters.boxPadding : "2rem";
    divBox.style.borderRadius = el.dataset.boxBorderRadius ? el.dataset.boxBorderRadius : parameters.boxBorderRadius ? parameters.boxBorderRadius : "20px";
    divBox.style.border = el.dataset.boxBorder ? el.dataset.boxBorder :  parameters.boxBorder ? parameters.boxBorder : "solid #e6e6e6 1px";
    divBox.style.background = el.dataset.boxBackground ? el.dataset.boxBackground : parameters.boxBackground ? parameters.boxBackground : "linear-gradient(145deg, #FFFFFF, #C1C3C6)";
    divBox.style.boxShadow = el.dataset.boxBoxShadow ? el.dataset.boxBoxShadow : parameters.boxBoxShadow ? parameters.boxBoxShadow : "0px 0px 10px #D9DADE";
    el.appendChild(divBox);

    let newDiv = document.createElement("div");
    newDiv.classList.add("circle-container");
    newDiv.style.position = "relative";
    newDiv.style.display = "flex";
    newDiv.style.justifyContent = "center";
    newDiv.style.margin="auto";
    divBox.appendChild(newDiv);

    const svgNS = "http://www.w3.org/2000/svg";
    let circleStrokeColor = el.dataset.circleStrokeColor ? el.dataset.circleStrokeColor : parameters.circleStrokeColor ? parameters.circleStrokeColor : "#2098D1";
    let circleStrokeBackground = el.dataset.circleStrokeBackground ? el.dataset.circleStrokeBackground :  parameters.circleStrokeBackground ? parameters.circleStrokeBackground : "#e7e7e7";
    let circleSize = el.dataset.circleSize ? el.dataset.circleSize : parameters.circleSize ? parameters.circleSize : 70;
    let circleBackground = el.dataset.circleBackground ? el.dataset.circleBackground :  parameters.circleBackground ? parameters.circleBackground : "none";
    let circleStrokeWidth =  parseInt(el.dataset.circleStrokeWidth ? el.dataset.circleStrokeWidth :   parameters.circleStrokeWidth ? parameters.circleStrokeWidth : 15);
    let circleDasharray = (circleSize*2)*Math.PI;
    let number = circleDasharray - ((circleDasharray/100)*el.dataset.number);
    el.dataset.circleDasharray = ""+number;

    const newSvg = document.createElementNS(svgNS,"svg");
    newSvg.setAttribute("xmlns",svgNS)
    newSvg.setAttributeNS(null,"class","circle");
    newSvg.setAttribute("height", ((circleSize*2)+circleStrokeWidth)+"px");
    newSvg.setAttribute("width", ((circleSize*2)+circleStrokeWidth)+"px");

    let myCircle = document.createElementNS(svgNS,"circle");
    myCircle.setAttributeNS(null,"cx",circleSize+"px");
    myCircle.setAttributeNS(null,"cy",circleSize+"px");
    myCircle.setAttributeNS(null,"r",circleSize+"px");

    myCircle.setAttribute("stroke", circleStrokeBackground);
    myCircle.setAttribute("fill", "none");
    myCircle.setAttribute("stroke-width", ""+circleStrokeWidth);
    myCircle.setAttribute("stroke-dasharray", ""+circleDasharray+"" );
    myCircle.style.transform = "translate("+circleStrokeWidth/2+"px, "+circleStrokeWidth/2+"px)";

    let myCircle2 = document.createElementNS(svgNS,"circle");
    myCircle2.setAttributeNS(null,"cx",circleSize+"px");
    myCircle2.setAttributeNS(null,"cy",circleSize+"px");
    myCircle2.setAttributeNS(null,"r",circleSize+"px");
    myCircle2.setAttribute("stroke", circleStrokeColor);
    myCircle2.setAttribute("fill", circleBackground);
    myCircle2.setAttribute("stroke-width", ""+circleStrokeWidth);
    myCircle2.style.transform = "translate("+circleStrokeWidth/2+"px, "+circleStrokeWidth/2+"px)";
    myCircle2.setAttribute("stroke-dasharray", ""+circleDasharray+"" );
    myCircle2.setAttribute("stroke-dashoffset", ""+circleDasharray+""  );
    myCircle2.style.strokeLinecap = "round";

    newSvg.appendChild(myCircle);
    newSvg.appendChild(myCircle2);
    newDiv.appendChild(newSvg);

    let numDiv =  document.createElement("div");
    numDiv.classList.add("innerNumber");
    numDiv.innerHTML = "<span class='pourcentText'>"+el.dataset.number+"</span>"; /// removed % sign after </span>
    numDiv.style.color =  el.dataset.numberColor ? el.dataset.numberColor :   parameters.numberColor ? parameters.numberColor : "#2098D1";
    numDiv.style.position = "absolute";
    numDiv.style.top = "50%";
    numDiv.style.left = "50%";
    numDiv.style.transform = "translate(-50%, -50%)";
    numDiv.style.fontSize =   el.dataset.numberSize ? el.dataset.numberSize : parameters.numberSize ? parameters.numberSize : "2.5rem";
    numDiv.style.fontWeight =    el.dataset.numberFontWeight ? el.dataset.numberFontWeight : parameters.numberFontWeight ? parameters.numberFontWeight : "500";
    if ( el.dataset.numberFontFamily ) {
        titreBox.style.fontFamily = el.dataset.numberFontFamily
    } else if ( parameters.numberFontFamily ) {
        titreBox.style.fontFamily = parameters.numberFontFamily
    }
    newDiv.appendChild(numDiv);

    let titreBox =  document.createElement("h1");
    titreBox.style.textAlign = "center";
    titreBox.style.margin = "2rem 0 0";
    titreBox.style.color = el.dataset.textColor ? el.dataset.textColor :  parameters.textColor ? parameters.textColor : "#2098D1";
    if ( el.dataset.textFontSize ) {
        titreBox.style.fontSize = el.dataset.textFontSize
    } else if ( parameters.textFontSize ) {
        titreBox.style.fontSize = parameters.textFontSize
    }
    if ( el.dataset.textFontFamily ) {
        titreBox.style.fontFamily = el.dataset.textFontFamily
    } else if ( parameters.textFontFamily ) {
        titreBox.style.fontFamily = parameters.textFontFamily
    }

    if (el.dataset.text) {
        titreBox.innerHTML = `${el.dataset.text} <i class="fas fa-info-circle"></i>`;
    } else {
    titreBox.style.display = "none";
    }
      
    divBox.appendChild(titreBox);

}

function animateValue(obj, start, end, duration) {
    if (start === end) return;
    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1; 
    let stepTime = Math.abs(Math.ceil(duration / range))/(1 + 10/(duration/100)); // does not work with 1/(duration/10) for whatever reason 
    let timer = setInterval(function() {
        current += increment;
        obj.innerHTML = current;
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}


function circleDashoffset(el) {
    return (el.children[0].children[0].children[0].children[0].r.animVal.value*2)*Math.PI;
}

function elementInViewport(el) {
    let bounding = el.getBoundingClientRect();
    let myElementHeightOn = el.offsetHeight*0.8;
    let myElementWidthOn = el.offsetWidth*0.8;

    if (bounding.top >= -myElementHeightOn
        && bounding.left >= -myElementWidthOn
        && bounding.right <= (window.innerWidth || document.documentElement.clientWidth) + myElementWidthOn
        && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) + myElementHeightOn) {

        if (el.dataset.onAnimate !== "off") {
            let animationDuration = el.dataset.duration ?  el.dataset.duration : 1 ;

            if (Number.isInteger(Number(el.dataset.number))) {
                animateValue(el.children[0].children[0].children[1].children[0], 0, Number(el.dataset.number), Number(animationDuration+"000"));
            }

            el.children[0].children[0].children[0].children[1].style.animation = 'circle'+el.dataset.index+' '+animationDuration+'s forwards';
            el.dataset.onAnimate = "off";
        }

    } else {

        animateValue(el.children[0].children[0].children[1].children[0], 0, 0, 0);
        el.children[0].children[0].children[0].children[1].style.animation = 'circleReverse'+el.dataset.index+' 0s forwards';
        el.dataset.onAnimate = "on";
    }
}