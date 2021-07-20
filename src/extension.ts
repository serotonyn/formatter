'use strict';

import * as vscode from 'vscode';
import { spaceAfterImportStatement } from './functions';

export function activate(context: vscode.ExtensionContext) {

    vscode.languages.registerDocumentFormattingEditProvider({ scheme: 'file', language: "typescriptreact" }, {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] | undefined {
            const text = document.getText();
            return spaceAfterImportStatement(document, text)
        }
    });
}