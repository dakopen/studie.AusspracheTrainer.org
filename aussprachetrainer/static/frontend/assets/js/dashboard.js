function addInfoToolboxesToIcons(){
    const infoIcons = document.querySelectorAll(".fas.fa-info-circle");
    console.log(infoIcons)

    infoIcons.forEach((icon) => {
      icon.addEventListener("mouseenter", function(event) {
        const parentDiv = event.target.closest(".jarode-items-percent");
        const hoverText = parentDiv.dataset.hoverText;
        const tooltip = document.createElement("div");
  
        tooltip.className = "tooltip";
        tooltip.innerText = hoverText;
        tooltip.style.backgroundColor = parentDiv.dataset.textColor
        updateTooltipColor(parentDiv.dataset.textColor)

        //icon.appendChild(tooltip);
        parentDiv.appendChild(tooltip);
      });
  
      icon.addEventListener("mouseleave", function(event) {
        const parentDiv = event.target.closest(".jarode-items-percent");
        //const tooltip = icon.querySelector('.tooltip');
        const tooltip = parentDiv.querySelector(".tooltip");
        if (tooltip) {
          parentDiv.removeChild(tooltip);
          //tooltip.remove();
        }
      });
    });
  }
  

function updateTooltipColor(newColor) {
    var style = document.createElement('style');
    style.innerHTML = `
        .tooltip::before {
        border-top: 10px solid ${newColor};
        }
    `;
    document.head.appendChild(style);
}