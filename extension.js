// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const formatter = require('./formatter');
const { unwrapSource, isWrapped } = require('./unwrapper');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


let myStatusBarItem = vscode.StatusBarItem;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "unwrapper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('unwrapper.unwrap', function () {
		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			updateStatusBar('Loading');
			vscode.window.showInformationMessage('Unwrapping your code!');
			var firstLine = editor.document.lineAt(0);
			var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
			var selection = new vscode.Range(firstLine.range.start, lastLine.range.end);
			const text = editor.document.getText(selection);
			
			try {
				// Check if the code is wrapped
				if (!isWrapped(text)) {
					vscode.window.showErrorMessage('The code does not appear to be wrapped Oracle PL/SQL code.');
					updateStatusBar('Done');
					return;
				}

				// Unwrap locally
				let unwrappedText = unwrapSource(text);
				unwrappedText = 'CREATE OR REPLACE ' + unwrappedText;
				
				updateStatusBar('Formatter Loading');
				const formatted = formatter.format(unwrappedText);
				editor.edit(editBuilder => {
					editBuilder.replace(selection, formatted);
				});
				vscode.window.showInformationMessage('Unwrapping completed!');
				updateStatusBar('Done');
			} catch (error) {
				vscode.window.showErrorMessage('Unwrapper failed: ' + error.message);
				console.log(error);
				updateStatusBar('Done');
			}
		}
	});

	let formatCommand = vscode.commands.registerCommand('unwrapper.format', function () {
		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			updateStatusBar('Formatter Loading');
			vscode.window.showInformationMessage('formatting your code!');
			var firstLine = editor.document.lineAt(0);
			var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
			var selection = new vscode.Range(firstLine.range.start, lastLine.range.end);
			let text = editor.document.getText(selection);
			// text = 'CREATE OR REPLACE ' + text;
			const formatted = formatter.format(text);
			editor.edit(editBuilder => {
				editBuilder.replace(selection, formatted);
			});
			updateStatusBar('Done');
		}
	});



	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.left, 1);
	myStatusBarItem.command = 'unwrapper.unwrap';
	context.subscriptions.push(myStatusBarItem);
	context.subscriptions.push(formatCommand);
	context.subscriptions.push(disposable);
	updateStatusBar('Ready');
}


function updateStatusBar(status) {
	if (status === 'Loading') {
		myStatusBarItem.text = '$(sync~spin) Unwrapping...';
		myStatusBarItem.show();
	}
	else if (status === 'Formatter Loading') {
		myStatusBarItem.text = '$(check) Formatting...';
		myStatusBarItem.show();
	}
	else {
		myStatusBarItem.text = '$(play) Unwrap Code';
		myStatusBarItem.show();
	}
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
