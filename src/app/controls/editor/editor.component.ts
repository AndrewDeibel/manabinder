import { Component, OnInit, Input } from '@angular/core';
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-classic';
import { Editor } from './editor';

@Component({
	selector: 'mb-editor',
	templateUrl: 'editor.component.html'
})

export class EditorComponent implements OnInit {

	@Input() editor: Editor;
	
	ckEditor = DecoupledEditor;
	
	constructor() { }

	ngOnInit() {
		
	}

	onReady(editor) {
        editor.ui.getEditableElement().parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.getEditableElement()
        );
    }
}