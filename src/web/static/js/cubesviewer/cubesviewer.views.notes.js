/*
 * CubesViewer
 * Copyright (c) 2012-2013 Jose Juan Montes, see AUTHORS for more details
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * If your version of the Software supports interaction with it remotely through
 * a computer network, the above copyright notice and this permission notice
 * shall be accessible to all users.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * CubesViewer view notes. This is an optional component.
 * Requires the inclusion of the JS wiki library.
 * Also requires the presence of the reststore plugin.
 */
function cubesviewerViewNotes () {

	this.cubesviewer = cubesviewer;
	
	// TODO: This shall be managed by cubesviewer
	this.noteViews = [];

	this.onViewCreate = function(event, view) {
		
		$.extend(view.params, {
		});
		
		view.notes = {
			"cube":  "",
			"view": ""
		}
		
		// Add the notes view to the list of notes views to be updated
		cubesviewer.views.notes.noteViews.push(view);
		
	};
	
	/*
	 * View destroyed 
	 */
	this.onViewDestroyed = function(event, view) {

		var len = cubesviewer.views.notes.noteViews.length;
		while (len--) {
			if (cubesviewer.views.notes.noteViews[len].id == view.id) {
			    // Element is detached, destroy graph
				cubesviewer.views.notes.noteViews.splice (len,1);
			}
		}
		
	};	
	
	
	/*
	 * Draw info structure.
	 */
	this.onViewDraw = function(event, view) {
		
		if ($(view.container).find('.cv-view-notes-menu').size() == 0) {
		
			$(view.container).find('.cv-view-viewfooter').append('<div class="cv-view-notes-menu" style="margin-top: 10px; width: 80%; min-width: 700px;"><ul></ul></div>');
			$(view.container).find('.cv-view-notes-menu ul').append('<li style="font-size: 70%;"><a href="#view-' + view.id + '-notes-menu-cube">Cube Notes</a></li>');
			$(view.container).find('.cv-view-notes-menu ul').append('<li style="font-size: 70%;"><a href="#view-' + view.id + '-notes-menu-view">View Notes</a></li>');
			$(view.container).find('.cv-view-notes-menu').append('<div id="view-' + view.id + '-notes-menu-view"><i>Loading...</i></div>');
			$(view.container).find('.cv-view-notes-menu').append('<div id="view-' + view.id + '-notes-menu-cube"><i>Loading...</i></div>');
			
			$(view.container).find('.cv-view-notes-menu').tabs ({
		        selected: -1,
		        collapsible: true,
			});
			
		}
		
		// Load data
		view.cubesviewer.views.notes.loadNotes(view);
		
	};
	
	this.loadNotes = function(view) {
		
		$('#view-' + view.id + '-notes-menu-cube').find('.cubes-notes-html').empty().append("<i>Loading...</i>");
		$('#view-' + view.id + '-notes-menu-view').find('.cubes-notes-html').empty().append("<i>Loading...</i>");
		
		$.get(view.cubesviewer.gui.options.backendUrl + "/note/get/" + "cube" + ":" + view.cube.name, null, view.cubesviewer.views.notes._loadNotesCallbackCube(view), "json")
		 .fail(cubesviewer.defaultRequestErrorHandler);
	};
	
    this._loadNotesCallbackCube = function(view) {

        var view = view;
        return function(data, status) {
        	if (data.length > 0) {
        		view.notes["cube"] = data[0].data;
        	} else {
        		view.notes["cube"] = "No Cube notes";
        	}
        	
            
        	if (view.savedId > 0) {
        		$.get(view.cubesviewer.gui.options.backendUrl + "/note/get/" + "view" + ":" + view.savedId, null, view.cubesviewer.views.notes._loadNotesCallbackView(view), "json")
        		 .fail(cubesviewer.defaultRequestErrorHandler);
            } else {
            	view.cubesviewer.views.notes.drawNotes(view);
            }
            
        }

    };

    this._loadNotesCallbackView = function(view) {

        var view = view;
        return function(data, status) {
        	if (data.length > 0) {
        		view.notes["view"] = data[0].data;
        		// Enable tab
        		$(view.container).find('.cv-view-notes-menu').tabs({active: 1});
        	} else {
        		view.notes["view"] = "No View notes";
        	}
        	
            view.cubesviewer.views.notes.drawNotes(view);
        }
    };

	this.notesEdit = function(view, noteType) {
		$('#view-' + view.id + '-notes-menu-' + noteType).find('.cubes-notes-html').empty();
		$('#view-' + view.id + '-notes-menu-' + noteType).find('.cubes-notes-edit-' + noteType).remove();
		$('#view-' + view.id + '-notes-menu-' + noteType).find('.cubes-notes-html').append(
			'<div style="width: 100%;">'
					+ '<div><textarea style="height: 170px; width: 100%;" name="notes">'
					+ view.notes[noteType]
					+ '</textarea></div>'
					+ '<div><button class="cubes-notes-save">Save</button> '
					+ '<button class="cubes-notes-cancel">Cancel</button> '
					+ '<a href="http://goessner.net/articles/wiky/" style="font-size: 10px;" target="_blank">[markup help]</a></div>'
					+ '</div>');
		$('#view-' + view.id + '-notes-menu-' + noteType).find('.cubes-notes-save').button();
		$('#view-' + view.id + '-notes-menu-' + noteType).find('.cubes-notes-save').click(
				function() {
					view.notes[noteType] = $('#view-' + view.id + '-notes-menu-' + noteType).find('.cubes-notes-html').find('textarea').val();
					cubesviewer.views.notes.drawNotes(view);
					cubesviewer.views.notes.saveNote(view, noteType);
		});
		$('#view-' + view.id + '-notes-menu-' + noteType).find('.cubes-notes-cancel').button();
		$('#view-' + view.id + '-notes-menu-' + noteType).find('.cubes-notes-cancel').click(
				function() {
					cubesviewer.views.notes.drawNotes(view);
		});

	};

	
	// Saves note to server
	this.saveNote = function(view, noteType) {

		var key = "";
		
		if (noteType == "cube") {
			key = "cube:" + view.cube.name; 
		} else {
			key = "view:" + view.savedId;
		}
		
		var data = {
            "key": key,
            "data": view.notes[noteType],
        };

		// Update notes in other views
		
		$( cubesviewer.views.notes.noteViews ).each (function(idx, e) {
			if (e != view) {
				if ((e.cube.name == view.cube.name) && (noteType=="cube")) {
					e.notes[noteType] = view.notes[noteType];
					cubesviewer.views.notes.drawNotes(e);
				} else if ((e.savedId == view.savedId) && (noteType=="view")) {
					e.notes[noteType] = view.notes[noteType];
					cubesviewer.views.notes.drawNotes(e);
				}
			}
		});
		
        $.post(view.cubesviewer.gui.options.backendUrl + "/note/save/", data, view.cubesviewer.views.notes._noteSaveCallback, "json")
        	.fail(cubesviewer.defaultRequestErrorHandler);

	};
	
	this._noteSaveCallback = function(data, status) {
		cubesviewer.showInfoMessage("Note saved correctly.", 3000);
	}
	
	this.onNoteSave = function(event, view) {
		
	}
	
	// Draw notes
	this.drawNotes = function(view) {

		var htmlNotesCube = Wiky.toHtml(view.notes["cube"]);
		var htmlNotesView = Wiky.toHtml(view.notes["view"]);

		$("#view-" + view.id + "-notes-menu-cube").empty()
			.append('<div class="cubes-notes-html" >' + htmlNotesCube + '</div>' +
			'<button class="cubes-notes-edit-cube" style="margin-top: 12px;">Edit Cube notes</button>');

		if (view.savedId > 0) {
			$("#view-" + view.id + "-notes-menu-view").empty()
				.append('<div class="cubes-notes-html" >' + htmlNotesView + '</div>' +
				'<button class="cubes-notes-edit-view" style="margin-top: 12px;">Edit View notes</button>');
		} else {
			$('#view-' + view.id + '-notes-menu-view').empty().append('<div class="cubes-notes-html" ><i>The view must be saved in order to add a View Note.</i></div>');
		}
		
		$('#' + view.id).find('.cubes-notes-edit-cube').button().click(function() {
			view.cubesviewer.views.notes.notesEdit(view, "cube");
			return false;
		});
		$('#' + view.id).find('.cubes-notes-edit-view').button().click(function() {
			view.cubesviewer.views.notes.notesEdit(view, "view");
			return false;
		});
		
	};	

};

/*
 * Create object.
 */
cubesviewer.views.notes = new cubesviewerViewNotes();

/*
 * Bind events.
 */
$(document).bind("cubesviewerViewCreate", { }, cubesviewer.views.notes.onViewCreate);
$(document).bind("cubesviewerViewDestroyed", { }, cubesviewer.views.notes.onViewDestroyed);
$(document).bind("cubesviewerViewDraw", { }, cubesviewer.views.notes.onViewDraw);

