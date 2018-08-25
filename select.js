var selectionEles = null;
var selectionMode = false;

function initSelect()
{
	selectionEles = document.getElementsByClassName("selectClass");
}

function selectOnChange(ev)
{
	console.log("selectOnChange(", ev, ")");
	ev.stopPropagation();
}

function selectButtonOnClick(ev)
{
	console.log("selectButtonOnClick(", ev, ")");
	selectionMode = !selectionMode;
	for (var e of selectionEles) {
		if (selectionMode) {
			e.style.display = "table-cell";
		} else {
			e.style.display = "none";
			e.firstElementChild.checked = false;
		}
	}
}
