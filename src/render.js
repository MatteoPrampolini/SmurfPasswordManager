//MODULES
const {
	remote
} = require('electron');
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const spawnSync = require('child_process').spawnSync;
var nodeConsole = require('console'); //debug
var myConsole = new nodeConsole.Console(process.stdout, process.stderr); //debug
const path = require('path');
const fs = require('fs');
//INDEX.HTML ELEMENTS
const open_client_btn = document.getElementById("open_client_btn");
const add_account_btn = document.getElementById("add_account_btn");
const detect_client_btn = document.getElementById("detect_client_btn");
var accounts_form = document.getElementById("accounts_form");
var settings_form = document.getElementById("settings_form");
var settings_result_label=document.getElementById("settings_result_label");
var should_delete = false;
var account_array = {};
var settings_array = {};
const account_file = path.join(__dirname+ "/accounts.json");
const settings_file = path.join(__dirname+ "/settings.json");
const vbs_path=(path.join(__dirname,'login.vbs'));
var client_path;

document.addEventListener('click', function(e) {  //settings button clicked
	//e.preventDefault();
	if(e.target.id=="open_settings_btn" || e.target.id=="settings_icon"){
		account_result_label.classList.add("form-hidden");	
		account_result_label.classList.remove("animate-flicker");
		if(settings_form.classList.contains('form-hidden')){
			accounts_form.classList.add('form-hidden');
			settings_form.classList.remove('form-hidden');
			settings_form.classList.add('doFadeIn');
		}
		else{
			settings_form.classList.add('form-hidden');
			accounts_form.classList.remove('form-hidden');
			accounts_form.classList.add('doFadeIn');

		}

	}
	
	else if (e.target.id == "eye_icon") {
		let password = document.getElementsByClassName("password_type")[0];
		if (e.target.classList.contains("fa-eye")) {
			password.type = "password";
			e.target.classList.replace('fa-eye', 'fa-eye-slash');
		} else {
			password.type = "text";
			e.target.classList.replace('fa-eye-slash', 'fa-eye');
		}
	}
	else if (e.target.id == "trash_icon") {
		var elements = accounts_form.getElementsByClassName("account_li");
		if (should_delete == false) {
			e.target.parentNode.classList.replace('has-text-info','has-text-danger');
			for (let i = 0; i < elements.length; i++) {
				{
					elements[i].classList.replace('is-link', 'is-danger');
				}
			}
			should_delete = true;
		}
		//trash clicked twice
		else {
			e.target.parentNode.classList.replace('has-text-danger','has-text-info');
			for (let i = 0; i < elements.length; i++) {
				{
					elements[i].classList.replace('is-danger', 'is-link');
				}

				should_delete = false;
			}
		}

	}
	else if (e.target.classList.contains("account_li")) {
		if (should_delete) {
			let account = e.target.textContent;
			should_delete = false;
			let trash = document.getElementsByClassName("fa-trash-alt")[0];
			trash.parentNode.classList.replace('has-text-danger','has-text-info');
			removeAndUpdate(account);
		} 

		
		else {
				isRunning('RiotClientServices.exe', (status) => {
					if (status) {
						autoLogin(e.target.textContent,account_array[e.target.textContent]);
					
					}
					else{ //open client
						//myConsole.log("OPENING CLIENT...");
						openClient(e.target.textContent,account_array[e.target.textContent]);
						
						

					}
				});

			}

	}
});
accounts_form.addEventListener("click", function() {

	event.preventDefault();

});
settings_form.addEventListener("click", function() {

	//event.preventDefault();

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
detect_client_btn.addEventListener("click", function() {
	event.preventDefault();
	settings_result_label.innerHTML="Open your client please";
	settings_result_label.classList.remove("form-hidden");
	settings_result_label.classList.add("animate-flicker");
	settings_array["clientPath"]=undefined;
	client_path=undefined;

	detectClient();
	////myConsole.log(result);
	//getRiotPath();
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
function openClient(username,password) {
	client_path=settings_array["clientPath"];
	if (!client_path)
	{
		updateAccount_error_label();

	}
	else{
		execFile(client_path, { detached: true}, function(err, data, ) { 
			
			if (err){
				updateAccount_error_label();
			}
		});  
		//myConsole.log("LOGGING IN..."");
		autoLogin(username,password);
	}
   
 }

 function updateAccount_error_label(){
	account_result_label.classList.remove("form-hidden");	
	account_result_label.classList.add("animate-flicker");
		

 }
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


function detectClient(){
		getRiotPath();
		 if (!client_path)
		{ setTimeout(() => {
			

			detectClient();
			if(!client_path)
			{	detect_client_btn.classList.add('is-loading');
				
			}
			else
			{

				detect_client_btn.classList.remove('is-loading');
			}
		}, 2000);
	}

	if (client_path){
		detect_client_btn.classList.remove('is-loading');
		settings_result_label.classList.remove("animate-flicker");
		settings_result_label.style.opacity=1;
		settings_result_label.innerHTML='Client found. All good.<br>Press <i class="fas fa-cogs"></i> to go back.';
		settings_result_label.style.color="hsl(204, 86%, 53%)";
		settings_array['clientPath']=client_path;
		saveSetting();

	}


}

async function getRiotPath(cb) {
	let platform = process.platform;
	let cmd = '';
	switch (platform) {
		case 'win32':
			cmd = `wmic process where "name='RiotClientServices.exe'" get ExecutablePath`;
			break;
		case 'darwin':
			//cmd = `ps -ax | grep ${query}`;
			break;
		case 'linux':
			//cmd = `ps -A`;
			break;
		default:
			break;
	}
		exec(cmd, (err, stdout, stderr) => {
			let path=stdout.split("\n")[1].trim();
			client_path=path;
			
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

	fs.writeFile(account_file, JSON.stringify(account_array), function(err) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
			}, 200);
		});

	});
}
async function removeAccountFromFile(username) {
	//myConsole.log("REMOVE");

	delete account_array[username];
	fs.writeFile(account_file, JSON.stringify(account_array), function(err) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(true);
			}, 200);
		});

	});



}


async function fromFileLoadAccounts() {
	account_array = await _fromFileLoadAccounts();
}
async function _fromFileLoadAccounts() {
	fs.readFile(account_file, function(err, data) {

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
			}, 200);
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

	//myConsole.log("UPDATE");
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

			trash.parentNode.classList.add('has-text-info');
		} else {
			trash.parentNode.classList.remove('has-text-info');
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
	fs.readFile(account_file, function(err, data) {
		var json = JSON.parse(data);
		account_array = JSON.parse(data);

	});

	return new Promise(resolve => {
		setTimeout(() => {
			resolve(account_array);
		}, 300);
	});
}
async function readSettingsFromFile(settings_file) {

	settings_array= await _readSettingsFromFile(settings_file);
}
function _readSettingsFromFile(settings_file) {
	fs.readFile(settings_file, function(err, data) {
		var json = JSON.parse(data);
		settings_array = JSON.parse(data);
		client_path=json["clientPath"];
	});

	return new Promise(resolve => {
		setTimeout(() => {
			resolve(settings_array);
		}, 300);
	});
}

function saveSetting(){
	
	fs.writeFile(settings_file, JSON.stringify(settings_array, null, "\t"), function (err) {
	  });

}
function autoLogin(username,password){
		let hide_window="windowsHide";
		spawnSync('Cscript', [vbs_path,username,password,hide_window]);

}

//MAIN CODE, no need to wait for page loading cause defer;

settings_array= readSettingsFromFile(settings_file);
updateAccountList();
