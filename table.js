
class SpanInfo {
    constructor(rowSpan, startRow) {
        if (arguments.length == 0) {
            rowSpan = 1;
            startRow = -1;
        }
        this._rowSpan = rowSpan;
        this._startRow = startRow;
    }
    set rowSpan(n) { this._rowSpan = n; };
    get rowSpan()  { return this._rowSpan };
    set startRow(n)  { this._startRow = n };
    get startRow()   { return this._startRow };
};

class Table {
    constructor(tableData, rowClickCb, checkChangeCb = null) {
        this._table_ele = document.createElement("table");
        this._table_ele.border = "1";

        var s = this.createTableHTML(tableData, rowClickCb, checkChangeCb);
        this._table_ele.innerHTML = s;
        this._rows = tableData.length;

        this._table_ele._table = this;

        this.storeCheckboxElements();
        this.setCheckBoxVisibility(false);
    }

    //
    // Utility functions that can be used when a checkbox is clicked or changed.
    //
    // Just used to prevent propagation of event to the parent <tr> which would otherwise
    // trigger the row on-click method.
    //

    static checkboxOnClick(ev, row) {
        //console.log("Table.checkboxOnClick:", ev, row);
        ev.stopPropagation();
    }

    static checkboxOnChange(ev, row) {
        //console.log("Table.checkboxOnChange:", ev, row);
        ev.stopPropagation();
    }

    storeCheckboxElements() {
        this._selectionHideEles = this._table_ele.getElementsByClassName('selectClass');
        this._selectionCheckboxEles = this._table_ele.getElementsByClassName('selectCheckbox');
    }

    //
    // Create a table indicating HTML rowspan information, to merge duplicate row text
    //
    // Work through the table comparing each column against the previous column.  
    // Build up a 2D array, mirroring the "tableData" information, that contains the
    // following SpanInfo entries for each cell:
    //
    //      rowSpan             Number of rowspans for this cell
    //                              0 for a cell that is part of a span that started at row startRow
    //                              1 for a normal cell
    //                              >1 for a cell that begins a rowspan
    //      startRow            If rowSpan = 0, row where rowspan starts, else -1.  Used to increment
    //                          rowSpan entry for corresponding cell is that row.
    //
    createSpanInfo(tableData) {
        var spanInfo = [];
        for (var row = 0 ; row < tableData.length ; row++) {
            spanInfo[row] = [];
    		for (var col = 0 ; col < tableData[row].length ; col++) {
                if (row == 0 || tableData[row-1][col] != tableData[row][col]) {
                    spanInfo[row].push(new SpanInfo());
                } else {
                    var index = row - 1;
                    var info = spanInfo[index][col];
                    if (info.startRow >= 0) {
                        index = info.startRow;
                        info = spanInfo[index][col];
                    }
                    info.rowSpan += 1;
                    spanInfo[index][col] = info;
                    spanInfo[row].push(new SpanInfo(0, index));
                }
            }
        }
        return spanInfo;
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
        var spanInfo = this.createSpanInfo(tableData)
        var s = "";
        for (var row = 0 ; row < tableData.length ; row++) {
			if (rowClickCb)
				s += `<tr onclick="${rowClickCb}(event, ${row})">`;
			else
				s += '<tr>';
			
			for (var col = 0 ; col < tableData[row].length ; col++) {
                var rowSpan = spanInfo[row][col].rowSpan;
                if (rowSpan == 1)
                    s += `<td>${tableData[row][col]}</td>`;
                else if (rowSpan > 1)
                    s += `<td rowspan="${rowSpan}">${tableData[row][col]}</td>`;
			}

			if (checkChangeCb) {
               	//
            	// If requested, generate a checkbox within a table data cell (normally hidden)
                //
                s += '<td class="selectClass" style="display: none">' +
                `<input type="checkbox" class="selectCheckbox" onchange="${checkChangeCb}(event, ${row})" onclick="Table.checkboxOnClick(event, ${row})" />` +
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