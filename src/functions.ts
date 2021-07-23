import { EOL } from 'os';
import * as vscode from 'vscode';

export const spaceAfterImportStatement = (document: vscode.TextDocument, text: string, edit: vscode.WorkspaceEdit) => {

    const lastImportStatementRegex = vscode.EndOfLine[document.eol] === 'CRLF' ? /import.+\r\n(?!import)/g : /import.+\n(?!import)/g
    const match = lastImportStatementRegex.exec(text)

    if (!match) {
        return
    }

    const indexOfLastImportStatement = match.index
    const lineOfLastImportStatement = document.positionAt(indexOfLastImportStatement).line
    const afterLastImportStatement: vscode.TextLine = document.lineAt(lineOfLastImportStatement + 1)

    const delta = getNumberOfEmptyAfterCurLine(document, lineOfLastImportStatement)

    if (delta === 0) {
        edit.insert(document.uri, afterLastImportStatement.range.start, EOL.repeat(3));
    }
    if (delta === 1) {
        edit.insert(document.uri, afterLastImportStatement.range.start, EOL.repeat(2));
    }
    if (delta === 2) {
        edit.insert(document.uri, afterLastImportStatement.range.start, EOL.repeat(1));
    }
    if (delta === 3) {
    }
    if (delta > 3) {
        const from = new vscode.Position(afterLastImportStatement.lineNumber, 0)
        const to = new vscode.Position(afterLastImportStatement.lineNumber + (delta - 3), 0)
        edit.delete(document.uri, new vscode.Range(from, to))
    }
    vscode.WorkspaceEdit.apply(edit)
}

interface Highlight extends vscode.DocumentHighlight {
    name: string
}

export const getNumberOfEmptyAfterCurLine = (document: vscode.TextDocument, currentLine: number) => {
    let delta = 0
    for (let index = currentLine + 1; index < document.lineCount; index++) {
        if (!document.lineAt(index).isEmptyOrWhitespace) { break }
        delta++
    }
    return delta
}

export const getNumberOfEmptyBeforeCurLine = (document: vscode.TextDocument, currentLine: number) => {
    let delta = 0
    for (let index = currentLine - 1; index < document.lineCount; index--) {
        if (!document.lineAt(index).isEmptyOrWhitespace) { break }
        delta++
    }
    return delta
}

export const addSpacesAfterOpeningCurlyBracket = (document: vscode.TextDocument, component: vscode.DocumentHighlight, edit: vscode.WorkspaceEdit, numberOfEmptySpaceWanted: number) => {
    const firstLine = document.lineAt(component.range.start).lineNumber
    const delta = getNumberOfEmptyAfterCurLine(document, firstLine)

    const afterFirstLine = document.lineAt(firstLine + 1)

    if (delta === numberOfEmptySpaceWanted) { return }
    if (delta < numberOfEmptySpaceWanted) {
        edit.insert(document.uri, afterFirstLine.range.start, EOL.repeat(numberOfEmptySpaceWanted - delta));
    }
    if (delta > numberOfEmptySpaceWanted) {
        const from = new vscode.Position(afterFirstLine.lineNumber, 0)
        const to = new vscode.Position(afterFirstLine.lineNumber + (delta - numberOfEmptySpaceWanted), 0)
        edit.delete(document.uri, new vscode.Range(from, to))
    }
}

export const addSpacesBeforeClosingCurlyBracket = (document: vscode.TextDocument, component: vscode.DocumentHighlight, edit: vscode.WorkspaceEdit) => {
    const lastLine = document.lineAt(component.range.end).lineNumber
    const delta = getNumberOfEmptyBeforeCurLine(document, lastLine)

    const beforeFirstLine = document.lineAt(lastLine - 1)
    if (delta === 0) {
        edit.insert(document.uri, beforeFirstLine.range.end, EOL.repeat(1));
    }
    if (delta === 1) {
    }
    if (delta > 1) {
        const from = new vscode.Position(beforeFirstLine.lineNumber, 0)
        const to = new vscode.Position(beforeFirstLine.lineNumber - (delta - 1), 0)
        edit.delete(document.uri, new vscode.Range(from, to))
    }
}

export const addSpacesToSymbols = async (document: vscode.TextDocument, edit: vscode.WorkspaceEdit) => {

    const symbols: vscode.DocumentHighlight[] | undefined = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", document.uri)
    if (!symbols) {
        return
    }

    let components: vscode.DocumentHighlight[] = [];
    let objectLiterals: vscode.DocumentHighlight[] = [];

    symbols.forEach(symbol => {

    })


    // sort symbols
    symbols.forEach(symbol => {
        if ((symbol as Highlight).name[0] === (symbol as Highlight).name[0].toUpperCase()) {
            components.push(symbol)
        }
        else {
            if ((symbol.kind as unknown as vscode.SymbolKind) !== 12) { return }
            const startLine = document.lineAt(symbol.range.start).text
            if (startLine.endsWith('{')) {
                objectLiterals.push(symbol)
            }
        }
    })

    // add spaces to symbols
    components.forEach(component => {
        addSpacesAfterOpeningCurlyBracket(document, component, edit, 2)
        addSpacesBeforeClosingCurlyBracket(document, component, edit)
    })
    objectLiterals.forEach(objectLiteral => {
        addSpacesAfterOpeningCurlyBracket(document, objectLiteral, edit, 1)
        addSpacesBeforeClosingCurlyBracket(document, objectLiteral, edit)
    })

    vscode.workspace.applyEdit(edit)
}