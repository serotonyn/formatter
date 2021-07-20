import { EOL } from 'os';
import * as vscode from 'vscode';

export const spaceAfterImportStatement = (document: vscode.TextDocument, text: string) => {

    const lastImportStatementRegex = vscode.EndOfLine[document.eol] === 'CRLF' ? /import.+\r\n(?!import)/g : /import.+\n(?!import)/g
    const match = lastImportStatementRegex.exec(text)

    if (!match) {
        return
    }

    const indexOfLastImportStatement = match.index
    const lineOfLastImportStatement = document.positionAt(indexOfLastImportStatement).line
    const afterLastImportStatement: vscode.TextLine = document.lineAt(lineOfLastImportStatement + 1)

    let delta = 0
    for (let index = lineOfLastImportStatement + 1; index < document.lineCount; index++) {
        if (document.lineAt(index).text !== '') { break }
        delta++
    }

    if (delta === 0) {
        return [vscode.TextEdit.insert(afterLastImportStatement.range.start, EOL.repeat(3))];
    }
    if (delta === 1) {
        return [vscode.TextEdit.insert(afterLastImportStatement.range.start, EOL.repeat(2))];
    }
    if (delta === 2) {
        return [vscode.TextEdit.insert(afterLastImportStatement.range.start, EOL.repeat(1))];
    }
    if (delta === 3) {
        return
    }
    if (delta > 3) {
        const from = new vscode.Position(afterLastImportStatement.lineNumber, 0)
        const to = new vscode.Position(afterLastImportStatement.lineNumber + (delta - 3), 0)
        return [vscode.TextEdit.delete(new vscode.Range(from, to))]
    }
}