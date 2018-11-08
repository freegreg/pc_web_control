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

var folder_structure = [];

var table_tree = [];
function parseTree(json_tree) {
	for (i = 0; i < json_tree["folder_content"].length; i++) {
		if (json_tree.hasOwnProperty('folder_name'))
			table_tree.push(json_tree["folder_content"][i]["folder_name"]);
		else if (json_tree.hasOwnProperty('file_name'))
			table_tree.push(json_tree["folder_content"][i]["file_name"]);
		if (json_tree["folder_content"][i].hasOwnProperty('folder_content')) {
			parseTree(json_tree["folder_content"][i]["folder_content"]);
		}
	}
}

function fileviewer_click(event) {
	var target = $(event.target);
	var row_index = target.closest('tr').index();
	//alert(target.text() + " Index: " + row_index);
	if (folder_structure[row_index][1]) {
		$.ajax({
			url: "getPath?path=root",
			success: function (result) {
				//var obj = JSON.parse(result);
				alert('Folders: ' + result.folders + 'Files: ' + result.files);
			}
		});
	}
}

$.fn.fileviewer = function (folder_structure) {
	var table = $('<table>').addClass('table table-hover');
	var tbody = $('<tbody>');
	tbody.click(fileviewer_click);
	alert(folder_structure)
	for (i = 0; i < folder_structure.length; i++) {
		var row = $('<tr>');
		var col = $('<td>').text(folder_structure[i][0]).css("text-indent", (folder_structure[i][2] * 20) + "px");
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
		success: function (result) {
			alert('Folders: ' + result.folders + ' Files: ' + result.files);
			for (i = 0; i < result.folders.length; i++) {
				folder_structure.push([result.folders[i], true, 0])
			}
			$('#fileviewer').fileviewer(folder_structure);
		}
	});
	

});
