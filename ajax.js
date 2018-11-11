function onClickButton(clicked_id) {
	var xhttp;
	if (window.XMLHttpRequest) {
		xhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {}
	};
	xhttp.open("GET", clicked_id, true);
	xhttp.send();
}

function onClickButtonShutdown(clicked_id) {
	var r = confirm("Are you sure?");
	if (r == true) {
		onClickButton(clicked_id);
	} else {}
}

var FSView;
function fileviewer_click(event) {
	var target = $(event.target);
	var row_index = target.closest('tr').index();

	if (FSView.isFolder(row_index) && FSView.isCollapsed(row_index))
		$.ajax({
			url: "getPath?path=" + FSView.getFullPath(row_index),
			success: function (result) {
				FSView.addContent(row_index, result);
			}
		});
}

class FolderStructure {
	//name isFolder level path isCollapsed
	constructor(root_drives) {
		var table = $('<table>').addClass('table table-hover');
		var tbody = $('<tbody>');
		table.append(tbody);
		$('#fileviewer').append(table);

		this.folder_structure = [];
		for (var i = 0; i < root_drives.folders.length; i++) {
			this.folder_structure.push([root_drives.folders[i], true, 0, '', true])
			$('#fileviewer > table > tbody').append(this.viewCreateRow(i));
		}
	}

	fileviewer_insert(index_row, length) {
		for (var i = index_row; i < index_row + length; i++) {
			console.log(i);
			$('#fileviewer > table > tbody > tr').eq(i).after(this.viewCreateRow(i));
		}
	}

	viewCreateRow(i) {
		var row = $('<tr>');
		var col = $('<td>').text(this.getName(i)).css("text-indent", (this.getLevel(i) * 20) + "px");
		row.append(col);
		col = $('<td>').text(this.isFolder(i));
		row.append(col);
		col = $('<td>').text(this.getFullPath(i));
		row.append(col);
		col = $('<td>').text(this.isCollapsed(i));
		row.append(col);
		return row;
	}

	viewRemoveRow(i) {
		$('#fileviewer > table > tbody > tr').eq(i).remove();
	}
	getLength() {
		return this.folder_structure.length;
	}
	getName(i) {
		return this.folder_structure[i][0];
	}
	isFolder(i) {
		return this.folder_structure[i][1];
	}
	getLevel(i) {
		return this.folder_structure[i][2];
	}
	getPath(i) {
		return this.folder_structure[i][3];
	}
	getFullPath(i) {
		return this.getPath(i) + this.getName(i) + '\\';
	}
	isCollapsed(i) {
		return this.folder_structure[i][4];
	}

	addContent(index_row, content) {
		this.folder_structure[index_row][4] = false;
		var full_path = this.getFullPath(index_row);
		var level = this.getLevel(index_row) + 1;
		for (var j = 0; j < content.folders.length; j++) {
			this.folder_structure.splice(index_row + j, 0, [content.folders[j], true, level, full_path, true])
		}
		for (var j = 0; j < content.files.length; j++) {
			this.folder_structure.splice(index_row + content.folders.length + j, 0, [content.files[j], false, level, full_path, true])

		}
		this.fileviewer_insert(row_index, result.folders.length + result.files.length);
	}

}

$.fn.fileViewer = function (FSView) {
	var table = $('<table>').addClass('table table-hover');
	var tbody = $('<tbody>');
	tbody.click(fileviewer_click);
	for (i = 0; i < FSView.getLength(); i++) {
		var row = $('<tr>');
		var col = $('<td>').text(FSView.getName(i)).css("text-indent", (FSView.getLevel(i) * 20) + "px");
		row.append(col);
		for (j = 1; j < 3; j++) {
			var col = $('<td>').text('col ' + j);
			row.append(col);
		}
		tbody.append(row);
	}
	table.append(tbody);
	this.append(table);
	return this;
}

$(document).ready(function () {
	$.ajax({
		url: "getPath?path=root",
		success: function (content) {
			//alert('Folders: ' + result.folders + ' Files: ' + result.files);
			FSView = new FolderStructure(content);
			$('#fileviewer > table > tbody').click(fileviewer_click);
		}
	});

});
