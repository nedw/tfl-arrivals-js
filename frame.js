
class Frame {
    constructor(id) {
        this._div_ele = document.createElement("div");
        this._div_ele.id = id;
    }

    // Note: slow - use sparingly
    appendHTML(s) {
        this._div_ele.innerHTML += s;
    }

    setHTML(s) {
        this._div_ele.innerHTML = s;
    }

    clear() {
        this._div_ele.innerHTML = "";
    }

    getElementsByTag(tag) {
        return this._div_ele.getElementsByTagName(tag);
    }

    addToBody() {
        document.body.appendChild(this._div_ele);
    }
}