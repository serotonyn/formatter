'use strict';

import * as vscode from 'vscode';
import { addSpacesToSymbols, spaceAfterImportStatement } from './functions';


export async function activate(context: vscode.ExtensionContext) {

    vscode.commands.registerCommand('extension.formatter', async () => {
        const { activeTextEditor } = vscode.window;

        if (activeTextEditor && activeTextEditor.document.languageId === 'typescriptreact') {
            const { document } = activeTextEditor;
            const text = document.getText();
            const edit = new vscode.WorkspaceEdit();

            addSpacesToSymbols(document, edit)

            spaceAfterImportStatement(document, text, edit)

        }
    });
}