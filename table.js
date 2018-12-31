
class Table {
    constructor(tableData, rowClickCb, checkChangeCb = null) {
        this._table_ele = document.createElement("table");
        this._table_ele.border = "1";

        var s = this.createTableHTML(tableData, rowClickCb, checkChangeCb);
        this._table_ele.innerHTML = s;
        this._rows = tableData.length;

        this._selectionHideEles = this._table_ele.getElementsByClassName('selectClass');
        this._selectionCheckboxEles = this._table_ele.getElementsByClassName('selectCheckbox');
        
        this._table_ele._table = this;
        this.setCheckBoxVisibility(false);
    }

   	//
	// Generate a table from a two dimensional array of strings, where each element represents a table
	// data cell.  Each row can have a variable number of columns, ie:
	//
	// tableData: [
	//			  [ col1, col2, ..., colM ],
	//			  [ col1, col2, ..., colN ],
	//			       ...
	//			  ]
	//

    createTableHTML(tableData, rowClickCb, checkChangeCb) {
        var s = "";
        for (var row = 0 ; row < tableData.length ; row++) {
			if (rowClickCb)
				s += `<tr onclick="${rowClickCb}(event, ${row})">`;
			else
				s += '<tr>';
			
			for (var col = 0 ; col < tableData[row].length ; col++) {
				s += `<td>${tableData[row][col]}</td>`;
			}

			if (checkChangeCb) {
               	//
            	// If requested, generate a checkbox within a table data cell (normally hidden)
                //
                s += '<td class="selectClass" style="display: none">' +
                `<input type="checkbox" class="selectCheckbox" onchange="${checkChangeCb}(event, ${row})" />` +
                '</td>';
			}

			s += '</tr>'
		}
        return s;
    }

    getNode() {
        return this._table_ele;
    }

    rows()
	{
		return this._rows;
	}

    setCheckBoxVisibility(visible) {
        for (var e of this._selectionHideEles) {
			e.style.display = visible ? "table-cell" : "none";
		}

		if (!visible) {
			for (let e of this._selectionCheckboxEles) {
				e.checked = false;
			}
        }
        this._checkBoxVisible = visible;
    }

    toggleCheckBoxVisibility() {
        this._checkBoxVisible = !this._checkBoxVisible;
        this.setCheckBoxVisibility(this._checkBoxVisible);
    }

	isCheckboxChecked(i)
	{
		return !!this._selectionCheckboxEles[i].checked;
	}

}