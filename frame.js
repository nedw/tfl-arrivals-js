
class Frame {
    constructor() {
        this._div_ele = document.createElement("div");
    }

    clear() {
        this._div_ele.innerHTML = "";
    }

    setHTML(s) {
        this._div_ele.innerHTML = s;
    }

    // Note: slow - use sparingly
    appendHTML(s) {
        this._div_ele.innerHTML += s;
    }

    appendNode(node) {
        this._div_ele.appendChild(node);
    }

    getElementsByTag(tag) {
        return this._div_ele.getElementsByTagName(tag);
    }

    addToBody() {
        document.body.appendChild(this._div_ele);
    }
}