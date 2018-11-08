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

class FolderStructure {
	//name isFolder level path isCollapsed
	
	constructor(root_drives) {
			this.folder_structure = [];
			for (var i = 0; i < root_drives.folders.length; i++) {
				this.folder_structure.push([root_drives.folders[i], true, 0, '', true])
			}
  }
  getLength(){return this.folder_structure.length;}
  getName(i){return this.folder_structure[i][0];}
  isFolder(i){return this.folder_structure[i][1];}
  getLevel(i){return this.folder_structure[i][2];}
  getPath(i){return this.folder_structure[i][3];}
  getFullPath(i){return this.getPath(i) + this.getName(i);}
  isCollapsed(i){return this.folder_structure[i][4];}
  
  addContent(i, content){
		this.folder_structure[i][4] = false;
		for (var j = 0; j < content.folders.length; j++) {
			this.folder_structure.splice(i+j, 0, [content.folders[j], true, 0, this.getFullPath(i), true])
	}
  }
}

function fileviewer_click(event) {
	var target = $(event.target);
	var row_index = target.closest('tr').index();
	//alert(target.text() + " Index: " + row_index);
	if (FSView.isFolder(row_index) && FSView.isCollapsed(row_index)) {
		$.ajax({
			url: "getPath?path=" + FSView.getName(row_index),
			success: function (result) {
					FSView.addContent(row_index, result);
					
				//var obj = JSON.parse(result);
				//alert('Folders: ' + result.folders + 'Files: ' + result.files);
			}
		});
	}
}

$.fn.fileviewer = function (FSView) {
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
		success: function (result) {
			//alert('Folders: ' + result.folders + ' Files: ' + result.files);
			FSView = new FolderStructure(result);
			$('#fileviewer').fileviewer(FSView);
		}
	});
	

});
