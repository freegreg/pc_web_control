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

class FolderStructureView {
	constructor(tag) {
		this.table = $('<table>').addClass('table table-hover');
		this.tbody = $('<tbody>');
		this.table.append(this.tbody);
		$(tag).append(this.table);

		//$('#fileviewer > table > tbody').append(this.viewCreateRow(i));
		//$('#fileviewer > table > tbody').click(fileviewer_click);
	}
	bindClickHandler(selfClass, selfClassHandler) {
		this.tbody.on("click", {
			self: selfClass
		}, selfClassHandler);
	}
	addRowView(index, name, level, isFolder, fullPath, isCollapsed) {
		var row = $('<tr>');
		var span = $('<span>');
		if (isFolder)
			span.addClass('oi oi-caret-right');
		else
			span.addClass('oi oi-file');

		var col = $('<td>').append(span);
		span.css("text-indent", (level * 20) + "px").text(' ' + name)
		row.append(col);

		if (index >= this.tbody.find('tr').length)
			this.tbody.append(row);
		else
			this.tbody.find('tr').eq(index - 1).after(row);

	}

	setRowCollapsed(index, collapse) {
		var collClass;
		var span = this.tbody.find('tr').eq(index).find('span');
		if (collapse)
			collClass = 'oi-caret-right';
		else
			collClass = 'oi-caret-bottom';
		span.removeClass('oi-caret-right');
		span.removeClass('oi-caret-bottom');
		span.addClass(collClass);
	}

	removeRowView(index) {
		this.tbody.find('tr').eq(index).remove();
	}
	removeRowsView(index, length) {
		for (var j = 0; j < length; j++) {
			this.tbody.find('tr').eq(index).remove();
		}
	}
}

class FolderStructureData {
	//name isFolder level path isCollapsed
	constructor(root_drives) {
		this.folder_structure = [];
		for (var i = 0; i < root_drives.folders.length; i++) {
			this.folder_structure.push([root_drives.folders[i], true, 0, '', true])
			//this.addContent(i, root_drives.folders[i]);
		}
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
		var fPath;
		if (this.isFolder(i))
			fPath = this.getPath(i) + this.getName(i) + '\\';
		else
			fPath = this.getPath(i) + this.getName(i);
		return fPath;
	}

	isCollapsed(i) {
		return this.folder_structure[i][4];
	}

	addContent(index_row, content) {
		this.folder_structure[index_row][4] = false;
		var full_path = this.getFullPath(index_row);
		var level = this.getLevel(index_row) + 1;
		for (var j = 0; j < content.folders.length; j++) {
			this.folder_structure.splice(index_row + j + 1, 0, [content.folders[j], true, level, full_path, true])
		}
		for (var j = 0; j < content.files.length; j++) {
			this.folder_structure.splice(index_row + content.folders.length + j + 1, 0, [content.files[j], false, level, full_path, true])
		}
	}
	removeContent(index_row) {
		this.folder_structure[index_row][4] = true;
		var levelToRemove = this.getLevel(index_row);
		var i = 0;
		while ((++i + index_row < this.getLength()) && (this.getLevel(i + index_row) > levelToRemove));
		this.folder_structure.splice(index_row + 1, i - 1);
		return i - 1;
	}

}

class FolderStructureController {
	constructor(FolderStructureData_, FolderStructureView_) {
		this.Data = FolderStructureData_;
		this.View = FolderStructureView_;
		this.View.bindClickHandler(this, this.ItemClick);

		//create initial root drives in table
		for (var i = 0; i < this.Data.getLength(); i++) {
			this.View.addRowView(i, this.Data.getName(i), this.Data.getLevel(i), this.Data.isFolder(i), this.Data.getFullPath(i), this.Data.isCollapsed(i));
		}
	}

	ItemClick(e) {
		var self = e.data.self;
		var target = $(e.target);
		var row_index = target.closest('tr').index();
		console.log("self.Data.getLength(): " + self.Data.getLength());
		console.log("row_index: " + row_index);
		console.log("self.Data.getName(row_index): " + self.Data.getName(row_index));

		if (self.Data.isFolder(row_index) && self.Data.isCollapsed(row_index))
			$.ajax({
				url: "getPath?path=" + self.Data.getFullPath(row_index),
				success: function (result) {
					console.log("result.folders: " + result.folders);
					console.log("result.files: " + result.files);
					self.Data.addContent(row_index, result);
					for (var i = row_index + 1; i <= (row_index + result.folders.length + result.files.length); i++) {
						self.View.addRowView(i, self.Data.getName(i), self.Data.getLevel(i), self.Data.isFolder(i), self.Data.getFullPath(i), self.Data.isCollapsed(i));
					}
					self.View.setRowCollapsed(row_index, false);
				}
			});
		else if (self.Data.isFolder(row_index) && !self.Data.isCollapsed(row_index)) {
			var lengthToDelete = self.Data.removeContent(row_index);
			console.log("lengthToDelete: " + lengthToDelete);
			self.View.removeRowsView(row_index + 1, lengthToDelete);
			self.View.setRowCollapsed(row_index, true);
		} else if (!self.Data.isFolder(row_index))
			$.ajax({
				url: "openFile?path=" + self.Data.getFullPath(row_index),
				success: function (result) {
					console.log("result: " + result);
				}
			});

	}
}

$(document).ready(function () {
	$.ajax({
		url: "getPath?path=root",
		success: function (content) {
			//alert('Folders: ' + result.folders + ' Files: ' + result.files);
			FSView = new FolderStructureView('#fileviewer');
			FSData = new FolderStructureData(content);
			FSController = new FolderStructureController(FSData, FSView);
		}
	});
});
