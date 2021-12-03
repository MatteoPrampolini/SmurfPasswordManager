//MODULES
const {
	remote
} = require('electron');
const exec = require('child_process').exec;
var nodeConsole = require('console'); //debug
var myConsole = new nodeConsole.Console(process.stdout, process.stderr); //debug
const path = require('path');
const fs = require('fs');
//INDEX.HTML ELEMENTS
const open_client_btn = document.getElementById("open_client_btn");
const add_account_btn = document.getElementById("add_account_btn");
var accounts_form = document.getElementById("accounts_form");
var should_delete = false;
var account_array = {};
const file_name = "./src/accounts.json";

//il bottone open client e' inutile. se il client e' chiuso lo apro con account_li click()
//HANDLERS
open_client_btn.addEventListener("click", function() { //open client button handler
	isRunning('RiotClientUx.exe', (status) => {
		if (!status) {
			id = "C:\\Riot Games\\Riot Client\\RiotClientServices.exe";
			var dirgame = path.dirname(id) + '\\\\';
			var namegame = path.basename(id);
			exec(namegame, {
				cwd: dirgame
			});
		}
	})
});

document.addEventListener('click', function(e) { //swap eye icon
	if (e.target.id == "eye_icon") {
		let password = document.getElementsByClassName("password_type")[0];
		if (e.target.classList.contains("fa-eye")) {
			password.type = "password";
			e.target.classList.replace('fa-eye', 'fa-eye-slash');
		} else {
			password.type = "text";
			e.target.classList.replace('fa-eye-slash', 'fa-eye');
		}
	}
	if (e.target.id == "trash_icon") {
		var elements = accounts_form.getElementsByClassName("account_li");
		if (should_delete == false) {
			for (let i = 0; i < elements.length; i++) {
				{
					elements[i].classList.replace('is-link', 'is-danger');
				}
			}
			should_delete = true;
		}
		//trash clicked twice
		else {
			for (let i = 0; i < elements.length; i++) {
				{
					elements[i].classList.replace('is-danger', 'is-link');
				}

				should_delete = false;
			}
		}

	}
	if (e.target.classList.contains("is-outlined")) {
		if (should_delete) {
			let account = e.target.textContent;
			myConsole.log(account);
			should_delete = false;
			removeAndUpdate(account);


		} else {
			myConsole.log("clickato nome account");
		}

	}
});
accounts_form.addEventListener("click", function() {

	event.preventDefault();

});
accounts_form.addEventListener("keypress", function(event) { //on Enter
	//avoid form submits
	let username = document.getElementsByClassName("newacc_input")[0];
	let password = document.getElementsByClassName("password_type")[0];
	if (username && checkInputValidity(username, password)) {
		add_account_btn.disabled = false;
	} else
		add_account_btn.disabled = true;
	if (event.key && event.target.classList.contains('newacc_input')) {
		if (event.key === 'Enter') {


			if (checkInputValidity(username, password)) {
				username = username.value;
				password = password.value;
				addAndUpdate(username, password);
				add_account_btn.disabled = false;

			} else {
				add_account_btn.disabled = true;
			}
			event.preventDefault();

		}
	} else {
		event.preventDefault();
	}
});
add_account_btn.addEventListener("click", function() { //add account pressed
	event.preventDefault();
	let username = document.getElementsByClassName("newacc_input");
	let password = document.getElementsByClassName("password_type");
	if (username.length === 0) {
		fillAccountDivWithInputs();
		add_account_btn.disabled = true;
	} else {
		add_account_btn.disabled = false;
		addAndUpdate(username[0].value, password[0].value);

	}
});
//FUNCTIONS
const isRunning = (query, cb) => {
	let platform = process.platform;
	let cmd = '';
	switch (platform) {
		case 'win32':
			cmd = `tasklist`;
			break;
		case 'darwin':
			cmd = `ps -ax | grep ${query}`;
			break;
		case 'linux':
			cmd = `ps -A`;
			break;
		default:
			break;
	}
	exec(cmd, (err, stdout, stderr) => {
		cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
	});
}


function fillAccountDivWithInputs() {
	//username
	let acc_name = document.createElement("input");
	acc_name.classList.add('input', 'is-small', 'newacc_input', 'name_type');
	acc_name.type = "text";
	acc_name.placeholder = "Username";
	acc_name.onkeydown = "return event.key != 'Enter';";
	accounts_form.insertBefore(acc_name, add_account_btn);
	//password
	let div = document.createElement("div");
	div.classList.add('div', 'control', 'has-icons-left', 'has-icons-right');
	accounts_form.insertBefore(div, add_account_btn);
	let password = document.createElement("input");
	password.classList.add('input', 'is-small', 'newacc_input', 'password_type');
	password.type = "password";
	password.placeholder = "Password";
	div.appendChild(password);
	let span = document.createElement("span");
	span.classList.add('span', 'icon', 'is-small', 'is-right');
	div.appendChild(span);
	let eye = document.createElement("i");
	eye.classList.add('i', 'fas', 'fa-eye-slash', 'fav-icon');
	eye.id = "eye_icon";
	span.appendChild(eye);


}

function checkInputValidity(username, password) {
	return (username.value != '' && password.value != '');

}
async function appendAccountToFile(username, password) {
	account_array[username] = password;

	fs.writeFile(file_name, JSON.stringify(account_array), function(err) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
			}, 2000);
		});

	});
}
async function removeAccountFromFile(username) {
	myConsole.log("REMOVE");

	delete account_array[username];
	fs.writeFile(file_name, JSON.stringify(account_array), function(err) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
			}, 2000);
		});

	});



}


async function fromFileLoadAccounts() {
	account_array = await _fromFileLoadAccounts();
}
async function _fromFileLoadAccounts() {
	fs.readFile(file_name, function(err, data) {
		var json = JSON.parse(data);
		account_array = JSON.parse(data);
		Object.entries(json).forEach((entry) => {
			const [key, value] = entry;
			let account = document.createElement("button");
			account.classList.add('button', 'is-small', 'is-link', 'is-outlined', 'is-fullwidth', 'account_li');
			account.textContent = key;
			accounts_form.insertBefore(account, add_account_btn);

		});
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(account_array);
			}, 2000);
		});


	});

}

function fromVariableLoadAccounts() {
	Object.entries(account_array).forEach((entry) => {
		const [key, value] = entry;
		let account = document.createElement("button");
		account.classList.add('button', 'is-small', 'is-link', 'is-outlined', 'is-fullwidth', 'account_li');
		account.textContent = key;
		accounts_form.insertBefore(account, add_account_btn);

	});

}

function updateAccountList() {

	myConsole.log("UPDATE");
	var elements = accounts_form.getElementsByClassName("account_li");
	while (elements[0]) {
		elements[0].parentNode.removeChild(elements[0]);
	}
	var elements = accounts_form.getElementsByClassName("div");
	while (elements[0]) {
		elements[0].parentNode.removeChild(elements[0]);
	}
	var elements = accounts_form.getElementsByClassName("input");
	while (elements[0]) {
		elements[0].parentNode.removeChild(elements[0]);
	}
	add_account_btn.disabled = false;

	if (Object.keys(account_array).length !== 0) {
		fromVariableLoadAccounts();
		updateTrashIcon();


	} else {
		fromFileLoadAccounts();
		updateTrashIcon();

	}



}
async function updateTrashIcon() {
	let trash = document.getElementsByClassName("fa-trash-alt")[0];
	updateJson().then(function() {
		if (Object.keys(account_array).length !== 0) {

			trash.parentNode.classList.add('has-text-danger');
		} else {
			trash.parentNode.classList.remove('has-text-danger');
		}
	});

}
async function addAndUpdate(account, password) {
	var result = await appendAccountToFile(account, password);

	updateAccountList();
}

async function removeAndUpdate(account) {
	var result = await removeAccountFromFile(account);

	updateAccountList();
}

function updateJson(new_json) {
	fs.readFile(file_name, function(err, data) {
		var json = JSON.parse(data);
		account_array = JSON.parse(data);

	});
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(account_array);
		}, 2000);
	});
}
//MAIN CODE, no need to wait for page loading cause defer;
isRunning('RiotClientUx.exe', (status) => {
	if (status) {
		open_client_btn.disabled = true;
	}
})

updateAccountList();