// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');
var FormData = require('form-data');
const html_parser = require('node-html-parser');
const formatter = require('./formatter');

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
			const selection = editor.selection;
			const text = editor.document.getText(selection);
			var data = new FormData();
			data.append('Code', text);
			data.append('UnwrapText', 'Unwrap Code');

			var config = {
				method: 'post',
				url: 'https://www.codecrete.net/UnwrapIt/',
				headers: {
					...data.getHeaders()
				},
				data: data
			};

			axios(config)
				.then(function (response) {
					console.log(JSON.stringify(response.data));
					const res = response.data;
					const root = html_parser.parse(res);
					const text = root.querySelector('pre').text;
					editor.edit(editBuilder => {
						editBuilder.replace(selection, text);
					});
					vscode.window.showInformationMessage('Unwrapping completed!');
					updateStatusBar('Done');
				})
				.catch(function (error) {
					vscode.window.showErrorMessage('Unwrapper failed!');
					console.log(error);
					updateStatusBar('Done');
				});
		}
	});

	let formatCommand = vscode.commands.registerCommand('unwrapper.format', function () {
		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			updateStatusBar('Loading');
			vscode.window.showInformationMessage('formatter your code!');
			const selection = editor.selection;
			let text = editor.document.getText(selection);
			text = 'CREATE OR REPLACE ' + text;
			const formatted = formatter.format(text);
			editor.edit(editBuilder => {
				editBuilder.replace(selection, formatted);
			});
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
