
class Frame {
    constructor(id = null) {
        this._div_ele = document.createElement("div");
        if (id) {
            this._div_ele.setAttribute("id", id);
            this._id = id;
        }
        this.setVisibility(false);
    }

    get id() {
        if (this._id)
            return this._id;
        else
            return null;
    }

    get div() {
        return this._div_ele;
    }

    setVisibility(visible) {
        this._div_ele.style.display = visible ? "inline" : "none";
        this._visible = visible;
        return this;
    }

    setVisibilityType(type) {
        this._div_ele.style.display = type;
        return this;
    }

    clear() {
        this._div_ele.innerHTML = "";
    }

    setHTML(s) {
        this._div_ele.innerHTML = s;
        return this;
    }

    // Note: slow - use sparingly
    appendHTML(s) {
        this._div_ele.innerHTML += s;
    }

    appendNode(node) {
        this._div_ele.appendChild(node);
        return this;
    }

    getElementsByTag(tag) {
        return this._div_ele.getElementsByTagName(tag);
    }

    addToBody() {
        document.body.appendChild(this._div_ele);
    }
}